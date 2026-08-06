window.openCezooProfile = function(){

  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );

  if(user && user.name && user.mobile && user.otp && user.login === true){

    const capitalName = user.name
      .toLowerCase()
      .split(" ")
      .filter(word => word)
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");

    document.getElementById("profileUserName").innerText =
      capitalName;

    document.getElementById("profileUserMobile").innerText =
      "+91 " + user.mobile;

    document
      .getElementById("cezooProfilePopup")
      .classList.add("open");

    document.body.style.overflow = "hidden";
loadProfileRecentOrders();
  }else{

    openLoginPopup();

  }
};

window.closeCezooProfile = function(){

  // Do not close profile while a child popup is open
  if(anyChildPopupOpen()){
    return;
  }

  document
    .getElementById("cezooProfilePopup")
    ?.classList.remove("open");

  document
    .getElementById("profileMenu")
    ?.classList.remove("show");

  document.body.style.overflow = "";

};

const profileBackBtn = document.getElementById("profileBackBtn");
const profileDotsBtn = document.getElementById("profileDotsBtn");
const profileMenuBox = document.getElementById("profileMenu");

profileBackBtn.onclick = function(){
  closeCezooProfile();
};

profileDotsBtn.onclick = function(e){
  e.stopPropagation();
  profileMenuBox.classList.toggle("show");
};

profileMenuBox.onclick = function(e){
  e.stopPropagation();
};

document.addEventListener("click", function(){
  profileMenuBox.classList.remove("show");
});

window.logoutUser = function(){

  // Logout
  localStorage.removeItem("cezooUser");
  localStorage.removeItem("cezooLastName");

  profileMenuBox.classList.remove("show");
  closeCezooProfile();

  // Reset all login fields
  document.getElementById("nameInput").value = "";
  document.getElementById("mobileInput").value = "";

  document.querySelectorAll("#otpBoxes input")
    .forEach(input => input.value = "");

  document.getElementById("error").innerText = "";

  confirmationResult = null;

  showStep("nameStep", "Log in or Sign up");

  setTimeout(function(){
    openLoginPopup();
    document.getElementById("nameInput").focus();
  }, 150);

};

