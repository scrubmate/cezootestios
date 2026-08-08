(function () {

  "use strict";


  const CART_KEY =
    "cezooFoodCart";


  let products = [];
  let pindiProducts = [];

  let cart = {};

  let selectedProduct = null;


  let section = null;
  let pindiSection = null;

  let overlay = null;

  let sheet = null;

  let cartBar = null;

  /* Food data should load only when FOOD mode is opened */
  let foodProductsLoaded = false;
  let foodProductsLoading = false;

  let pindiProductsLoaded = false;
  let pindiProductsLoading = false;


  /* =========================================================
     START
     Prepare Food UI only. Do NOT fetch Supabase products yet.
  ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initBase,
      {
        once:true
      }
    );

  } else {

    initBase();

  }


  /* =========================================================
     BASE INIT — NO PRODUCT PRELOAD
  ========================================================= */

  function initBase() {

    section =
      document.getElementById(
        "tanukuRefreshmentItems"
      );

    pindiSection =
      document.getElementById(
        "tanukuPindiVantaluItems"
      );


    if (!section) {

      console.error(
        "#tanukuRefreshmentItems not found"
      );

      return;
    }


    if (
      section.dataset.foodUiReady === "1"
    ) {

      checkAndLoadFoodMode();
      return;
    }


    section.dataset.foodUiReady =
      "1";


    loadCart();

    injectCSS();

    createSheet();

    createCartBar();

    watchCezooFoodPageVisibility();

    bindEvents();

    updateCartBar();

    /*
      IMPORTANT:
      Food products are NOT fetched here.
      They load only when data-cezoo-mode becomes "food".
    */
    checkAndLoadFoodMode();

  }


  /* =========================================================
     FOOD MODE LAZY LOADER
  ========================================================= */

  function isFoodModeActive() {

    return (
      document.body.getAttribute(
        "data-cezoo-mode"
      ) === "food"
    );

  }


  async function checkAndLoadFoodMode() {

    syncCezooFoodCartVisibility();

    if (!isFoodModeActive()) {
      return;
    }

    if (foodProductsLoaded) {
      await loadPindiProductsOnce();
      return;
    }

    if (foodProductsLoading) {
      return;
    }

    if (!window._supabaseClient) {

      console.error(
        "Supabase client not found"
      );

      return;
    }

    foodProductsLoading = true;

    try {

      await loadProducts();
      foodProductsLoaded = true;

      await loadPindiProductsOnce();

    } catch (error) {

      console.error(
        "Food lazy-load error:",
        error
      );

    } finally {

      foodProductsLoading = false;

    }

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


      /* Remove stale / zero / broken cart rows */
      Object.keys(cart).forEach(
        function(key){

          const qty =
            Number(
              cart[key]?.qty
            ) || 0;

          if(qty <= 0){
            delete cart[key];
          }

        }
      );


      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );


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

    Object.keys(cart).forEach(
      function(key){

        const qty =
          Number(
            cart[key]?.qty
          ) || 0;

        if(qty <= 0){
          delete cart[key];
        }

      }
    );


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

      #tanukuRefreshmentItems,
      #tanukuPindiVantaluItems{
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
        margin-top:2px;

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

        margin-top:4px;
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


      .czRComingSoon{
        position:relative;
        flex:0 0 94px;
        width:94px;
        height:50px;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        padding:0;
        margin:0;
        border:0;
        background:transparent;
        user-select:none;
        overflow:visible;
      }

      .czRComingSoonHanger{
        position:relative;
        width:88px;
        height:48px;
        transform-origin:50% 0;
        animation:czRComingSoonSwing 2.2s ease-in-out infinite;
      }

      .czRComingSoonHanger::before,
      .czRComingSoonHanger::after{
        content:"";
        position:absolute;
        top:0;
        width:1.5px;
        height:13px;
        border-radius:999px;
        background:#6f6f6f;
      }

      .czRComingSoonHanger::before{
        left:18px;
        transform:rotate(8deg);
        transform-origin:top;
      }

      .czRComingSoonHanger::after{
        right:18px;
        transform:rotate(-8deg);
        transform-origin:top;
      }

      .czRComingSoonBoard{
        position:absolute;
        left:50%;
        top:11px;
        width:86px;
        height:31px;
        transform:translateX(-50%);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0 8px;
        border:1px solid #333;
        border-radius:4px;
        background:#fff;
        color:#222;
        font-size:9.5px;
        font-weight:800;
        line-height:1;
        letter-spacing:.25px;
        white-space:nowrap;
        box-shadow:0 2px 5px rgba(0,0,0,.08);
      }

      .czRComingSoonBoard::before,
      .czRComingSoonBoard::after{
        content:"";
        position:absolute;
        top:-3px;
        width:5px;
        height:5px;
        border-radius:50%;
        background:#333;
      }

      .czRComingSoonBoard::before{
        left:14px;
      }

      .czRComingSoonBoard::after{
        right:14px;
      }

      @keyframes czRComingSoonSwing{
        0%,100%{
          transform:rotate(-3deg);
        }

        50%{
          transform:rotate(3deg);
        }
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
        .czRComingSoon{
          flex-basis:88px;
          width:88px;
        }

        .czRComingSoonHanger{
          transform-origin:50% 0;
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


      /* =====================================
         MAIN FOOD PAGE BOTTOM SCROLL GAP
         Lets the final Food content scroll fully upward
      ===================================== */

      #cezooFoodPage{
        padding-bottom:
          calc(
            150px +
            env(safe-area-inset-bottom)
          ) !important;

        box-sizing:border-box;
      }

      #cezooFoodPage::after{
        content:"";

        display:block;

        width:100%;
        height:
          calc(
            70px +
            env(safe-area-inset-bottom)
          );

        flex:0 0 auto;

        pointer-events:none;
      }


      @media(max-width:600px){

        #cezooFoodPage{
          padding-bottom:
            calc(
              90px +
              env(safe-area-inset-bottom)
            ) !important;
        }

        #cezooFoodPage::after{
          height:
            calc(
              30px +
              env(safe-area-inset-bottom)
            );
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

        .czRComingSoonHanger{
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
      <div
        class="czRComingSoon"
        aria-label="Coming soon"
      >
        <div
          class="czRComingSoonHanger"
          aria-hidden="true"
        >
          <div class="czRComingSoonBoard">
            Coming Soon
          </div>
        </div>
      </div>

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
     PINDI VANTALU — fresh_products IDs 60 TO 70
     Uses the SAME cards, sheet and Food cart.
  ========================================================= */

  async function loadPindiProductsOnce() {

    if (!pindiSection) {
      pindiSection =
        document.getElementById(
          "tanukuPindiVantaluItems"
        );
    }

    if (
      !pindiSection ||
      pindiProductsLoaded ||
      pindiProductsLoading ||
      !isFoodModeActive()
    ) {
      return;
    }

    if (!window._supabaseClient) {
      console.error(
        "Supabase client not found for Pindi Vantalu"
      );
      return;
    }

    pindiProductsLoading = true;

    try {

      const { data, error } =
        await window._supabaseClient
          .from("fresh_products")
          .select(`
            id,
            name,
            name_telugu,
            image1,
            quantity,
            unit,
            original_price,
            discount_price
          `)
          .gte("id", 64)
          .lte("id", 77)
          .order("id", {
            ascending:true
          });

      if (error) {
        throw error;
      }

      /*
        Prefix the UI/cart id so fresh_products ID 60
        can never collide with food_items ID 60.
      */
      pindiProducts =
        (Array.isArray(data) ? data : [])
          .map(product => ({
            id:`pindi_${product.id}`,
            source_id:product.id,
            source_table:"fresh_products",

            product_name:
              product.name || "",

            image1:
              product.image1 || "",

            quantity:
              [
                product.quantity,
                product.unit
              ]
                .filter(Boolean)
                .join(" "),

            sub_text:
              product.name_telugu || "",

            restaurant_name:null,
            restaurant_image:null,

            original_price:
              Number(product.original_price) || 0,

            discount_price:
              Number(product.discount_price) || 0,

            additional_info:""
          }));

      renderPindiProducts();

      pindiProductsLoaded = true;

    } catch (error) {

      console.error(
        "Pindi Vantalu load error:",
        error
      );

      if (pindiSection) {
        pindiSection.innerHTML = `
          <div style="
            padding:18px;
            text-align:center;
            font-size:11px;
            color:#777;
          ">
            Unable to load Pindi Vantalu
          </div>
        `;
      }

    } finally {

      pindiProductsLoading = false;

    }

  }


  function renderPindiProducts() {

    if (!pindiSection) {
      return;
    }

    if (!pindiProducts.length) {

      pindiSection.innerHTML = `
        <div style="
          padding:18px;
          text-align:center;
          font-size:11px;
          color:#777;
        ">
          No Pindi Vantalu available
        </div>
      `;

      return;
    }

    pindiSection.innerHTML = `
      <div class="czRRow">
        ${pindiProducts.map(
          product => {

            const qty =
              getQty(product.id);

            const mrp =
              Number(product.original_price) || 0;

            const price =
              Number(product.discount_price) || 0;

            return `
              <article
                class="czRCard"
                data-card="${escapeHTML(product.id)}"
              >

                <div class="czRImageBox">

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
                          data-add="${escapeHTML(product.id)}"
                        >
                          +
                        </button>
                      `
                  }

                </div>

                <div class="czRInfo">

                  <div class="czRName">
                    ${escapeHTML(
                      product.product_name || ""
                    )}
                  </div>

                  <div class="czRQuantity">
                    ${escapeHTML(
                      product.quantity || ""
                    )}
                  </div>

                  <div class="czRPrices">

                    ${
                      mrp > price
                        ? `
                          <span class="czRMrp">
                            ₹${money(mrp)}
                          </span>
                        `
                        : ""
                    }

                    <span class="czRPrice">
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

    if (pindiSection) {
      pindiSection.addEventListener(
        "click",
        handleSectionClick
      );
    }


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
      ) ||
      pindiSection?.querySelector(
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

      cartBar.style.zIndex =
        "";

      const imageContainer =
        document.getElementById(
          "czRCartImages"
        );

      if(imageContainer){
        imageContainer.innerHTML =
          "";
      }

      const title =
        document.getElementById(
          "czRCartTitle"
        );

      if(title){
        title.textContent =
          "Food Cart";
      }

      const sub =
        document.getElementById(
          "czRCartSub"
        );

      if(sub){
        sub.textContent =
          "";
      }

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


    const visibleSignature =
      visibleItems
        .map(
          item =>
            `${item.id}|${item.image || ""}`
        )
        .join("||");


    if(
      imageContainer.dataset.signature !==
      visibleSignature
    ){

      imageContainer.dataset.signature =
        visibleSignature;


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
                  decoding="async"
                >

              `;

            }
          )
          .join("");

    }


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
        "Your Food Cart";

    }


    document.getElementById(
      "czRCartSub"
    ).textContent =

      totalQuantity === 1

        ? "1 item"

        : `${totalQuantity} items`;


    syncCezooFoodCartVisibility();


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


    return (
      products.find(
        product =>
          String(product.id) === String(id)
      ) ||
      pindiProducts.find(
        product =>
          String(product.id) === String(id)
      ) ||
      null
    );

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
     FOOD-ONLY CART VISIBILITY + MODE WATCHER
     Cart data stays saved, but UI is hidden outside FOOD.
  ========================================================= */

  function isCezooFoodPageVisible() {

    const foodPage =
      document.getElementById(
        "cezooFoodPage"
      );

    if (!foodPage) {
      return false;
    }

    const style =
      window.getComputedStyle(foodPage);

    const ariaHidden =
      foodPage.getAttribute(
        "aria-hidden"
      );

    return (
      isFoodModeActive() &&
      ariaHidden !== "true" &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity || "1") !== 0
    );

  }


  function syncCezooFoodCartVisibility() {

    if (!cartBar) {
      return;
    }


    const items =
      getCartItems();


    const totalQuantity =
      items.reduce(
        function(total, item){

          return total +
            (
              Number(
                item.qty
              ) || 0
            );

        },
        0
      );


    const restaurantPage =
      document.getElementById(
        "czRestaurantPage"
      );


    const restaurantPageOpen =
      Boolean(
        restaurantPage &&
        restaurantPage.classList.contains(
          "show"
        )
      );


    const shouldShow =
      totalQuantity > 0 &&
      isFoodModeActive() &&
      (
        isCezooFoodPageVisible() ||
        restaurantPageOpen
      );


    cartBar.classList.toggle(
      "show",
      shouldShow
    );


    /*
      Restaurant full page sits above the Food page.
      Lift cart only while that full page is actually open.
    */
    cartBar.style.zIndex =
      shouldShow &&
      restaurantPageOpen

        ? "2147483350"

        : "";


    if(!shouldShow && totalQuantity <= 0){

      const images =
        document.getElementById(
          "czRCartImages"
        );


      if(images){
        images.innerHTML = "";
      }


      const title =
        document.getElementById(
          "czRCartTitle"
        );


      if(title){
        title.textContent =
          "Food Cart";
      }


      const sub =
        document.getElementById(
          "czRCartSub"
        );


      if(sub){
        sub.textContent = "";
      }

    }

  }

  function watchCezooFoodPageVisibility() {

    const foodPage =
      document.getElementById(
        "cezooFoodPage"
      );

    /*
      Your CEZOO / FOOD / SPECIAL switch changes
      body[data-cezoo-mode]. Watch that directly.
    */
    const bodyObserver =
      new MutationObserver(
        function(mutations) {

          for (const mutation of mutations) {

            if (
              mutation.type === "attributes" &&
              mutation.attributeName ===
                "data-cezoo-mode"
            ) {

              requestAnimationFrame(
                function() {

                  syncCezooFoodCartVisibility();
                  checkAndLoadFoodMode();

                  /* Close Food sheet if user leaves Food mode */
                  if (!isFoodModeActive()) {
                    if (overlay) overlay.classList.remove("show");
                    if (sheet) sheet.classList.remove("show");
                    selectedProduct = null;
                    document.body.style.overflow = "";
                  }

                }
              );

            }

          }

        }
      );

    bodyObserver.observe(
      document.body,
      {
        attributes:true,
        attributeFilter:[
          "data-cezoo-mode"
        ]
      }
    );


    if (foodPage) {

      const foodPageObserver =
        new MutationObserver(
          function() {

            requestAnimationFrame(
              function() {
                syncCezooFoodCartVisibility();
                checkAndLoadFoodMode();
              }
            );

          }
        );

      foodPageObserver.observe(
        foodPage,
        {
          attributes:true,
          attributeFilter:[
            "class",
            "style",
            "aria-hidden",
            "hidden"
          ]
        }
      );

    }


    window.addEventListener(
      "pageshow",
      function() {
        syncCezooFoodCartVisibility();
        checkAndLoadFoodMode();
      }
    );

    window.addEventListener(
      "popstate",
      function() {
        syncCezooFoodCartVisibility();
        checkAndLoadFoodMode();
      }
    );

    syncCezooFoodCartVisibility();

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


      [...products, ...pindiProducts].forEach(
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


  window.reloadCezooPindiVantalu =
    async function() {

      pindiProductsLoaded = false;
      pindiProductsLoading = false;

      await loadPindiProductsOnce();

    };


  window.addEventListener(
    "storage",
    function(event){

      if(
        event.key ===
        "cezooFoodCart"
      ){

        loadCart();

        updateCartBar();

      }

    }
  );


  window.reloadCezooFoodItems =
    async function() {

      foodProductsLoaded = false;
      foodProductsLoading = false;

      await checkAndLoadFoodMode();

    };


  /* =========================================================
     RESTAURANT FOOD CART BRIDGE
     Allows restaurant variants to use this SAME Food cart.
  ========================================================= */

  window.setCezooFoodCartProductQty =
    function(product, qty) {

      if (!product || product.id == null) {
        return;
      }

      setQty(
        product,
        qty
      );

    };


  window.getCezooFoodCartProductQty =
    function(id) {

      return getQty(id);

    };


  window.syncCezooFoodCartBar =
    function(){

      syncCezooFoodCartVisibility();

    };


})();
/* =========================================================
   GODAVARI PINDI VANTALU IMAGE
   LOAD ONLY WHEN USER COMES NEAR IT
========================================================= */

