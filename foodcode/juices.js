/* =========================================================
   CEZOO REFRESHMENT ITEMS — CLEAN VERSION
   Uses existing window._supabaseClient
   No separate CSS

   ✓ compact cards
   ✓ aligned - qty +
   ✓ small bottom sheet
   ✓ localStorage cart
   ✓ latest 3 product images in cart bar
   ✓ 4th product hides oldest image
   ✓ product image flies into cart when added
========================================================= */

(function () {

  "use strict";


  const CART_KEY =
    "cezooFoodCart";


  let products = [];

  let cart = {};

  let selectedProduct = null;


  let section = null;

  let overlay = null;

  let sheet = null;

  let cartBar = null;


  /* =========================================================
     START
  ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:true
      }
    );

  } else {

    init();

  }


  /* =========================================================
     INIT
  ========================================================= */

  async function init() {


    section =
      document.getElementById(
        "tanukuRefreshmentItems"
      );


    if (!section) {

      console.error(
        "#tanukuRefreshmentItems not found"
      );

      return;
    }


    if (
      section.dataset.foodReady === "1"
    ) {

      return;
    }


    section.dataset.foodReady =
      "1";


    if (
      !window._supabaseClient
    ) {

      console.error(
        "Supabase client not found"
      );

      return;
    }


    loadCart();

    injectCSS();

    createSheet();

    createCartBar();

    bindEvents();

    updateCartBar();

    await loadProducts();

  }


  /* =========================================================
     LOAD CART
  ========================================================= */

  function loadCart() {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            CART_KEY
          ) || "{}"
        );


      cart =
        saved &&
        typeof saved === "object" &&
        !Array.isArray(saved)

          ? saved

          : {};


    } catch (error) {

      console.warn(
        "Food cart reset:",
        error
      );

      cart = {};

    }

  }


  /* =========================================================
     SAVE CART
  ========================================================= */

  function saveCart() {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );


    updateCartBar();


    window.dispatchEvent(
      new CustomEvent(
        "cezooFoodCartChanged",
        {
          detail:{
            cart:{
              ...cart
            }
          }
        }
      )
    );

  }


  /* =========================================================
     CSS
  ========================================================= */

  function injectCSS() {


    if (
      document.getElementById(
        "czRefreshCleanStyles"
      )
    ) {

      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "czRefreshCleanStyles";


    style.textContent = `


      /* =====================================
         SECTION
      ===================================== */

      #tanukuRefreshmentItems{
        width:100%;

        background:#fff;

        padding:6px 0 12px;

        overflow:visible;

        position:relative;

        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }


      /* =====================================
         REFRESHMENT DIVIDER LINE
      ===================================== */

      .cezooRefreshmentBlackLine{
        display:block;
        position:relative;
        clear:both;

        width:calc(100% - 24px);
        height:1px;

        margin:4px 12px 14px;
        padding:0;

        background:#111;

        border:0;

        z-index:1;
      }


      /* =====================================
         PRODUCT ROW
      ===================================== */

      .czRRow{
        display:flex;

        align-items:flex-start;

        gap:11px;

        width:100%;

        overflow-x:auto;
        overflow-y:hidden;

        padding:
          6px
          12px
          14px;

        scrollbar-width:none;

        -webkit-overflow-scrolling:touch;
      }


      .czRRow::-webkit-scrollbar{
        display:none;
      }


      /* =====================================
         PRODUCT CARD
      ===================================== */

      .czRCard{
        position:relative;

        flex:
          0
          0
          98px;

        width:98px;
        min-width:98px;

        cursor:pointer;

        -webkit-tap-highlight-color:
          transparent;
      }


      /* =====================================
         IMAGE
      ===================================== */

      .czRImageBox{
        position:relative;

        width:98px;
        height:98px;

        overflow:hidden;

        border-radius:14px;

        background:#f7f7f7;
      }


      .czRImage{
        display:block;

        width:100%;
        height:100%;

        object-fit:cover;

        pointer-events:none;

        user-select:none;

        -webkit-user-drag:none;
      }


      /* =====================================
         ADD
      ===================================== */

      .czRAdd{
        position:absolute;

        right:5px;
        bottom:5px;

        width:34px;
        height:32px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:
          1px
          solid
          #d3d3d3;

        border-radius:10px;

        background:#fff;

        color:#18a568;

        font-size:21px;
        font-weight:600;

        line-height:1;

        box-shadow:
          0
          2px
          5px
          rgba(0,0,0,.08);

        cursor:pointer;

        -webkit-tap-highlight-color:
          transparent;
      }


      .czRAdd:active{
        transform:scale(.95);
      }


      /* =====================================
         CARD QUANTITY
      ===================================== */

      .czRQty{
        position:absolute;

        right:5px;
        bottom:5px;

        height:32px;

        display:grid;

        grid-template-columns:
          27px
          22px
          27px;

        align-items:center;
        justify-items:center;

        overflow:hidden;

        border-radius:10px;

        background:#18a568;

        box-shadow:
          0
          2px
          5px
          rgba(0,0,0,.08);
      }


      .czRQty button{
        width:27px;
        height:32px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:0;

        appearance:none;
        -webkit-appearance:none;

        background:transparent;

        color:#fff;

        font-family:
          Arial,
          sans-serif;

        font-size:18px;
        font-weight:500;

        line-height:1;

        cursor:pointer;
      }


      .czRQty span{
        width:22px;
        height:32px;

        display:flex;

        align-items:center;
        justify-content:center;

        color:#fff;

        font-size:12px;
        font-weight:700;

        line-height:1;

        text-align:center;
      }


      /* =====================================
         PRODUCT INFO
      ===================================== */

      .czRInfo{
        padding:
          8px
          1px
          0;
      }


      .czRName{
        min-height:31px;

        display:
          -webkit-box;

        overflow:hidden;

        -webkit-box-orient:
          vertical;

        -webkit-line-clamp:2;

        color:#282828;

        font-size:12px;
        font-weight:600;

        line-height:1.2;
      }


      .czRQuantity{
        margin-top:4px;

        color:#8a8a8a;

        font-size:9px;
      }


      .czRPrices{
        display:flex;

        align-items:center;

        gap:5px;

        margin-top:6px;
      }


      .czRMrp{
        color:#888;

        font-size:12px;

        text-decoration:
          line-through;
      }


      .czRPrice{
        color:#111;

        font-size:13px;
        font-weight:700;
      }


      /* =====================================
         OVERLAY
      ===================================== */

      .czROverlay{
        position:fixed;

        inset:0;

        z-index:2147483000;

        background:
          rgba(0,0,0,.28);

        opacity:0;

        visibility:hidden;

        pointer-events:none;

        transition:
          opacity .18s ease,
          visibility .18s ease;
      }


      .czROverlay.show{
        opacity:1;

        visibility:visible;

        pointer-events:auto;
      }


      /* =====================================
         SMALL BOTTOM SHEET
      ===================================== */

      .czRSheet{
        position:fixed;

        left:50%;
        bottom:0;

        z-index:2147483001;

        width:
          min(
            calc(100% - 12px),
            540px
          );

        max-height:68vh;

        overflow-y:auto;

        background:#fff;

        border-radius:
          20px
          20px
          0
          0;

        padding:
          8px
          14px
          calc(
            16px +
            env(safe-area-inset-bottom)
          );

        transform:
          translate3d(
            -50%,
            105%,
            0
          );

        transition:
          transform
          .22s
          ease;

        box-shadow:
          0
          -7px
          24px
          rgba(0,0,0,.12);
      }


      .czRSheet.show{
        transform:
          translate3d(
            -50%,
            0,
            0
          );
      }


      .czRHandle{
        width:34px;
        height:4px;

        margin:
          0
          auto
          11px;

        border-radius:999px;

        background:#d8d8d8;
      }


      .czRSheetMain{
        width:100%;
      }


      .czRSheetImageBox{
        width:calc(100% + 28px);
        height:240px;
        margin-left:-14px;
        margin-right:-14px;
        margin-top:-1px;
        padding:10px 12px;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        background:#f6f6f6;
        border-radius:14px 14px 12px 12px;
        box-sizing:border-box;
      }


      .czRSheetImage{
        width:100%;
        height:100%;
        display:block;
        object-fit:contain;
        object-position:center;
        border-radius:10px;
        background:transparent;
      }


      .czRSheetContentRow{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
        margin-top:14px;
      }


      .czRSheetText{
        flex:1;
        min-width:0;
        text-align:left;
      }


      .czRSheetName{
        margin:0;

        color:#202020;

        font-size:21px;
        font-weight:700;

        line-height:1.15;
      }


      .czRSheetQtyText{
        margin-top:5px;

        color:#888;

        font-size:12px;
      }


      .czRSheetPrices{
        display:flex;

        align-items:center;

        gap:6px;

        margin-top:7px;
      }


      .czRSheetMrp{
        color:#888;

        font-size:10px;

        text-decoration:
          line-through;
      }


      .czRSheetPrice{
        color:#111;

        font-size:17px;
        font-weight:750;
      }


      .czRSheetDescription{
        margin-top:12px;

        color:#666;

        font-size:13px;

        line-height:1.5;
      }


      .czRSheetAdditional{
        margin-top:5px;

        color:#858585;

        font-size:12px;

        line-height:1.45;
      }


      /* =====================================
         SHEET ACTION
      ===================================== */

      .czRSheetAction{
        flex:0 0 auto;
        margin-top:0;

        display:flex;
        align-items:center;
        justify-content:flex-end;
      }


      .czRSheetAdd{
        width:92px;
        height:38px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;

        border:
          1px
          solid
          #d5d5d5;

        border-radius:10px;

        background:#fff;

        color:#18a568;

        font-size:13px;
        font-weight:700;

        cursor:pointer;
      }


      .czRSheetQty{
        height:38px;

        display:grid;

        grid-template-columns:
          34px
          28px
          34px;

        align-items:center;
        justify-items:center;

        overflow:hidden;

        border-radius:10px;

        background:#18a568;
      }


      .czRSheetQty button{
        width:34px;
        height:38px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:0;

        appearance:none;
        -webkit-appearance:none;

        background:transparent;

        color:#fff;

        font-family:
          Arial,
          sans-serif;

        font-size:18px;

        line-height:1;

        cursor:pointer;
      }


      .czRSheetQty span{
        width:28px;
        height:38px;

        display:flex;

        align-items:center;
        justify-content:center;

        color:#fff;

        font-size:12px;
        font-weight:700;

        line-height:1;
      }


      /* =====================================
         CART BAR
      ===================================== */

      .czRCartBar{
  position:fixed;

  left:12px;
  right:12px;

  /* little more upward */
  bottom:
    calc(
      22px +
      env(safe-area-inset-bottom)
    );

  z-index:2147482500;

  /* slightly bigger */
  height:64px;

  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:12px;

  padding:
    9px
    10px
    9px
    11px;

  border:
    1px
    solid
    #e7e7e7;

  border-radius:18px;

  background:#fff;

  box-shadow:
    0 8px 24px
    rgba(0,0,0,.12);

  transform:
    translate3d(
      0,
      95px,
      0
    );

  opacity:0;
  pointer-events:none;

  transition:
    transform .22s ease,
    opacity .18s ease;

  box-sizing:border-box;
}

.czRCartBar.show{
  transform:
    translate3d(
      0,
      0,
      0
    );

  opacity:1;
  pointer-events:auto;
}

      /* =====================================
         CART LEFT AREA
      ===================================== */

      .czRCartLeft{
        flex:1;

        min-width:0;

        display:flex;

        align-items:center;

        gap:10px;

        overflow:hidden;
      }


      /* =====================================
         CART IMAGES
      ===================================== */

      .czRCartImages{
        flex:0 0 auto;

        display:flex;

        align-items:center;

        min-width:38px;
      }

.czRCartThumb{
  position:relative;

  width:40px;
  height:40px;

  flex:0 0 40px;

  display:block;

  object-fit:cover;

  border:2px solid #fff;

  border-radius:10px;

  background:#f5f5f5;

  box-shadow:
    0 2px 6px
    rgba(0,0,0,.12);
}

.czRCartThumb + .czRCartThumb{
  margin-left:-9px;
}


      .czRCartThumb + .czRCartThumb{
        margin-left:-10px;
      }


      /* =====================================
         CART TEXT
      ===================================== */

      .czRCartText{
        flex:1;

        min-width:0;

        overflow:hidden;
      }


      .czRCartTitle{
        width:100%;

        overflow:hidden;

        color:#252525;

        font-size:12px;
        font-weight:700;

        line-height:1.15;

        white-space:nowrap;

        text-overflow:ellipsis;
      }


      .czRCartSub{
        margin-top:3px;

        color:#8a8a8a;

        font-size:9px;

        line-height:1;
      }


      /* =====================================
         FIXED CHECKOUT BUTTON
      ===================================== */

      .czRCheckout{
        flex:
          0
          0
          88px;

        width:88px;
        min-width:88px;
        max-width:88px;

        height:38px;
        min-height:38px;
        max-height:38px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;

        margin:0;

        border:0;

        border-radius:10px;

        background:#18a568;

        color:#fff;

        font-size:11px;
        font-weight:700;

        line-height:1;

        cursor:pointer;

        white-space:nowrap;

        box-sizing:border-box;

        -webkit-tap-highlight-color:
          transparent;
      }


      .czRCheckout:active{
        transform:scale(.97);
      }


      /* =====================================
         FLYING PRODUCT IMAGE
      ===================================== */

      .czRFlyingImage{
        position:fixed;

        z-index:2147483646;

        width:54px;
        height:54px;

        object-fit:cover;

        border-radius:12px;

        pointer-events:none;

        box-shadow:
          0
          4px
          15px
          rgba(0,0,0,.18);

        transform:
          translate3d(
            0,
            0,
            0
          )
          scale(1);

        opacity:1;

        will-change:
          transform,
          opacity;
      }


      /* =====================================
         CART IMAGE ENTER ANIMATION
      ===================================== */

      .czRCartThumb.new-image{
        animation:
          czRCartImagePop
          .28s
          ease;
      }


      @keyframes czRCartImagePop{

        0%{
          transform:
            scale(.55);

          opacity:.35;
        }

        70%{
          transform:
            scale(1.12);
        }

        100%{
          transform:
            scale(1);

          opacity:1;
        }

      }


      /* =====================================
         MOBILE
      ===================================== */


      @media(max-width:600px){
        .czRSheetImageBox{
          width:calc(100% + 28px);
          height:215px;
          padding:8px 10px;
        }
        .czRSheetContentRow{
          gap:12px;
          margin-top:13px;
        }
        .czRSheetName{
          font-size:19px;
        }
      }

      @media(max-width:600px){

        .czRRow{
          gap:9px;

          padding-left:10px;
          padding-right:10px;
        }


        .czRCard{
          flex-basis:92px;

          width:92px;
          min-width:92px;
        }


        .czRImageBox{
          width:92px;
          height:92px;
        }


        .czRSheet{
          width:
            calc(100% - 8px);
          max-height:70vh;
        }


        .czRSheetImage{
          height:165px;
        }


        .czRSheetContentRow{
          gap:12px;
        }


       @media(max-width:600px){

  .czRCartBar{
    left:9px;
    right:9px;

    bottom:
      calc(
        20px +
        env(safe-area-inset-bottom)
      );

    height:62px;

    padding:
      8px
      9px;

    border-radius:17px;
  }

  .czRCartThumb{
    width:39px;
    height:39px;
    flex-basis:39px;
  }

  .czRCartThumb + .czRCartThumb{
    margin-left:-9px;
  }
}


        .czRCheckout{
          flex-basis:82px;

          width:82px;
          min-width:82px;
          max-width:82px;

          height:36px;
          min-height:36px;
          max-height:36px;

          font-size:10px;
        }

      }


      @media(max-width:370px){

        .czRCard{
          flex-basis:86px;

          width:86px;
          min-width:86px;
        }


        .czRImageBox{
          width:86px;
          height:86px;
        }


        .czRCartText{
          display:none;
        }


        .czRCartLeft{
          gap:0;
        }

      }


      @media(
        prefers-reduced-motion:
        reduce
      ){

        .czRSheet,
        .czROverlay,
        .czRCartBar{
          transition:none;
        }


        .czRFlyingImage{
          display:none !important;
        }


        .czRCartThumb.new-image{
          animation:none;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =========================================================
     CREATE BOTTOM SHEET
  ========================================================= */

  function createSheet() {


    overlay =
      document.getElementById(
        "czROverlay"
      );


    if (!overlay) {

      overlay =
        document.createElement(
          "div"
        );


      overlay.id =
        "czROverlay";


      overlay.className =
        "czROverlay";


      document.body.appendChild(
        overlay
      );

    }


    sheet =
      document.getElementById(
        "czRSheet"
      );


    if (!sheet) {


      sheet =
        document.createElement(
          "div"
        );


      sheet.id =
        "czRSheet";


      sheet.className =
        "czRSheet";


      sheet.innerHTML = `

        <div
          class="czRHandle"
        ></div>


        <div
          class="czRSheetMain"
        >

          <div class="czRSheetImageBox">
            <img
              id="czRSheetImage"
              class="czRSheetImage"
              alt=""
            >
          </div>


          <div class="czRSheetContentRow">

            <div class="czRSheetText">

              <h3
                id="czRSheetName"
                class="czRSheetName"
              ></h3>


              <div
                id="czRSheetQtyText"
                class="czRSheetQtyText"
              ></div>


              <div
                class="czRSheetPrices"
              >

                <span
                  id="czRSheetMrp"
                  class="czRSheetMrp"
                ></span>


                <span
                  id="czRSheetPrice"
                  class="czRSheetPrice"
                ></span>

              </div>

            </div>


            <div
              id="czRSheetAction"
              class="czRSheetAction"
            ></div>

          </div>

        </div>


        <div
          id="czRSheetDescription"
          class="czRSheetDescription"
        ></div>


        <div
          id="czRSheetAdditional"
          class="czRSheetAdditional"
        ></div>

      `;


      document.body.appendChild(
        sheet
      );

    }

  }


  /* =========================================================
     CREATE CART BAR
  ========================================================= */

  function createCartBar() {


    cartBar =
      document.getElementById(
        "czRCartBar"
      );


    if (cartBar) {

      return;

    }


    cartBar =
      document.createElement(
        "div"
      );


    cartBar.id =
      "czRCartBar";


    cartBar.className =
      "czRCartBar";


    cartBar.innerHTML = `

      <div
        class="czRCartLeft"
      >

        <div
          id="czRCartImages"
          class="czRCartImages"
        ></div>


        <div
          class="czRCartText"
        >

          <div
            id="czRCartTitle"
            class="czRCartTitle"
          >
            Food Cart
          </div>


          <div
            id="czRCartSub"
            class="czRCartSub"
          ></div>

        </div>

      </div>


      <button
        id="czRCheckout"
        class="czRCheckout"
        type="button"
      >
        Checkout
      </button>

    `;


    document.body.appendChild(
      cartBar
    );

  }


  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts() {


    const {
      data,
      error
    } =
      await window._supabaseClient
        .from(
          "food_items"
        )
        .select(`
          id,
          product_name,
          image1,
          quantity,
          sub_text,
          restaurant_name,
          restaurant_image,
          original_price,
          discount_price,
          additional_info
        `)
        .is(
          "restaurant_name",
          null
        )
        .order(
          "id",
          {
            ascending:true
          }
        );


    if (error) {

      console.error(
        "Refreshment load error:",
        error
      );


      section.innerHTML = `

        <div style="
          padding:18px;
          text-align:center;
          font-size:11px;
          color:#777;
        ">
          Unable to load items
        </div>

      `;


      return;

    }


    products =
      Array.isArray(data)
        ? data
        : [];


    renderProducts();

    updateCartBar();

  }


  /* =========================================================
     RENDER PRODUCTS
  ========================================================= */

  function renderProducts() {


    if (!products.length) {

      section.innerHTML = `

        <div style="
          padding:18px;
          text-align:center;
          font-size:11px;
          color:#777;
        ">
          No refreshments available
        </div>

      `;


      return;

    }


    section.innerHTML = `

      <div
        class="czRRow"
      >

        ${products.map(
          product => {


            const qty =
              getQty(
                product.id
              );


            const mrp =
              Number(
                product.original_price
              ) || 0;


            const price =
              Number(
                product.discount_price
              ) || 0;


            return `

              <article
                class="czRCard"
                data-card="${product.id}"
              >

                <div
                  class="czRImageBox"
                >

                  ${
                    product.image1
                      ? `

                        <img
                          class="czRImage"
                          src="${escapeHTML(product.image1)}"
                          alt="${escapeHTML(product.product_name || "")}"
                          loading="lazy"
                          decoding="async"
                        >

                      `
                      : ""
                  }


                  ${
                    qty > 0

                      ? quantityHTML(
                          product.id,
                          qty
                        )

                      : `

                        <button
                          class="czRAdd"
                          type="button"
                          data-add="${product.id}"
                        >
                          +
                        </button>

                      `
                  }

                </div>


                <div
                  class="czRInfo"
                >

                  <div
                    class="czRName"
                  >
                    ${escapeHTML(
                      product.product_name ||
                      ""
                    )}
                  </div>


                  <div
                    class="czRQuantity"
                  >
                    ${escapeHTML(
                      product.quantity ||
                      ""
                    )}
                  </div>


                  <div
                    class="czRPrices"
                  >

                    ${
                      mrp > price

                        ? `

                          <span
                            class="czRMrp"
                          >
                            ₹${money(mrp)}
                          </span>

                        `

                        : ""
                    }


                    <span
                      class="czRPrice"
                    >
                      ₹${money(price)}
                    </span>

                  </div>

                </div>

              </article>

            `;

          }
        ).join("")}

      </div>

    `;

  }


  /* =========================================================
     QTY HTML
  ========================================================= */

  function quantityHTML(
    id,
    qty
  ) {

    return `

      <div
        class="czRQty"
      >

        <button
          type="button"
          data-minus="${id}"
          aria-label="Decrease"
        >
          −
        </button>


        <span>
          ${qty}
        </span>


        <button
          type="button"
          data-plus="${id}"
          aria-label="Increase"
        >
          +
        </button>

      </div>

    `;

  }


  /* =========================================================
     EVENTS
  ========================================================= */

  function bindEvents() {


    section.addEventListener(
      "click",
      handleSectionClick
    );


    overlay.addEventListener(
      "click",
      closeSheet
    );


    document
      .getElementById(
        "czRSheetAction"
      )
      .addEventListener(
        "click",
        handleSheetAction
      );


    document
      .getElementById(
        "czRCheckout"
      )
      .addEventListener(
        "click",
        function() {


          const items =
            getCartItems();


          window.dispatchEvent(
            new CustomEvent(
              "cezooFoodCheckout",
              {
                detail:{
                  cart:{
                    ...cart
                  },

                  items
                }
              }
            )
          );


          console.log(
            "Food checkout:",
            items
          );

        }
      );

  }


  /* =========================================================
     CARD CLICK
  ========================================================= */

  function handleSectionClick(
    event
  ) {


    /* ADD */

    const add =
      event.target.closest(
        "[data-add]"
      );


    if (add) {


      event.preventDefault();

      event.stopPropagation();


      const product =
        findProduct(
          add.dataset.add
        );


      if (!product) {

        return;

      }


      /*
        Product flies first,
        then quantity becomes 1.
      */

      flyProductToCart(
        product,
        add
      );


      setQty(
        product,
        1
      );


      return;

    }


    /* MINUS */

    const minus =
      event.target.closest(
        "[data-minus]"
      );


    if (minus) {


      event.preventDefault();

      event.stopPropagation();


      const product =
        findProduct(
          minus.dataset.minus
        );


      if (product) {

        setQty(
          product,
          getQty(
            product.id
          ) - 1
        );

      }


      return;

    }


    /* PLUS */

    const plus =
      event.target.closest(
        "[data-plus]"
      );


    if (plus) {


      event.preventDefault();

      event.stopPropagation();


      const product =
        findProduct(
          plus.dataset.plus
        );


      if (product) {

        setQty(
          product,
          getQty(
            product.id
          ) + 1
        );

      }


      return;

    }


    /* CARD */

    const card =
      event.target.closest(
        "[data-card]"
      );


    if (card) {


      const product =
        findProduct(
          card.dataset.card
        );


      if (product) {

        openSheet(
          product
        );

      }

    }

  }


  /* =========================================================
     OPEN SHEET
  ========================================================= */

  function openSheet(
    product
  ) {


    selectedProduct =
      product;


    const image =
      document.getElementById(
        "czRSheetImage"
      );


    if (product.image1) {

      image.src =
        product.image1;


      image.style.display =
        "block";

    } else {

      image.removeAttribute(
        "src"
      );


      image.style.display =
        "none";

    }


    document.getElementById(
      "czRSheetName"
    ).textContent =
      product.product_name ||
      "";


    document.getElementById(
      "czRSheetQtyText"
    ).textContent =
      product.quantity ||
      "";


    const mrp =
      Number(
        product.original_price
      ) || 0;


    const price =
      Number(
        product.discount_price
      ) || 0;


    document.getElementById(
      "czRSheetMrp"
    ).textContent =
      mrp > price

        ? `₹${money(mrp)}`

        : "";


    document.getElementById(
      "czRSheetPrice"
    ).textContent =
      `₹${money(price)}`;


    document.getElementById(
      "czRSheetDescription"
    ).textContent =
      product.sub_text ||
      "";


    document.getElementById(
      "czRSheetAdditional"
    ).textContent =
      product.additional_info ||
      "";


    renderSheetAction();


    overlay.classList.add(
      "show"
    );


    sheet.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";

  }


  /* =========================================================
     CLOSE SHEET
  ========================================================= */

  function closeSheet() {


    overlay.classList.remove(
      "show"
    );


    sheet.classList.remove(
      "show"
    );


    document.body.style.overflow =
      "";


    selectedProduct =
      null;

  }


  /* =========================================================
     SHEET ACTION
  ========================================================= */

  function renderSheetAction() {


    const action =
      document.getElementById(
        "czRSheetAction"
      );


    if (!selectedProduct) {

      return;

    }


    const qty =
      getQty(
        selectedProduct.id
      );


    if (
      qty <= 0
    ) {


      action.innerHTML = `

        <button
          class="czRSheetAdd"
          type="button"
          data-sheet-add
        >
          ADD
        </button>

      `;


    } else {


      action.innerHTML = `

        <div
          class="czRSheetQty"
        >

          <button
            type="button"
            data-sheet-minus
          >
            −
          </button>


          <span>
            ${qty}
          </span>


          <button
            type="button"
            data-sheet-plus
          >
            +
          </button>

        </div>

      `;

    }

  }


  /* =========================================================
     SHEET BUTTONS
  ========================================================= */

  function handleSheetAction(
    event
  ) {


    if (!selectedProduct) {

      return;

    }


    /* ADD */

    if (
      event.target.closest(
        "[data-sheet-add]"
      )
    ) {


      const sheetImage =
        document.getElementById(
          "czRSheetImage"
        );


      flyProductToCart(
        selectedProduct,
        sheetImage
      );


      setQty(
        selectedProduct,
        1
      );


      return;

    }


    /* MINUS */

    if (
      event.target.closest(
        "[data-sheet-minus]"
      )
    ) {


      setQty(
        selectedProduct,

        getQty(
          selectedProduct.id
        ) - 1
      );


      return;

    }


    /* PLUS */

    if (
      event.target.closest(
        "[data-sheet-plus]"
      )
    ) {


      setQty(
        selectedProduct,

        getQty(
          selectedProduct.id
        ) + 1
      );

    }

  }


  /* =========================================================
     CART QUANTITY
  ========================================================= */

  function getQty(
    id
  ) {


    const item =
      cart[
        String(id)
      ];


    return item

      ? Number(
          item.qty
        ) || 0

      : 0;

  }


  /* =========================================================
     SET QUANTITY
  ========================================================= */

  function setQty(
    product,
    qty
  ) {


    const id =
      String(
        product.id
      );


    qty =
      Math.max(
        0,
        Number(qty) || 0
      );


    if (
      qty === 0
    ) {


      delete cart[id];


    } else {


      /*
        Preserve added_at,
        so we know which products
        were added most recently.
      */

      const previous =
        cart[id];


      cart[id] = {

        id:
          product.id,

        name:
          product.product_name ||
          "",

        image:
          product.image1 ||
          "",

        quantity:
          product.quantity ||
          "",

        original_price:
          Number(
            product.original_price
          ) || 0,

        discount_price:
          Number(
            product.discount_price
          ) || 0,

        price:
          Number(
            product.discount_price
          ) || 0,

        qty:
          qty,

        added_at:
          previous?.added_at ||
          Date.now()

      };

    }


    saveCart();


    updateCard(
      product.id
    );


    if (
      selectedProduct &&
      String(
        selectedProduct.id
      ) === id
    ) {


      renderSheetAction();

    }

  }


  /* =========================================================
     UPDATE CARD ONLY
  ========================================================= */

  function updateCard(
    id
  ) {


    const card =
      section.querySelector(
        `[data-card="${String(id)}"]`
      );


    if (!card) {

      return;

    }


    const box =
      card.querySelector(
        ".czRImageBox"
      );


    if (!box) {

      return;

    }


    box
      .querySelector(
        ".czRAdd, .czRQty"
      )
      ?.remove();


    const qty =
      getQty(id);


    box.insertAdjacentHTML(
      "beforeend",

      qty > 0

        ? quantityHTML(
            id,
            qty
          )

        : `

          <button
            class="czRAdd"
            type="button"
            data-add="${id}"
          >
            +
          </button>

        `
    );

  }


  /* =========================================================
     CART ITEMS
  ========================================================= */

  function getCartItems() {


    return Object.values(
      cart
    )
      .filter(
        item =>
          Number(
            item.qty
          ) > 0
      )
      .sort(
        (
          a,
          b
        ) => {

          return (
            Number(
              a.added_at
            ) || 0
          ) -
          (
            Number(
              b.added_at
            ) || 0
          );

        }
      );

  }


  /* =========================================================
     CART BAR
  ========================================================= */

  function updateCartBar() {


    if (!cartBar) {

      return;

    }


    const items =
      getCartItems();


    const totalQuantity =
      items.reduce(
        (
          total,
          item
        ) => {

          return total +
            (
              Number(
                item.qty
              ) || 0
            );

        },
        0
      );


    if (
      totalQuantity <= 0
    ) {


      cartBar.classList.remove(
        "show"
      );


      return;

    }


    /*
      VERY IMPORTANT:

      Always show latest 3 DIFFERENT products.

      1 product:
      [1]

      2 products:
      [1][2]

      3 products:
      [1][2][3]

      Add 4th:
      [2][3][4]

      Add 5th:
      [3][4][5]
    */

    const visibleItems =
      items.slice(-3);


    const imageContainer =
      document.getElementById(
        "czRCartImages"
      );


    imageContainer.innerHTML =
      visibleItems
        .map(
          (
            item,
            index
          ) => {


            if (!item.image) {

              return `

                <div
                  class="czRCartThumb"
                  style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:10px;
                    font-weight:700;
                    color:#18a568;
                  "
                >
                  ${index + 1}
                </div>

              `;

            }


            return `

              <img
                class="czRCartThumb"
                src="${escapeHTML(
                  item.image
                )}"
                alt=""
              >

            `;

          }
        )
        .join("");


    const title =
      document.getElementById(
        "czRCartTitle"
      );


    if (
      items.length === 1
    ) {


      title.textContent =
        items[0].name ||
        "Food Cart";


    } else {


      title.textContent =
        `${items.length} items added`;

    }


    document.getElementById(
      "czRCartSub"
    ).textContent =

      totalQuantity === 1

        ? "1 item"

        : `${totalQuantity} items`;


    cartBar.classList.add(
      "show"
    );


    /*
      Animate newest visible thumbnail.
    */

    requestAnimationFrame(
      () => {


        const thumbs =
          imageContainer.querySelectorAll(
            ".czRCartThumb"
          );


        const last =
          thumbs[
            thumbs.length - 1
          ];


        if (last) {


          last.classList.remove(
            "new-image"
          );


          void last.offsetWidth;


          last.classList.add(
            "new-image"
          );

        }

      }
    );

  }


  /* =========================================================
     PRODUCT FLY TO CART
  ========================================================= */

  function flyProductToCart(
    product,
    sourceElement
  ) {


    if (
      !product?.image ||
      !sourceElement ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {

      return;

    }


    const sourceRect =
      sourceElement.getBoundingClientRect();


    /*
      Make sure cart bar is visible
      before getting target position.
    */

    cartBar.classList.add(
      "show"
    );


    const cartImageTarget =
      document.getElementById(
        "czRCartImages"
      );


    const targetRect =
      cartImageTarget
        .getBoundingClientRect();


    const flying =
      document.createElement(
        "img"
      );


    flying.src =
      product.image;


    flying.className =
      "czRFlyingImage";


    const startSize =
      Math.min(
        54,
        Math.max(
          42,
          sourceRect.width * .45
        )
      );


    flying.style.width =
      `${startSize}px`;


    flying.style.height =
      `${startSize}px`;


    flying.style.left =
      `${
        sourceRect.left +
        sourceRect.width / 2 -
        startSize / 2
      }px`;


    flying.style.top =
      `${
        sourceRect.top +
        sourceRect.height / 2 -
        startSize / 2
      }px`;


    document.body.appendChild(
      flying
    );


    const destinationX =
      targetRect.left +
      targetRect.width / 2 -
      (
        sourceRect.left +
        sourceRect.width / 2
      );


    const destinationY =
      targetRect.top +
      targetRect.height / 2 -
      (
        sourceRect.top +
        sourceRect.height / 2
      );


    /*
      Native Web Animation API:
      transform + opacity only,
      so it is lightweight.
    */

    const animation =
      flying.animate(
        [

          {
            transform:
              "translate3d(0,0,0) scale(1)",

            opacity:1
          },

          {
            transform:
              `translate3d(
                ${destinationX * .45}px,
                ${destinationY * .38}px,
                0
              ) scale(.82)`,

            opacity:.95,

            offset:.45
          },

          {
            transform:
              `translate3d(
                ${destinationX}px,
                ${destinationY}px,
                0
              ) scale(.35)`,

            opacity:.15
          }

        ],

        {
          duration:430,

          easing:
            "cubic-bezier(.22,.75,.25,1)",

          fill:"forwards"
        }
      );


    animation.onfinish =
      function() {


        flying.remove();

      };


    animation.oncancel =
      function() {


        flying.remove();

      };

  }


  /* =========================================================
     FIND PRODUCT
  ========================================================= */

  function findProduct(
    id
  ) {


    return products.find(
      product =>

        String(
          product.id
        ) ===
        String(id)

    ) || null;

  }


  /* =========================================================
     MONEY
  ========================================================= */

  function money(
    value
  ) {


    const number =
      Number(value);


    if (
      !Number.isFinite(
        number
      )
    ) {

      return "0";

    }


    return Number.isInteger(
      number
    )

      ? String(number)

      : number.toFixed(2);

  }


  /* =========================================================
     ESCAPE
  ========================================================= */

  function escapeHTML(
    value
  ) {


    return String(
      value ?? ""
    )

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* =========================================================
     GLOBAL HELPERS
  ========================================================= */

  window.getCezooFoodCart =
    function() {


      return JSON.parse(
        JSON.stringify(
          cart
        )
      );

    };


  window.clearCezooFoodCart =
    function() {


      cart = {};


      saveCart();


      products.forEach(
        product => {


          updateCard(
            product.id
          );

        }
      );


      if (
        selectedProduct
      ) {

        renderSheetAction();

      }

    };


  window.reloadCezooFoodItems =
    loadProducts;


})();
