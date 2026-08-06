/* =====================================================
   CEZOO — AUTOMATIC ORDER STATUS + SWIFT BRIDGE

   WORKS FOR:
   - cash_delivery_orders
   - upi_orders

   FEATURES:
   - New order with placed → automatically sends to Swift
   - Status change while app open → automatically sends
   - Status change while app closed → detected when app opens
   - Active tracking restored when app opens
   - Every order handled separately using table + order_id
   - No manual test/send button
===================================================== */

(function () {
  "use strict";

  let orderCheckRunning = false;
  let orderRealtimeChannel = null;
  let currentRealtimeMobile = "";
  let orderReloadTimer = null;

  /*
    Current page-session status cache.
    Every order gets a different key.
  */
  const orderStatusCache = new Map();

  /*
    These orders still need a tracking Live Activity.
  */
  const ACTIVE_STATUSES = new Set([
    "placed",
    "order_placed",
    "confirmed",
    "packed",
    "on_the_way",
    "out_for_delivery"
  ]);


  /* =====================================================
     GET LOGGED USER
  ===================================================== */

  function getCezooLoggedUser() {

    try {

      const user = JSON.parse(
        localStorage.getItem("cezooUser") || "null"
      );

      if (
        !user ||
        user.login !== true ||
        !user.mobile
      ) {
        return null;
      }

      return user;

    } catch (error) {

      console.error(
        "❌ Could not read CEZOO logged user:",
        error
      );

      return null;

    }

  }


  /* =====================================================
     NORMALIZE MOBILE
  ===================================================== */

  function normalizeCezooMobile(value) {

    return String(value || "")
      .replace(/\D/g, "")
      .slice(-10);

  }


  /* =====================================================
     MOBILE VARIANTS
  ===================================================== */

  function getCezooMobileVariants(mobile) {

    return [
      mobile,
      `91${mobile}`,
      `+91${mobile}`,
      `+91 ${mobile}`
    ];

  }


  /* =====================================================
     NORMALIZE STATUS
  ===================================================== */

  function normalizeCezooOrderStatus(status) {

    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  }


  /* =====================================================
     READABLE STATUS
  ===================================================== */

  function getCezooOrderStatusText(status) {

    const normalizedStatus =
      normalizeCezooOrderStatus(status) || "placed";

    const statusLabels = {

      placed: "Order Placed",
      order_placed: "Order Placed",

      confirmed: "Order Confirmed",

      packed: "Packed",

      on_the_way: "On the Way",
      out_for_delivery: "Out for Delivery",

      delivered: "Delivered",

      cancelled: "Cancelled",
      canceled: "Cancelled"

    };

    return (
      statusLabels[normalizedStatus] ||
      normalizedStatus
    );

  }


  /* =====================================================
     GET SUPABASE CLIENT
  ===================================================== */

  function getCezooOrdersClient() {

    if (!window._supabaseClient) {

      throw new Error(
        "Supabase client is not initialized"
      );

    }

    return window._supabaseClient;

  }


  /* =====================================================
     UNIQUE ORDER KEYS
  ===================================================== */

  function getOrderStatusCacheKey(
    tableName,
    orderId
  ) {

    return (
      `${tableName}:${String(orderId || "").trim()}`
    );

  }


  function getPersistentStatusKey(
    tableName,
    orderId
  ) {

    return (
      `cezoo_order_status_${tableName}_${String(orderId || "").trim()}`
    );

  }


  /* =====================================================
     READ SAVED STATUS
  ===================================================== */

  function readPersistentOrderStatus(
    tableName,
    orderId
  ) {

    try {

      return normalizeCezooOrderStatus(
        localStorage.getItem(
          getPersistentStatusKey(
            tableName,
            orderId
          )
        ) || ""
      );

    } catch (error) {

      console.warn(
        "⚠️ Could not read saved order status:",
        error
      );

      return "";

    }

  }


  /* =====================================================
     SAVE ORDER STATUS
  ===================================================== */

  function saveOrderStatus(
    tableName,
    order
  ) {

    const orderId =
      String(
        order?.order_id || ""
      ).trim();

    const status =
      normalizeCezooOrderStatus(
        order?.order_status
      );

    if (!orderId || !status) {
      return;
    }

    const cacheKey =
      getOrderStatusCacheKey(
        tableName,
        orderId
      );

    /*
      Save in memory.
    */
    orderStatusCache.set(
      cacheKey,
      status
    );

    /*
      Save permanently.

      This is used to detect changes that happened
      while the app was closed.
    */
    try {

      localStorage.setItem(
        getPersistentStatusKey(
          tableName,
          orderId
        ),
        status
      );

    } catch (error) {

      console.warn(
        "⚠️ Could not permanently save order status:",
        error
      );

    }

  }


  /* =====================================================
     CHECK MOBILE MATCH
  ===================================================== */

  function doesOrderBelongToMobile(
    orderMobile,
    mobileVariants
  ) {

    const value =
      String(orderMobile || "").trim();

    if (
      mobileVariants.includes(value)
    ) {
      return true;
    }

    const normalizedOrderMobile =
      normalizeCezooMobile(value);

    const normalizedLoggedMobile =
      normalizeCezooMobile(
        mobileVariants[0]
      );

    return (
      normalizedOrderMobile &&
      normalizedOrderMobile ===
      normalizedLoggedMobile
    );

  }


  /* =====================================================
     LOAD ORDERS FROM ONE TABLE
  ===================================================== */

  async function loadOrdersFromTable(
    tableName,
    paymentType,
    mobileVariants
  ) {

    const { data, error } =
      await getCezooOrdersClient()
        .from(tableName)
        .select("*")
        .in(
          "user_mobile",
          mobileVariants
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {

      throw new Error(
        `${tableName}: ${error.message}`
      );

    }

    return (data || []).map(order => ({

      ...order,

      _payment_type:
        paymentType,

      _table_name:
        tableName

    }));

  }


  /* =====================================================
     SEND STATUS TO SWIFT AUTOMATICALLY
  ===================================================== */

  function sendOrderStatusToSwift(
    order,
    eventType = "status_changed"
  ) {

    const orderId =
      String(
        order?.order_id || ""
      ).trim();

    const status =
      normalizeCezooOrderStatus(
        order?.order_status
      );

    if (!orderId || !status) {

      console.error(
        "❌ Order ID or status missing:",
        order
      );

      return false;

    }

    const handler =
      window.webkit
        ?.messageHandlers
        ?.orderStatusNotification;

    if (!handler) {

      console.log(
        "ℹ️ Swift bridge unavailable:",
        {
          orderId,
          status,
          eventType
        }
      );

      return false;

    }

    try {

      handler.postMessage({

        orderId:
          orderId,

        status:
          status,

        eventType:
          eventType,

        paymentType:
          String(
            order?._payment_type || ""
          ),

        tableName:
          String(
            order?._table_name || ""
          )

      });

      console.log(
        "✅ Automatically sent order status to Swift:",
        {
          orderId,
          status,
          eventType
        }
      );

      return true;

    } catch (error) {

      console.error(
        "❌ Failed to send order status to Swift:",
        error
      );

      return false;

    }

  }


  /* =====================================================
     PROCESS ORDER WHEN APP OPENS

     CASE 1:
     First active order seen on this device
     → send to Swift and create tracking.

     CASE 2:
     Status changed while app was closed
     → send latest status to Swift.

     CASE 3:
     Status is same and still active
     → restore tracking without notification.
  ===================================================== */

  function processLoadedOrder(
    order,
    tableName
  ) {

    const orderId =
      String(
        order?.order_id || ""
      ).trim();

    const currentStatus =
      normalizeCezooOrderStatus(
        order?.order_status
      );

    if (!orderId || !currentStatus) {
      return;
    }

    const previousStatus =
      readPersistentOrderStatus(
        tableName,
        orderId
      );

    const preparedOrder = {

      ...order,

      _table_name:
        tableName

    };


    /*
      First time this device sees this order.
    */
    if (!previousStatus) {

      saveOrderStatus(
        tableName,
        preparedOrder
      );

      /*
        Only active orders should create tracking.

        Do not send old delivered or cancelled orders
        when the user installs or first opens the app.
      */
      if (
        ACTIVE_STATUSES.has(
          currentStatus
        )
      ) {

        const firstEventType =

          currentStatus === "placed" ||
          currentStatus === "order_placed"

            ? "new_order"

            : "restore";

        sendOrderStatusToSwift(
          preparedOrder,
          firstEventType
        );

      }

      return;

    }


    /*
      Status changed while the app was closed.
    */
    if (
      previousStatus !== currentStatus
    ) {

      saveOrderStatus(
        tableName,
        preparedOrder
      );

      console.log(
        "🔔 Missed status detected after app opened:",
        {
          orderId,
          previousStatus,
          currentStatus
        }
      );

      sendOrderStatusToSwift(
        preparedOrder,
        "missed_status_change"
      );

      return;

    }


    /*
      Same status as before.

      If order is still active,
      tell Swift to restore the tracking card.

      Swift should NOT show a normal notification
      for eventType = restore.
    */
    saveOrderStatus(
      tableName,
      preparedOrder
    );

    if (
      ACTIVE_STATUSES.has(
        currentStatus
      )
    ) {

      sendOrderStatusToSwift(
        preparedOrder,
        "restore"
      );

    }

  }


  /* =====================================================
     PROCESS REALTIME STATUS CHANGE
  ===================================================== */

  function processChangedOrderStatus(
    updatedOrder,
    tableName
  ) {

    const orderId =
      String(
        updatedOrder?.order_id || ""
      ).trim();

    const newStatus =
      normalizeCezooOrderStatus(
        updatedOrder?.order_status
      );

    if (!orderId || !newStatus) {

      console.error(
        "❌ Updated order has no ID or status:",
        updatedOrder
      );

      return;

    }

    const cacheKey =
      getOrderStatusCacheKey(
        tableName,
        orderId
      );

    const previousStatus =

      orderStatusCache.get(
        cacheKey
      ) ||

      readPersistentOrderStatus(
        tableName,
        orderId
      );

    const preparedOrder = {

      ...updatedOrder,

      _table_name:
        tableName

    };


    /*
      Unknown order received from Realtime.
    */
    if (!previousStatus) {

      saveOrderStatus(
        tableName,
        preparedOrder
      );

      const eventType =

        newStatus === "placed" ||
        newStatus === "order_placed"

          ? "new_order"

          : "status_changed";

      sendOrderStatusToSwift(
        preparedOrder,
        eventType
      );

      return;

    }


    /*
      Some other database column changed,
      but order_status did not change.
    */
    if (
      previousStatus === newStatus
    ) {

      console.log(
        "ℹ️ Order updated but status did not change:",
        {
          orderId,
          status: newStatus
        }
      );

      return;

    }


    /*
      Real status change.
    */
    saveOrderStatus(
      tableName,
      preparedOrder
    );

    console.log(
      "🔔 Real order status change detected:",
      {
        orderId,
        previousStatus,
        newStatus
      }
    );

    sendOrderStatusToSwift(
      preparedOrder,
      "status_changed"
    );

  }


  /* =====================================================
     PROCESS NEW ORDER INSERT

     Automatically sends placed to Swift.
     No manual button is needed.
  ===================================================== */

  function processNewOrder(
    newOrder,
    tableName,
    paymentType
  ) {

    const orderId =
      String(
        newOrder?.order_id || ""
      ).trim();

    const status =

      normalizeCezooOrderStatus(
        newOrder?.order_status || "placed"
      ) || "placed";

    if (!orderId) {

      console.error(
        "❌ New order has no order ID:",
        newOrder
      );

      return;

    }

    const preparedOrder = {

      ...newOrder,

      order_status:
        status,

      _table_name:
        tableName,

      _payment_type:
        paymentType

    };


    /*
      Save before sending so it does not duplicate.
    */
    saveOrderStatus(
      tableName,
      preparedOrder
    );


    /*
      Automatically send placed/new order to Swift.
    */
    sendOrderStatusToSwift(
      preparedOrder,
      "new_order"
    );


    console.log(
      `🆕 New ${paymentType} order automatically sent to Swift:`,
      {
        orderId,
        status
      }
    );

  }


  /* =====================================================
     SHOW REALTIME UPDATE IN CONSOLE
  ===================================================== */

  function showRealtimeOrderUpdate(
    order,
    paymentType,
    tableName
  ) {

    const orderId =
      order?.order_id || "—";

    const cacheKey =
      getOrderStatusCacheKey(
        tableName,
        orderId
      );

    const previousStatus =

      orderStatusCache.get(
        cacheKey
      ) ||

      readPersistentOrderStatus(
        tableName,
        orderId
      ) ||

      "—";

    const newStatus =

      normalizeCezooOrderStatus(
        order?.order_status
      ) ||

      "placed";

    console.group(
      `🔔 CEZOO ${paymentType} order update`
    );

    console.log(
      "🆔 Order ID:",
      orderId
    );

    console.log(
      "📱 Mobile:",
      order?.user_mobile || "—"
    );

    console.log(
      "📦 Previous status:",
      previousStatus === "—"

        ? "—"

        : getCezooOrderStatusText(
            previousStatus
          )
    );

    console.log(
      "✅ Current status:",
      getCezooOrderStatusText(
        newStatus
      )
    );

    console.table([
      {

        order_id:
          orderId,

        payment:
          paymentType,

        previous_status:
          previousStatus,

        new_status:
          newStatus,

        readable_status:
          getCezooOrderStatusText(
            newStatus
          ),

        payment_status:
          order?.payment_status ||
          "Pending",

        amount:
          Number(
            order?.total_amount || 0
          ),

        table:
          tableName,

        received_at:
          new Date()
            .toLocaleString("en-IN")

      }
    ]);

    console.groupEnd();

  }


  /* =====================================================
     DEBOUNCED ORDER RELOAD
  ===================================================== */

  function scheduleOrdersConsoleReload() {

    clearTimeout(
      orderReloadTimer
    );

    orderReloadTimer =
      setTimeout(function () {

        /*
          Do not restore tracking during this small
          Realtime refresh because the status was
          already sent by the Realtime handler.
        */
        window
          .checkLoggedUserOrdersInConsole
          ?.({
            restoreTracking: false
          });

      }, 700);

  }


  /* =====================================================
     LOAD ALL LOGGED-USER ORDERS
  ===================================================== */

  window.checkLoggedUserOrdersInConsole =
    async function (
      options = {}
    ) {

      const restoreTracking =
        options.restoreTracking !== false;


      if (orderCheckRunning) {

        console.log(
          "ℹ️ CEZOO order check already running"
        );

        return;

      }


      const user =
        getCezooLoggedUser();


      if (!user) {

        console.log(
          "ℹ️ Order check skipped: user not logged in"
        );

        return;

      }


      const mobile =
        normalizeCezooMobile(
          user.mobile
        );


      if (
        mobile.length !== 10
      ) {

        console.error(
          "❌ Invalid logged-user mobile:",
          user.mobile
        );

        return;

      }


      const mobileVariants =
        getCezooMobileVariants(
          mobile
        );


      orderCheckRunning = true;


      console.group(
        "📦 CEZOO Logged User Orders"
      );


      console.log(
        "👤 User:",
        user.name || "—"
      );


      console.log(
        "📱 Mobile:",
        mobile
      );


      try {

        const [
          cashOrders,
          upiOrders
        ] = await Promise.all([

          loadOrdersFromTable(
            "cash_delivery_orders",
            "Cash",
            mobileVariants
          ),

          loadOrdersFromTable(
            "upi_orders",
            "UPI",
            mobileVariants
          )

        ]);


        const allOrders = [

          ...cashOrders,
          ...upiOrders

        ].sort((first, second) => {

          return (

            new Date(
              second.created_at
            ).getTime() -

            new Date(
              first.created_at
            ).getTime()

          );

        });


        /*
          When the app initially opens:
          detect missed changes and restore tracking.

          After a Realtime update:
          only refresh and save the latest data.
        */
        allOrders.forEach(order => {

          if (restoreTracking) {

            processLoadedOrder(
              order,
              order._table_name
            );

          } else {

            saveOrderStatus(
              order._table_name,
              order
            );

          }

        });


        console.log(
          "✅ Total orders:",
          allOrders.length
        );


        console.log(
          "💵 Cash orders:",
          cashOrders.length
        );


        console.log(
          "📲 UPI orders:",
          upiOrders.length
        );


        if (
          allOrders.length === 0
        ) {

          console.log(
            "ℹ️ No orders found"
          );

          window.cezooConsoleUserOrders = [];

          return;

        }


        console.table(

          allOrders.map(
            (order, index) => ({

              no:
                index + 1,

              order_id:
                order.order_id || "—",

              payment:
                order._payment_type,

              status:
                getCezooOrderStatusText(
                  order.order_status
                ),

              raw_status:
                order.order_status ||
                "placed",

              payment_status:
                order.payment_status ||
                "Pending",

              amount:
                Number(
                  order.total_amount || 0
                ),

              mobile:
                order.user_mobile || "—",

              created_at:
                order.created_at || "—",

              table:
                order._table_name

            })

          )

        );


        window.cezooConsoleUserOrders =
          allOrders;


      } catch (error) {

        console.error(
          "❌ User order loading failed:",
          error
        );


      } finally {

        orderCheckRunning = false;

        console.groupEnd();

      }

    };


  /* =====================================================
     STOP REALTIME
  ===================================================== */

  window.stopLoggedUserOrderStatusRealtime =
    async function () {

      if (!orderRealtimeChannel) {

        console.log(
          "ℹ️ No order Realtime channel active"
        );

        return;

      }

      try {

        await getCezooOrdersClient()
          .removeChannel(
            orderRealtimeChannel
          );

        console.log(
          "🛑 CEZOO order Realtime stopped"
        );

      } catch (error) {

        console.error(
          "❌ Realtime stop failed:",
          error
        );

      } finally {

        orderRealtimeChannel = null;
        currentRealtimeMobile = "";

      }

    };


  /* =====================================================
     START REALTIME
  ===================================================== */

  window.startLoggedUserOrderStatusRealtime =
    async function () {

      const user =
        getCezooLoggedUser();


      if (!user) {

        console.log(
          "ℹ️ Realtime skipped: user not logged in"
        );

        return;

      }


      const mobile =
        normalizeCezooMobile(
          user.mobile
        );


      if (
        mobile.length !== 10
      ) {

        console.error(
          "❌ Invalid mobile for Realtime:",
          user.mobile
        );

        return;

      }


      const mobileVariants =
        getCezooMobileVariants(
          mobile
        );


      if (
        orderRealtimeChannel &&
        currentRealtimeMobile === mobile
      ) {

        console.log(
          "ℹ️ Order Realtime already active:",
          mobile
        );

        return;

      }


      if (orderRealtimeChannel) {

        try {

          await getCezooOrdersClient()
            .removeChannel(
              orderRealtimeChannel
            );

        } catch (error) {

          console.warn(
            "⚠️ Previous Realtime removal failed:",
            error
          );

        }

        orderRealtimeChannel = null;
        currentRealtimeMobile = "";

      }


      const channelName =
        `cezoo-orders-${mobile}-${Date.now()}`;


      orderRealtimeChannel =
        getCezooOrdersClient()
          .channel(channelName)


          /* =============================
             CASH UPDATE
          ============================= */

          .on(
            "postgres_changes",
            {

              event:
                "UPDATE",

              schema:
                "public",

              table:
                "cash_delivery_orders"

            },
            payload => {

              const updatedOrder = {

                ...(payload.new || {}),

                _payment_type:
                  "Cash",

                _table_name:
                  "cash_delivery_orders"

              };


              if (
                !doesOrderBelongToMobile(
                  updatedOrder.user_mobile,
                  mobileVariants
                )
              ) {
                return;
              }


              showRealtimeOrderUpdate(
                updatedOrder,
                "Cash",
                "cash_delivery_orders"
              );


              processChangedOrderStatus(
                updatedOrder,
                "cash_delivery_orders"
              );


              scheduleOrdersConsoleReload();

            }
          )


          /* =============================
             UPI UPDATE
          ============================= */

          .on(
            "postgres_changes",
            {

              event:
                "UPDATE",

              schema:
                "public",

              table:
                "upi_orders"

            },
            payload => {

              const updatedOrder = {

                ...(payload.new || {}),

                _payment_type:
                  "UPI",

                _table_name:
                  "upi_orders"

              };


              if (
                !doesOrderBelongToMobile(
                  updatedOrder.user_mobile,
                  mobileVariants
                )
              ) {
                return;
              }


              showRealtimeOrderUpdate(
                updatedOrder,
                "UPI",
                "upi_orders"
              );


              processChangedOrderStatus(
                updatedOrder,
                "upi_orders"
              );


              scheduleOrdersConsoleReload();

            }
          )


          /* =============================
             CASH INSERT
          ============================= */

          .on(
            "postgres_changes",
            {

              event:
                "INSERT",

              schema:
                "public",

              table:
                "cash_delivery_orders"

            },
            payload => {

              const newOrder = {

                ...(payload.new || {}),

                _payment_type:
                  "Cash",

                _table_name:
                  "cash_delivery_orders"

              };


              if (
                !doesOrderBelongToMobile(
                  newOrder.user_mobile,
                  mobileVariants
                )
              ) {
                return;
              }


              processNewOrder(
                newOrder,
                "cash_delivery_orders",
                "Cash"
              );


              scheduleOrdersConsoleReload();

            }
          )


          /* =============================
             UPI INSERT
          ============================= */

          .on(
            "postgres_changes",
            {

              event:
                "INSERT",

              schema:
                "public",

              table:
                "upi_orders"

            },
            payload => {

              const newOrder = {

                ...(payload.new || {}),

                _payment_type:
                  "UPI",

                _table_name:
                  "upi_orders"

              };


              if (
                !doesOrderBelongToMobile(
                  newOrder.user_mobile,
                  mobileVariants
                )
              ) {
                return;
              }


              processNewOrder(
                newOrder,
                "upi_orders",
                "UPI"
              );


              scheduleOrdersConsoleReload();

            }
          )


          /* =============================
             SUBSCRIBE
          ============================= */

          .subscribe(status => {

            console.log(
              "📡 CEZOO Realtime:",
              status
            );


            if (
              status === "SUBSCRIBED"
            ) {

              currentRealtimeMobile =
                mobile;

              console.log(
                "✅ Listening for Cash + UPI order changes:",
                mobile
              );

            }


            if (
              status === "CHANNEL_ERROR"
            ) {

              console.error(
                "❌ CEZOO Realtime channel error"
              );

            }


            if (
              status === "TIMED_OUT"
            ) {

              console.error(
                "❌ CEZOO Realtime timed out"
              );

            }


            if (
              status === "CLOSED"
            ) {

              console.log(
                "🛑 CEZOO Realtime closed"
              );

            }

          });

    };


  /* =====================================================
     INITIALIZE AFTER LOGIN
  ===================================================== */

  window.initializeLoggedUserOrderStatusCheck =
    async function () {

      const user =
        getCezooLoggedUser();


      if (!user) {

        console.log(
          "ℹ️ Order checker waiting for login"
        );

        return;

      }


      /*
        First load existing orders.

        This:
        - detects status changes while app was closed
        - restores active tracking
      */
      await window
        .checkLoggedUserOrdersInConsole({
          restoreTracking: true
        });


      /*
        Then start Realtime.
      */
      await window
        .startLoggedUserOrderStatusRealtime();

    };


  /* =====================================================
     AUTO START
  ===================================================== */

  function autoStartOrderStatusChecker() {

    const user =
      getCezooLoggedUser();


    if (!user) {

      console.log(
        "ℹ️ Order checker loaded — waiting for login"
      );

      return;

    }


    setTimeout(function () {

      if (!window._supabaseClient) {

        console.log(
          "⏳ Supabase not ready. Retrying..."
        );


        setTimeout(function () {

          window
            .initializeLoggedUserOrderStatusCheck
            ?.();

        }, 1500);


        return;

      }


      window
        .initializeLoggedUserOrderStatusCheck
        ?.();


    }, 800);

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      autoStartOrderStatusChecker
    );

  } else {

    autoStartOrderStatusChecker();

  }


  console.log(
    "✅ CEZOO automatic order tracking bridge loaded"
  );

})();