function openTermsPopup(){
  document.getElementById("termsPopup").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeTermsPopup(){
  document.getElementById("termsPopup").classList.remove("open");
  document.body.style.overflow = "hidden"; // keep profile popup locked
}

let termsStartX = 0;
let termsStartY = 0;

const termsPopup = document.getElementById("termsPopup");

termsPopup.addEventListener("touchstart", function(e){
    e.stopPropagation();
  const touch = e.touches[0];
  termsStartX = touch.clientX;
  termsStartY = touch.clientY;
});

termsPopup.addEventListener("touchend", function(e){
      e.stopPropagation();

  const touch = e.changedTouches[0];

  const diffX = touch.clientX - termsStartX;
  const diffY = touch.clientY - termsStartY;

  if(Math.abs(diffX) > 90 && Math.abs(diffY) < 70){
    closeTermsPopup();
  }
});

window.openRefundPopup = function(){
  document
    .getElementById("refundPopup")
    .classList.add("open");

  document.body.style.overflow = "hidden";
};


window.closeRefundPopup = function(){
  document
    .getElementById("refundPopup")
    .classList.remove("open");

  // profile is still open behind refund popup
  document.body.style.overflow = "hidden";
};


let refundStartX = 0;
let refundStartY = 0;

const refundPopupBox =
  document.getElementById("refundPopup");


refundPopupBox.addEventListener("touchstart", function(e){
  e.stopPropagation();

  const touch = e.touches[0];

  refundStartX = touch.clientX;
  refundStartY = touch.clientY;

});


refundPopupBox.addEventListener("touchend", function(e){
  e.stopPropagation();

  const touch = e.changedTouches[0];

  const diffX =
    touch.clientX - refundStartX;

  const diffY =
    touch.clientY - refundStartY;


 if(
  Math.abs(diffX) > 90 &&
  Math.abs(diffY) < 70
){
  closeRefundPopup();
}

});

window.openCouponsPopup = function(){
  document.getElementById("couponsPopup").classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeCouponsPopup = function(){
  document.getElementById("couponsPopup").classList.remove("open");
  document.body.style.overflow = "hidden";
};

let couponsStartX = 0;
let couponsStartY = 0;

const couponsPopupBox = document.getElementById("couponsPopup");

couponsPopupBox.addEventListener("touchstart", function(e){
      e.stopPropagation();

  const touch = e.touches[0];
  couponsStartX = touch.clientX;
  couponsStartY = touch.clientY;
});

couponsPopupBox.addEventListener("touchend", function(e){
      e.stopPropagation();

  const touch = e.changedTouches[0];

  const diffX = touch.clientX - couponsStartX;
  const diffY = touch.clientY - couponsStartY;

  if(Math.abs(diffX) > 90 && Math.abs(diffY) < 70){
    closeCouponsPopup();
  }
});

window.openNotificationsPopup = function(){
  document.getElementById("notificationsPopup").classList.add("open");
  document.body.style.overflow = "hidden";

  document.getElementById("appNotificationToggle").checked =
    localStorage.getItem("cezooAppNotifications") === "on";

  document.getElementById("whatsappNotificationToggle").checked =
    localStorage.getItem("cezooWhatsappNotifications") === "on";
};

window.closeNotificationsPopup = function(){
  document.getElementById("notificationsPopup").classList.remove("open");
  document.body.style.overflow = "hidden";
};

document.getElementById("appNotificationToggle").addEventListener("change", function(){

  if(this.checked){

    localStorage.setItem("cezooAppNotifications", "on");

    if(window.webkit && window.webkit.messageHandlers.requestNotificationPermission){
      window.webkit.messageHandlers.requestNotificationPermission.postMessage("ask");
    }

  }else{

    localStorage.setItem("cezooAppNotifications", "off");

  }

});

document.getElementById("whatsappNotificationToggle").addEventListener("change", function(){
  localStorage.setItem(
    "cezooWhatsappNotifications",
    this.checked ? "on" : "off"
  );
});

let notificationsStartX = 0;
let notificationsStartY = 0;

const notificationsPopupBox =
  document.getElementById("notificationsPopup");

notificationsPopupBox.addEventListener("touchstart", function(e){
    e.stopPropagation();
  const touch = e.touches[0];
  notificationsStartX = touch.clientX;
  notificationsStartY = touch.clientY;
});

notificationsPopupBox.addEventListener("touchend", function(e){
    e.stopPropagation();
  const touch = e.changedTouches[0];

  const diffX = touch.clientX - notificationsStartX;
  const diffY = touch.clientY - notificationsStartY;

  if(Math.abs(diffX) > 90 && Math.abs(diffY) < 70){
    closeNotificationsPopup();
  }
});

window.openSellerPopup = function(){
  document
    .getElementById("sellerPopup")
    .classList.add("open");

  document.body.style.overflow = "hidden";
};


window.closeSellerPopup = function(){
  document
    .getElementById("sellerPopup")
    .classList.remove("open");

  document.body.style.overflow = "hidden";
};


let sellerStartX = 0;
let sellerStartY = 0;

const sellerPopupBox =
  document.getElementById("sellerPopup");


sellerPopupBox.addEventListener("touchstart", function(e){
e.stopPropagation();
  const touch = e.touches[0];

  sellerStartX = touch.clientX;
  sellerStartY = touch.clientY;

});


sellerPopupBox.addEventListener("touchend", function(e){
e.stopPropagation();
  const touch = e.changedTouches[0];

  const diffX = touch.clientX - sellerStartX;
  const diffY = touch.clientY - sellerStartY;

  if(
    Math.abs(diffX) > 90 &&
    Math.abs(diffY) < 70
  ){
    closeSellerPopup();
  }

});

function anyChildPopupOpen(){
  return (
    document
  .getElementById("savedAddressPopup")
  ?.classList.contains("open") ||

    document.getElementById("termsPopup")?.classList.contains("open") ||
    document.getElementById("refundPopup")?.classList.contains("open") ||
    document.getElementById("couponsPopup")?.classList.contains("open") ||
    document
  .getElementById("suggestProductPopup")
  ?.classList.contains("open") ||
    document.getElementById("notificationsPopup")?.classList.contains("open") ||
    document.getElementById("sellerPopup")?.classList.contains("open") ||
    document.getElementById("yourOrdersPopup")?.classList.contains("open")
  );
}
window.openYourOrdersPopup = function(){

  document
    .getElementById("yourOrdersPopup")
    .classList.add("open");

  document.body.style.overflow = "hidden";
};


window.closeYourOrdersPopup = function(){

  document
    .getElementById("yourOrdersPopup")
    .classList.remove("open");

  // profile popup remains open
  document.body.style.overflow = "hidden";
};
let yourOrdersStartX = 0;
let yourOrdersStartY = 0;

const yourOrdersPopupBox =
  document.getElementById("yourOrdersPopup");

if(yourOrdersPopupBox){

  yourOrdersPopupBox.addEventListener(
    "touchstart",
    function(e){

      /*
        Don't close Your Orders when the
        Order Details page is open.
      */
      if(
        document
          .getElementById("userOrderDetailsPage")
          ?.classList.contains("open")
      ){
        return;
      }

      e.stopPropagation();

      const touch = e.touches[0];

      yourOrdersStartX = touch.clientX;
      yourOrdersStartY = touch.clientY;

    },
    { passive:true }
  );


  yourOrdersPopupBox.addEventListener(
    "touchend",
    function(e){

      if(
        document
          .getElementById("userOrderDetailsPage")
          ?.classList.contains("open")
      ){
        return;
      }

      e.stopPropagation();

      const touch = e.changedTouches[0];

      const diffX =
        touch.clientX - yourOrdersStartX;

      const diffY =
        touch.clientY - yourOrdersStartY;

      if(
        Math.abs(diffX) > 90 &&
        Math.abs(diffY) < 70
      ){
        closeYourOrdersPopup();
      }

    },
    { passive:true }
  );

}


/* ================================
   OPEN SAVED ADDRESS
================================ */

window.openSavedAddressPopup = function(){

  const popup =
    document.getElementById("savedAddressPopup");

  popup.classList.add("open");

  document.body.style.overflow = "hidden";

  renderSavedAddresses();

};


/* ================================
   CLOSE SAVED ADDRESS
================================ */

window.closeSavedAddressPopup = function(){

  const popup =
    document.getElementById("savedAddressPopup");

  popup.classList.remove("open");

  // Keep body locked because profile popup
  // is still open behind this popup

  document.body.style.overflow = "hidden";

};


/* ================================
   SHOW SAVED LOCATIONS
================================ */

function renderSavedAddresses(){

  const list =
    document.getElementById("savedAddressList");


  const addresses = JSON.parse(
    localStorage.getItem("recentLocations") || "[]"
  );


  if(addresses.length === 0){

    list.innerHTML = `
      <div class="noSavedAddress">
        No saved address found
      </div>
    `;

    return;
  }


  list.innerHTML = addresses.map((loc, index) => {

    return `

      <div class="savedAddressCard">

        <div class="savedAddressCardIcon">
          <i class="fa-solid fa-location-dot"></i>
        </div>


        <div class="savedAddressCardText">

          <h3>
            Saved Address ${index + 1}
          </h3>

          <p>
            ${loc.name}
          </p>

        </div>

      </div>

    `;

  }).join("");

}


/* ================================
   SWIPE TO CLOSE
================================ */

let savedAddressStartX = 0;
let savedAddressStartY = 0;


const savedAddressPopupBox =
  document.getElementById("savedAddressPopup");


savedAddressPopupBox.addEventListener(
  "touchstart",
  function(e){

    // IMPORTANT:
    // Prevent profile popup swipe listener
    e.stopPropagation();


    const touch = e.touches[0];

    savedAddressStartX =
      touch.clientX;

    savedAddressStartY =
      touch.clientY;

  }
);


savedAddressPopupBox.addEventListener(
  "touchend",
  function(e){

    // IMPORTANT:
    // Only close Saved Address popup
    e.stopPropagation();


    const touch =
      e.changedTouches[0];


    const diffX =
      touch.clientX -
      savedAddressStartX;


    const diffY =
      touch.clientY -
      savedAddressStartY;


    if(
      Math.abs(diffX) > 90 &&
      Math.abs(diffY) < 70
    ){

      closeSavedAddressPopup();

    }

  }
);

function openAddressSheetFromProfile(){

  // close saved address page first
  document.getElementById("savedAddressPopup")
    ?.classList.remove("open");

  // close profile page also, so sheet works normally
  document.getElementById("cezooProfilePopup")
    ?.classList.remove("open");

  document.body.style.overflow = "";

  setTimeout(() => {
    openSheet();
  }, 100);
}


/* =====================================================
   USER ORDERS DATABASE
===================================================== */
function getOrdersSupabaseClient(){

  if(!window._supabaseClient){
    throw new Error("Supabase client is not initialized");
  }

  return window._supabaseClient;
}
/*
  This creates a separate Supabase connection only for
  loading the user's orders.

  If you already have a Supabase client called:
  window.supabaseClient
  it will use that client.
*/


/* =====================================================
   ORDER STATE
===================================================== */

let loggedUserOrders = [];
let selectedCancelOrder = null;
let selectedCancelOrderIndex = null;
let orderCancelSaving = false;
const userOrdersProductCache = {};
let userOrderTrackingMap = null;
let userOrderBikeMarker = null;
let userOrderCustomerMarker = null;
let userOrderRouteLine = null;
let userOrderTrackingTimer = null;
let userOrderTrackingRequestRunning = false;
let currentTrackedUserOrder = null;
let userOrderMapFirstFit = true;
let userOrderRealtimeChannel = null;
let currentOpenUserOrderIndex = null;
let userOrderRealtimeRefreshing = false;

/* MAP RAIN EFFECT STATE */
let userOrderMapRainChannel = null;
let userOrderMapRainEnabled = false;

/* =====================================================
   HELPERS
===================================================== */

function userOrderEscape(value){

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function userOrderNumber(value){

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;

}


function userOrderMoney(value){

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:"currency",
      currency:"INR",
      maximumFractionDigits:2
    }
  ).format(userOrderNumber(value));

}


function userOrderDate(value){

  if(!value){
    return "—";
  }

  const date = new Date(value);

  if(Number.isNaN(date.getTime())){
    return String(value);
  }

  return date.toLocaleString(
    "en-IN",
    {
      day:"2-digit",
      month:"short",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit",
      hour12:true
    }
  );

}


function isUserOrderFinished(status){

  const cleanStatus =
    String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  return [
    "delivered",
    "cancelled",
    "canceled"
  ].includes(cleanStatus);
}


function userOrderStatusText(status){

  const labels = {
    placed:"Order Placed",
    packed:"Packed",
    on_the_way:"On the Way",
    delivered:"Delivered",
    cancelled:"Cancelled",
    canceled:"Cancelled"
  };

  return labels[status] || "Order Placed";

}


function parseUserOrderItems(items){

  if(Array.isArray(items)){
    return items;
  }

  if(typeof items === "string"){

    try{

      const parsed = JSON.parse(items);

      return Array.isArray(parsed)
        ? parsed
        : [];

    }catch(error){

      console.error(
        "Order items JSON error:",
        error
      );

    }

  }

  return [];

}


function getLoggedUserMobile(){

  try{

    const user = JSON.parse(
      localStorage.getItem("cezooUser") || "null"
    );

    if(!user || !user.mobile){
      return "";
    }

    return String(user.mobile)
      .replace(/\D/g, "")
      .slice(-10);

  }catch(error){

    console.error(
      "Logged user read error:",
      error
    );

    return "";

  }

}


/* =====================================================
   OPEN / CLOSE YOUR ORDERS
===================================================== */

window.openYourOrdersPopup = function(){

  const popup =
    document.getElementById("yourOrdersPopup");

  if(!popup){
    return;
  }

  popup.classList.add("open");

  document.body.style.overflow = "hidden";

  closeUserOrderDetails();

  loadLoggedUserOrders();

};


window.closeYourOrdersPopup = function(){

  document
    .getElementById("yourOrdersPopup")
    ?.classList.remove("open");

  document
    .getElementById("userOrderDetailsPage")
    ?.classList.remove("open");

  /*
    Profile popup is still open behind it,
    so body must remain locked.
  */

  document.body.style.overflow = "hidden";

};


window.closeUserOrderDetails = async function(){
  await stopUserOrderRealtime();

currentOpenUserOrderIndex = null;
  stopUserOrderLiveTracking();

  document
    .getElementById("userOrderDetailsPage")
    ?.classList.remove("open");

  removeUserOrderMapRain();

  if(userOrderTrackingMap){

    userOrderTrackingMap.remove();
    userOrderTrackingMap = null;

  }

  document.body.style.overflow = "hidden";


  // IMPORTANT:
  // Load Your Orders list before user sees parent page

  const container =
    document.getElementById("yourOrdersContent");

  if(container){

    container.innerHTML = `
      <div class="userOrdersState">

        <div class="userOrdersSpinner"></div>

        <h3>Loading your orders</h3>

        <p>Please wait...</p>

      </div>
    `;

  }

  await loadLoggedUserOrders();

};


/* =====================================================
   LOAD FIRST PRODUCT FOR ORDER CARD
===================================================== */

async function loadSingleOrderProduct(item){

  if(!item){
    return null;
  }
/* XEROX / PRINT ORDER */
if(
  item.product_type === "print_order" ||
  item.product_table === "printing"
){

  const files =
    Array.isArray(item.files)
      ? item.files
      : [];

  return {
    id: item.product_id,

    product_table: "printing",
    is_print_order: true,

    name:
      item.name ||
      "CEZOO Xerox & Printing",

    ordered_qty:
      userOrderNumber(item.qty) || 1,

    pages:
      userOrderNumber(item.pages),

    copies:
      userOrderNumber(item.copies) || 1,

    print_type:
      item.print_type || "",

    print_type_text:
      item.print_type_text ||
      item.print_type ||
      "",

    paper_size:
      item.paper_size || "",

    side_text:
      item.side_text ||
      item.side_type ||
      "",

    orientation_text:
      item.orientation_text ||
      item.orientation ||
      "",

    binding_text:
      item.binding_text ||
      item.binding ||
      "",

    files: files,

    quantity: "",
    unit: "",

    original_price:
      userOrderNumber(
        item.unit_price ||
        item.total_price
      ),

    discount_price:
      userOrderNumber(
        item.unit_price ||
        item.total_price
      ),

    image1: ""
  };
}
  const tableName =
    String(item.product_table || "").trim();

  const productId =
    Number(item.product_id);


  if(
    !tableName ||
    !Number.isFinite(productId)
  ){
    return null;
  }


  const cacheKey =
    `${tableName}_${productId}`;


  if(userOrdersProductCache[cacheKey]){

    return {
      ...userOrdersProductCache[cacheKey],
      ordered_qty:
        userOrderNumber(item.qty) || 1
    };

  }


const { data, error } =
  await getOrdersSupabaseClient()
      .from(tableName)
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
      .eq("id", productId)
      .maybeSingle();


  if(error){

    console.error(
      `Could not load product from ${tableName}:`,
      error
    );

    return null;

  }


  if(!data){
    return null;
  }


  userOrdersProductCache[cacheKey] = {
    ...data,
    product_table:tableName
  };


  return {
    ...data,
    product_table:tableName,
    ordered_qty:
      userOrderNumber(item.qty) || 1
  };

}


/* =====================================================
   LOAD ALL PRODUCTS FOR ONE ORDER
===================================================== */

async function loadAllUserOrderProducts(items){

  const savedItems =
    parseUserOrderItems(items);


  if(savedItems.length === 0){
    return [];
  }


  const products =
    await Promise.all(

      savedItems.map(async item => {

        const product =
          await loadSingleOrderProduct(item);


        if(product){
          return product;
        }


        return {
          id:item.product_id,
          product_table:item.product_table,
          ordered_qty:
            userOrderNumber(item.qty) || 1,
          name:"Product information unavailable",
          quantity:"",
          unit:"",
          original_price:0,
          discount_price:0,
          image1:""
        };

      })

    );


  return products;

}


/* =====================================================
   LOAD ORDERS BY MOBILE NUMBER
===================================================== */

async function loadLoggedUserOrders(){

  const container =
    document.getElementById("yourOrdersContent");


  if(!container){
    return;
  }


  const mobile =
    getLoggedUserMobile();


  if(!mobile){

    container.innerHTML = `

      <div class="userOrdersState">

        <i class="fa-solid fa-user-lock"></i>

        <h3>Login required</h3>

        <p>
          Please log in to view your orders.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML = `

    <div class="userOrdersState">

      <div class="userOrdersSpinner"></div>

      <h3>Loading your orders</h3>

      

    </div>
  `;


  

  const mobileVariants = [
    mobile,
    `91${mobile}`,
    `+91${mobile}`,
    `+91 ${mobile}`
  ];


  try{

    const [
      cashResponse,
      upiResponse
    ] = await Promise.all([

      getOrdersSupabaseClient()
  .from("cash_delivery_orders")
        .select("*")
        .in("user_mobile", mobileVariants)
        .order("created_at", {
          ascending:false
        }),

     getOrdersSupabaseClient()
  .from("upi_orders")
        .select("*")
        .in("user_mobile", mobileVariants)
        .order("created_at", {
          ascending:false
        })

    ]);


    if(cashResponse.error){
      throw cashResponse.error;
    }

    if(upiResponse.error){
      throw upiResponse.error;
    }


    const cashOrders =
      (cashResponse.data || []).map(order => ({
        ...order,
        _order_type:"cash"
      }));


    const upiOrders =
      (upiResponse.data || []).map(order => ({
        ...order,
        _order_type:"upi"
      }));


    loggedUserOrders = [
      ...cashOrders,
      ...upiOrders
    ].sort((first, second) => {

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );

    });


    await renderLoggedUserOrders();


  }catch(error){

    console.error(
      "User orders load error:",
      error
    );


    container.innerHTML = `

      <div class="userOrdersState">

        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>Could not load orders</h3>

        <p>
          ${userOrderEscape(
            error.message ||
            "Please try again."
          )}
        </p>

      </div>
    `;

  }

}


/* =====================================================
   RENDER USER ORDER CARDS
===================================================== */

async function renderLoggedUserOrders(){

  const container =
    document.getElementById("yourOrdersContent");


  if(loggedUserOrders.length === 0){

    container.innerHTML = `

      <div class="userOrdersState">

        <i class="fa-regular fa-box-open"></i>

        <h3>No orders found</h3>

       
      </div>
    `;

    return;

  }


  const cards =
    await Promise.all(

      loggedUserOrders.map(
        async (order, index) => {

          const items =
            parseUserOrderItems(order.items);


          
const orderProducts =
  await loadAllUserOrderProducts(items);



const orderImagesHtml =
  orderProducts.length
    ? orderProducts.map(product => {

        return `
          <div class="userOrderMiniImage">

           ${
  product.is_print_order
    ? `
      <i
        class="fa-solid fa-print"
        style="color:#555;font-size:25px"
      ></i>
    `
    : product.image1
      ? `
        <img
          src="${userOrderEscape(product.image1)}"
          alt="${userOrderEscape(product.name)}"
          loading="lazy"
        >
      `
      : `
        <i
          class="fa-solid fa-box"
          style="color:#bbb;font-size:22px"
        ></i>
      `
}

            <span>
              ×${userOrderNumber(product.ordered_qty) || 1}
            </span>

          </div>
        `;

      }).join("")
    : `
      <div class="userOrderMiniImage">
        <i class="fa-solid fa-box"></i>
      </div>
    `;

          const remainingItems =
            Math.max(
              0,
              items.length - 1
            );
const totalItemCount = items.reduce((total, item) => {
  return total + (userOrderNumber(item.qty) || 1);
}, 0);

          const statusClass =
            String(
              order.order_status || "placed"
            )
            .toLowerCase()
            .replace(/[^a-z_]/g, "");


          return `

            <div
              class="userOrderCard"
              onclick="openRecentOrderDetails(${index})"
            >

              <div class="userOrderTopRow">

              <div class="userOrderImagesViewport">

  <div class="userOrderImagesRow">
    ${orderImagesHtml}
  </div>

</div>


                <div class="userOrderMainInfo">

               

                  <div class="userOrderQuantity">
  Total Items: ${totalItemCount}
</div>

                  <div class="userOrderId">
                    Order ID:
                    ${userOrderEscape(order.order_id || "—")}
                  </div>
  <div class="userOrderCustomerName">
    Name:
    ${userOrderEscape(order.user_name || "—")}
  </div>

    <div class="userOrderCustomerMobile">
    Mobile:
    ${userOrderEscape(order.user_mobile || "—")}
  </div>
                </div>


                <div class="userOrderArrow">

                  <i class="fa-solid fa-chevron-right"></i>

                </div>

              </div>


              <div class="userOrderDivider"></div>


              <div class="userOrderAddress">

                <i class="fa-solid fa-location-dot"></i>

                <span>
                  ${userOrderEscape(
                    order.address ||
                    order.village ||
                    "Delivery address unavailable"
                  )}
                </span>

              </div>


              <div class="userOrderBottomRow">

                <div
                  class="userOrderStatus ${statusClass}"
                >
                  ${userOrderEscape(
                    userOrderStatusText(
                      order.order_status
                    )
                  )}
                </div>


                <div class="userOrderPrice">

                  ${userOrderMoney(
                    order.total_amount
                  )}

                </div>

              </div>

            </div>
          `;

        }
      )

    );


  container.innerHTML =
    cards.join("");

}

/* =====================================================
   MAP RAIN EFFECT

   Shows falling rain only when:
   cezoo_status_bar.is_visible = true
   cezoo_status_bar.status_type = "rain"
===================================================== */

function ensureUserOrderMapRainStyles(){

  if(
    document.getElementById(
      "userOrderMapRainStyles"
    )
  ){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "userOrderMapRainStyles";

  style.textContent = `

    .userOrderTrackingMapWrap{
      position:relative !important;
      overflow:hidden !important;
    }

    #userOrderTrackingMap{
      position:relative;
      z-index:1;
      overflow:hidden;
    }

    .userOrderMapRainLayer{
      position:absolute;
      inset:0;
      z-index:9998;
      overflow:hidden;
      pointer-events:none;
      border-radius:inherit;
    }

    .userOrderMapRainLayer::before{
      content:"";
      position:absolute;
      inset:0;
      background:
        linear-gradient(
          180deg,
          rgba(21,48,66,.10) 0%,
          rgba(28,74,98,.04) 48%,
          rgba(255,255,255,.02) 100%
        );
      pointer-events:none;
    }

    .userOrderMapRainDrop{
      position:absolute;
      left:var(--rain-left);
      top:-18%;

      width:2px;
      height:var(--rain-height);

      border-radius:999px;

      opacity:var(--rain-opacity);

      background:
        linear-gradient(
          to bottom,
          rgba(26,120,175,0),
          rgba(18,126,190,1)
        );

      box-shadow:
        0 0 2px rgba(255,255,255,.95);

      filter:
        drop-shadow(
          0 0 2px
          rgba(15,110,175,.8)
        );

      transform:rotate(12deg);

      animation:
        userOrderMapRainFall
        var(--rain-speed)
        linear
        infinite;

      animation-delay:
        var(--rain-delay);
    }

    @keyframes userOrderMapRainFall{

      0%{
        transform:
          translate3d(0,-15%,0)
          rotate(12deg);

        opacity:0;
      }

      10%{
        opacity:var(--rain-opacity);
      }

      100%{
        transform:
          translate3d(
            var(--rain-drift),
            760px,
            0
          )
          rotate(12deg);

        opacity:.08;
      }

    }

    .userOrderMapThunderFlash{
      position:absolute;
      inset:0;
      z-index:9999;
      pointer-events:none;
      opacity:0;

      background:
        radial-gradient(
          circle at 72% 12%,
          rgba(255,255,255,.92) 0%,
          rgba(205,232,255,.42) 18%,
          rgba(120,175,220,.12) 42%,
          transparent 68%
        );

      animation:
        userOrderMapThunderFlash
        8.5s
        linear
        infinite;
    }

    .userOrderMapLightning{
      position:absolute;
      top:5%;
      right:17%;
      width:3px;
      height:88px;
      z-index:10000;
      opacity:0;
      pointer-events:none;

      background:
        linear-gradient(
          to bottom,
          rgba(255,255,255,.98),
          rgba(196,226,255,.9),
          rgba(116,185,235,.15)
        );

      box-shadow:
        0 0 7px rgba(255,255,255,.95),
        0 0 16px rgba(115,185,240,.8);

      transform:
        rotate(15deg)
        skewX(-8deg);

      clip-path:
        polygon(
          45% 0,
          100% 0,
          58% 43%,
          92% 43%,
          0 100%,
          34% 54%,
          6% 54%
        );

      animation:
        userOrderMapLightningStrike
        8.5s
        linear
        infinite;
    }

    @keyframes userOrderMapThunderFlash{
      0%,70%,100%{opacity:0}
      72%{opacity:.18}
      73%{opacity:0}
      74%{opacity:.72}
      76%{opacity:0}
    }

    @keyframes userOrderMapLightningStrike{
      0%,70%,100%{opacity:0}
      72%{opacity:.45}
      73%{opacity:0}
      74%{opacity:1}
      75.5%{opacity:0}
    }

    @media(prefers-reduced-motion:reduce){

      .userOrderMapRainDrop{
        animation-duration:1.8s;
      }

      .userOrderMapThunderFlash,
      .userOrderMapLightning{
        animation:none;
        display:none;
      }

    }

  `;

  document.head.appendChild(style);
}


function createUserOrderMapRainDrops(){

  let drops = "";

  const totalDrops = 58;

  for(
    let index = 0;
    index < totalDrops;
    index++
  ){

    const left =
      Math.floor(
        Math.random() * 104
      ) - 2;

    const height =
      12 +
      Math.floor(
        Math.random() * 18
      );

    const speed =
      (
        .62 +
        Math.random() * .62
      ).toFixed(2);

    const delay =
      (
        Math.random() * 1.8
      ).toFixed(2);

    const opacity =
      (
        .36 +
        Math.random() * .52
      ).toFixed(2);

    const drift =
      18 +
      Math.floor(
        Math.random() * 34
      );

    drops += `
      <span
        class="userOrderMapRainDrop"
        style="
          --rain-left:${left}%;
          --rain-height:${height}px;
          --rain-speed:${speed}s;
          --rain-delay:-${delay}s;
          --rain-opacity:${opacity};
          --rain-drift:${drift}px;
        "
      ></span>
    `;
  }

  return drops;
}


function removeUserOrderMapRain(){

  document
    .querySelector(
      ".userOrderMapRainLayer"
    )
    ?.remove();

  document
    .querySelector(
      ".userOrderMapThunderFlash"
    )
    ?.remove();

  document
    .querySelector(
      ".userOrderMapLightning"
    )
    ?.remove();
}


function renderUserOrderMapRain(){

  removeUserOrderMapRain();

  const activeOrderStatus =
    String(
      currentTrackedUserOrder?.order_status ||
      currentTrackedUserOrder?.delivery_status ||
      ""
    )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if(
    !userOrderMapRainEnabled ||
    isUserOrderFinished(activeOrderStatus)
  ){
    return;
  }

  const mapBox =
    document.getElementById(
      "userOrderTrackingMap"
    );

  const mapWrap =
    mapBox?.closest(
      ".userOrderTrackingMapWrap"
    );

  if(!mapBox || !mapWrap){
    return;
  }

  ensureUserOrderMapRainStyles();

  const rainLayer =
    document.createElement("div");

  rainLayer.className =
    "userOrderMapRainLayer";

  rainLayer.setAttribute(
    "aria-hidden",
    "true"
  );

  rainLayer.innerHTML =
    createUserOrderMapRainDrops();

  mapWrap.appendChild(rainLayer);

  /*
    Lightweight thunder/lightning UI.
    Only two extra elements, so no heavy lag.
  */
  const thunderFlash =
    document.createElement("div");

  thunderFlash.className =
    "userOrderMapThunderFlash";

  thunderFlash.setAttribute(
    "aria-hidden",
    "true"
  );

  const lightning =
    document.createElement("div");

  lightning.className =
    "userOrderMapLightning";

  lightning.setAttribute(
    "aria-hidden",
    "true"
  );

  mapWrap.appendChild(thunderFlash);
  mapWrap.appendChild(lightning);

  console.log(
    "CEZOO MAP WEATHER ADDED:",
    rainLayer.children.length,
    "rain drops + thunder"
  );
}


function applyUserOrderMapRainStatus(row){

  const type =
    String(
      row?.status_type || ""
    )
    .trim()
    .toLowerCase();

  const rainIsVisible =
    row?.is_visible === true ||
    row?.is_visible === 1 ||
    String(
      row?.is_visible || ""
    )
    .trim()
    .toLowerCase() === "true";

  userOrderMapRainEnabled =
    rainIsVisible &&
    type === "rain";

  console.log(
    "CEZOO MAP RAIN:",
    {
      row:row,
      type:type,
      visible:rainIsVisible,
      enabled:userOrderMapRainEnabled
    }
  );

  renderUserOrderMapRain();
}


async function loadUserOrderMapRainStatus(){

  try{

    /*
      Use the same row as the working CEZOO
      status bar. Do not filter status_type
      in Supabase because its saved value may
      be "Rain", "RAIN", or "rain".
    */
    const {data,error} =
      await getOrdersSupabaseClient()
        .from("cezoo_status_bar")
        .select(
          "id,is_visible,status_type"
        )
        .eq("id",1)
        .maybeSingle();

    if(error){
      throw error;
    }

    applyUserOrderMapRainStatus(data);

  }catch(error){

    console.error(
      "Map rain status load error:",
      error
    );

    userOrderMapRainEnabled = false;
    removeUserOrderMapRain();
  }
}


function startUserOrderMapRainRealtime(){

  if(userOrderMapRainChannel){
    return;
  }

  try{

    userOrderMapRainChannel =
      getOrdersSupabaseClient()
        .channel(
          "user-order-map-rain-status"
        )
        .on(
          "postgres_changes",
          {
            event:"*",
            schema:"public",
            table:"cezoo_status_bar"
          },
          function(){

            /*
              Recheck the table after every status change.
              This works even when the rain row ID is not 1.
            */
            loadUserOrderMapRainStatus();
          }
        )
        .subscribe();

  }catch(error){

    console.error(
      "Map rain realtime error:",
      error
    );
  }
}


function initializeUserOrderMap(order){

  const mapBox =
    document.getElementById(
      "userOrderTrackingMap"
    );

  if(!mapBox){
    return;
  }

  const customerLatitude =
    Number(order.latitude);

  const customerLongitude =
    Number(order.longitude);

  if(
    !Number.isFinite(customerLatitude) ||
    !Number.isFinite(customerLongitude) ||
    customerLatitude === 0 ||
    customerLongitude === 0
  ){
    return;
  }

  stopUserOrderLiveTracking();

  currentTrackedUserOrder = order;
  userOrderMapFirstFit = true;

  currentUserOrderMapLocation = {
    latitude:customerLatitude,
    longitude:customerLongitude
  };

  if(userOrderTrackingMap){
    userOrderTrackingMap.remove();
    userOrderTrackingMap = null;
  }

  userOrderTrackingMap =
    L.map(
      mapBox,
      {
        zoomControl:false,
        attributionControl:false,
        dragging:true,
        scrollWheelZoom:false,
        doubleClickZoom:true,
        touchZoom:true,
        boxZoom:false,
        tap:false
      }
    )
    .setView(
      [
        customerLatitude,
        customerLongitude
      ],
      16
    );

  L.DomEvent.disableClickPropagation(mapBox);
  L.DomEvent.disableScrollPropagation(mapBox);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom:19
    }
  ).addTo(userOrderTrackingMap);

  /*
    Load map weather only for an active order.
    Delivered/cancelled orders show a clean map.
  */
  const initialOrderStatus =
    String(
      order.order_status ||
      order.delivery_status ||
      ""
    )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if(!isUserOrderFinished(initialOrderStatus)){
    loadUserOrderMapRainStatus();
    startUserOrderMapRainRealtime();
  }else{
    userOrderMapRainEnabled = false;
    removeUserOrderMapRain();
  }


  /*
    Customer destination marker.
  */
  const customerIcon =
    L.divIcon({
      className:"",
      html:`
        <div class="userOrderCustomerMapMarker"></div>
      `,
      iconSize:[22,22],
      iconAnchor:[11,11]
    });

  userOrderCustomerMarker =
    L.marker(
      [
        customerLatitude,
        customerLongitude
      ],
      {
        icon:customerIcon
      }
    )
    .addTo(userOrderTrackingMap)
    .bindPopup("Delivery location");


  const status =
    String(
      order.order_status || "placed"
    )
    .trim()
    .toLowerCase();

  const shouldTrack =
  (
    order.delivery_boy_accepted === true ||
    String(
      order.delivery_boy_accepted
    ).toLowerCase() === "true"
  ) &&
    ![
      "delivered",
      "cancelled",
      "canceled"
    ].includes(status);

  if(shouldTrack){

    /*
      Load immediately.
    */
    refreshDeliveryPartnerLocation();

    /*
      Refresh only marker and route every 5 seconds.
      The complete order page will not reload.
    */
    userOrderTrackingTimer =
      setInterval(
        refreshDeliveryPartnerLocation,
        5000
      );
  }

  setTimeout(function(){
    userOrderTrackingMap?.invalidateSize();

    /*
      Render again after Leaflet finishes its layout.
    */
    renderUserOrderMapRain();
  },200);
}
async function refreshDeliveryPartnerLocation(){

  if(
    !currentTrackedUserOrder ||
    !userOrderTrackingMap ||
    userOrderTrackingRequestRunning
  ){
    return;
  }

  const order =
    currentTrackedUserOrder;

  const deliveryTable =
    order._order_type === "upi"
      ? "delivery_upi_orders"
      : "delivery_cash_orders";

  userOrderTrackingRequestRunning = true;

  try{

    const {data,error} =
      await getOrdersSupabaseClient()
        .from(deliveryTable)
        .select(`
          order_id,
          delivery_status,
          delivery_boy_location
        `)
        .eq(
          "order_id",
          order.order_id
        )
        .maybeSingle();

    if(error){
      throw error;
    }

    if(!data){
      console.warn(
        "Delivery tracking row not found:",
        order.order_id
      );

      return;
    }

    const deliveryStatus =
      String(
        data.delivery_status || ""
      )
      .trim()
      .toLowerCase();

    if(isUserOrderFinished(deliveryStatus)){

      /*
        Keep the map visible, but stop tracking
        and remove rain/thunder immediately.
      */
      currentTrackedUserOrder = {
        ...currentTrackedUserOrder,
        delivery_status:deliveryStatus,
        order_status:
          deliveryStatus === "delivered"
            ? "delivered"
            : deliveryStatus
      };

      stopUserOrderLiveTracking();
      removeUserOrderMapRain();

      document
        .querySelector(".userOrderSimpleLive")
        ?.remove();

      return;
    }

    let location =
      data.delivery_boy_location;

    if(typeof location === "string"){

      try{
        location = JSON.parse(location);
      }catch(error){
        location = null;
      }
    }

    const partnerLatitude =
      Number(location?.latitude);

    const partnerLongitude =
      Number(location?.longitude);

    if(
      !Number.isFinite(partnerLatitude) ||
      !Number.isFinite(partnerLongitude) ||
      partnerLatitude === 0 ||
      partnerLongitude === 0
    ){

      

      return;
    }

    updateDeliveryPartnerBikeMarker(
      partnerLatitude,
      partnerLongitude,
      Number(location?.heading)
    );

    await drawDeliveryPartnerRoute(
      partnerLatitude,
      partnerLongitude,
      Number(order.latitude),
      Number(order.longitude)
    );

  }catch(error){

    console.error(
      "Customer live tracking error:",
      error
    );

  }finally{

    userOrderTrackingRequestRunning =
      false;
  }
}
function updateDeliveryPartnerBikeMarker(
  latitude,
  longitude,
  heading
){

  if(!userOrderTrackingMap){
    return;
  }

  const safeHeading =
    Number.isFinite(heading)
      ? heading
      : 0;
const bikeIcon =
  L.divIcon({
    className:"userOrderBikeLeafletIcon",

html:`
  <div
  class="zeptoBikeMarker"
  style="
      width:52px;
      height:58px;
      display:flex;
      align-items:center;
      justify-content:center;
      position:relative;
  "
>

  <div
    style="
      position:absolute;
      bottom:7px;
      width:24px;
      height:8px;
      background:rgba(0,0,0,.18);
      border-radius:50%;
      filter:blur(3px);
    "
  ></div>

  <div
    style="
      font-size:34px;
      line-height:1;
      transform:translateY(-2px);
      user-select:none;
      animation:bikeBounce .8s ease-in-out infinite;
    "
  >
    🛵
  </div>

</div>
`,
    iconSize:[52,58],
    iconAnchor:[26,48]
  });











  

  if(!userOrderBikeMarker){

    userOrderBikeMarker =
      L.marker(
        [latitude,longitude],
        {
          icon:bikeIcon,
          zIndexOffset:1000
        }
      )
      .addTo(userOrderTrackingMap)
      .bindPopup("Delivery partner");

  }else{

    /*
      Move the existing marker.
      Do not recreate or reload the map.
    */
    userOrderBikeMarker.setLatLng(
      [latitude,longitude]
    );

    userOrderBikeMarker.setIcon(
      bikeIcon
    );
  }
}
async function loadDeliveryTrackingData(order){

  if(!order?.order_id){
    return order;
  }

  const deliveryTable =
    order._order_type === "upi"
      ? "delivery_upi_orders"
      : "delivery_cash_orders";

  try{

    const {data,error} =
      await getOrdersSupabaseClient()
        .from(deliveryTable)
        .select(`
          order_id,
          delivery_boy_accepted,
          delivery_boy_id,
          delivery_boy_name,
          delivery_boy_mobile,
          delivery_boy_location,
          delivery_status
        `)
        .eq(
          "order_id",
          String(order.order_id)
        )
        .maybeSingle();

    if(error){
      throw error;
    }

    if(!data){
      console.warn(
        "Delivery row not found:",
        deliveryTable,
        order.order_id
      );

      return order;
    }

    console.log(
      "✅ Delivery tracking data loaded:",
      data
    );

    return {
      ...order,

      delivery_boy_accepted:
        data.delivery_boy_accepted === true ||
        String(
          data.delivery_boy_accepted
        ).toLowerCase() === "true",

      delivery_boy_id:
        data.delivery_boy_id ||
        order.delivery_boy_id,

      delivery_boy_name:
        data.delivery_boy_name ||
        order.delivery_boy_name,

      delivery_boy_mobile:
        data.delivery_boy_mobile ||
        order.delivery_boy_mobile,

      delivery_boy_location:
        data.delivery_boy_location ||
        order.delivery_boy_location,

      delivery_status:
        data.delivery_status ||
        order.delivery_status
    };

  }catch(error){

    console.error(
      "Load delivery tracking data error:",
      error
    );

    return order;
  }
}


async function stopUserOrderRealtime(){

  if(!userOrderRealtimeChannel){
    return;
  }

  try{

    await getOrdersSupabaseClient()
      .removeChannel(
        userOrderRealtimeChannel
      );

  }catch(error){

    console.error(
      "Realtime channel remove error:",
      error
    );
  }

  userOrderRealtimeChannel = null;
}


function parseLiveDeliveryLocation(value){

  if(!value){
    return null;
  }

  if(typeof value === "object"){
    return value;
  }

  try{
    return JSON.parse(value);
  }catch(error){
    return null;
  }
}


async function refreshOpenOrderInstantly(){

  if(
    userOrderRealtimeRefreshing ||
    currentOpenUserOrderIndex === null
  ){
    return;
  }

  const page =
    document.getElementById(
      "userOrderDetailsPage"
    );

  if(!page?.classList.contains("open")){
    return;
  }

  userOrderRealtimeRefreshing = true;

  try{

    /*
      Reload customer order data from database.
    */
    const oldOrder =
      loggedUserOrders[
        currentOpenUserOrderIndex
      ];

    if(!oldOrder){
      return;
    }

    const customerTable =
      oldOrder._order_type === "upi"
        ? "upi_orders"
        : "cash_delivery_orders";

    const {data,error} =
      await getOrdersSupabaseClient()
        .from(customerTable)
        .select("*")
        .eq(
          "order_id",
          oldOrder.order_id
        )
        .maybeSingle();

    if(error){
      throw error;
    }

    if(data){

      loggedUserOrders[
        currentOpenUserOrderIndex
      ] = {
        ...oldOrder,
        ...data,
        _order_type:
          oldOrder._order_type
      };
    }

    /*
      Redraw only the open details page.
      The popup does not close.
    */
    await window.openUserOrderDetails(
      currentOpenUserOrderIndex,
      true
    );

  }catch(error){

    console.error(
      "Instant order refresh error:",
      error
    );

  }finally{

    userOrderRealtimeRefreshing = false;
  }
}

window.openUserOrderDetails =
async function(
  index,
  skipRealtimeStart = false
){

 let order =
  loggedUserOrders[index];

  if(!order){
    return;
  }
  currentOpenUserOrderIndex = index;
order =
  await loadDeliveryTrackingData(order);

/*
  Keep the updated details locally too.
*/
if(loggedUserOrders[index]){

  loggedUserOrders[index] = {
    ...loggedUserOrders[index],
    ...order
  };
}

  const page =
    document.getElementById(
      "userOrderDetailsPage"
    );


  const content =
    document.getElementById(
      "userOrderDetailsContent"
    );


  page.classList.add("open");

  document.body.style.overflow =
    "hidden";


  content.innerHTML = `

    <div class="userOrdersState">

      <div class="userOrdersSpinner"></div>

      <h3>Loading order details</h3>

      <p>
        Loading ordered product information.
      </p>

    </div>
  `;


  try{

    const products =
      await loadAllUserOrderProducts(
        order.items
      );


    const instructions =
      Array.isArray(order.delivery_instructions)
        ? order.delivery_instructions
        : [];


    const productsHtml =
      products.length
        ? products.map(product => {

            const qty =
              userOrderNumber(
                product.ordered_qty
              ) || 1;


            const price =
              userOrderNumber(
                product.discount_price ||
                product.original_price
              );


            return `

              <div class="userOrderedProduct">

                <div class="userOrderedProductImage">

                  ${
                    product.image1
                      ? `
                        <img
                          src="${userOrderEscape(product.image1)}"
                          alt="${userOrderEscape(product.name)}"
                          loading="lazy"
                        >
                      `
                      : `
                        <i
                          class="fa-solid fa-box"
                          style="color:#bbb;font-size:22px"
                        ></i>
                      `
                  }

                </div>


                <div class="userOrderedProductInfo">

                  <div class="userOrderedProductName">

                    ${userOrderEscape(product.name)}

                  </div>


                 <div class="userOrderedProductPack">

  ${
    product.is_print_order
      ? userOrderEscape(
          `${product.pages || 0} pages • ` +
          `${product.copies || 1} copies • ` +
          `${product.print_type_text || ""} • ` +
          `${product.paper_size || ""}`
        )
      : userOrderEscape(
          `${product.quantity || ""} ${product.unit || ""}`.trim() ||
          "Pack information unavailable"
        )
  }

</div>



                  <div class="userOrderedProductQty">

                    Quantity: ${qty}

                  </div>

                </div>


                <div class="userOrderedProductPrice">

                  ${userOrderMoney(
                    price * qty
                  )}

                </div>

              </div>
            `;

          }).join("")

        : `

          <div class="userOrdersState">

            <i class="fa-regular fa-box-open"></i>

            <p>
              No product information found.
            </p>

          </div>
        `;


    
content.innerHTML = `

${
  Number.isFinite(Number(order.latitude)) &&
  Number.isFinite(Number(order.longitude)) &&
  Number(order.latitude) !== 0 &&
  Number(order.longitude) !== 0

    ? `
      <div class="userOrderTrackingMapWrap">

       <div id="userOrderTrackingMap"></div>

${
  (
  order.delivery_boy_accepted === true ||
  String(
    order.delivery_boy_accepted
  ).toLowerCase() === "true"
) &&
![
  "delivered",
  "cancelled",
  "canceled"
].includes(
    String(order.order_status || "")
      .trim()
      .toLowerCase()
  )
    ? `
        <div class="userOrderSimpleLive">
  <span class="userOrderTrackingLiveDot"></span>
  LIVE
</div>
      `
    : ""
}

        <button
          class="userOrderMapBackBtn"
          type="button"
          onclick="closeUserOrderDetails()"
          aria-label="Back"
        >
          ‹
        </button>

      </div>
    `

    : `
      <div class="userOrderTrackingMapWrap">

        <div class="userOrderMapNoLocation">
          <i class="fa-solid fa-location-dot"></i>
          <span>Location not available</span>
        </div>

      </div>
    `
}



${
  ![
    "cancelled",
    "canceled"
  ].includes(
    String(
      order.order_status ||
      order.delivery_status ||
      ""
    )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
  ) &&
  (
    order.delivery_boy_accepted === true ||
    String(
      order.delivery_boy_accepted
    ).toLowerCase() === "true"
  ) &&
  String(order.delivery_boy_name || "").trim()

    ? (() => {

        const deliveryBoyName =
          String(
            order.delivery_boy_name ||
            "Delivery Partner"
          ).trim();

        const deliveryBoyMobile =
          String(
            order.delivery_boy_mobile || ""
          )
          .replace(/[^\d+]/g, "")
          .trim();

        const orderStatus =
          String(
            order.order_status || "placed"
          )
          .trim()
          .toLowerCase();

        const hideDeliveryPartnerCall =
          isUserOrderFinished(orderStatus);

        return `
          <div class="orderDeliveryPartnerCard">

            <div class="orderDeliveryPartnerProfile">
              <i class="fa-solid fa-user"></i>
            </div>

            <div class="orderDeliveryPartnerInfo">

              <div class="orderDeliveryPartnerLabel">
                Delivery Partner
              </div>

              <div class="orderDeliveryPartnerName">
                ${userOrderEscape(deliveryBoyName)}
              </div>

             

            </div>

           ${
  deliveryBoyMobile && !hideDeliveryPartnerCall
    ? `
        <a
          class="orderDeliveryPartnerCall"
          href="tel:${userOrderEscape(deliveryBoyMobile)}"
          aria-label="Call delivery partner"
        >
          <i class="fa-solid fa-phone"></i>
        </a>
      `
    : ""
}

          </div>
        `;

      })()

    : (() => {

        const currentOrderStatus =
          String(
            order.order_status ||
            order.delivery_status ||
            ""
          )
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        const orderIsCancelled =
          [
            "cancelled",
            "canceled"
          ].includes(
            currentOrderStatus
          );

        if(orderIsCancelled){

          return `
            <div class="orderDeliveryPartnerCard">

              <div class="orderDeliveryPartnerProfile cancelled">
                <i class="fa-solid fa-xmark"></i>
              </div>

              <div class="orderDeliveryPartnerInfo">

                <div class="orderDeliveryPartnerLabel">
                  Order Status
                </div>

                <div class="orderDeliveryPartnerName">
                  Order Cancelled
                </div>

              </div>

            </div>
          `;
        }

        return `
          <div class="orderDeliveryPartnerCard">

            <div class="orderDeliveryPartnerProfile waiting">
              <i class="fa-solid fa-motorcycle"></i>
            </div>

            <div class="orderDeliveryPartnerInfo">

              <div class="orderDeliveryPartnerLabel">
                Delivery Partner
              </div>

              <div class="orderDeliveryPartnerName">
                Waiting for delivery partner
              </div>

            </div>

          </div>
        `;

      })()
}


<div class="userOrderDetailCard">




  <div class="userOrderDetailHeading">

    <i class="fa-solid fa-box-open"></i>

    Order Information

  </div>

        <div class="userOrderDetailRow">

          <span>Order ID</span>

          <strong>
            ${userOrderEscape(order.order_id || "—")}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Order date</span>

          <strong>
            ${userOrderEscape(
              userOrderDate(order.created_at)
            )}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Status</span>

          <strong>
            ${userOrderEscape(
              userOrderStatusText(
                order.order_status
              )
            )}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Mobile</span>

          <strong>
            ${userOrderEscape(order.user_mobile || "—")}
          </strong>

        </div>

      </div>


      <div class="userOrderDetailCard">

        <div class="userOrderDetailHeading">

          <i class="fa-solid fa-basket-shopping"></i>

          Items Ordered

        </div>

        ${productsHtml}

      </div>


      <div class="userOrderDetailCard">

        <div class="userOrderDetailHeading">

          <i class="fa-solid fa-location-dot"></i>

          Delivery Address

        </div>


        <div class="userOrderDetailRow">

          <span>Name</span>

          <strong>
            ${userOrderEscape(order.user_name || "—")}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Village</span>

          <strong>
            ${userOrderEscape(order.village || "—")}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Address</span>

          <strong>
            ${userOrderEscape(order.address || "—")}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Delivery mode</span>

          <strong>
            ${
              order.delivery_mode === "12_hours"
                ? "Scheduled Delivery"
                : "Instant Delivery"
            }
          </strong>

        </div>




      </div>


      ${
  instructions.length
    ? `
      <div class="userOrderDetailCard">

        <div class="userOrderDetailHeading">
          <i class="fa-solid fa-list-check"></i>
          Delivery Instructions
        </div>

        <div class="orderInstructionGrid">

          ${instructions.map(text => {

            const value = String(text).toLowerCase();

            let icon = "fa-solid fa-box";

            if(value.includes("security")){
              icon = "fa-solid fa-shield-halved";
            }
            else if(value.includes("door")){
              icon = "fa-solid fa-door-closed";
            }
            else if(value.includes("ring")){
              icon = "fa-solid fa-bell-slash";
            }
            else if(value.includes("pet")){
              icon = "fa-solid fa-paw";
            }

            return `
              <div class="orderInstructionItem">

                <div class="orderInstructionIcon">
                  <i class="${icon}"></i>
                </div>

                <div class="orderInstructionText">
                  ${userOrderEscape(text)}
                </div>

              </div>
            `;

          }).join("")}

        </div>

      </div>
    `
    : ""
}

      <div class="userOrderDetailCard">

        <div class="userOrderDetailHeading">

          <i class="fa-solid fa-receipt"></i>

          Bill Details

        </div>


        <div class="userOrderDetailRow">

          <span>Item total</span>

          <strong>
            ${userOrderMoney(order.item_total)}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Delivery fee</span>

          <strong>
            ${userOrderMoney(order.delivery_fee)}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Handling fee</span>

          <strong>
            ${userOrderMoney(order.handling_fee)}
          </strong>

        </div>


        <div class="userOrderDetailRow">

          <span>Delivery tip</span>

          <strong>
            ${userOrderMoney(order.delivery_tip)}
          </strong>

        </div>


        <div class="userOrderDetailRow userOrderDetailTotal">

          <span>Total amount</span>

          <strong>
            ${userOrderMoney(order.total_amount)}
          </strong>

        </div>

      </div>


      <div class="userOrderDetailCard">

        <div class="userOrderDetailHeading">

          <i class="fa-solid fa-credit-card"></i>

          Payment

        </div>


        <div class="userOrderDetailRow">

          <span>Payment method</span>

          <strong>
            ${
              order._order_type === "upi"
                ? "UPI Payment"
                : "Cash on Delivery"
            }
          </strong>

        </div>


        <div class="userOrderDetailRow">

  <span>Payment status</span>

  <strong>
    ${userOrderEscape(
      order.payment_status || "Pending"
    )}
  </strong>

</div>

</div>

${
  [
    "cancelled",
    "canceled"
  ].includes(
    String(order.order_status || "")
      .trim()
      .toLowerCase()
  )
    ? `
     <div class="orderTrackingCancelled">

  <div class="trackingRow completed">
    <div class="trackingDot">
      <i class="fa-solid fa-check"></i>
    </div>

    <div class="trackingContent">
      <div class="trackingTitle">
        Order Placed
      </div>

      <div class="trackingSub">
        Your order was received successfully.
      </div>
    </div>
  </div>

  <div class="trackingLine"></div>

  <div class="trackingRow cancelled">
    <div class="trackingDot cancel">
      <i class="fa-solid fa-xmark"></i>
    </div>

    <div class="trackingContent">
      <div class="trackingTitle">
        Order Cancelled
      </div>

      <div class="trackingSub">
        This order has been cancelled.
      </div>
    </div>
  </div>

</div>
    `
    : ""
}



${
  ![
    "on_the_way",
    "delivered",
    "cancelled",
    "canceled"
  ].includes(
    String(order.order_status || "placed")
      .toLowerCase()
  )
    ? `
      <div class="userOrderCancelArea">

       <button
  class="userOrderCancelBtn"
  type="button"
  data-order-id="${userOrderEscape(order.order_id || "")}"
  data-order-type="${order._order_type || "cash"}"
  onclick="openCancelOrderSheetById(this)"
>
  Cancel Order
</button>

      </div>
    `
    : ""
}
`;


/* INITIALIZE ORDER LOCATION MAP */

if(
  Number.isFinite(Number(order.latitude)) &&
  Number.isFinite(Number(order.longitude)) &&
  Number(order.latitude) !== 0 &&
  Number(order.longitude) !== 0
){

  setTimeout(function(){

    /*
      Always show the map when coordinates exist.
      For delivered/cancelled orders,
      initializeUserOrderMap will not start live tracking.
    */
    initializeUserOrderMap(order);

  }, 100);

}

if(
  !skipRealtimeStart &&
  !isUserOrderFinished(
    order.order_status ||
    order.delivery_status
  )
){

  startUserOrderRealtime(
    order,
    index
  );
}
}
catch(error){

  console.error(
    "Order detail error:",
    error
  );

  content.innerHTML = `

    <div class="userOrdersState">

      <i class="fa-solid fa-triangle-exclamation"></i>

      <h3>Unable to load details</h3>

      <p>
        ${userOrderEscape(
          error.message ||
          "Please try again."
        )}
      </p>

    </div>
  `;

}

};

let currentUserOrderMapLocation = null;

window.refreshUserOrderMap = function(){

  if(
    !userOrderTrackingMap ||
    !currentUserOrderMapLocation
  ){
    return;
  }

  userOrderTrackingMap.invalidateSize();

  userOrderTrackingMap.setView(
    [
      currentUserOrderMapLocation.latitude,
      currentUserOrderMapLocation.longitude
    ],
    16,
    {
      animate:true
    }
  );

};


async function loadProfileRecentOrders(){

  const container =
    document.getElementById("profileRecentOrders");

  if(!container) return;


  const mobile = getLoggedUserMobile();

  if(!mobile){
    container.innerHTML = "";
    return;
  }


  container.innerHTML = `
    <div class="userOrdersState">
      <div class="userOrdersSpinner"></div>
      <p>Loading recent orders...</p>
    </div>
  `;


  const mobileVariants = [
    mobile,
    `91${mobile}`,
    `+91${mobile}`,
    `+91 ${mobile}`
  ];


  try{

    const [cashResponse, upiResponse] =
      await Promise.all([

        getOrdersSupabaseClient()
          .from("cash_delivery_orders")
          .select("*")
          .in("user_mobile", mobileVariants)
          .order("created_at", {
            ascending:false
          })
          .limit(3),

        getOrdersSupabaseClient()
          .from("upi_orders")
          .select("*")
          .in("user_mobile", mobileVariants)
          .order("created_at", {
            ascending:false
          })
          .limit(3)

      ]);


    const cashOrders =
      (cashResponse.data || []).map(order => ({
        ...order,
        _order_type:"cash"
      }));


    const upiOrders =
      (upiResponse.data || []).map(order => ({
        ...order,
        _order_type:"upi"
      }));


    loggedUserOrders = [
      ...cashOrders,
      ...upiOrders
    ]
    .sort((a,b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
    )
    .slice(0,3);


    await renderProfileRecentOrders();

  }
  catch(error){

    console.error(error);

    container.innerHTML = `
      <div class="userOrdersState">
        <p>Could not load recent orders</p>
      </div>
    `;

  }

}
async function renderProfileRecentOrders(){

  const container =
    document.getElementById("profileRecentOrders");

  if(!container) return;


  if(loggedUserOrders.length === 0){

    container.innerHTML = `
      <div class="userOrdersState">
        <i class="fa-regular fa-box-open"></i>
        <p>No recent orders found</p>
      </div>
    `;

    return;
  }


  const cards = await Promise.all(

    loggedUserOrders.map(async (order, index) => {

      const items =
        parseUserOrderItems(order.items);


      const products =
        await loadAllUserOrderProducts(items);


      const imagesHtml = products.map(product => `

        <div class="userOrderMiniImage">

          ${
            product.image1
              ? `
                <img
                  src="${userOrderEscape(product.image1)}"
                  loading="lazy"
                >
              `
              : `
                <i class="fa-solid fa-box"></i>
              `
          }

          <span>
            ×${product.ordered_qty || 1}
          </span>

        </div>

      `).join("");


      const totalItems = items.reduce(
        (total, item) =>
          total + (userOrderNumber(item.qty) || 1),
        0
      );


    return `

  <div
    class="recentOrderCard"
  onclick="openRecentOrderDetails(${index})"
  >

    <div class="recentOrderHeader">

      <div class="recentOrderIcon">
        <i class="fa-solid fa-bag-shopping"></i>
      </div>

      <div class="recentOrderHeaderInfo">

        <div class="recentOrderId">
          ${userOrderEscape(order.order_id || "Order")}
        </div>

        <div class="recentOrderDate">
          ${userOrderEscape(userOrderDate(order.created_at))}
        </div>

      </div>

      <div class="recentOrderArrow">
        <i class="fa-solid fa-chevron-right"></i>
      </div>

    </div>


    <div class="recentOrderProducts">

      <div class="recentOrderImages">
        ${imagesHtml}
      </div>

    </div>


   <div class="recentOrderMeta">

  <div class="recentOrderMetaItem">

    <i class="fa-solid fa-box"></i>

    <span>
      ${totalItems}
      ${totalItems === 1 ? "Item" : "Items"}
    </span>

  </div>

</div>


<div class="recentOrderLocation">

  <i class="fa-solid fa-location-dot"></i>

  <span>
    ${userOrderEscape(
      order.village ||
      order.address ||
      "Delivery address"
    )}
  </span>

</div>

    </div>


    <div class="recentOrderFooter">

      <div class="recentOrderStatus ${
        String(order.order_status || "placed")
          .toLowerCase()
          .replace(/[^a-z_]/g, "")
      }">

        <span class="recentOrderStatusDot"></span>

        ${userOrderEscape(
          userOrderStatusText(order.order_status)
        )}

      </div>

      <div class="recentOrderAmount">
        ${userOrderMoney(order.total_amount)}
      </div>

    </div>

  </div>

`;

    })

  );


  container.innerHTML = cards.join("");

}
window.openRecentOrderDetails = async function(index){

  const selectedOrder = loggedUserOrders[index];

  const ordersPopup =
    document.getElementById("yourOrdersPopup");

  const detailsPage =
    document.getElementById("userOrderDetailsPage");

  if(!selectedOrder || !ordersPopup || !detailsPage){
    console.error("Order or popup not found");
    return;
  }

  // Keep selected recent order safe
  const recentOrder = selectedOrder;

  // Open parent popup behind details page
  ordersPopup.classList.add("open");

  // Open details
  detailsPage.classList.add("open");

  document.body.style.overflow = "hidden";

  // Show selected recent order
  const tempOrders = loggedUserOrders;

  loggedUserOrders = [recentOrder];

  await window.openUserOrderDetails(0);

  // Restore recent orders array temporarily
  loggedUserOrders = tempOrders;
};

let detailSwipeStartX = 0;
let detailSwipeStartY = 0;
let detailSwipeAllowed = false;

const orderDetailsPage =
  document.getElementById("userOrderDetailsPage");


orderDetailsPage.addEventListener("touchstart", function(e){

  const touch = e.touches[0];

  detailSwipeStartX = touch.clientX;
  detailSwipeStartY = touch.clientY;

  // Only allow swipe-back when finger starts
  // from left 35px edge
  detailSwipeAllowed =
    detailSwipeStartX <= 35;

}, { passive:true });


orderDetailsPage.addEventListener("touchend", function(e){

  if(!detailSwipeAllowed){
    return;
  }

  const touch = e.changedTouches[0];

  const diffX =
    touch.clientX - detailSwipeStartX;

  const diffY =
    touch.clientY - detailSwipeStartY;

  // Right swipe only
  if(
    diffX > 90 &&
    Math.abs(diffY) < 70
  ){
    closeUserOrderDetails();
  }

  detailSwipeAllowed = false;

}, { passive:true });


/* =========================================
   SWIPE LEFT / RIGHT TO CLOSE PROFILE
========================================= */

let profileSwipeStartX = 0;
let profileSwipeStartY = 0;
let profileSwipeAllowed = false;

const cezooProfilePopup =
  document.getElementById("cezooProfilePopup");

if(cezooProfilePopup){

  cezooProfilePopup.addEventListener(
    "touchstart",
    function(e){

      // Do not handle profile swipe
      // when another popup is open above it
      if(anyChildPopupOpen()){
        profileSwipeAllowed = false;
        return;
      }

      const touch = e.touches[0];

      profileSwipeStartX = touch.clientX;
      profileSwipeStartY = touch.clientY;

      profileSwipeAllowed = true;

    },
    {
      passive:true
    }
  );


  cezooProfilePopup.addEventListener(
    "touchend",
    function(e){

      if(!profileSwipeAllowed){
        return;
      }

      // Recheck before closing
      if(anyChildPopupOpen()){
        profileSwipeAllowed = false;
        return;
      }

      const touch = e.changedTouches[0];

      const diffX =
        touch.clientX - profileSwipeStartX;

      const diffY =
        touch.clientY - profileSwipeStartY;


      // Close when swiped either left or right
      if(
        Math.abs(diffX) > 90 &&
        Math.abs(diffY) < 70
      ){
        closeCezooProfile();
      }

      profileSwipeAllowed = false;

    },
    {
      passive:true
    }
  );

}

/* =====================================================
   CANCEL ORDER BOTTOM SHEET
===================================================== */




/* =====================================================
   SIMPLE CANCEL ORDER BOTTOM SHEET
===================================================== */

function createCancelOrderSheet(){

  if(
    document.getElementById(
      "cancelOrderSheet"
    )
  ){
    return;
  }

  const style =
    document.createElement("style");

  style.innerHTML = `

    .cancelOrderSheet{
      position:fixed;
      inset:0;
      z-index:9999999999;
      display:none;
    }

    .cancelOrderSheet.show{
      display:block;
    }

    .cancelOrderOverlay{
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.42);
    }

    .cancelOrderBox{
      position:absolute;
      left:0;
      right:0;
      bottom:0;

      background:#fff;
      border-radius:24px 24px 0 0;

      padding:
        14px 18px
        calc(20px + env(safe-area-inset-bottom));

      box-shadow:
        0 -12px 35px rgba(0,0,0,.16);

      animation:
        cancelOrderUp .24s ease;
    }

    @keyframes cancelOrderUp{
      from{
        transform:translateY(100%);
      }

      to{
        transform:translateY(0);
      }
    }

    .cancelOrderHandle{
      width:40px;
      height:4px;
      background:#ddd;
      border-radius:10px;
      margin:0 auto 18px;
    }

    .cancelOrderTitle{
      margin:0;

      text-align:center;
      font-size:18px;
      font-weight:800;
      color:#222;
    }

    .cancelOrderDescription{
      margin:8px 0 20px;

      text-align:center;
      font-size:13px;
      line-height:1.5;
      color:#777;
    }

    .cancelOrderButtons{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    }

    .cancelOrderKeepBtn,
    .cancelOrderConfirmBtn{
      height:48px;

      border:none;
      border-radius:14px;

      font-size:14px;
      font-weight:700;

      cursor:pointer;
    }

    .cancelOrderKeepBtn{
      background:#f2f2f2;
      color:#333;
    }

    .cancelOrderConfirmBtn{
      background:#e53935;
      color:#fff;
    }

    .cancelOrderConfirmBtn:disabled{
      opacity:.6;
      cursor:not-allowed;
    }
  `;

  document.head.appendChild(style);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="cancelOrderSheet"
        class="cancelOrderSheet"
      >

        <div
          class="cancelOrderOverlay"
          onclick="closeCancelOrderSheet()"
        ></div>

        <div class="cancelOrderBox">

          <div class="cancelOrderHandle"></div>

          <h3 class="cancelOrderTitle">
            Cancel Order?
          </h3>

          <p class="cancelOrderDescription">
            Are you sure you want to cancel this order?
          </p>

          <div class="cancelOrderButtons">

            <button
              type="button"
              class="cancelOrderKeepBtn"
              onclick="closeCancelOrderSheet()"
            >
              No, Keep It
            </button>

            <button
              type="button"
              id="confirmCancelOrderBtn"
              class="cancelOrderConfirmBtn"
              onclick="confirmCancelOrder()"
            >
              Yes, Cancel
            </button>

          </div>

        </div>

      </div>
    `
  );
}