(function(){

  "use strict";


  function initPindiVantaluImage(){

    const image =
      document.querySelector(
        ".cezooPindiVantaluImage[data-src]"
      );


    if(!image){
      return;
    }


    function loadImage(){

      if(image.dataset.loaded === "1"){
        return;
      }


      const imageSrc =
        image.dataset.src;


      if(!imageSrc){
        return;
      }


      image.dataset.loaded = "1";


      image.addEventListener(
        "load",
        function(){

          image.classList.add(
            "is-loaded"
          );

        },
        {
          once:true
        }
      );


      /* ONLY NOW NETWORK LOAD STARTS */

      image.src = imageSrc;

    }


    /* =====================================
       LAZY LOAD
    ===================================== */

    if(
      "IntersectionObserver" in window
    ){

      const observer =
        new IntersectionObserver(
          function(entries){

            entries.forEach(
              function(entry){

                if(
                  entry.isIntersecting
                ){

                  loadImage();

                  observer.disconnect();

                }

              }
            );

          },
          {
            root:null,

            /* almost near section */
            rootMargin:"60px 0px",

            threshold:0.01
          }
        );


      observer.observe(
        image
      );


    }else{

      loadImage();

    }

  }


  /* =====================================
     START
  ===================================== */

  if(
    document.readyState === "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      initPindiVantaluImage,
      {
        once:true
      }
    );


  }else{

    initPindiVantaluImage();

  }


})();

/* =========================================================
   CEZOO — RESTAURANT EXPLORE FULL PAGE

   REQUIRED HTML:
   <section id="tanukuFoodsExploreItems"></section>

   FLOW:
   1) Main FOOD page shows RESTAURANT CARD only.
   2) Tap restaurant card -> full-page restaurant sheet.
   3) Back button is 40px from top.
   4) Swipe right from left edge -> back.
   5) Restaurant page shows 2 food cards per row.
   6) Half / Full / Regular stay grouped as ONE food card.
   7) ADD on multi-variant item opens compact variant bottom sheet.
   8) Same cezooFoodCart + same Food cart bar.
   9) Supabase realtime stays live.
   10) Restaurant image can be set from frontend:
       setCezooRestaurantImage("your-image.png");
========================================================= */