/* =====================================================
   CEZOO — REAL DELIVERED ORDER INVOICE

   IMPORTANT:
   - Uses the real cash_delivery_orders / upi_orders row.
   - Uses the real items JSON saved in that order.
   - Loads each normal product from its real product_table.
   - Loads name, Telugu name, pack quantity, unit and prices.
   - Keeps Bill Details on the left and Download Invoice on
     the right on exactly one line.
   - Does not wrap, move or rebuild the existing bill section.
===================================================== */

(function () {
  "use strict";

  /*
    This invoice section is a separate IIFE, so it cannot access
    the private getCezooOrdersClient() declared in the tracking IIFE.
    Use its own client getter and wait briefly for index.html to
    initialize window._supabaseClient.
  */
  function getCezooInvoiceSupabaseClient() {

    if (!window._supabaseClient) {

      throw new Error(
        "Supabase is still loading. Please try again in a moment."
      );

    }

    return window._supabaseClient;

  }


  const CEZOO_ORDER_DETAILS_ID =
    "userOrderDetailsContent";

  const CEZOO_INVOICE_BUTTON_CLASS =
    "userOrderInvoiceDownloadBtn";

  const cezooInvoiceProductCache =
    new Map();

  let cezooInvoiceOpenedOrder =
    null;


  function cezooInvoiceText(value) {

    return String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  }


  function cezooInvoiceNumber(value) {

    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : 0;

  }


  function cezooInvoiceStatus(value) {

    return cezooInvoiceText(value)
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  }


  function cezooInvoiceIsDelivered(value) {

    return (
      cezooInvoiceStatus(value) ===
      "delivered"
    );

  }


  function getCezooInvoiceOrderId(order) {

    return cezooInvoiceText(
      order?.order_id ||
      order?.id ||
      ""
    );

  }


  function getCezooInvoiceContent() {

    return document.getElementById(
      CEZOO_ORDER_DETAILS_ID
    );

  }


  function getCezooInvoiceHeading(root) {

    if (!root) {
      return null;
    }

    const headings =
      root.querySelectorAll(
        ".userOrderDetailHeading"
      );

    for (const heading of headings) {

      const headingText =
        cezooInvoiceText(
          heading.textContent
        ).toLowerCase();

      if (
        headingText.includes(
          "bill details"
        )
      ) {
        return heading;
      }

    }

    return null;

  }


  function readCezooOpenedOrderId(root) {

    if (!root) {
      return "";
    }

    const dataOrderId =
      cezooInvoiceText(
        root.dataset?.orderId ||
        root
          .closest("[data-order-id]")
          ?.dataset?.orderId ||
        ""
      );

    if (dataOrderId) {
      return dataOrderId;
    }

    const contentText =
      cezooInvoiceText(
        root.innerText
      );

    const patterns = [
      /order\s*(?:id|no|number|#)\s*[:#-]?\s*([a-z0-9_-]+)/i,
      /#\s*([a-z0-9_-]{4,})/i
    ];

    for (const pattern of patterns) {

      const match =
        contentText.match(pattern);

      if (match?.[1]) {
        return match[1];
      }

    }

    return "";

  }


  function findCezooOpenedInvoiceOrder(
    root
  ) {

    const orders =
      Array.isArray(
        window.cezooConsoleUserOrders
      )
        ? window.cezooConsoleUserOrders
        : [];

    if (!orders.length) {
      return null;
    }

    const openedOrderId =
      readCezooOpenedOrderId(root);

    if (openedOrderId) {

      const exactOrder =
        orders.find(order =>
          getCezooInvoiceOrderId(order)
            .toLowerCase() ===
          openedOrderId.toLowerCase()
        );

      if (exactOrder) {
        return exactOrder;
      }

    }

    /*
      Do not attach a different order's invoice.
      A one-order fallback is safe.
    */
    if (orders.length === 1) {
      return orders[0];
    }

    return null;

  }


  function updateCezooRealInvoiceButton() {

    const root =
      getCezooInvoiceContent();

    if (!root) {
      return;
    }

    const heading =
      getCezooInvoiceHeading(root);

    if (!heading) {
      return;
    }

    const order =
      findCezooOpenedInvoiceOrder(
        root
      );

    cezooInvoiceOpenedOrder =
      order;

    let button =
      heading.querySelector(
        `.${CEZOO_INVOICE_BUTTON_CLASS}`
      );

    const canDownload =
      Boolean(order) &&
      cezooInvoiceIsDelivered(
        order.order_status
      );

    if (!canDownload) {

      button?.remove();
      return;
    }

    if (!button) {

      button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        CEZOO_INVOICE_BUTTON_CLASS;

      button.textContent =
        "Download Invoice";

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();

          downloadCezooRealInvoice(
            this
          );

        }
      );

      /*
        Add only the button.
        Do not replace or wrap existing heading content.
      */
      heading.appendChild(
        button
      );

    }

    button.dataset.orderId =
      getCezooInvoiceOrderId(
        order
      );

  }


  function normalizeCezooSavedItems(
    order
  ) {

    let items =
      order?.items;

    if (
      typeof items === "string"
    ) {

      try {

        items =
          JSON.parse(items);

      } catch (error) {

        console.error(
          "Invalid order items JSON:",
          error
        );

        items = [];

      }

    }

    return Array.isArray(items)
      ? items
      : [];

  }


  async function loadCezooRealInvoiceProducts(
    order
  ) {

    const savedItems =
      normalizeCezooSavedItems(
        order
      );

    if (!savedItems.length) {

      throw new Error(
        "No products were saved in this order."
      );

    }

    const finalProducts =
      new Array(
        savedItems.length
      );

    const groupedProducts = {};


    savedItems.forEach(
      (savedItem, itemIndex) => {

        const productTable =
          cezooInvoiceText(
            savedItem.product_table ||
            savedItem.table ||
            ""
          );

        const isPrintOrder =
          savedItem.product_type ===
            "print_order" ||
          savedItem.type ===
            "print_order" ||
          productTable ===
            "printing";

        const orderedQty =
          cezooInvoiceNumber(
            savedItem.qty ??
            savedItem.ordered_qty ??
            savedItem.quantity ??
            1
          ) || 1;


        if (isPrintOrder) {

          const unitPrice =
            cezooInvoiceNumber(
              savedItem.unit_price ??
              savedItem.discount_price ??
              savedItem.price
            );

          const totalPrice =
            cezooInvoiceNumber(
              savedItem.total_price ??
              savedItem.amount
            ) ||
            (
              unitPrice *
              orderedQty
            );

          finalProducts[
            itemIndex
          ] = {

            name:
              cezooInvoiceText(
                savedItem.name ||
                "CEZOO Xerox & Printing"
              ),

            nameTelugu:"",

            pack:
              [
                savedItem.pages
                  ? `${savedItem.pages} pages`
                  : "",
                savedItem.copies
                  ? `${savedItem.copies} copies`
                  : "",
                savedItem.paper_size ||
                  "",
                savedItem.print_type_text ||
                  savedItem.print_type ||
                  ""
              ]
                .filter(Boolean)
                .join(" · "),

            orderedQty,
            unitPrice,
            totalPrice,
            productTable:
              productTable ||
              "printing"

          };

          return;

        }


        const rawProductId =
          savedItem.product_id ??
          savedItem.id;

        const numericProductId =
          Number(rawProductId);

        const productId =
          Number.isFinite(
            numericProductId
          )
            ? numericProductId
            : cezooInvoiceText(
                rawProductId
              );


        if (
          !productTable ||
          productId === ""
        ) {

          throw new Error(
            "A saved order item is missing product_table or product_id."
          );

        }


        if (
          !groupedProducts[
            productTable
          ]
        ) {

          groupedProducts[
            productTable
          ] = [];

        }


        groupedProducts[
          productTable
        ].push({

          itemIndex,
          productId,
          orderedQty,
          savedItem

        });

      }
    );


    for (
      const [
        productTable,
        groupedItems
      ]
      of Object.entries(
        groupedProducts
      )
    ) {

      const ids = [
        ...new Set(
          groupedItems.map(
            item =>
              item.productId
          )
        )
      ];


      const idsToLoad =
        ids.filter(productId => {

          const cacheKey =
            `${productTable}_${productId}`;

          return (
            !cezooInvoiceProductCache
              .has(cacheKey)
          );

        });


      if (idsToLoad.length) {

        const {
          data,
          error
        } =
          await getCezooInvoiceSupabaseClient()
            .from(productTable)
            .select(`
              id,
              name,
              name_telugu,
              quantity,
              unit,
              original_price,
              discount_price,
              image1
            `)
            .in(
              "id",
              idsToLoad
            );


        if (error) {

          throw new Error(
            `Unable to load products from ${productTable}: ${error.message}`
          );

        }


        (data || []).forEach(
          product => {

            const cacheKey =
              `${productTable}_${product.id}`;

            cezooInvoiceProductCache.set(
              cacheKey,
              {
                ...product,
                product_table:
                  productTable
              }
            );

          }
        );

      }


      groupedItems.forEach(
        groupedItem => {

          const cacheKey =
            `${productTable}_${groupedItem.productId}`;

          const product =
            cezooInvoiceProductCache
              .get(cacheKey);

          if (!product) {

            throw new Error(
              `Product ${groupedItem.productId} was not found in ${productTable}.`
            );

          }


          const savedItem =
            groupedItem.savedItem;


          /*
            Purchase-time saved price is used first.
            Product-table price is the fallback.
          */
          const unitPrice =
            cezooInvoiceNumber(
              savedItem.unit_price ??
              savedItem.price ??
              savedItem.discount_price ??
              product.discount_price ??
              product.original_price
            );


          const totalPrice =
            cezooInvoiceNumber(
              savedItem.total_price ??
              savedItem.amount
            ) ||
            (
              unitPrice *
              groupedItem.orderedQty
            );


          finalProducts[
            groupedItem.itemIndex
          ] = {

            name:
              cezooInvoiceText(
                product.name ||
                `Product ${product.id}`
              ),

            pack:
              cezooInvoiceText(
                [
                  product.quantity,
                  product.unit
                ]
                  .filter(
                    value =>
                      value !==
                        null &&
                      value !==
                        undefined &&
                      value !==
                        ""
                  )
                  .join(" ")
              ),

            orderedQty:
              groupedItem.orderedQty,

            unitPrice,
            totalPrice,

            productTable

          };

        }
      );

    }


    return finalProducts.filter(
      Boolean
    );

  }


  function loadCezooInvoicePdfLibrary() {

    return new Promise(
      (resolve, reject) => {

        if (
          window.jspdf?.jsPDF
        ) {

          resolve(
            window.jspdf.jsPDF
          );

          return;
        }


        const existingScript =
          document.getElementById(
            "cezooRealInvoicePdfLibrary"
          );


        if (existingScript) {

          existingScript.addEventListener(
            "load",
            () => {

              if (
                window.jspdf?.jsPDF
              ) {

                resolve(
                  window.jspdf.jsPDF
                );

              } else {

                reject(
                  new Error(
                    "PDF library loaded incorrectly."
                  )
                );

              }

            },
            {
              once:true
            }
          );


          existingScript.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "Unable to load PDF library."
                )
              ),
            {
              once:true
            }
          );

          return;
        }


        const script =
          document.createElement(
            "script"
          );

        script.id =
          "cezooRealInvoicePdfLibrary";

        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


        script.onload = () => {

          if (
            window.jspdf?.jsPDF
          ) {

            resolve(
              window.jspdf.jsPDF
            );

          } else {

            reject(
              new Error(
                "PDF library loaded incorrectly."
              )
            );

          }

        };


        script.onerror = () =>
          reject(
            new Error(
              "Unable to load PDF library."
            )
          );


        document.head.appendChild(
          script
        );

      }
    );

  }


  function createCezooInvoiceSummary(
    order,
    products
  ) {

    const calculatedItemsTotal =
      products.reduce(
        (total, product) =>
          total +
          product.totalPrice,
        0
      );


    const itemTotal =
      cezooInvoiceNumber(
        order.item_total ??
        calculatedItemsTotal
      );


    const deliveryFee =
      cezooInvoiceNumber(
        order.delivery_fee
      );


    const handlingFee =
      cezooInvoiceNumber(
        order.handling_fee
      );


    const deliveryTip =
      cezooInvoiceNumber(
        order.delivery_tip
      );


    /*
      Coupon information can be stored using different
      column names. Read all common CEZOO variants.
    */
    let appliedCoupon =
      order.applied_coupon ??
      order.coupon ??
      order.coupon_data ??
      null;


    if (
      typeof appliedCoupon === "string"
    ) {

      try {

        appliedCoupon =
          JSON.parse(
            appliedCoupon
          );

      } catch (error) {

        appliedCoupon = {
          code:
            appliedCoupon
        };

      }

    }


    const couponCode =
      cezooInvoiceText(
        order.coupon_code ??
        order.applied_coupon_code ??
        appliedCoupon?.code ??
        appliedCoupon?.coupon_code ??
        appliedCoupon?.name ??
        ""
      );


    const couponPercent =
      cezooInvoiceNumber(
        order.coupon_percent ??
        order.discount_percent ??
        appliedCoupon?.percent ??
        appliedCoupon?.discount_percent
      );


    const couponDiscount =
      Math.max(
        0,
        cezooInvoiceNumber(
          order.coupon_discount_amount ??
          order.coupon_discount ??
          order.discount_amount ??
          order.game_coupon_discount ??
          order.coupon_savings ??
          appliedCoupon?.discount_amount ??
          appliedCoupon?.amount ??
          appliedCoupon?.discount
        )
      );


    const totalBeforeCoupon =
      itemTotal +
      deliveryFee +
      handlingFee +
      deliveryTip;


    const totalAmount =
      cezooInvoiceNumber(
        order.total_amount
      ) ||
      Math.max(
        0,
        totalBeforeCoupon -
        couponDiscount
      );


    const paymentType =
      cezooInvoiceText(
        order.payment_method ||
        order._payment_type
      ).toLowerCase();


    const paymentMethod =
      paymentType.includes("upi") ||
      paymentType.includes("online") ||
      paymentType.includes("card")
        ? "Online / UPI / Card"
        : "Cash on Delivery";


    return {

      orderId:
        getCezooInvoiceOrderId(
          order
        ),

      createdAt:
        order.delivered_at ||
        order.updated_at ||
        order.created_at,

      products,

      totalItems:
        cezooInvoiceNumber(
          order.total_items
        ) ||
        products.reduce(
          (total, product) =>
            total +
            product.orderedQty,
          0
        ),

      itemTotal,
      deliveryFee,
      handlingFee,
      deliveryTip,
      couponCode,
      couponPercent,
      couponDiscount,
      totalBeforeCoupon,
      totalAmount,
      paymentMethod,
      paymentStatus:"PAID"

    };

  }



  /* =====================================================
     SAVE / OPEN PDF WITHOUT ANY SWIFT CODE CHANGE
  ===================================================== */

  function isCezooIOSDevice() {

    const userAgent =
      navigator.userAgent || "";

    const platform =
      navigator.platform || "";

    const touchMac =
      platform === "MacIntel" &&
      navigator.maxTouchPoints > 1;

    return (
      /iPad|iPhone|iPod/i.test(
        userAgent
      ) ||
      touchMac
    );

  }


  function showCezooInvoicePreview(
    objectUrl,
    fileName
  ) {

    document
      .getElementById(
        "cezooInvoicePreviewOverlay"
      )
      ?.remove();


    const overlay =
      document.createElement("div");

    overlay.id =
      "cezooInvoicePreviewOverlay";

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:2147483646;
      background:#fff;
      display:flex;
      flex-direction:column;
      width:100%;
      height:100dvh;
    `;


    const header =
      document.createElement("div");

    header.style.cssText = `
      flex:0 0 auto;
      min-height:56px;
      padding:
        calc(10px + env(safe-area-inset-top))
        14px
        10px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      border-bottom:1px solid #e5e5e5;
      background:#fff;
      font-family:Arial,sans-serif;
    `;


    const closeButton =
      document.createElement("button");

    closeButton.type =
      "button";

    closeButton.textContent =
      "Close";

    closeButton.style.cssText = `
      border:0;
      background:transparent;
      color:#202124;
      font-size:15px;
      font-weight:700;
      padding:8px 4px;
    `;


    const title =
      document.createElement("div");

    title.textContent =
      fileName;

    title.style.cssText = `
      flex:1;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      text-align:center;
      color:#202124;
      font-size:14px;
      font-weight:700;
    `;


    const shareButton =
      document.createElement("button");

    shareButton.type =
      "button";

    shareButton.textContent =
      "Share";

    shareButton.style.cssText = `
      border:0;
      background:transparent;
      color:#16a34a;
      font-size:15px;
      font-weight:800;
      padding:8px 4px;
    `;


    const frame =
      document.createElement("iframe");

    frame.src =
      objectUrl;

    frame.title =
      "CEZOO Invoice";

    frame.style.cssText = `
      width:100%;
      flex:1 1 auto;
      min-height:0;
      border:0;
      background:#f5f5f5;
    `;


    closeButton.addEventListener(
      "click",
      function () {

        overlay.remove();

        setTimeout(
          function () {

            URL.revokeObjectURL(
              objectUrl
            );

          },
          500
        );

      }
    );


    shareButton.addEventListener(
      "click",
      async function () {

        try {

          const response =
            await fetch(objectUrl);

          const blob =
            await response.blob();

          const file =
            new File(
              [blob],
              fileName,
              {
                type:"application/pdf"
              }
            );


          const shared =
            await tryCezooNativePdfShare(
              file
            );

          if (shared) {
            return;
          }


          const link =
            document.createElement("a");

          link.href =
            objectUrl;

          link.download =
            fileName;

          document.body.appendChild(
            link
          );

          link.click();
          link.remove();


        } catch (error) {

          if (
            error?.name !==
            "AbortError"
          ) {

            console.error(
              "Invoice share failed:",
              error
            );

          }

        }

      }
    );


    header.append(
      closeButton,
      title,
      shareButton
    );

    overlay.append(
      header,
      frame
    );

    document.body.appendChild(
      overlay
    );

  }


  function isCezooAndroidDevice() {

    return /Android/i.test(
      navigator.userAgent || ""
    );

  }


  function isCezooMobileDevice() {

    return (
      isCezooIOSDevice() ||
      isCezooAndroidDevice()
    );

  }


  async function tryCezooNativePdfShare(
    pdfFile
  ) {

    if (
      !navigator.share
    ) {
      return false;
    }


    if (
      navigator.canShare &&
      !navigator.canShare({
        files:[pdfFile]
      })
    ) {
      return false;
    }


    try {

      await navigator.share({
        title:"CEZOO Invoice",
        text:"CEZOO order invoice",
        files:[pdfFile]
      });

      return true;


    } catch (error) {

      /*
        Closing the native Share Sheet is a completed
        user action. Do not open another screen after it.
      */
      if (
        error?.name ===
        "AbortError"
      ) {
        return true;
      }


      console.warn(
        "Native PDF share unavailable:",
        error
      );

      return false;

    }

  }


  async function saveCezooInvoiceWithoutSwift(
    pdf,
    fileName
  ) {

    const pdfBlob =
      pdf.output("blob");

    const pdfFile =
      new File(
        [pdfBlob],
        fileName,
        {
          type:"application/pdf"
        }
      );


    /*
      iPhone, iPad and Android:

      First try the browser/WebView native Share Sheet.
      No Swift or Kotlin interface is required.
    */
    if (
      isCezooMobileDevice()
    ) {

      const shared =
        await tryCezooNativePdfShare(
          pdfFile
        );


      if (shared) {
        return;
      }

    }


    const objectUrl =
      URL.createObjectURL(
        pdfBlob
      );


    /*
      Mobile WebView fallback:

      Android WebView may ignore <a download> unless
      Kotlin adds a DownloadListener. Because Kotlin must
      remain unchanged, open a PDF preview inside this same
      web app. The preview has Close and Share buttons.
    */
    if (
      isCezooMobileDevice()
    ) {

      showCezooInvoicePreview(
        objectUrl,
        fileName
      );

      return;

    }


    /*
      Normal desktop Safari, Chrome and other browsers.
    */
    const link =
      document.createElement("a");

    link.href =
      objectUrl;

    link.download =
      fileName;

    link.rel =
      "noopener";

    document.body.appendChild(
      link
    );

    link.click();
    link.remove();


    setTimeout(
      function () {

        URL.revokeObjectURL(
          objectUrl
        );

      },
      4000
    );

  }

  async function downloadCezooRealInvoice(
    button
  ) {

    const root =
      getCezooInvoiceContent();

    const order =
      cezooInvoiceOpenedOrder ||
      findCezooOpenedInvoiceOrder(
        root
      );


    if (!order) {

      alert(
        "Unable to find this order."
      );

      return;
    }


    if (
      !cezooInvoiceIsDelivered(
        order.order_status
      )
    ) {

      alert(
        "Invoice is available only after delivery."
      );

      return;
    }


    const oldText =
      button.textContent;


    try {

      button.disabled = true;

      button.textContent =
        "Preparing...";


      const [
        jsPDF,
        products
      ] =
        await Promise.all([

          loadCezooInvoicePdfLibrary(),

          loadCezooRealInvoiceProducts(
            order
          )

        ]);


      const invoice =
        createCezooInvoiceSummary(
          order,
          products
        );


      let invoiceDate =
        new Date(
          invoice.createdAt ||
          Date.now()
        );


      if (
        Number.isNaN(
          invoiceDate.getTime()
        )
      ) {

        invoiceDate =
          new Date();

      }


      const dateText =
        invoiceDate
          .toLocaleDateString(
            "en-IN"
          );


      const timeText =
        invoiceDate
          .toLocaleTimeString(
            "en-IN",
            {
              hour:"2-digit",
              minute:"2-digit"
            }
          );


      const pdf =
        new jsPDF({
          unit:"mm",
          format:"a4"
        });


      const pageWidth =
        pdf.internal.pageSize
          .getWidth();


      const left = 15;

      const right =
        pageWidth - 15;


      let y = 18;


      pdf.setTextColor(
        22,
        163,
        74
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(24);

      pdf.text(
        "CEZOO",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      y += 7;


      pdf.setTextColor(
        40,
        40,
        40
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        "Groceries in Minutes",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      y += 7;


      pdf.text(
        "Tanuku V Max Opposite, 2nd Floor",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      y += 5;


      pdf.text(
        "Tanuku - 534211 | Phone: +91 93477 68947",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      y += 8;


      pdf.line(
        left,
        y,
        right,
        y
      );


      y += 8;


      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(16);

      pdf.text(
        "TAX INVOICE",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      y += 8;


      pdf.line(
        left,
        y,
        right,
        y
      );


      y += 8;


      pdf.setFontSize(10);


      pdf.text(
        `Bill No: ${invoice.orderId}`,
        left,
        y
      );


      pdf.text(
        `Date: ${dateText}`,
        105,
        y
      );


      pdf.text(
        `Time: ${timeText}`,
        right,
        y,
        {
          align:"right"
        }
      );


      y += 9;


      pdf.setFillColor(
        245,
        245,
        245
      );


      pdf.rect(
        left,
        y - 5,
        right - left,
        8,
        "F"
      );


      pdf.text(
        "S.No",
        left + 2,
        y
      );


      pdf.text(
        "Product",
        left + 18,
        y
      );


      pdf.text(
        "Qty",
        125,
        y
      );


      pdf.text(
        "Rate",
        150,
        y
      );


      pdf.text(
        "Amount",
        right,
        y,
        {
          align:"right"
        }
      );


      y += 7;


      pdf.setFont(
        "helvetica",
        "normal"
      );


      invoice.products.forEach(
        (product, index) => {

          if (y > 255) {

            pdf.addPage();

            y = 20;

          }


          /*
            jsPDF default font does not support Telugu Unicode.
            Print a clean English product line only:
            Tomato (1 kg)
          */
          const cleanProductName =
            cezooInvoiceText(
              product.name
            );

          const cleanProductPack =
            cezooInvoiceText(
              product.pack
            );

          const productDisplayName =
            cleanProductPack
              ? `${cleanProductName} (${cleanProductPack})`
              : cleanProductName;

          const productLines =
            pdf.splitTextToSize(
              productDisplayName,
              83
            );


          pdf.text(
            String(index + 1),
            left + 3,
            y
          );


          pdf.text(
            productLines,
            left + 18,
            y
          );


          pdf.text(
            String(
              product.orderedQty
            ),
            125,
            y
          );


          pdf.text(
            `Rs. ${Number(
              product.unitPrice
            ).toFixed(2)}`,
            150,
            y
          );


          pdf.text(
            `Rs. ${Number(
              product.totalPrice
            ).toFixed(2)}`,
            right,
            y,
            {
              align:"right"
            }
          );


          y += Math.max(
            7,
            productLines.length * 5
          );

        }
      );


      y += 4;


      /*
        Clean totals section.
        Lines are placed only above and below the complete
        section, so no line crosses Grand Total text.
      */
      const totalsLeft = 118;
      const totalsRight = right;
      const totalsLabelX = 122;

      pdf.setDrawColor(
        215,
        215,
        215
      );

      pdf.line(
        left,
        y,
        right,
        y
      );

      y += 8;


      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        `Items Count: ${invoice.totalItems}`,
        left,
        y
      );


      const addInvoiceTotalRow = (
        label,
        amount,
        options = {}
      ) => {

        const {
          bold = false,
          negative = false
        } = options;

        pdf.setFont(
          "helvetica",
          bold
            ? "bold"
            : "normal"
        );

        pdf.setTextColor(
          negative
            ? 22
            : 40,
          negative
            ? 163
            : 40,
          negative
            ? 74
            : 40
        );

        pdf.text(
          label,
          totalsLabelX,
          y
        );

        const amountPrefix =
          negative
            ? "- Rs. "
            : "Rs. ";

        pdf.text(
          `${amountPrefix}${Number(
            amount || 0
          ).toFixed(2)}`,
          totalsRight,
          y,
          {
            align:"right"
          }
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        y += 7;

      };


      addInvoiceTotalRow(
        "Item Total",
        invoice.itemTotal
      );


      addInvoiceTotalRow(
        "Delivery Fee",
        invoice.deliveryFee
      );


      addInvoiceTotalRow(
        "Handling Fee",
        invoice.handlingFee
      );


      if (
        invoice.deliveryTip > 0
      ) {

        addInvoiceTotalRow(
          "Delivery Tip",
          invoice.deliveryTip
        );

      }


      if (
        invoice.couponDiscount > 0
      ) {

        const couponLabelParts = [
          "Coupon Discount",
          invoice.couponCode
            ? `(${invoice.couponCode})`
            : "",
          invoice.couponPercent > 0
            ? `${invoice.couponPercent}%`
            : ""
        ].filter(Boolean);

        addInvoiceTotalRow(
          couponLabelParts.join(" "),
          invoice.couponDiscount,
          {
            negative:true
          }
        );

      }


      /*
        Grand Total has its own soft background and
        separate top/bottom borders.
      */
      const grandTotalTop =
        y - 2;

      pdf.setDrawColor(
        190,
        190,
        190
      );

      pdf.line(
        totalsLeft,
        grandTotalTop,
        totalsRight,
        grandTotalTop
      );

      pdf.setFillColor(
        246,
        255,
        249
      );

      pdf.rect(
        totalsLeft,
        grandTotalTop + 1,
        totalsRight - totalsLeft,
        10,
        "F"
      );

      y += 6;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(11);

      pdf.setTextColor(
        20,
        20,
        20
      );

      pdf.text(
        "Grand Total",
        totalsLabelX,
        y
      );

      pdf.setTextColor(
        22,
        163,
        74
      );

      pdf.text(
        `Rs. ${Number(
          invoice.totalAmount || 0
        ).toFixed(2)}`,
        totalsRight,
        y,
        {
          align:"right"
        }
      );

      y += 6;

      pdf.setDrawColor(
        190,
        190,
        190
      );

      pdf.line(
        totalsLeft,
        y,
        totalsRight,
        y
      );

      pdf.setTextColor(
        40,
        40,
        40
      );

      pdf.setFontSize(10);

      y += 10;


      pdf.setFont(
        "helvetica",
        "bold"
      );


      pdf.text(
        `Payment Method: ${invoice.paymentMethod}`,
        left,
        y
      );


      y += 7;


      pdf.text(
        `Payment Status: ${invoice.paymentStatus}`,
        left,
        y
      );


      y += 15;


      pdf.setTextColor(
        22,
        163,
        74
      );


      pdf.text(
        "Thank You for Choosing CEZOO",
        pageWidth / 2,
        y,
        {
          align:"center"
        }
      );


      const safeOrderId =
        String(invoice.orderId)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );


      const invoiceFileName =
        `CEZOO-Invoice-${safeOrderId}.pdf`;


      /*
        iPhone WKWebView does not always support jsPDF's
        normal <a download> flow.

        This works without changing Swift:
        1. iPhone/iPad WebView → opens the native iOS Share Sheet.
        2. Safari/Chrome/Android → downloads normally.
        3. Final fallback → opens an in-page PDF preview.
      */
      await saveCezooInvoiceWithoutSwift(
        pdf,
        invoiceFileName
      );


    } catch (error) {

      console.error(
        "CEZOO invoice failed:",
        error
      );


      alert(
        error?.message ||
        "Unable to download invoice."
      );


    } finally {

      button.disabled = false;

      button.textContent =
        oldText;

    }

  }


  function startCezooInvoiceWatcher() {

    updateCezooRealInvoiceButton();


    const observer =
      new MutationObserver(
        function () {

          clearTimeout(
            window
              .cezooInvoiceWatcherTimer
          );


          window
            .cezooInvoiceWatcherTimer =
              setTimeout(
                updateCezooRealInvoiceButton,
                80
              );

        }
      );


    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true,
        characterData:true,
        attributes:true,
        attributeFilter:[
          "class",
          "data-order-id",
          "data-order-status"
        ]
      }
    );

  }


  window.updateCezooRealInvoiceButton =
    updateCezooRealInvoiceButton;


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startCezooInvoiceWatcher,
      {
        once:true
      }
    );

  } else {

    startCezooInvoiceWatcher();

  }

})();