window.openCancelOrderSheetById = function(button){

  const orderId =
    button?.dataset?.orderId || "";

  const orderType =
    button?.dataset?.orderType || "cash";

  if(!orderId){
    console.error("Cancel Order ID is missing");
    return;
  }

  const order =
    loggedUserOrders.find(item =>
      String(item.order_id) === String(orderId) &&
      String(item._order_type || "cash") === String(orderType)
    );

  if(!order){
    console.error(
      "Cancel order not found:",
      orderId,
      orderType
    );
    return;
  }

  const currentStatus =
    String(
      order.order_status || "placed"
    )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if(
    [
      "on_the_way",
      "delivered",
      "cancelled",
      "canceled"
    ].includes(currentStatus)
  ){
    return;
  }

  createCancelOrderSheet();

  selectedCancelOrder = order;

  selectedCancelOrderIndex =
    loggedUserOrders.findIndex(item =>
      String(item.order_id) === String(orderId) &&
      String(item._order_type || "cash") === String(orderType)
    );

  const sheet =
    document.getElementById(
      "cancelOrderSheet"
    );

  if(!sheet){
    console.error(
      "Cancel order sheet was not created"
    );
    return;
  }

  sheet.classList.add("show");

  document.body.style.overflow =
    "hidden";

  console.log(
    "✅ Cancel sheet opened:",
    orderId
  );
};
window.closeCancelOrderSheet = function(){

  const sheet =
    document.getElementById(
      "cancelOrderSheet"
    );

  sheet?.classList.remove("show");

  selectedCancelOrder = null;
  selectedCancelOrderIndex = null;

  /*
    Order details page is still open,
    so keep the background locked.
  */
  document.body.style.overflow = "hidden";

};
window.confirmCancelOrder = async function(){

  if(
    !selectedCancelOrder ||
    orderCancelSaving
  ){
    return;
  }

  const order =
    selectedCancelOrder;

  const orderIndex =
    selectedCancelOrderIndex;

  const currentStatus =
    String(
      order.order_status || "placed"
    ).toLowerCase();

  /*
    Recheck status before cancelling.
  */
  if(
    [
      "on_the_way",
      "delivered",
      "cancelled",
      "canceled"
    ].includes(currentStatus)
  ){

    closeCancelOrderSheet();
    return;
  }

  const button =
    document.getElementById(
      "confirmCancelOrderBtn"
    );

  orderCancelSaving = true;

  if(button){
    button.disabled = true;
    button.textContent = "Cancelling...";
  }

  try{

    const tableName =
      order._order_type === "upi"
        ? "upi_orders"
        : "cash_delivery_orders";

   const { data, error } =
  await getOrdersSupabaseClient()
    .from(tableName)
    .update({
      order_status: "cancelled"
    })
    .eq(
      "order_id",
      order.order_id
    )
    .select()
    .single();

    if(error){
      throw error;
    }

    /*
      Update local order immediately.
    */
    if(
      orderIndex !== null &&
      loggedUserOrders[orderIndex]
    ){

      loggedUserOrders[orderIndex] = {
        ...loggedUserOrders[orderIndex],
        ...data,
        order_status:"cancelled"
      };

    }

    selectedCancelOrder = null;
    selectedCancelOrderIndex = null;

    document
      .getElementById("cancelOrderSheet")
      ?.classList.remove("show");

    /*
      Reload order details.
      Cancel button will now be hidden.
    */
    await window.openUserOrderDetails(
      orderIndex
    );

    /*
      Also refresh order lists.
    */
    await loadLoggedUserOrders();

  }catch(error){

    console.error(
      "Order cancellation failed:",
      error
    );

    if(button){
      button.textContent =
        "Try Again";
    }

  }finally{

    orderCancelSaving = false;

    if(button){
      button.disabled = false;

      if(
        button.textContent !== "Try Again"
      ){
        button.textContent =
          "Yes, Cancel";
      }
    }

  }
};
async function drawDeliveryPartnerRoute(
  partnerLatitude,
  partnerLongitude,
  customerLatitude,
  customerLongitude
){

  if(!userOrderTrackingMap){
    return;
  }

  try{

    const routeUrl =
      "https://router.project-osrm.org/route/v1/driving/" +
      `${partnerLongitude},${partnerLatitude};` +
      `${customerLongitude},${customerLatitude}` +
      "?overview=full" +
      "&geometries=geojson" +
      "&steps=false";

    const response =
      await fetch(routeUrl);

    if(!response.ok){
      throw new Error(
        "Route service failed"
      );
    }

    const routeData =
      await response.json();

    const route =
      routeData?.routes?.[0];

    if(
      routeData?.code !== "Ok" ||
      !route?.geometry?.coordinates
    ){
      throw new Error(
        "Route not available"
      );
    }

    /*
      GeoJSON returns:
      [longitude, latitude]

      Leaflet requires:
      [latitude, longitude]
    */
    const routePoints =
      route.geometry.coordinates
        .map(function(point){
          return [
            Number(point[1]),
            Number(point[0])
          ];
        });

    if(userOrderRouteLine){

      userOrderRouteLine.setLatLngs(
        routePoints
      );

    }else{

      userOrderRouteLine =
        L.polyline(
          routePoints,
          {
            color:"#16a34a",
            weight:5,
            opacity:.9,
            lineCap:"round",
            lineJoin:"round"
          }
        )
        .addTo(userOrderTrackingMap);
    }

    const distanceKilometres =
      Number(route.distance || 0) / 1000;

    const durationMinutes =
      Math.max(
        1,
        Math.round(
          Number(route.duration || 0) / 60
        )
      );

    const distanceElement =
      document.getElementById(
        "userOrderRemainingDistance"
      );

    if(distanceElement){

      distanceElement.textContent =
        distanceKilometres < 1
          ? `${Math.round(
              distanceKilometres * 1000
            )} m away • ${durationMinutes} min`
          : `${distanceKilometres.toFixed(
              1
            )} km away • ${durationMinutes} min`;
    }

    /*
      Fit both customer and delivery partner
      the first time only.

      After that, do not disturb the user's
      manual map zoom or position.
    */
    if(userOrderMapFirstFit){

      userOrderTrackingMap.fitBounds(
        userOrderRouteLine.getBounds(),
        {
          padding:[45,45],
          maxZoom:16
        }
      );

      userOrderMapFirstFit = false;
    }

  }catch(error){

    console.error(
      "Delivery route error:",
      error
    );

    drawFallbackDeliveryLine(
      partnerLatitude,
      partnerLongitude,
      customerLatitude,
      customerLongitude
    );
  }
}
function drawFallbackDeliveryLine(
  partnerLatitude,
  partnerLongitude,
  customerLatitude,
  customerLongitude
){

  if(!userOrderTrackingMap){
    return;
  }

  const points = [
    [
      partnerLatitude,
      partnerLongitude
    ],
    [
      customerLatitude,
      customerLongitude
    ]
  ];

  if(userOrderRouteLine){

    userOrderRouteLine.setLatLngs(
      points
    );

  }else{

    userOrderRouteLine =
      L.polyline(
        points,
        {
          color:"#16a34a",
          weight:4,
          opacity:.75,
          dashArray:"8 8"
        }
      )
      .addTo(userOrderTrackingMap);
  }

  const distance =
    calculateMapDistance(
      partnerLatitude,
      partnerLongitude,
      customerLatitude,
      customerLongitude
    );

  const distanceElement =
    document.getElementById(
      "userOrderRemainingDistance"
    );

  if(distanceElement){

    distanceElement.textContent =
      distance < 1
        ? `${Math.round(distance * 1000)} m away`
        : `${distance.toFixed(1)} km away`;
  }
}


function calculateMapDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
){

  const earthRadius = 6371;

  const latitudeDifference =
    (
      latitude2 -
      latitude1
    ) * Math.PI / 180;

  const longitudeDifference =
    (
      longitude2 -
      longitude1
    ) * Math.PI / 180;

  const firstLatitude =
    latitude1 * Math.PI / 180;

  const secondLatitude =
    latitude2 * Math.PI / 180;

  const value =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(firstLatitude) *
    Math.cos(secondLatitude) *
    Math.sin(
      longitudeDifference / 2
    ) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}
function stopUserOrderLiveTracking(){

  if(userOrderTrackingTimer){

    clearInterval(
      userOrderTrackingTimer
    );

    userOrderTrackingTimer = null;
  }

  userOrderTrackingRequestRunning =
    false;

  currentTrackedUserOrder = null;

  userOrderBikeMarker = null;
  userOrderCustomerMarker = null;
  userOrderRouteLine = null;

  userOrderMapFirstFit = true;
}

async function startUserOrderRealtime(
  order,
  index
){

  await stopUserOrderRealtime();

  if(!order?.order_id){
    return;
  }

  currentOpenUserOrderIndex = index;

  const orderId =
    String(order.order_id);

  const customerTable =
    order._order_type === "upi"
      ? "upi_orders"
      : "cash_delivery_orders";

  const deliveryTable =
    order._order_type === "upi"
      ? "delivery_upi_orders"
      : "delivery_cash_orders";

  userOrderRealtimeChannel =
    getOrdersSupabaseClient()
      .channel(
        `customer-live-order-${orderId}-${Date.now()}`
      )

      /*
        Original customer-order table updates:

        order_status
        payment_status
        amount
        address
        instructions
        cancellation
        and every other updated column
      */
      .on(
        "postgres_changes",
        {
          event:"UPDATE",
          schema:"public",
          table:customerTable,
          filter:`order_id=eq.${orderId}`
        },
        async function(payload){

          const newRow =
            payload.new || {};

          const oldOrder =
            loggedUserOrders[index];

          if(!oldOrder){
            return;
          }

          loggedUserOrders[index] = {
            ...oldOrder,
            ...newRow,
            _order_type:
              oldOrder._order_type
          };

          console.log(
            "✅ Customer order updated instantly:",
            newRow
          );

          await refreshOpenOrderInstantly();
        }
      )

      /*
        Delivery table updates:

        delivery status
        delivery partner name
        mobile
        accepted status
        live location
      */
      .on(
        "postgres_changes",
        {
          event:"UPDATE",
          schema:"public",
          table:deliveryTable,
          filter:`order_id=eq.${orderId}`
        },
        async function(payload){

          const newRow =
            payload.new || {};

          const currentOrder =
            loggedUserOrders[index];

          if(!currentOrder){
            return;
          }

          /*
            Update bike directly without rebuilding
            the complete order page.
          */
          const liveLocation =
            parseLiveDeliveryLocation(
              newRow.delivery_boy_location
            );

          const partnerLatitude =
            Number(
              liveLocation?.latitude
            );

          const partnerLongitude =
            Number(
              liveLocation?.longitude
            );

          if(
            Number.isFinite(partnerLatitude) &&
            Number.isFinite(partnerLongitude) &&
            partnerLatitude !== 0 &&
            partnerLongitude !== 0 &&
            userOrderTrackingMap
          ){

            updateDeliveryPartnerBikeMarker(
              partnerLatitude,
              partnerLongitude,
              Number(liveLocation?.heading)
            );

            drawDeliveryPartnerRoute(
              partnerLatitude,
              partnerLongitude,
              Number(currentOrder.latitude),
              Number(currentOrder.longitude)
            );
          }

          const previousAccepted =
            currentOrder
              .delivery_boy_accepted;

          const previousName =
            currentOrder
              .delivery_boy_name;

          const previousMobile =
            currentOrder
              .delivery_boy_mobile;

          const previousStatus =
            String(
              currentOrder.delivery_status ||
              currentOrder.order_status ||
              ""
            );

          const nextAccepted =
            newRow.delivery_boy_accepted;

          const nextName =
            newRow.delivery_boy_name;

          const nextMobile =
            newRow.delivery_boy_mobile;

          const nextStatus =
            String(
              newRow.delivery_status || ""
            );

          /*
            Keep delivery details in local order.
          */
          loggedUserOrders[index] = {
            ...currentOrder,

            delivery_boy_accepted:
              nextAccepted ??
              previousAccepted,

            delivery_boy_id:
              newRow.delivery_boy_id ??
              currentOrder.delivery_boy_id,

            delivery_boy_name:
              nextName ??
              previousName,

            delivery_boy_mobile:
              nextMobile ??
              previousMobile,

            delivery_boy_location:
              newRow.delivery_boy_location ??
              currentOrder.delivery_boy_location,

            delivery_status:
              nextStatus ||
              currentOrder.delivery_status
          };

          /*
            Rebuild details only when visible
            information changed.

            Location-only updates will move the bike
            without resetting the page or map.
          */
          const visibleDataChanged =
            String(previousAccepted) !==
              String(nextAccepted) ||

            String(previousName || "") !==
              String(nextName || "") ||

            String(previousMobile || "") !==
              String(nextMobile || "") ||

            (
              nextStatus &&
              previousStatus !== nextStatus
            );

          if(visibleDataChanged){

            console.log(
              "✅ Delivery details updated instantly:",
              newRow
            );

            await refreshOpenOrderInstantly();
          }
        }
      )

      .subscribe(function(status,error){

        console.log(
          "📡 User order realtime:",
          status
        );

        if(error){
          console.error(
            "User order realtime error:",
            error
          );
        }
      });
}