(function () {

  "use strict";

  const RESTAURANT_TABLE =
    "restaurant_food_items";

  const RESTAURANT_SECTION_ID =
    "tanukuFoodsExploreItems";

  let restaurantSection = null;

  let restaurantRows = [];
  let restaurantGroups = [];

  let restaurantLoaded = false;
  let restaurantLoading = false;

  let currentRestaurantName = "";
  let frontendRestaurantImage = "";

  let pageOverlay = null;
  let restaurantPage = null;

  let variantOverlay = null;
  let variantSheet = null;

  let selectedGroupKey = "";

  let realtimeChannel = null;
  let modeObserver = null;
  let restaurantViewportObserver = null;
  let restaurantSectionSeen = false;

  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeTracking = false;


  /* =========================================================
     FRONTEND RESTAURANT IMAGE
  ========================================================= */

  window.setCezooRestaurantImage =
    function(imageSrc){

      frontendRestaurantImage =
        String(imageSrc || "").trim();

      renderRestaurantEntryCard();

      const pageImage =
        document.getElementById(
          "czRestaurantPageImage"
        );

      if(pageImage){

        if(frontendRestaurantImage){
          pageImage.src =
            frontendRestaurantImage;

          pageImage.style.display =
            "block";
        }else{
          pageImage.removeAttribute(
            "src"
          );

          pageImage.style.display =
            "none";
        }

      }

    };


  /* =========================================================
     START
  ========================================================= */

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      initRestaurantExplore,
      {
        once:true
      }
    );

  }else{

    initRestaurantExplore();

  }


  /* =========================================================
     INIT
  ========================================================= */

  function initRestaurantExplore(){

    restaurantSection =
      document.getElementById(
        RESTAURANT_SECTION_ID
      );

    if(!restaurantSection){
      return;
    }

    if(
      restaurantSection.dataset
        .restaurantFullReady === "1"
    ){
      checkRestaurantMode();
      return;
    }

    restaurantSection.dataset
      .restaurantFullReady = "1";

    injectRestaurantCSS();

    createRestaurantPage();

    createVariantSheet();

    bindRestaurantEvents();

    watchRestaurantMode();

    setupRestaurantViewportLazyLoad();

  }


  /* =========================================================
     FOOD MODE
  ========================================================= */

  function isFoodModeActive(){

    return (
      document.body.getAttribute(
        "data-cezoo-mode"
      ) === "food"
    );

  }


  async function checkRestaurantMode(){

    if(!isFoodModeActive()){

      closeRestaurantPage();

      closeVariantSheet();

      return;
    }

    if(
      restaurantLoaded ||
      restaurantLoading
    ){
      return;
    }

    await loadRestaurantData();

  }


  /* =========================================================
     CSS
  ========================================================= */

  function injectRestaurantCSS(){

    if(
      document.getElementById(
        "czRestaurantFullPageStyles"
      )
    ){
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "czRestaurantFullPageStyles";

    style.textContent = `

      /* =====================================
         RESTAURANT SHIMMER
      ===================================== */

      .czRestaurantShimmer{
        width:100%;

        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:10px;

        padding:0;
      }

      .czRestaurantShimmerCard{
        overflow:hidden;

        border:1px solid #ededed;

        border-radius:11px;

        background:#fff;
      }

      .czRestaurantShimmerImage,
      .czRestaurantShimmerLine{
        position:relative;
        overflow:hidden;

        background:#f1f1f1;
      }

      .czRestaurantShimmerImage{
        width:100%;
        aspect-ratio:1.28 / 1;
      }

      .czRestaurantShimmerBody{
        padding:7px;
      }

      .czRestaurantShimmerLine{
        height:9px;

        margin-top:6px;

        border-radius:5px;
      }

      .czRestaurantShimmerLine.short{
        width:58%;
      }

      .czRestaurantShimmerImage::after,
      .czRestaurantShimmerLine::after{
        content:"";

        position:absolute;
        inset:0;

        transform:translateX(-100%);

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.72),
            transparent
          );

        animation:
          czRestaurantShimmerMove
          1.15s
          infinite;
      }

      @keyframes czRestaurantShimmerMove{
        100%{
          transform:translateX(100%);
        }
      }


      /* =====================================
         FULL PAGE TOP HANGERS
      ===================================== */

      .czRestaurantTopDecor{
        position:fixed;

        top:
          calc(
            94px +
            env(safe-area-inset-top)
          );

        left:0;
        right:0;

        z-index:2147483303;

        height:36px;

        display:flex;
        align-items:flex-start;
        justify-content:space-between;

        padding:
          0
          13px;

        pointer-events:none;

        box-sizing:border-box;
      }

      .czRestaurantTopHanger{
        position:relative;

        width:64px;
        height:27px;

        display:flex;
        align-items:flex-end;
        justify-content:center;
      }

      .czRestaurantTopHanger::before,
      .czRestaurantTopHanger::after{
        content:"";

        position:absolute;

        top:0;

        width:1px;
        height:9px;

        background:#15945c;
      }

      .czRestaurantTopHanger::before{
        left:20px;

        transform:rotate(7deg);
      }

      .czRestaurantTopHanger::after{
        right:20px;

        transform:rotate(-7deg);
      }

      .czRestaurantTopHanger span{
        width:62px;
        height:22px;

        display:flex;
        align-items:center;
        justify-content:center;

        box-sizing:border-box;

        border:
          1px solid
          #15945c;

        border-radius:7px;

        background:#fff;

        color:#15945c;

        font-size:7px;
        font-weight:800;

        letter-spacing:.3px;

        box-shadow:
          0
          2px
          5px
          rgba(0,0,0,.05);
      }


      /* =====================================
         CENTER PNG BELOW HANGERS
         Uses: food/center.png
      ===================================== */

      .czRestaurantCenterArt{
        position:fixed;

        top:
          calc(
            124px +
            env(safe-area-inset-top)
          );

        left:50%;

        z-index:2147483303;

        width:100%;
        height:88px;

        display:flex;
        align-items:center;
        justify-content:center;

        transform:translateX(-50%);

        pointer-events:none;
      }

      .czRestaurantCenterArtImage{
        display:block;

        width:min(230px, 62vw);
        height:84px;

        object-fit:contain;
        object-position:center;

        opacity:0;

        transition:
          opacity .16s ease;

        background:transparent;
      }

      .czRestaurantCenterArtImage.is-loaded{
        opacity:1;
      }


      /* =====================================
         MAIN RESTAURANT ENTRY
      ===================================== */

      #tanukuFoodsExploreItems{
        width:100%;
        padding:4px 10px 14px;
        box-sizing:border-box;
        background:#fff;

        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .czRestaurantEntry{
        width:100%;

        display:flex;
        align-items:center;

        gap:9px;

        padding:5px 0;

        background:transparent;

        border:0;

        cursor:pointer;

        -webkit-tap-highlight-color:
          transparent;
      }

      .czRestaurantEntry:active{
        transform:scale(.995);
      }

      .czRestaurantEntryImageBox{
        flex:0 0 auto;

        width:82px;
        height:66px;

        overflow:hidden;

        border-radius:11px;

        background:#f4f4f4;
      }

      .czRestaurantEntryImage{
        width:100%;
        height:100%;

        display:block;

        object-fit:cover;
        object-position:center;
      }

      .czRestaurantEntryNoImage{
        width:100%;
        height:100%;

        display:flex;
        align-items:center;
        justify-content:center;

        color:#aaa;

        font-size:9px;
      }

      .czRestaurantEntryText{
        flex:1;
        min-width:0;

        text-align:left;
      }

      .czRestaurantEntrySmall{
        color:#15945c;

        font-size:9px;
        font-weight:750;

        text-transform:uppercase;

        letter-spacing:.3px;
      }

      .czRestaurantEntryName{
        margin-top:4px;

        color:#202020;

        font-size:18px;
        font-weight:800;

        line-height:1.15;
      }

      .czRestaurantEntrySub{
        margin-top:4px;

        color:#8a8a8a;

        font-size:10px;

        line-height:1.3;
      }

      .czRestaurantEntryArrow{
        flex:0 0 auto;

        width:30px;
        height:30px;

        display:flex;
        align-items:center;
        justify-content:center;

        color:#333;

        font-size:21px;
        font-weight:400;
      }


      /* =====================================
         FULL PAGE OVERLAY
      ===================================== */

      .czRestaurantPageOverlay{
        position:fixed;

        inset:0;

        z-index:2147483300;

        background:#fff;

        opacity:0;

        visibility:hidden;

        pointer-events:none;

        transition:
          opacity .18s ease,
          visibility .18s ease;
      }

      .czRestaurantPageOverlay.show{
        opacity:1;
        visibility:visible;
        pointer-events:auto;
      }


      /* =====================================
         FULL RESTAURANT PAGE
      ===================================== */

      .czRestaurantPage{
        position:fixed;

        inset:0;

        z-index:2147483301;

        width:100%;
        height:100dvh;

        overflow-y:auto;
        overflow-x:hidden;

        padding-bottom:
          calc(
            24px +
            env(safe-area-inset-bottom)
          );

        box-sizing:border-box;

        background:#fff;

        transform:
          translate3d(
            100%,
            0,
            0
          );

        transition:
          transform .25s
          cubic-bezier(.22,.75,.25,1);

        overscroll-behavior-y:auto;

        -webkit-overflow-scrolling:touch;
      }

      .czRestaurantPage.show{
        transform:
          translate3d(
            0,
            0,
            0
          );
      }


      /* =====================================
         BACK BUTTON — TOP 40PX
      ===================================== */


      .czRestaurantTopBar{
        position:sticky;

        top:
          calc(
            38px +
            env(safe-area-inset-top)
          );

        left:0;
        right:0;

        z-index:2147483306;

        width:100%;
        height:48px;

        display:flex;
        align-items:center;

        padding:
          0
          13px;

        background:#fff;

        border-bottom:
          1px
          solid
          #e5e5e5;

        box-shadow:
          0
          2px
          7px
          rgba(0,0,0,.04);

        box-sizing:border-box;
      }

      /*
        Fill the whole area above the sticky navbar in white.
        This removes the transparent/visible-content gap at the top
        without changing the navbar to position:fixed.
      */
      .czRestaurantTopBar::before{
        content:"";

        position:absolute;

        left:0;
        right:0;

        bottom:100%;

        height:
          calc(
            38px +
            env(safe-area-inset-top)
          );

        background:#fff;

        pointer-events:none;
      }

      .czRestaurantTopName{
        flex:1;
        min-width:0;

        margin-left:8px;

        overflow:hidden;

        color:#171717;

        font-size:20px;
        font-weight:800;

        line-height:1.05;

        white-space:nowrap;
        text-overflow:ellipsis;
      }

      .czRestaurantBack{
        flex:0 0 36px;

        width:36px;
        height:36px;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:0;
        border-radius:0;

        background:transparent;

        color:#171717;

        font-size:20px;

        cursor:pointer;

        touch-action:manipulation;

        -webkit-tap-highlight-color:
          transparent;
      }

      .czRestaurantBack i{
        display:block;

        font-size:19px;
        line-height:1;

        pointer-events:none;
      }


      /* =====================================
         RESTAURANT HERO
      ===================================== */

      .czRestaurantHero{
        display:none;
      }

      .czRestaurantPageImage{
        width:100%;
        height:100%;

        display:block;

        object-fit:cover;
        object-position:center;
      }

      .czRestaurantHeroFade{
        position:absolute;

        left:0;
        right:0;
        bottom:0;

        height:70px;

        background:
          linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            #fff
          );

        pointer-events:none;
      }


      /* =====================================
         PAGE TITLE
      ===================================== */

      .czRestaurantPageHead{
        display:none;
      }

      .czRestaurantPageName{
        margin:0;

        color:#1f1f1f;

        font-size:22px;
        font-weight:800;

        line-height:1.15;
      }

      .czRestaurantPageSub{
        margin-top:2px;

        color:#888;

        font-size:10px;

        line-height:1.3;
      }


      /* =====================================
         2 FOOD CARDS PER ROW
      ===================================== */

      .czRestaurantFoodsGrid{
        width:100%;

        display:grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );

        gap:
          8px
          8px;

        padding:
          calc(
            218px +
            env(safe-area-inset-top)
          )
          16px
          calc(
            120px +
            env(safe-area-inset-bottom)
          );

        box-sizing:border-box;
      }


      /* =====================================
         FOOD CARD — NO BIG BOX LOOK
      ===================================== */

      .czRestaurantFoodCard{
        min-width:0;

        background:#fff;

        border:
          1px
          solid
          #ececec;

        border-radius:12px;

        overflow:hidden;

        box-shadow:
          0
          1px
          4px
          rgba(0,0,0,.035);

        cursor:pointer;

        -webkit-tap-highlight-color:
          transparent;
      }

      .czRestaurantFoodImageBox{
        position:relative;

        width:100%;
        height:128px;

        overflow:hidden;

        border-radius:
          10px
          10px
          0
          0;

        background:#f5f5f5;
      }

      .czRestaurantFoodImage{
        width:100%;
        height:100%;

        display:block;

        object-fit:cover;
        object-position:center;

        transform:translateZ(0);
        backface-visibility:hidden;

        will-change:auto;
      }

      .czRestaurantFoodNoImage{
        width:100%;
        height:100%;

        display:flex;

        align-items:center;
        justify-content:center;

        color:#aaa;

        font-size:9px;
      }

      .czRestaurantFoodInfo{
        padding:
          5px
          6px
          6px;
      }

      .czRestaurantFoodName{
        min-height:0;

        margin:0;
        padding:0;

        display:-webkit-box;

        overflow:hidden;

        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;

        color:#2a2a2a;

        font-size:11px;
        font-weight:750;

        line-height:1.1;
      }

      .czRestaurantFoodDesc{
        display:none;
      }

      .czRestaurantFoodBottom{
        display:flex;

        align-items:center;
        justify-content:space-between;

        gap:5px;

        margin-top:3px;
      }

      .czRestaurantFoodFrom{
        display:block;

        margin-bottom:1px;

        color:#999;

        font-size:7px;
        font-weight:600;
      }

      .czRestaurantFoodPrices{
        display:flex;

        align-items:center;

        gap:4px;
      }

      .czRestaurantFoodMrp{
        color:#999;

        font-size:9px;

        text-decoration:
          line-through;
      }

      .czRestaurantFoodPrice{
        color:#222;

        font-size:12px;
        font-weight:800;
      }


      /* =====================================
         ADD
      ===================================== */

      .czRestaurantFoodAdd{
        flex:0 0 auto;

        width:72px;
        height:36px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:
          1px
          solid
          #d6d6d6;

        border-radius:10px;

        background:#fff;

        color:#15945c;

        font-size:11px;
        font-weight:800;

        line-height:1;

        box-shadow:none;

        cursor:pointer;

        box-sizing:border-box;
      }


      /* =====================================
         COMING SOON MINI HANGER
      ===================================== */

      .czRestaurantSoon{
        position:relative;

        flex:0 0 auto;

        width:61px;
        height:34px;

        display:flex;

        align-items:flex-end;
        justify-content:center;
      }

      .czRestaurantSoonHook{
        position:absolute;

        top:0;
        left:50%;

        width:14px;
        height:7px;

        transform:
          translateX(-50%);

        border:
          1px
          solid
          #15945c;

        border-bottom:0;

        border-radius:
          8px
          8px
          0
          0;

        box-sizing:border-box;
      }

      .czRestaurantSoon::before,
      .czRestaurantSoon::after{
        content:"";

        position:absolute;

        top:6px;

        width:1px;
        height:8px;

        background:#15945c;
      }

      .czRestaurantSoon::before{
        left:20px;

        transform:rotate(8deg);
      }

      .czRestaurantSoon::after{
        right:20px;

        transform:rotate(-8deg);
      }

      .czRestaurantSoonBoard{
        width:59px;
        height:23px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:
          0
          4px;

        box-sizing:border-box;

        border:
          1px
          solid
          #15945c;

        border-radius:7px;

        background:#fff;

        color:#15945c;

        font-size:6.5px;
        font-weight:800;

        white-space:nowrap;

        box-shadow:
          0
          2px
          5px
          rgba(0,0,0,.05);
      }


      /* =====================================
         VARIANT OVERLAY
      ===================================== */


      .czRestaurantFoodQty{
        flex:0 0 auto;

        width:72px;
        height:36px;

        display:grid;

        grid-template-columns:
          24px
          24px
          24px;

        align-items:center;
        justify-items:center;

        overflow:hidden;

        border-radius:10px;

        background:#15945c;

        box-sizing:border-box;
      }

      .czRestaurantFoodQty button{
        width:24px;
        height:36px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:0;

        background:transparent;

        color:#fff;

        font-family:
          Arial,
          sans-serif;

        font-size:16px;
        font-weight:500;

        line-height:1;

        cursor:pointer;

        box-sizing:border-box;
      }

      .czRestaurantFoodQty span{
        width:24px;
        height:36px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        color:#fff;

        font-size:11px;
        font-weight:800;

        line-height:1;

        text-align:center;

        box-sizing:border-box;
      }


      /* =====================================
         VARIANT POPUP BIG HANGER
      ===================================== */

      .czRestaurantPopupHanger{
        position:relative;

        width:118px;
        height:39px;

        display:flex;
        align-items:flex-end;
        justify-content:center;

        margin:
          1px
          auto
          2px;

        pointer-events:none;
      }

      .czRestaurantPopupHanger::before,
      .czRestaurantPopupHanger::after{
        content:"";

        position:absolute;

        top:0;

        width:1.5px;
        height:13px;

        background:#15945c;
      }

      .czRestaurantPopupHanger::before{
        left:35px;
        transform:rotate(10deg);
      }

      .czRestaurantPopupHanger::after{
        right:35px;
        transform:rotate(-10deg);
      }

      .czRestaurantPopupHangerHook{
        position:absolute;

        top:-1px;
        left:50%;

        width:23px;
        height:10px;

        transform:translateX(-50%);

        border:
          1.5px solid
          #15945c;

        border-bottom:0;

        border-radius:
          12px
          12px
          0
          0;

        box-sizing:border-box;
      }

      .czRestaurantPopupHangerBoard{
        width:116px;
        height:29px;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:0 9px;

        box-sizing:border-box;

        border:
          1.5px solid
          #15945c;

        border-radius:8px;

        background:#fff;

        color:#15945c;

        font-size:9px;
        font-weight:800;

        letter-spacing:.6px;

        box-shadow:
          0
          2px
          6px
          rgba(0,0,0,.06);
      }


      .czRestaurantVariantOverlay{
        position:fixed;

        inset:0;

        z-index:2147483400;

        background:
          rgba(0,0,0,.28);

        opacity:0;

        visibility:hidden;

        pointer-events:none;

        transition:
          opacity .18s ease,
          visibility .18s ease;
      }

      .czRestaurantVariantOverlay.show{
        opacity:1;

        visibility:visible;

        pointer-events:auto;
      }


      /* =====================================
         VARIANT BOTTOM SHEET
      ===================================== */

      .czRestaurantVariantSheet{
        position:fixed;

        left:50%;
        bottom:0;

        z-index:2147483401;

        width:
          min(
            calc(100% - 16px),
            460px
          );

        max-height:66vh;

        overflow-y:auto;

        padding:
          8px
          12px
          calc(
            15px +
            env(safe-area-inset-bottom)
          );

        box-sizing:border-box;

        background:#fff;

        border-radius:
          19px
          19px
          0
          0;

        transform:
          translate3d(
            -50%,
            105%,
            0
          );

        transition:
          transform .22s ease;

        box-shadow:
          0
          -7px
          22px
          rgba(0,0,0,.13);
      }

      .czRestaurantVariantSheet.show{
        transform:
          translate3d(
            -50%,
            0,
            0
          );
      }

      .czRestaurantVariantHandle{
        width:32px;
        height:4px;

        margin:
          0
          auto
          7px;

        border-radius:999px;

        background:#d8d8d8;
      }

      .czRestaurantVariantClose{
        position:absolute;

        top:12px;
        right:12px;

        width:31px;
        height:31px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;

        border:0;

        border-radius:50%;

        background:#f3f3f3;

        color:#222;

        font-size:18px;

        cursor:pointer;
      }

      .czRestaurantVariantImageBox{
        width:100%;
        height:145px;

        margin:
          5px
          0
          0;

        display:flex;

        align-items:center;
        justify-content:center;

        overflow:hidden;

        background:#fff;

        border-radius:12px;

        box-sizing:border-box;
      }

      .czRestaurantVariantImage{
        display:block;

        width:min(78%, 230px);
        height:135px;

        margin:0 auto;

        object-fit:contain;
        object-position:center center;

        background:transparent;
      }

      .czRestaurantVariantContent{
        padding-top:7px;
      }

      .czRestaurantVariantTitle{
        margin:
          0
          34px
          0
          0;

        color:#202020;

        font-size:16px;
        font-weight:750;

        line-height:1.15;
      }

      .czRestaurantVariantDesc{
        margin-top:5px;

        color:#777;

        font-size:10px;

        line-height:1.4;
      }

      .czRestaurantVariantList{
        display:flex;

        flex-direction:column;

        gap:7px;

        margin-top:9px;
      }

      .czRestaurantVariantRow{
        min-height:56px;

        display:flex;

        align-items:center;
        justify-content:space-between;

        gap:10px;

        padding:
          8px
          9px
          8px
          10px;

        border:
          1px
          solid
          #ededed;

        border-radius:11px;

        background:#fff;

        box-sizing:border-box;
      }

      .czRestaurantVariantLeft{
        flex:1;
        min-width:0;
      }

      .czRestaurantVariantName{
        color:#222;

        font-size:12px;
        font-weight:700;
      }

      .czRestaurantVariantPrices{
        display:flex;

        align-items:center;

        gap:5px;

        margin-top:4px;
      }

      .czRestaurantVariantMrp{
        color:#999;

        font-size:9px;

        text-decoration:
          line-through;
      }

      .czRestaurantVariantPrice{
        color:#111;

        font-size:13px;
        font-weight:750;
      }

      .czRestaurantVariantAdd{
        flex:0 0 auto;

        width:63px;
        height:33px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;

        border:
          1px
          solid
          #d4d4d4;

        border-radius:9px;

        background:#fff;

        color:#15945c;

        font-size:10px;
        font-weight:800;

        cursor:pointer;
      }

      .czRestaurantVariantQty{
        flex:0 0 auto;

        height:33px;

        display:grid;

        grid-template-columns:
          28px
          23px
          28px;

        align-items:center;
        justify-items:center;

        overflow:hidden;

        border-radius:9px;

        background:#15945c;
      }

      .czRestaurantVariantQty button{
        width:28px;
        height:33px;

        display:flex;

        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        border:0;

        background:transparent;

        color:#fff;

        font-family:Arial,sans-serif;

        font-size:17px;

        cursor:pointer;
      }

      .czRestaurantVariantQty span{
        color:#fff;

        font-size:11px;
        font-weight:700;
      }


      /* =====================================
         MESSAGE
      ===================================== */

      .czRestaurantMessage{
        width:100%;

        padding:22px 10px;

        box-sizing:border-box;

        text-align:center;

        color:#888;

        font-size:10px;
      }


      /* =====================================
         MOBILE
      ===================================== */

      @media(max-width:600px){

        .czRestaurantVariantSheet{
          width:calc(100% - 12px);
          max-height:64vh;
        }

        .czRestaurantVariantImageBox{
          height:132px;
        }

        .czRestaurantVariantImage{
          width:min(76%, 210px);
          height:124px;
        }

        .czRestaurantPopupHanger{
          transform:scale(.95);
          transform-origin:center top;
        }

        .czRestaurantHero{
          display:none;
        }

        .czRestaurantPageName{
          font-size:20px;
        }

        .czRestaurantFoodsGrid{
          gap:
            8px
            8px;

          padding:
            calc(
              214px +
              env(safe-area-inset-top)
            )
            14px
            calc(
              112px +
              env(safe-area-inset-bottom)
            );
        }

        .czRestaurantFoodName{
          font-size:11px;
        }

      }


      @media(max-width:370px){

        .czRestaurantFoodsGrid{
          gap:
            11px
            7px;

          padding-left:6px;
          padding-right:6px;
        }

        .czRestaurantFoodName{
          font-size:10px;
        }

      }


      @media(
        prefers-reduced-motion:
        reduce
      ){

        .czRestaurantPage,
        .czRestaurantPageOverlay,
        .czRestaurantVariantSheet,
        .czRestaurantVariantOverlay{
          transition:none;
        }

      }

    `;

    document.head.appendChild(
      style
    );

  }


  /* =========================================================
     CREATE FULL PAGE
  ========================================================= */

  function createRestaurantPage(){

    pageOverlay =
      document.getElementById(
        "czRestaurantPageOverlay"
      );

    if(!pageOverlay){

      pageOverlay =
        document.createElement(
          "div"
        );

      pageOverlay.id =
        "czRestaurantPageOverlay";

      pageOverlay.className =
        "czRestaurantPageOverlay";

      document.body.appendChild(
        pageOverlay
      );

    }


    restaurantPage =
      document.getElementById(
        "czRestaurantPage"
      );

    if(!restaurantPage){

      restaurantPage =
        document.createElement(
          "div"
        );

      restaurantPage.id =
        "czRestaurantPage";

      restaurantPage.className =
        "czRestaurantPage";

      restaurantPage.innerHTML = `

        <div class="czRestaurantTopBar">
          <button
            id="czRestaurantBack"
            class="czRestaurantBack"
            type="button"
            aria-label="Back"
          >
            <i
              class="fas fa-arrow-left"
              aria-hidden="true"
            ></i>
          </button>

          <div
            class="czRestaurantTopName"
            id="czRestaurantTopName"
          ></div>
        </div>

        <div class="czRestaurantTopDecor">

          <div class="czRestaurantTopHanger">
            <span>FRESH</span>
          </div>

          <div class="czRestaurantTopHanger">
            <span>FOOD</span>
          </div>

        </div>


        <div class="czRestaurantCenterArt">
          <img
            id="czRestaurantCenterArtImage"
            class="czRestaurantCenterArtImage"
            data-src="foods/alif.png"
            alt=""
            decoding="async"
          >
        </div>


        <div class="czRestaurantHero">

          <img
            id="czRestaurantPageImage"
            class="czRestaurantPageImage"
            alt=""
            style="display:none"
          >

          <div
            class="czRestaurantHeroFade"
          ></div>

        </div>

        <div
          class="czRestaurantPageHead"
        >

          <h2
            id="czRestaurantPageName"
            class="czRestaurantPageName"
          ></h2>

          <div
            class="czRestaurantPageSub"
          >
            Fresh food prepared for you
          </div>

        </div>

        <div
          id="czRestaurantFoodsGrid"
          class="czRestaurantFoodsGrid"
        ></div>

      `;

      document.body.appendChild(
        restaurantPage
      );

    }

  }


  /* =========================================================
     CREATE VARIANT SHEET
  ========================================================= */

  function createVariantSheet(){

    variantOverlay =
      document.getElementById(
        "czRestaurantVariantOverlay"
      );

    if(!variantOverlay){

      variantOverlay =
        document.createElement(
          "div"
        );

      variantOverlay.id =
        "czRestaurantVariantOverlay";

      variantOverlay.className =
        "czRestaurantVariantOverlay";

      document.body.appendChild(
        variantOverlay
      );

    }


    variantSheet =
      document.getElementById(
        "czRestaurantVariantSheet"
      );

    if(!variantSheet){

      variantSheet =
        document.createElement(
          "div"
        );

      variantSheet.id =
        "czRestaurantVariantSheet";

      variantSheet.className =
        "czRestaurantVariantSheet";

      variantSheet.innerHTML = `

        <div
          class="czRestaurantVariantHandle"
        ></div>

        <button
          type="button"
          id="czRestaurantVariantClose"
          class="czRestaurantVariantClose"
          aria-label="Close"
        >
          ×
        </button>

        <div
          id="czRestaurantVariantInner"
        ></div>

      `;

      document.body.appendChild(
        variantSheet
      );

    }

  }


  /* =========================================================
     EVENTS
  ========================================================= */

  function bindRestaurantEvents(){

    restaurantSection.addEventListener(
      "click",
      handleRestaurantEntryClick
    );


    document
      .getElementById(
        "czRestaurantBack"
      )
      ?.addEventListener(
        "click",
        closeRestaurantPage
      );


    restaurantPage.addEventListener(
      "click",
      handleRestaurantPageClick
    );


    variantOverlay.addEventListener(
      "click",
      closeVariantSheet
    );


    document
      .getElementById(
        "czRestaurantVariantClose"
      )
      ?.addEventListener(
        "click",
        closeVariantSheet
      );


    variantSheet.addEventListener(
      "click",
      handleVariantSheetClick
    );


    restaurantPage.addEventListener(
      "touchstart",
      handleSwipeStart,
      {
        passive:true
      }
    );


    restaurantPage.addEventListener(
      "touchend",
      handleSwipeEnd,
      {
        passive:true
      }
    );


    restaurantPage.addEventListener(
      "touchcancel",
      handleSwipeCancel,
      {
        passive:true
      }
    );


    window.addEventListener(
      "popstate",
      function(){

        if(
          restaurantPage.classList.contains(
            "show"
          )
        ){

          closeRestaurantPage(
            false
          );

        }

      }
    );

  }


  function restaurantShimmerHTML(){

    return `
      <div class="czRestaurantShimmer">

        ${Array.from({length:4}).map(
          function(){
            return `
              <div class="czRestaurantShimmerCard">

                <div
                  class="czRestaurantShimmerImage"
                ></div>

                <div
                  class="czRestaurantShimmerBody"
                >
                  <div
                    class="czRestaurantShimmerLine"
                  ></div>

                  <div
                    class="czRestaurantShimmerLine short"
                  ></div>
                </div>

              </div>
            `;
          }
        ).join("")}

      </div>
    `;

  }


  function showRestaurantShimmer(){

    if(!restaurantSection){
      return;
    }

    restaurantSection.innerHTML =
      restaurantShimmerHTML();

  }


  function setupRestaurantViewportLazyLoad(){

    if(!restaurantSection){
      return;
    }


    showRestaurantShimmer();


    if(
      restaurantViewportObserver
    ){
      return;
    }


    restaurantViewportObserver =
      new IntersectionObserver(
        function(entries){

          entries.forEach(
            function(entry){

              if(
                entry.isIntersecting &&
                !restaurantSectionSeen
              ){

                restaurantSectionSeen =
                  true;


                restaurantViewportObserver
                  ?.disconnect();


                restaurantViewportObserver =
                  null;


                if(
                  isFoodModeActive()
                ){

                  checkRestaurantMode();

                }

              }

            }
          );

        },
        {
          threshold:0.01,
          rootMargin:"0px"
        }
      );


    restaurantViewportObserver.observe(
      restaurantSection
    );

  }


  /* =========================================================
     LOAD RESTAURANT DATA
  ========================================================= */

  async function loadRestaurantData(){

    if(
      !restaurantSection ||
      !isFoodModeActive()
    ){
      return;
    }


    if(!window._supabaseClient){

      restaurantSection.innerHTML = `
        <div class="czRestaurantMessage">
          Unable to load restaurant
        </div>
      `;

      return;
    }


    if(restaurantLoading){
      return;
    }


    restaurantLoading =
      true;


    showRestaurantShimmer();


    try{

      const {
        data,
        error
      } =
        await window._supabaseClient
          .from(
            RESTAURANT_TABLE
          )
          .select(`
            id,
            restaurant_name,
            product_name,
            item_name,
            short_description,
            original_price,
            discount_price,
            image1,
            is_open,
            created_at
          `)
          .order(
            "id",
            {
              ascending:true
            }
          );


      if(error){
        throw error;
      }


      restaurantRows =
        Array.isArray(data)
          ? data
          : [];


      restaurantGroups =
        groupRestaurantItems(
          restaurantRows
        );


      currentRestaurantName =
        restaurantRows[0]
          ?.restaurant_name ||
        "Restaurant";


      restaurantLoaded =
        true;


      renderRestaurantEntryCard();


      if(
        restaurantPage.classList.contains(
          "show"
        )
      ){

        renderRestaurantFullPage();

      }


      startRealtime();


    }catch(error){

      console.error(
        "Restaurant food load error:",
        error
      );


      restaurantSection.innerHTML = `
        <div class="czRestaurantMessage">
          Unable to load restaurant
        </div>
      `;


    }finally{

      restaurantLoading =
        false;

    }

  }


  /* =========================================================
     GROUP VARIANTS
  ========================================================= */

  function groupRestaurantItems(rows){

    const map =
      new Map();


    rows.forEach(
      function(row){

        const restaurant =
          String(
            row.restaurant_name ||
            ""
          ).trim();


        const cleanName =
          cleanMainProductName(
            row.product_name
          );


        if(!cleanName){
          return;
        }


        const key =
          `${restaurant.toLowerCase()}__${cleanName.toLowerCase()}`;


        if(!map.has(key)){

          map.set(
            key,
            {
              key:key,

              restaurant_name:
                restaurant,

              product_name:
                cleanName,

              short_description:
                cleanMainDescription(
                  row.short_description,
                  cleanName
                ),

              image1:
                row.image1 ||
                "",

              variants:[]
            }
          );

        }


        const group =
          map.get(key);


        if(
          !group.image1 &&
          row.image1
        ){
          group.image1 =
            row.image1;
        }


        if(
          !group.short_description &&
          row.short_description
        ){
          group.short_description =
            cleanMainDescription(
              row.short_description,
              cleanName
            );
        }


        group.variants.push(
          row
        );

      }
    );


    return Array.from(
      map.values()
    );

  }


  /* =========================================================
     MAIN RESTAURANT CARD
  ========================================================= */

  function renderRestaurantEntryCard(){

    if(!restaurantSection){
      return;
    }


    if(!restaurantRows.length){

      restaurantSection.innerHTML = `
        <div class="czRestaurantMessage">
          No restaurant available
        </div>
      `;

      return;
    }


    const image =
      frontendRestaurantImage;


    restaurantSection.innerHTML = `

      <button
        type="button"
        class="czRestaurantEntry"
        id="czRestaurantEntry"
      >

        <div
          class="czRestaurantEntryImageBox"
        >

          ${
            image
              ? `
                <img
                  class="czRestaurantEntryImage"
                  src="${escapeRestaurantHTML(image)}"
                  alt="${escapeRestaurantHTML(currentRestaurantName)}"
                >
              `
              : `
                <img
                  class="czRestaurantEntryImage"
                  src="foods/alif.png"
                  alt="Alif Food Point"
                  loading="lazy"
                  decoding="async"
                >
              `
          }

        </div>


        <div
          class="czRestaurantEntryText"
        >

          <div
            class="czRestaurantEntrySmall"
          >
            Restaurant
          </div>

          <div
            class="czRestaurantEntryName"
          >
            ${escapeRestaurantHTML(currentRestaurantName)}
          </div>

          <div
            class="czRestaurantEntrySub"
          >
            Tap to explore the full menu
          </div>

        </div>


        <div
          class="czRestaurantEntryArrow"
        >
          ›
        </div>

      </button>

    `;

  }


  function handleRestaurantEntryClick(
    event
  ){

    if(
      !event.target.closest(
        "#czRestaurantEntry"
      )
    ){
      return;
    }


    openRestaurantPage();

  }


  /* =========================================================
     OPEN FULL PAGE
  ========================================================= */

  function openRestaurantPage(){

    const centerArt =
      document.getElementById(
        "czRestaurantCenterArtImage"
      );


    if(
      centerArt &&
      !centerArt.getAttribute("src")
    ){

      const centerSrc =
        centerArt.dataset.src ||
        "food/center.png";


      centerArt.onload =
        function(){

          centerArt.classList.add(
            "is-loaded"
          );

        };


      centerArt.src =
        centerSrc;

    }


    renderRestaurantFullPage();


    pageOverlay.classList.add(
      "show"
    );


    restaurantPage.classList.add(
      "show"
    );


    if(
      typeof window.syncCezooFoodCartBar ===
      "function"
    ){
      window.syncCezooFoodCartBar();
    }


    requestAnimationFrame(syncRestaurantTopName);


    restaurantPage.scrollTop =
      0;


    document.body.style.overflow =
      "hidden";


    try{

      history.pushState(
        {
          cezooRestaurantPage:true
        },
        ""
      );

    }catch{}

  }


  function closeRestaurantPage(
    useHistory = true
  ){

    closeVariantSheet();


    pageOverlay?.classList.remove(
      "show"
    );


    restaurantPage?.classList.remove(
      "show"
    );



    document.body.style.overflow =
      "";


    if(
      typeof window.syncCezooFoodCartBar ===
      "function"
    ){
      requestAnimationFrame(
        window.syncCezooFoodCartBar
      );
    }


    if(
      useHistory &&
      history.state?.cezooRestaurantPage
    ){

      try{
        history.back();
      }catch{}

    }

  }


  /* =========================================================
     SWIPE RIGHT TO BACK
  ========================================================= */

  function handleSwipeStart(
    event
  ){

    const touch =
      event.touches?.[0];


    if(!touch){
      return;
    }


    /*
      Edge swipe zone is a little wider so it is easier
      to use on iPhone / Android WebView.
    */
    if(touch.clientX > 82){

      swipeTracking =
        false;

      return;
    }


    swipeTracking =
      true;

    swipeStartX =
      touch.clientX;

    swipeStartY =
      touch.clientY;

  }


  function handleSwipeEnd(
    event
  ){

    if(!swipeTracking){
      return;
    }


    swipeTracking =
      false;


    const touch =
      event.changedTouches?.[0];


    if(!touch){
      return;
    }


    const deltaX =
      touch.clientX -
      swipeStartX;


    const deltaY =
      Math.abs(
        touch.clientY -
        swipeStartY
      );


    /*
      Swipe right from the left edge.
      Horizontal movement must be stronger than vertical movement.
    */
    if(
      deltaX >= 58 &&
      deltaX > deltaY * 1.15
    ){

      closeRestaurantPage();

    }

  }


  function handleSwipeCancel(){

    swipeTracking =
      false;

  }


  function getRestaurantGroupQty(
    group
  ){

    if(!group?.variants?.length){
      return 0;
    }


    return group.variants.reduce(
      function(total, variant){

        return total +
          getRestaurantCartQty(
            restaurantVariantCartId(
              variant
            )
          );

      },
      0
    );

  }


  function restaurantMainActionHTML(
    group,
    allClosed
  ){

    if(allClosed){
      return comingSoonHTML();
    }


    const qty =
      getRestaurantGroupQty(
        group
      );


    if(qty <= 0){

      return `
        <button
          type="button"
          class="czRestaurantFoodAdd"
          data-rest-food-open="${escapeRestaurantHTML(group.key)}"
        >
          ADD
        </button>
      `;

    }


    return `
      <div
        class="czRestaurantFoodQty"
        data-rest-food-qty="${escapeRestaurantHTML(group.key)}"
      >
        <button
          type="button"
          data-rest-food-minus="${escapeRestaurantHTML(group.key)}"
          aria-label="Decrease"
        >
          −
        </button>

        <span>${qty}</span>

        <button
          type="button"
          data-rest-food-plus="${escapeRestaurantHTML(group.key)}"
          aria-label="Increase"
        >
          +
        </button>
      </div>
    `;

  }


  /* =========================================================
     FULL PAGE RENDER
  ========================================================= */

  function renderRestaurantFullPage(){

    document.getElementById(
      "czRestaurantPageName"
    ).textContent =
      currentRestaurantName;


    const topRestaurantName =
      document.getElementById(
        "czRestaurantTopName"
      );


    if(topRestaurantName){

      topRestaurantName.textContent =
        currentRestaurantName ||
        "Restaurant";

    }


    const pageImage =
      document.getElementById(
        "czRestaurantPageImage"
      );


    if(frontendRestaurantImage){

      pageImage.src =
        frontendRestaurantImage;

      pageImage.style.display =
        "block";

    }else{

      pageImage.removeAttribute(
        "src"
      );

      pageImage.style.display =
        "none";

    }


    const grid =
      document.getElementById(
        "czRestaurantFoodsGrid"
      );


    if(!restaurantGroups.length){

      grid.innerHTML = `
        <div
          class="czRestaurantMessage"
          style="grid-column:1/-1"
        >
          No foods available
        </div>
      `;

      return;
    }


    grid.innerHTML =
      restaurantGroups
        .map(
          function(group){

            const openVariants =
              group.variants.filter(
                variant =>
                  isRestaurantVariantOpen(variant)
              );


            const allClosed =
              openVariants.length === 0;


            const usableVariants =
              openVariants.length
                ? openVariants
                : group.variants;


            const cheapest =
              usableVariants
                .slice()
                .sort(
                  (
                    a,
                    b
                  ) =>
                    getRestaurantPrice(a) -
                    getRestaurantPrice(b)
                )[0];


            const mrp =
              Number(
                cheapest?.original_price
              ) || 0;


            const price =
              getRestaurantPrice(
                cheapest || {}
              );


            return `

              <article
                class="czRestaurantFoodCard"
                data-rest-food-card="${escapeRestaurantHTML(group.key)}"
              >

                <div
                  class="czRestaurantFoodImageBox"
                >

                  ${
                    group.image1
                      ? `
                        <img
                          class="czRestaurantFoodImage"
                          src="${escapeRestaurantHTML(group.image1)}"
                          alt="${escapeRestaurantHTML(group.product_name)}"
                          loading="lazy"
                          decoding="async"
                        >
                      `
                      : `
                        <div class="czRestaurantFoodNoImage">
                          No Image
                        </div>
                      `
                  }

                </div>


                <div
                  class="czRestaurantFoodInfo"
                >

                  <div
                    class="czRestaurantFoodName"
                  >
                    ${escapeRestaurantHTML(group.product_name)}
                  </div>


                  ${
                    group.short_description
                      ? `
                        <div
                          class="czRestaurantFoodDesc"
                        >
                          ${escapeRestaurantHTML(group.short_description)}
                        </div>
                      `
                      : ""
                  }


                  <div
                    class="czRestaurantFoodBottom"
                  >

                    <div>

                      ${
                        group.variants.length > 1
                          ? `
                            <span
                              class="czRestaurantFoodFrom"
                            >
                              From
                            </span>
                          `
                          : ""
                      }


                      <div
                        class="czRestaurantFoodPrices"
                      >

                        ${
                          mrp > price
                            ? `
                              <span
                                class="czRestaurantFoodMrp"
                              >
                                ₹${restaurantMoney(mrp)}
                              </span>
                            `
                            : ""
                        }


                        <span
                          class="czRestaurantFoodPrice"
                        >
                          ₹${restaurantMoney(price)}
                        </span>

                      </div>

                    </div>


                    <div
                      class="czRestaurantFoodAction"
                      data-rest-food-action="${escapeRestaurantHTML(group.key)}"
                    >
                      ${
                        restaurantMainActionHTML(
                          group,
                          allClosed
                        )
                      }
                    </div>

                  </div>

                </div>

              </article>

            `;

          }
        )
        .join("");

  }


  function updateRestaurantMainCardAction(
    groupKey
  ){

    const group =
      findRestaurantGroup(
        groupKey
      );


    if(!group){
      return;
    }


    const action =
      Array.from(
        document.querySelectorAll(
          "[data-rest-food-action]"
        )
      ).find(
        element =>
          String(
            element.getAttribute(
              "data-rest-food-action"
            )
          ) ===
          String(group.key)
      );


    if(!action){
      return;
    }


    const openVariants =
      group.variants.filter(
        variant =>
          isRestaurantVariantOpen(
            variant
          )
      );


    const allClosed =
      openVariants.length === 0;


    action.innerHTML =
      restaurantMainActionHTML(
        group,
        allClosed
      );

  }


  /* =========================================================
     PAGE CARD CLICK
  ========================================================= */

  function handleRestaurantPageClick(
    event
  ){

    const minusButton =
      event.target.closest(
        "[data-rest-food-minus]"
      );


    if(minusButton){

      event.preventDefault();
      event.stopPropagation();


      const group =
        findRestaurantGroup(
          minusButton.dataset.restFoodMinus
        );


      if(!group){
        return;
      }


      /*
        Single variant = change directly.
        Multiple variants = open chooser so user can select
        which Half / Full quantity to reduce.
      */

      if(group.variants.length === 1){

        const variant =
          group.variants[0];


        const qty =
          getRestaurantCartQty(
            restaurantVariantCartId(
              variant
            )
          );


        setRestaurantVariantQty(
          variant,
          qty - 1
        );

      }else{

        openVariantSheet(
          group
        );

      }


      return;

    }


    const plusButton =
      event.target.closest(
        "[data-rest-food-plus]"
      );


    if(plusButton){

      event.preventDefault();
      event.stopPropagation();


      const group =
        findRestaurantGroup(
          plusButton.dataset.restFoodPlus
        );


      if(!group){
        return;
      }


      if(group.variants.length === 1){

        const variant =
          group.variants[0];


        if(
          isRestaurantVariantOpen(
            variant
          )
        ){

          const qty =
            getRestaurantCartQty(
              restaurantVariantCartId(
                variant
              )
            );


          setRestaurantVariantQty(
            variant,
            qty + 1
          );

        }

      }else{

        openVariantSheet(
          group
        );

      }


      return;

    }


    const addButton =
      event.target.closest(
        "[data-rest-food-open]"
      );


    if(addButton){

      event.preventDefault();
      event.stopPropagation();

    }


    const target =
      addButton ||
      event.target.closest(
        "[data-rest-food-card]"
      );


    if(!target){
      return;
    }


    const key =
      target.dataset.restFoodOpen ||
      target.dataset.restFoodCard;


    const group =
      findRestaurantGroup(
        key
      );


    if(!group){
      return;
    }


    if(
      group.variants.length === 1
    ){

      const variant =
        group.variants[0];


      if(
        isRestaurantVariantOpen(
          variant
        )
      ){

        const qty =
          getRestaurantCartQty(
            restaurantVariantCartId(
              variant
            )
          );


        setRestaurantVariantQty(
          variant,
          qty > 0
            ? qty + 1
            : 1
        );

      }


      return;

    }


    openVariantSheet(
      group
    );

  }


  /* =========================================================
     VARIANT SHEET
  ========================================================= */

  function openVariantSheet(
    group
  ){

    selectedGroupKey =
      group.key;


    renderVariantSheet(
      group
    );


    variantOverlay.classList.add(
      "show"
    );


    variantSheet.classList.add(
      "show"
    );

  }


  function closeVariantSheet(){

    variantOverlay?.classList.remove(
      "show"
    );


    variantSheet?.classList.remove(
      "show"
    );


    selectedGroupKey =
      "";

  }


  function renderVariantSheet(
    group
  ){

    const inner =
      document.getElementById(
        "czRestaurantVariantInner"
      );


    if(!inner){
      return;
    }


    inner.innerHTML = `

      <div
        class="czRestaurantPopupHanger"
      >
        <span
          class="czRestaurantPopupHangerHook"
        ></span>

        <div
          class="czRestaurantPopupHangerBoard"
        >
          CHOOSE SIZE
        </div>
      </div>


      <div
        class="czRestaurantVariantImageBox"
      >

        ${
          group.image1
            ? `
              <img
                class="czRestaurantVariantImage"
                src="${escapeRestaurantHTML(group.image1)}"
                alt="${escapeRestaurantHTML(group.product_name)}"
                loading="lazy"
                decoding="async"
              >
            `
            : `
              <div class="czRestaurantFoodNoImage">
                No Image
              </div>
            `
        }

      </div>


      <div
        class="czRestaurantVariantContent"
      >

        <h3
          class="czRestaurantVariantTitle"
        >
          ${escapeRestaurantHTML(group.product_name)}
        </h3>


        ${
          group.short_description
            ? `
              <div
                class="czRestaurantVariantDesc"
              >
                ${escapeRestaurantHTML(group.short_description)}
              </div>
            `
            : ""
        }


        <div
          class="czRestaurantVariantList"
        >

          ${group.variants.map(
            function(variant){

              const cartId =
                restaurantVariantCartId(
                  variant
                );


              const qty =
                getRestaurantCartQty(
                  cartId
                );


              const mrp =
                Number(
                  variant.original_price
                ) || 0;


              const price =
                getRestaurantPrice(
                  variant
                );


              return `

                <div
                  class="czRestaurantVariantRow"
                >

                  <div
                    class="czRestaurantVariantLeft"
                  >

                    <div
                      class="czRestaurantVariantName"
                    >
                      ${escapeRestaurantHTML(
                        cleanVariantName(
                          variant.item_name ||
                          "Regular"
                        )
                      )}
                    </div>


                    <div
                      class="czRestaurantVariantPrices"
                    >

                      ${
                        mrp > price
                          ? `
                            <span
                              class="czRestaurantVariantMrp"
                            >
                              ₹${restaurantMoney(mrp)}
                            </span>
                          `
                          : ""
                      }


                      <span
                        class="czRestaurantVariantPrice"
                      >
                        ₹${restaurantMoney(price)}
                      </span>

                    </div>

                  </div>


                  <div
                    class="czRestaurantVariantAction"
                    data-rest-variant-action="${escapeRestaurantHTML(cartId)}"
                  >
                    ${
                      isRestaurantVariantOpen(variant)
                        ? variantActionHTML(
                            variant,
                            qty
                          )
                        : comingSoonHTML()
                    }
                  </div>

                </div>

              `;

            }
          ).join("")}

        </div>

      </div>

    `;

  }


  /* =========================================================
     VARIANT ACTIONS
  ========================================================= */

  function variantActionHTML(
    variant,
    qty
  ){

    const cartId =
      restaurantVariantCartId(
        variant
      );


    if(
      Number(qty) <= 0
    ){

      return `
        <button
          type="button"
          class="czRestaurantVariantAdd"
          data-rest-variant-add="${escapeRestaurantHTML(cartId)}"
        >
          ADD
        </button>
      `;

    }


    return `

      <div
        class="czRestaurantVariantQty"
      >

        <button
          type="button"
          data-rest-variant-minus="${escapeRestaurantHTML(cartId)}"
        >
          −
        </button>

        <span>
          ${Number(qty)}
        </span>

        <button
          type="button"
          data-rest-variant-plus="${escapeRestaurantHTML(cartId)}"
        >
          +
        </button>

      </div>

    `;

  }


  function updateRestaurantVariantAction(
    variant
  ){

    if(!variant){
      return;
    }


    const cartId =
      restaurantVariantCartId(
        variant
      );


    const action =
      Array.from(
        document.querySelectorAll(
          "[data-rest-variant-action]"
        )
      ).find(
        function(element){

          return String(
            element.getAttribute(
              "data-rest-variant-action"
            )
          ) === String(cartId);

        }
      );


    if(!action){
      return;
    }


    const qty =
      getRestaurantCartQty(
        cartId
      );


    action.innerHTML =
      isRestaurantVariantOpen(
        variant
      )

        ? variantActionHTML(
            variant,
            qty
          )

        : comingSoonHTML();

  }


  function handleVariantSheetClick(
    event
  ){

    const add =
      event.target.closest(
        "[data-rest-variant-add]"
      );


    if(add){

      const variant =
        findVariantByCartId(
          add.dataset.restVariantAdd
        );


      if(
        variant &&
        isRestaurantVariantOpen(variant)
      ){

        setRestaurantVariantQty(
          variant,
          1
        );

      }


      return;

    }


    const minus =
      event.target.closest(
        "[data-rest-variant-minus]"
      );


    if(minus){

      const variant =
        findVariantByCartId(
          minus.dataset.restVariantMinus
        );


      if(variant){

        const currentQty =
          getRestaurantCartQty(
            restaurantVariantCartId(
              variant
            )
          );


        setRestaurantVariantQty(
          variant,
          currentQty - 1
        );

      }


      return;

    }


    const plus =
      event.target.closest(
        "[data-rest-variant-plus]"
      );


    if(plus){

      const variant =
        findVariantByCartId(
          plus.dataset.restVariantPlus
        );


      if(
        variant &&
        isRestaurantVariantOpen(variant)
      ){

        const currentQty =
          getRestaurantCartQty(
            restaurantVariantCartId(
              variant
            )
          );


        setRestaurantVariantQty(
          variant,
          currentQty + 1
        );

      }

    }

  }


  /* =========================================================
     SAME FOOD CART
  ========================================================= */

  function restaurantVariantCartId(
    variant
  ){

    return `restaurant_${variant.id}`;

  }


  function getRestaurantCartQty(
    cartId
  ){

    if(
      typeof window
        .getCezooFoodCartProductQty ===
      "function"
    ){

      return Number(
        window
          .getCezooFoodCartProductQty(
            cartId
          )
      ) || 0;

    }


    try{

      const cart =
        JSON.parse(
          localStorage.getItem(
            "cezooFoodCart"
          ) || "{}"
        );


      return Number(
        cart?.[
          String(cartId)
        ]?.qty
      ) || 0;


    }catch{

      return 0;

    }

  }


  function setRestaurantVariantQty(
    variant,
    qty
  ){

    qty =
      Math.max(
        0,
        Number(qty) || 0
      );


    if(
      qty > 0 &&
      !isRestaurantVariantOpen(variant)
    ){
      return;
    }


    const product = {

      id:
        restaurantVariantCartId(
          variant
        ),

      product_name:
        `${cleanMainProductName(
          variant.product_name
        )}${
          variant.item_name
            ? ` • ${cleanVariantName(
                variant.item_name
              )}`
            : ""
        }`,

      image1:
        variant.image1 ||
        findGroupImage(
          variant
        ) ||
        "",

      quantity:
        cleanVariantName(
          variant.item_name ||
          "Regular"
        ),

      original_price:
        Number(
          variant.original_price
        ) || 0,

      discount_price:
        getRestaurantPrice(
          variant
        ),

      restaurant_name:
        variant.restaurant_name ||
        "",

      source_table:
        RESTAURANT_TABLE,

      source_id:
        variant.id

    };


    if(
      typeof window
        .setCezooFoodCartProductQty ===
      "function"
    ){

      window
        .setCezooFoodCartProductQty(
          product,
          qty
        );

    }


    if(
      typeof window.syncCezooFoodCartBar ===
      "function"
    ){
      window.syncCezooFoodCartBar();
    }


    /*
      IMPORTANT:
      Update only the affected product controls.
      Do not rebuild the full restaurant grid — this removes
      the ADD / + / - page blinking.
    */

    const affectedGroup =
      restaurantGroups.find(
        function(group){

          return group.variants.some(
            function(item){

              return String(item.id) ===
                String(variant.id);

            }
          );

        }
      );


    if(affectedGroup){

      updateRestaurantMainCardAction(
        affectedGroup.key
      );

    }


    /*
      Update only the selected Half / Full action.
      Do NOT rebuild the whole popup, so its image stays mounted
      and there is no blink/flicker.
    */

    updateRestaurantVariantAction(
      variant
    );

  }


  /* =========================================================
     COMING SOON
  ========================================================= */

  function comingSoonHTML(){

    return `

      <div
        class="czRestaurantSoon"
        aria-label="Coming Soon"
      >

        <span
          class="czRestaurantSoonHook"
        ></span>

        <div
          class="czRestaurantSoonBoard"
        >
          COMING SOON
        </div>

      </div>

    `;

  }


  /* =========================================================
     REALTIME
  ========================================================= */

  function startRealtime(){

    if(
      realtimeChannel ||
      !window._supabaseClient
    ){
      return;
    }


    realtimeChannel =
      window._supabaseClient
        .channel(
          "cezoo-restaurant-full-live"
        )
        .on(
          "postgres_changes",
          {
            event:"*",
            schema:"public",
            table:
              RESTAURANT_TABLE
          },
          function(){

            restaurantLoaded =
              false;

            restaurantLoading =
              false;


            if(
              isFoodModeActive() &&
              restaurantSectionSeen
            ){

              loadRestaurantData();

            }

          }
        )
        .subscribe();

  }


  /* =========================================================
     MODE WATCHER
  ========================================================= */

  function watchRestaurantMode(){

    if(modeObserver){
      return;
    }


    modeObserver =
      new MutationObserver(
        function(mutations){

          for(
            const mutation
            of mutations
          ){

            if(
              mutation.type === "attributes" &&
              mutation.attributeName ===
                "data-cezoo-mode"
            ){

              requestAnimationFrame(
                function(){

                  if(
                    isFoodModeActive()
                  ){

                    if(
                      restaurantSectionSeen
                    ){

                      checkRestaurantMode();

                    }else{

                      setupRestaurantViewportLazyLoad();

                    }

                  }else{

                    closeRestaurantPage(
                      false
                    );

                    closeVariantSheet();

                  }

                }
              );

            }

          }

        }
      );


    modeObserver.observe(
      document.body,
      {
        attributes:true,
        attributeFilter:[
          "data-cezoo-mode"
        ]
      }
    );

  }


  /* =========================================================
     HELPERS
  ========================================================= */

  function findRestaurantGroup(
    key
  ){

    return restaurantGroups.find(
      group =>
        String(group.key) ===
        String(key)
    ) || null;

  }


  function findVariantByCartId(
    cartId
  ){

    return restaurantRows.find(
      variant =>
        restaurantVariantCartId(
          variant
        ) ===
        String(cartId)
    ) || null;

  }


  function findGroupImage(
    variant
  ){

    const product =
      cleanMainProductName(
        variant.product_name
      )
        .toLowerCase();


    const restaurant =
      String(
        variant.restaurant_name ||
        ""
      )
        .trim()
        .toLowerCase();


    const group =
      restaurantGroups.find(
        item =>
          item.product_name
            .toLowerCase() ===
            product &&
          String(
            item.restaurant_name ||
            ""
          )
            .trim()
            .toLowerCase() ===
            restaurant
      );


    return group?.image1 || "";

  }


  function cleanMainProductName(
    value
  ){

    return String(
      value || ""
    )
      .replace(
        /\s*[-–—]\s*(half|full)(\s+portion)?\s*$/i,
        ""
      )
      .replace(
        /\s+(half|full)\s+portion\s*$/i,
        ""
      )
      .trim();

  }


  function cleanVariantName(
    value
  ){

    return String(
      value || "Regular"
    )
      .replace(
        /\s+portion\s*$/i,
        ""
      )
      .trim();

  }


  function cleanMainDescription(
    value,
    productName
  ){

    let description =
      String(
        value || ""
      ).trim();


    if(!description){
      return "";
    }


    /*
      Do not show descriptions like:
      "Chicken Fry Piece Biryani - half portion"
      on the MAIN card.
    */

    const normalizedDescription =
      description
        .toLowerCase()
        .replace(/\s+/g," ")
        .trim();


    const normalizedName =
      String(
        productName || ""
      )
        .toLowerCase()
        .replace(/\s+/g," ")
        .trim();


    if(
      normalizedDescription ===
        `${normalizedName} - half portion` ||
      normalizedDescription ===
        `${normalizedName} - full portion` ||
      normalizedDescription ===
        `${normalizedName} half portion` ||
      normalizedDescription ===
        `${normalizedName} full portion`
    ){

      return "";

    }


    return description;

  }


  function isRestaurantVariantOpen(
    variant
  ){

    if(!variant){
      return false;
    }


    /*
      Supabase values should be boolean, but this keeps the UI
      working safely if older rows contain null / "true" / 1.
      Only explicit false-like values are treated as closed.
    */

    const value =
      variant.is_open;


    if(
      value === false ||
      value === 0 ||
      value === "0" ||
      String(value).toLowerCase() === "false"
    ){
      return false;
    }


    return true;

  }


  function getRestaurantPrice(
    row
  ){

    const discount =
      Number(
        row.discount_price
      );


    if(
      Number.isFinite(discount) &&
      discount > 0
    ){

      return discount;

    }


    return Number(
      row.original_price
    ) || 0;

  }


  function restaurantMoney(
    value
  ){

    const number =
      Number(value);


    if(
      !Number.isFinite(number)
    ){
      return "0";
    }


    return Number.isInteger(
      number
    )
      ? String(number)
      : number.toFixed(2);

  }


  function escapeRestaurantHTML(
    value
  ){

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


  
  function syncRestaurantTopName(){
    const topName = document.getElementById("czRestaurantTopName");
    if(!topName) return;

    const pageName = document.getElementById("czRestaurantPageName");
    if(pageName && pageName.textContent.trim()){
      topName.textContent = pageName.textContent.trim();
    }
  }

/* =========================================================
     GLOBAL RELOAD
  ========================================================= */

  window.reloadCezooRestaurantFoodItems =
    async function(){

      restaurantLoaded =
        false;

      restaurantLoading =
        false;


      if(
        restaurantSectionSeen &&
        isFoodModeActive()
      ){

        await checkRestaurantMode();

      }else{

        showRestaurantShimmer();

      }

    };


})();