document.addEventListener("DOMContentLoaded", function () {

  const termsParagraph = document.querySelector(".terms");

  if (!termsParagraph) return;

  const clickableItems =
    termsParagraph.querySelectorAll("b");

  if (clickableItems.length < 2) return;

  const termsButton = clickableItems[0];
  const privacyButton = clickableItems[1];

  /* =========================================
     CLICKABLE EXISTING TEXT
  ========================================= */

  [termsButton, privacyButton].forEach(function (item) {

    Object.assign(item.style, {
      cursor: "pointer",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      textDecorationThickness: "1px",
      userSelect: "none",
      color: "#171717",
      fontWeight: "700",
      WebkitTapHighlightColor: "transparent"
    });

  });


  /* =========================================
     ADD POPUP FONT
  ========================================= */

  if (!document.getElementById("cezooLegalFont")) {

    const fontLink = document.createElement("link");

    fontLink.id = "cezooLegalFont";
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

    document.head.appendChild(fontLink);
  }


  /* =========================================
     CREATE OVERLAY
  ========================================= */

  const legalOverlay = document.createElement("div");

  legalOverlay.id = "cezooLegalOverlay";

  Object.assign(legalOverlay.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100dvh",
    background: "rgba(0,0,0,.52)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: "2147483647",
    opacity: "0",
    visibility: "hidden",
    pointerEvents: "none",
    transition:
      "opacity .28s ease, visibility .28s ease",
    overflow: "hidden",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  });


  /* =========================================
     CREATE FULL-PAGE BOTTOM SHEET
  ========================================= */

  const legalPage = document.createElement("div");

  legalPage.id = "cezooLegalPage";

  Object.assign(legalPage.style, {
    position: "absolute",

    /* 25px top gap */
    top: "calc(25px + env(safe-area-inset-top, 0px))",
    left: "0",
    right: "0",
    bottom: "0",

    width: "100%",
    maxWidth: "760px",
    height:
      "calc(100dvh - 25px - env(safe-area-inset-top, 0px))",

    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "26px 26px 0 0",

    transform: "translateY(105%)",
    transition:
      "transform .36s cubic-bezier(.22,.82,.27,1)",

    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",

    boxShadow:
      "0 -20px 60px rgba(0,0,0,.22)"
  });


  /* =========================================
     TOP DRAG HANDLE
  ========================================= */

  const dragArea = document.createElement("div");

  Object.assign(dragArea.style, {
    width: "100%",
    height: "18px",
    minHeight: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    flexShrink: "0"
  });


  const dragHandle = document.createElement("div");

  Object.assign(dragHandle.style, {
    width: "38px",
    height: "4px",
    borderRadius: "999px",
    background: "#d7d7dc"
  });

  dragArea.appendChild(dragHandle);


  /* =========================================
     HEADER
  ========================================= */

  const legalHeader = document.createElement("div");

  Object.assign(legalHeader.style, {
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding:
      "4px 18px 12px",
    borderBottom: "1px solid #ededf0",
    background: "#ffffff",
    boxSizing: "border-box",
    position: "relative",
    zIndex: "5",
    flexShrink: "0"
  });


  const legalTitleWrap = document.createElement("div");

  Object.assign(legalTitleWrap.style, {
    flex: "1",
    minWidth: "0"
  });


  const legalTitle = document.createElement("div");

  Object.assign(legalTitle.style, {
    margin: "0",
    color: "#111114",
    fontSize: "20px",
    fontWeight: "800",
    lineHeight: "1.25",
    letterSpacing: "-.35px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  });


  const legalSubtitle = document.createElement("div");

  legalSubtitle.textContent =
    "Please read this information carefully";

  Object.assign(legalSubtitle.style, {
    marginTop: "3px",
    color: "#77777f",
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "1.35"
  });


  const legalClose = document.createElement("button");

  legalClose.type = "button";
  legalClose.innerHTML = "×";
  legalClose.setAttribute(
    "aria-label",
    "Close legal information"
  );

  Object.assign(legalClose.style, {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    border: "1px solid #e5e5e8",
    borderRadius: "50%",
    background: "#f7f7f8",
    color: "#17171a",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    fontSize: "27px",
    fontWeight: "300",
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "0 0 2px",
    outline: "none",
    boxShadow: "none",
    WebkitTapHighlightColor: "transparent",
    transition:
      "transform .16s ease, background .16s ease"
  });


  legalClose.addEventListener("pointerdown", function () {
    legalClose.style.transform = "scale(.92)";
    legalClose.style.background = "#eeeeef";
  });


  function resetCloseButton() {
    legalClose.style.transform = "scale(1)";
    legalClose.style.background = "#f7f7f8";
  }


  legalClose.addEventListener(
    "pointerup",
    resetCloseButton
  );

  legalClose.addEventListener(
    "pointercancel",
    resetCloseButton
  );

  legalClose.addEventListener(
    "pointerleave",
    resetCloseButton
  );


  legalTitleWrap.appendChild(legalTitle);
  legalTitleWrap.appendChild(legalSubtitle);

  legalHeader.appendChild(legalTitleWrap);
  legalHeader.appendChild(legalClose);


  /* =========================================
     SCROLLABLE CONTENT
  ========================================= */

  const legalContent = document.createElement("div");

  Object.assign(legalContent.style, {
    flex: "1",
    minHeight: "0",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    overscrollBehavior: "contain",
    padding:
      "22px 18px calc(34px + env(safe-area-inset-bottom, 0px))",
    boxSizing: "border-box",
    background: "#f7f7f9",
    color: "#39393f",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "1.7",
    scrollbarWidth: "none"
  });


  legalContent.addEventListener("scroll", function () {
    legalHeader.style.boxShadow =
      legalContent.scrollTop > 5
        ? "0 5px 16px rgba(0,0,0,.06)"
        : "none";
  });


  /* Hide WebKit scrollbar */
  const scrollbarStyle =
    document.createElement("style");

  scrollbarStyle.id = "cezooLegalScrollbarStyle";

  scrollbarStyle.textContent = `
    #cezooLegalContent::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  `;

  document.head.appendChild(scrollbarStyle);

  legalContent.id = "cezooLegalContent";


  /* =========================================
     ADD ELEMENTS
  ========================================= */

  legalPage.appendChild(dragArea);
  legalPage.appendChild(legalHeader);
  legalPage.appendChild(legalContent);

  legalOverlay.appendChild(legalPage);
  document.body.appendChild(legalOverlay);


  /* =========================================
     COMMON HTML HELPERS
  ========================================= */

  function section(number, title, text) {

    return `
      <section style="
        background:#ffffff;
        border:1px solid #e9e9ed;
        border-radius:18px;
        padding:17px 16px;
        margin:0 0 12px;
        box-shadow:0 4px 14px rgba(20,20,25,.035);
      ">

        <div style="
          display:flex;
          align-items:flex-start;
          gap:11px;
        ">

          <div style="
            width:28px;
            height:28px;
            min-width:28px;
            border-radius:9px;
            background:#f0f0f3;
            color:#242428;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
            font-weight:800;
            line-height:1;
          ">
            ${number}
          </div>

          <div style="
            flex:1;
            min-width:0;
          ">

            <h3 style="
              margin:2px 0 8px;
              color:#18181c;
              font-size:15px;
              line-height:1.35;
              font-weight:800;
              letter-spacing:-.15px;
            ">
              ${title}
            </h3>

            <div style="
              margin:0;
              color:#55555d;
              font-size:13.5px;
              line-height:1.72;
              font-weight:400;
            ">
              ${text}
            </div>

          </div>

        </div>

      </section>
    `;
  }


  function legalTopMessage(text) {

    return `
      <div style="
        background:#ffffff;
        border:1px solid #e8e8ec;
        border-radius:19px;
        padding:17px;
        margin:0 0 16px;
        box-shadow:0 5px 18px rgba(20,20,25,.04);
      ">

        <div style="
          margin:0 0 6px;
          color:#18181c;
          font-size:15px;
          font-weight:800;
          line-height:1.4;
        ">
          Important information
        </div>

        <div style="
          color:#65656c;
          font-size:13px;
          font-weight:400;
          line-height:1.65;
        ">
          ${text}
        </div>

      </div>
    `;
  }


  function companyFooter() {

    return `
      <footer style="
        margin-top:24px;
        padding:22px 14px 8px;
        text-align:center;
        border-top:1px solid #dedee3;
      ">

        <div style="
          color:#1d1d21;
          font-size:13px;
          line-height:1.5;
          font-weight:800;
          letter-spacing:.1px;
        ">
          Cezonal Solutions Pvt. Ltd.
        </div>

        <div style="
          margin-top:5px;
          color:#85858d;
          font-size:11.5px;
          line-height:1.5;
          font-weight:500;
        ">
          CEZOO — Delivery in Minutes
        </div>

        <div style="
          margin-top:10px;
          color:#a0a0a7;
          font-size:10.5px;
          line-height:1.5;
          font-weight:500;
        ">
          © 2026 Cezonal Solutions Pvt. Ltd.
          All rights reserved.
        </div>

      </footer>
    `;
  }


  /* =========================================
     TERMS OF SERVICE
  ========================================= */

  const termsContent = `
    <div style="
      width:100%;
      max-width:700px;
      margin:0 auto;
      box-sizing:border-box;
    ">

      ${legalTopMessage(`
        By accessing, registering with or using CEZOO,
        you agree to these Terms of Service.
        Please stop using the platform if you do not
        agree with these terms.
      `)}

      ${section(
        "01",
        "About CEZOO",
        `
          CEZOO is an e-commerce and hyperlocal delivery
          platform operated by Cezonal Solutions Pvt. Ltd.
          The platform allows users to browse and order
          groceries, fruits, vegetables, daily-use household
          products, gift articles, stationery and other
          available products.
        `
      )}

      ${section(
        "02",
        "Account Registration and Verification",
        `
          To create or verify your account, CEZOO may request
          your name and mobile number. A one-time password
          may be sent to the mobile number provided by you.
          You are responsible for providing accurate details
          and keeping access to your mobile number secure.
        `
      )}

      ${section(
        "03",
        "OTP Use",
        `
          The OTP provided to you is intended only for account
          verification and login. You should not share your OTP
          with any other person. CEZOO representatives will not
          ask you to disclose your OTP through a phone call,
          message or social-media communication.
        `
      )}

      ${section(
        "04",
        "Location and Delivery Address",
        `
          CEZOO may request access to your device location or
          ask you to enter a delivery address. Location and
          address details are used to check service availability,
          calculate or assist delivery, identify the correct
          delivery location and complete your order.
        `
      )}

      ${section(
        "05",
        "Orders",
        `
          An order is considered successfully placed only after
          the platform confirms it. Product availability,
          quantity, price, discount and delivery availability
          may change. CEZOO may reject or cancel an order because
          of stock unavailability, incorrect information,
          payment failure, delivery limitations, suspected misuse
          or other operational reasons.
        `
      )}

      ${section(
        "06",
        "Products and Pricing",
        `
          CEZOO attempts to show accurate product names, images,
          sizes, quantities, descriptions and prices. Actual
          packaging, colour, weight or appearance may sometimes
          differ from the displayed image. Prices and offers may
          be changed before an order is successfully confirmed.
        `
      )}

      ${section(
        "07",
        "Payments",
        `
          Available payment methods may include cash, UPI or
          other supported methods. Online payments may be
          processed by third-party payment providers. Users must
          ensure that payment information submitted by them is
          accurate and authorised.
        `
      )}

      ${section(
        "08",
        "Delivery",
        `
          Delivery time shown in CEZOO is an estimate and is not
          a guaranteed time. Delivery may be affected by traffic,
          weather, product availability, distance, incorrect
          address information, technical problems or other
          circumstances outside reasonable control.
        `
      )}

      ${section(
        "09",
        "Cancellation, Replacement and Refund",
        `
          Cancellation, replacement and refund eligibility may
          depend on the product, order status, payment method and
          condition of the delivered item. Approved refunds will
          be processed through the applicable payment method or
          another method communicated by CEZOO.
        `
      )}

      ${section(
        "10",
        "Voice-Based Game Permission",
        `
          Certain optional games or interactive features may
          request microphone permission to detect voice input.
          Microphone access is used only when you actively use
          that feature and provide permission. You can deny or
          disable microphone permission through your device or
          browser settings. Denying permission may prevent the
          voice-based feature from working.
        `
      )}

      ${section(
        "11",
        "Notifications",
        `
          With your permission, CEZOO may send OTP messages,
          service alerts, order-status notifications, delivery
          updates and promotional communications. Notification
          permissions may be changed through your device settings.
        `
      )}

      ${section(
        "12",
        "User Responsibilities",
        `
          You must not place fraudulent orders, misuse discounts,
          impersonate another person, provide false information,
          interfere with the platform, attempt unauthorised access
          or use CEZOO for illegal or harmful activity.
        `
      )}

      ${section(
        "13",
        "Account Restriction",
        `
          CEZOO may temporarily restrict, suspend or close an
          account where there is suspected fraud, abusive conduct,
          repeated fake orders, security risk, unlawful activity
          or a material violation of these terms.
        `
      )}

      ${section(
        "14",
        "Platform Availability",
        `
          CEZOO may update, modify, suspend or discontinue a
          feature for maintenance, security, legal, technical or
          business reasons. Temporary interruptions may occur.
        `
      )}

      ${section(
        "15",
        "Limitation of Responsibility",
        `
          CEZOO will make reasonable efforts to provide a safe
          and reliable service. However, the platform may not
          always be uninterrupted or error-free. Responsibility
          will be limited to the extent permitted by applicable
          law.
        `
      )}

      ${section(
        "16",
        "Changes to These Terms",
        `
          These Terms of Service may be updated when CEZOO
          services, legal requirements or business practices
          change. Continued use of CEZOO after an update means
          that you accept the revised terms.
        `
      )}

      ${section(
        "17",
        "Contact and Support",
        `
          For questions about an order, account, refund, privacy
          or these terms, users may contact CEZOO through the
          Help or Support section available in the platform.
        `
      )}

      ${companyFooter()}

    </div>
  `;


  /* =========================================
     PRIVACY POLICY
  ========================================= */

  const privacyContent = `
    <div style="
      width:100%;
      max-width:700px;
      margin:0 auto;
      box-sizing:border-box;
    ">

      ${legalTopMessage(`
        This Privacy Policy explains what information CEZOO
        may collect, why it is collected and how it is handled
        while providing e-commerce and delivery services.
      `)}

      ${section(
        "01",
        "Information We May Collect",
        `
          CEZOO may collect information that you provide,
          including your name, mobile number, OTP-verification
          status, delivery address, order information, support
          messages and other details submitted while using the
          platform.
        `
      )}

      ${section(
        "02",
        "Mobile Number",
        `
          Your mobile number may be used to create or identify
          your account, send OTP verification messages, provide
          order updates, contact you regarding delivery and
          respond to support requests.
        `
      )}

      ${section(
        "03",
        "OTP Verification",
        `
          OTP verification is used to confirm that the mobile
          number entered by a user is accessible to that user.
          CEZOO may retain verification-related records where
          reasonably required for security, fraud prevention,
          account access and legal compliance.
        `
      )}

      ${section(
        "04",
        "Location Information",
        `
          With your permission, CEZOO may receive your device
          location. Location information may be used to identify
          serviceable areas, improve address accuracy, assist
          delivery partners, display delivery-related information
          and complete your order.
        `
      )}

      ${section(
        "05",
        "Delivery Information",
        `
          Information required to complete delivery may include
          your name, mobile number, address, nearby landmark,
          order details and delivery instructions. Necessary
          delivery information may be shared with the assigned
          delivery partner or seller only for completing and
          supporting the order.
        `
      )}

      ${section(
        "06",
        "Microphone and Voice Data",
        `
          Some optional CEZOO games or interactive features may
          request microphone permission. Microphone access is
          activated only after permission is provided and when
          the relevant voice-based feature is being used.
          CEZOO does not require microphone permission for normal
          shopping, account access or order delivery.
        `
      )}

      ${section(
        "07",
        "Order and Transaction Information",
        `
          CEZOO may process details such as products ordered,
          quantities, prices, discounts, payment type, delivery
          fee, delivery status, cancellation status, refund status
          and transaction references.
        `
      )}

      ${section(
        "08",
        "Payment Information",
        `
          Online payments may be processed through third-party
          payment providers. CEZOO does not generally store your
          complete card number, UPI PIN, banking password or other
          confidential payment credentials.
        `
      )}

      ${section(
        "09",
        "Device and Technical Information",
        `
          CEZOO may receive limited technical information such as
          device type, operating system, app version, browser
          information, notification token, IP address, error logs
          and security-related activity to operate, protect and
          improve the platform.
        `
      )}

      ${section(
        "10",
        "How Information Is Used",
        `
          Information may be used to register and verify users,
          process orders, arrange delivery, provide customer
          support, send order updates, improve platform
          performance, personalise relevant features, detect
          fraud, investigate security incidents and comply with
          legal obligations.
        `
      )}

      ${section(
        "11",
        "Data Sharing",
        `
          CEZOO may share only necessary information with sellers,
          assigned delivery partners, payment providers, hosting
          providers, OTP providers, technical service providers,
          professional advisers and government or legal
          authorities where required to provide services or comply
          with law.
        `
      )}

      ${section(
        "12",
        "Data Safety and Security",
        `
          CEZOO uses reasonable technical, organisational and
          access-control measures intended to protect user
          information. Security systems and sensitive operational
          access may be reviewed or handled by authorised
          technical and cybersecurity personnel. However, no
          internet service, transmission method or storage system
          can be guaranteed to be completely secure.
        `
      )}

      ${section(
        "13",
        "Cybersecurity Team",
        `
          Authorised cybersecurity and technical team members may
          monitor systems, review security alerts, investigate
          suspicious activity, maintain backups, apply security
          updates and take protective action when needed.
          Access to personal information should be limited to
          authorised persons who require it for legitimate
          operational or security purposes.
        `
      )}

      ${section(
        "14",
        "Data Retention",
        `
          Information may be retained only for as long as
          reasonably necessary to operate CEZOO, provide orders
          and support, maintain business and transaction records,
          prevent fraud, resolve disputes and comply with
          applicable legal obligations.
        `
      )}

      ${section(
        "15",
        "Notifications and Communications",
        `
          CEZOO may send OTP messages, order updates, delivery
          alerts, service announcements and, where permitted,
          promotional communications. Users may manage app
          notification permissions through their device settings.
        `
      )}

      ${section(
        "16",
        "User Choices and Permissions",
        `
          You may manage location, microphone and notification
          permissions through your browser or device settings.
          Some services may not function correctly when a required
          permission is disabled. Users may also request correction
          or deletion of eligible personal information through
          CEZOO support.
        `
      )}

      ${section(
        "17",
        "Children",
        `
          CEZOO services should be used by persons legally capable
          of entering into transactions or under the supervision
          of a parent or legal guardian. Users should not submit
          another person's personal information without proper
          permission.
        `
      )}

      ${section(
        "18",
        "Third-Party Services",
        `
          CEZOO may use third-party services for OTP delivery,
          databases, hosting, analytics, maps, payments and
          notifications. Those services may process limited
          information according to their own privacy terms and
          applicable agreements.
        `
      )}

      ${section(
        "19",
        "Privacy Policy Updates",
        `
          This Privacy Policy may be updated when CEZOO services,
          technology, security practices or legal requirements
          change. The latest version will be displayed through
          the CEZOO platform.
        `
      )}

      ${section(
        "20",
        "Privacy Support",
        `
          Users may contact CEZOO through the Help or Support
          section for questions about personal information,
          account data, permissions, correction requests or
          eligible deletion requests.
        `
      )}

      ${companyFooter()}

    </div>
  `;


  /* =========================================
     OPEN AND CLOSE
  ========================================= */

  let legalPopupOpen = false;
  let legalPopupClosing = false;
  let savedBodyOverflow = "";
  let savedHtmlOverflow = "";
  let popupHistoryAdded = false;


  function lockLegalScroll() {

    savedBodyOverflow =
      document.body.style.overflow;

    savedHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";
  }


  function unlockLegalScroll() {

    document.body.style.overflow =
      savedBodyOverflow;

    document.documentElement.style.overflow =
      savedHtmlOverflow;
  }


  function openLegalPopup(type) {

    if (legalPopupOpen || legalPopupClosing) return;

    legalPopupOpen = true;
    popupHistoryAdded = false;

    if (type === "terms") {

      legalTitle.textContent =
        "Terms of Service";

      legalContent.innerHTML =
        termsContent;

    } else {

      legalTitle.textContent =
        "Privacy Policy";

      legalContent.innerHTML =
        privacyContent;
    }

    legalContent.scrollTop = 0;
    legalHeader.style.boxShadow = "none";

    legalPage.style.transition =
      "transform .36s cubic-bezier(.22,.82,.27,1)";

    legalPage.style.transform =
      "translateY(105%)";

    legalOverlay.style.visibility = "visible";
    legalOverlay.style.pointerEvents = "auto";

    lockLegalScroll();

    requestAnimationFrame(function () {

      legalOverlay.style.opacity = "1";

      requestAnimationFrame(function () {
        legalPage.style.transform =
          "translateY(0)";
      });

    });

    try {

      history.pushState(
        {
          cezooLegalPopup: true,
          legalType: type
        },
        "",
        window.location.href
      );

      popupHistoryAdded = true;

    } catch (error) {

      popupHistoryAdded = false;
    }
  }


  function finishLegalClose() {

    legalOverlay.style.visibility = "hidden";
    legalContent.innerHTML = "";

    legalPage.style.transform =
      "translateY(105%)";

    unlockLegalScroll();

    legalPopupClosing = false;
  }


  function closeLegalPopup(options = {}) {

    const {
      fromHistory = false,
      swipeDirection = ""
    } = options;

    if (!legalPopupOpen || legalPopupClosing) {
      return;
    }

    legalPopupClosing = true;
    legalPopupOpen = false;

    legalOverlay.style.opacity = "0";
    legalOverlay.style.pointerEvents = "none";

    legalPage.style.transition =
      "transform .30s cubic-bezier(.4,0,.6,1)";

    if (swipeDirection === "right") {

      legalPage.style.transform =
        "translateX(105%)";

    } else if (swipeDirection === "down") {

      legalPage.style.transform =
        "translateY(105%)";

    } else {

      legalPage.style.transform =
        "translateY(105%)";
    }

    setTimeout(finishLegalClose, 310);

    if (
      !fromHistory &&
      popupHistoryAdded &&
      history.state?.cezooLegalPopup
    ) {

      popupHistoryAdded = false;
      history.back();
    }
  }


  /* =========================================
     BUTTON EVENTS
  ========================================= */

  termsButton.addEventListener(
    "click",
    function (event) {

      event.preventDefault();
      event.stopPropagation();

      openLegalPopup("terms");
    }
  );


  privacyButton.addEventListener(
    "click",
    function (event) {

      event.preventDefault();
      event.stopPropagation();

      openLegalPopup("privacy");
    }
  );


  legalClose.addEventListener(
    "click",
    function () {

      closeLegalPopup();
    }
  );


  /* =========================================
     BROWSER / ANDROID BACK
  ========================================= */

  window.addEventListener(
    "popstate",
    function () {

      if (legalPopupOpen) {

        popupHistoryAdded = false;

        closeLegalPopup({
          fromHistory: true
        });
      }
    }
  );


  /* =========================================
     ESCAPE KEY CLOSE
  ========================================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        legalPopupOpen
      ) {

        closeLegalPopup();
      }
    }
  );


  /* =========================================
     PREVENT CONTENT CLICK FROM CLOSING
  ========================================= */

  legalPage.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();
    }
  );


  /* Optional: tap dark area to close */
  legalOverlay.addEventListener(
    "click",
    function (event) {

      if (event.target === legalOverlay) {
        closeLegalPopup();
      }
    }
  );


  /* =========================================
     LEFT-EDGE SWIPE TO CLOSE
  ========================================= */

  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeCurrentX = 0;
  let edgeSwipeActive = false;
  let edgeSwipeMoved = false;


  legalPage.addEventListener(
    "touchstart",
    function (event) {

      if (!legalPopupOpen) return;

      const touch = event.touches[0];

      swipeStartX = touch.clientX;
      swipeStartY = touch.clientY;
      swipeCurrentX = swipeStartX;
      edgeSwipeMoved = false;

      edgeSwipeActive =
        swipeStartX <= 32;
    },
    {
      passive: true
    }
  );


  legalPage.addEventListener(
    "touchmove",
    function (event) {

      if (!edgeSwipeActive) return;

      const touch = event.touches[0];

      swipeCurrentX = touch.clientX;

      const moveX =
        swipeCurrentX - swipeStartX;

      const moveY =
        touch.clientY - swipeStartY;

      if (
        Math.abs(moveY) >
        Math.abs(moveX)
      ) {

        edgeSwipeActive = false;

        legalPage.style.transition =
          "transform .24s ease";

        legalPage.style.transform =
          "translateX(0)";

        return;
      }

      if (moveX > 0) {

        edgeSwipeMoved = true;

        legalPage.style.transition = "none";

        legalPage.style.transform =
          `translateX(${Math.min(
            moveX,
            window.innerWidth
          )}px)`;
      }
    },
    {
      passive: true
    }
  );


  legalPage.addEventListener(
    "touchend",
    function () {

      if (!edgeSwipeActive) return;

      const movedDistance =
        swipeCurrentX - swipeStartX;

      const closeThreshold =
        Math.min(
          100,
          window.innerWidth * 0.25
        );

      if (
        edgeSwipeMoved &&
        movedDistance > closeThreshold
      ) {

        closeLegalPopup({
          swipeDirection: "right"
        });

      } else {

        legalPage.style.transition =
          "transform .26s cubic-bezier(.22,.82,.27,1)";

        legalPage.style.transform =
          "translateX(0)";
      }

      edgeSwipeActive = false;
      edgeSwipeMoved = false;
    },
    {
      passive: true
    }
  );


  legalPage.addEventListener(
    "touchcancel",
    function () {

      if (!edgeSwipeActive) return;

      legalPage.style.transition =
        "transform .26s ease";

      legalPage.style.transform =
        "translateX(0)";

      edgeSwipeActive = false;
      edgeSwipeMoved = false;
    },
    {
      passive: true
    }
  );


  /* =========================================
     DRAG HANDLE SWIPE DOWN TO CLOSE
  ========================================= */

  let dragStartY = 0;
  let dragCurrentY = 0;
  let dragSheetActive = false;


  dragArea.addEventListener(
    "touchstart",
    function (event) {

      if (!legalPopupOpen) return;

      const touch = event.touches[0];

      dragStartY = touch.clientY;
      dragCurrentY = dragStartY;
      dragSheetActive = true;
    },
    {
      passive: true
    }
  );


  dragArea.addEventListener(
    "touchmove",
    function (event) {

      if (!dragSheetActive) return;

      const touch = event.touches[0];

      dragCurrentY = touch.clientY;

      const moveY =
        dragCurrentY - dragStartY;

      if (moveY > 0) {

        legalPage.style.transition = "none";

        legalPage.style.transform =
          `translateY(${moveY}px)`;

        legalOverlay.style.opacity =
          String(
            Math.max(
              0.25,
              1 - moveY / 500
            )
          );
      }
    },
    {
      passive: true
    }
  );


  dragArea.addEventListener(
    "touchend",
    function () {

      if (!dragSheetActive) return;

      const movedDistance =
        dragCurrentY - dragStartY;

      if (movedDistance > 95) {

        closeLegalPopup({
          swipeDirection: "down"
        });

      } else {

        legalOverlay.style.opacity = "1";

        legalPage.style.transition =
          "transform .28s cubic-bezier(.22,.82,.27,1)";

        legalPage.style.transform =
          "translateY(0)";
      }

      dragSheetActive = false;
    },
    {
      passive: true
    }
  );


  dragArea.addEventListener(
    "touchcancel",
    function () {

      if (!dragSheetActive) return;

      legalOverlay.style.opacity = "1";

      legalPage.style.transition =
        "transform .28s ease";

      legalPage.style.transform =
        "translateY(0)";

      dragSheetActive = false;
    },
    {
      passive: true
    }
  );


  /* =========================================
     GLOBAL CLOSE FUNCTION
     Useful for Android WebView back handling
  ========================================= */

  window.closeCezooLegalPopup =
    function () {

      if (!legalPopupOpen) {
        return false;
      }

      closeLegalPopup();
      return true;
    };


  window.isCezooLegalPopupOpen =
    function () {

      return legalPopupOpen;
    };

});