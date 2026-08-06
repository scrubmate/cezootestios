let apsaraSavedScrollTop = 0;

function openApsaraRewardSheet(){

  const overlay =
    document.getElementById("apsaraRewardOverlay");

  if(!overlay) return;

  /* Save current page position */
  apsaraSavedScrollTop =
    document.body.scrollTop ||
    document.documentElement.scrollTop ||
    window.scrollY ||
    0;

  overlay.classList.add("apsaraRewardShow");

  /*
    Do not use:
    document.body.style.overflow = "hidden";
  */

  document.documentElement.classList.add("apsaraSheetOpen");
  document.body.classList.add("apsaraSheetOpen");

  const cartBar =
    document.querySelector(".floatBarWrap");

  if(cartBar){
    cartBar.classList.add("apsaraCartVisible");
  }

  loadApsaraProducts();
}


function closeApsaraRewardSheet(){

  const overlay =
    document.getElementById("apsaraRewardOverlay");

  if(!overlay) return;

  overlay.classList.remove("apsaraRewardShow");

  document.documentElement.classList.remove("apsaraSheetOpen");
  document.body.classList.remove("apsaraSheetOpen");

  const cartBar =
    document.querySelector(".floatBarWrap");

  if(cartBar){
    cartBar.classList.remove("apsaraCartVisible");
  }

  requestAnimationFrame(() => {
    document.body.scrollTop = apsaraSavedScrollTop;
    document.documentElement.scrollTop = apsaraSavedScrollTop;
  });
}



document
  .getElementById("apsaraRewardOverlay")
  ?.addEventListener("click", function(e){

    if(e.target === this){
      closeApsaraRewardSheet();
    }

  });


/* =================================
   APSARA PRODUCT SETTINGS
================================= */

const APSARA_PRODUCT_TABLE = "icecreams";

const APSARA_PRODUCT_IDS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31
];

let apsaraProductsLoaded = false;
let apsaraProductsCache = [];


/* =================================
   SHOW SHIMMER
================================= */

function showApsaraProductsShimmer(){

  const row =
    document.getElementById("apsaraProductsRow");

  if(!row) return;

  row.innerHTML = Array(6).fill(`

    <div class="apsaraShimmerCard">

      <div class="apsaraShimmerImage"></div>

      <div class="apsaraShimmerPrice"></div>

      <div class="apsaraShimmerName"></div>

      <div class="apsaraShimmerQuantity"></div>

    </div>

  `).join("");
}


/* =================================
   LOAD PRODUCTS FROM SUPABASE
================================= */

async function loadApsaraProducts(){

  const row =
    document.getElementById("apsaraProductsRow");

  if(!row) return;

  if(apsaraProductsLoaded){

    renderApsaraProducts(
      apsaraProductsCache,
      APSARA_PRODUCT_TABLE
    );

    return;
  }

  showApsaraProductsShimmer();

  const { data, error } =
    await supabaseClient
      .from(APSARA_PRODUCT_TABLE)
      .select("*")
      .in("id", APSARA_PRODUCT_IDS);

  if(error){

    console.error(
      "Apsara products error:",
      error
    );

    row.innerHTML = `
      <div style="
        width:100%;
        padding:25px 10px;
        text-align:center;
        color:#777;
        font-size:13px;
        font-weight:700;
      ">
        Products could not be loaded
      </div>
    `;

    return;
  }

  /* KEEP SAME ID ORDER */

  const productMap =
    new Map(
      (data || []).map(product => [
        Number(product.id),
        product
      ])
    );

  const orderedProducts =
    APSARA_PRODUCT_IDS
      .map(id => productMap.get(Number(id)))
      .filter(Boolean);

  await Promise.all(
    orderedProducts.map(product =>
      preloadImage(product.image1)
    )
  );

  apsaraProductsCache = orderedProducts;
  apsaraProductsLoaded = true;

  renderApsaraProducts(
    orderedProducts,
    APSARA_PRODUCT_TABLE
  );
}


/* =================================
   RENDER PRODUCTS
================================= */

function renderApsaraProducts(products, table){

  const row =
    document.getElementById("apsaraProductsRow");

  if(!row) return;

  row.innerHTML = products.map(product => `

    <div
      class="apsaraProductCard"
      data-id="${product.id}"
      data-table="${table}"
    >

      <div class="apsaraProductImageWrap">

        <img
          class="apsaraProductImage"
          src="${product.image1 || ""}"
          loading="lazy"
          alt="${product.name || "Reward product"}"
        >

        <button
          type="button"
          class="apsaraProductAddBtn"
          aria-label="Add product"
        >
          <span>+</span>
        </button>

      </div>

      <div class="apsaraProductInfo">

        <div class="apsaraProductPriceRow">

          <span class="apsaraProductDiscountPrice">
            ₹${product.discount_price || 0}
          </span>

          <span class="apsaraProductOriginalPrice">
            ₹${product.original_price || 0}
          </span>

        </div>

      <div class="apsaraProductBrand">
  ${product.brand || ""}
</div>

<div class="apsaraProductName">
  ${product.name || ""}
</div>

        <div class="apsaraProductQuantity">
          ${product.quantity || ""}
          ${product.unit || ""}
        </div>

      </div>

    </div>

  `).join("");


  row
    .querySelectorAll(".apsaraProductCard")
    .forEach(card => {

      const id =
        Number(card.dataset.id);

      const product =
        products.find(
          item => Number(item.id) === id
        );

      if(!product) return;

      const addButton =
        card.querySelector(
          ".apsaraProductAddBtn"
        );

      addButton.addEventListener(
        "click",
        event => {

          apsaraAddProductToCart(
            event,
            addButton,
            product,
            table
          );

        }
      );

    });


  restoreApsaraCartButtons();
}


/* =================================
   ADD APSARA PRODUCT TO CART
================================= */

function apsaraAddProductToCart(
  event,
  button,
  product,
  table
){

  event.preventDefault();
  event.stopPropagation();

  const key =
    `${table}_${product.id}`;

  if(!cart[key]){

    cart[key] = {

      table:table,

      id:product.id,

      name:product.name,

      image1:product.image1,

      discount_price:
        product.discount_price,

      original_price:
        product.original_price,

      quantity:product.quantity,

      unit:product.unit,

      qty:1,

      addedTime:Date.now()

    };

  }else{

    cart[key].qty++;

    cart[key].addedTime =
      Date.now();

  }

  saveCart();

  updateCartFloat();

  updatePopupCartSummary();

  restoreCartButtons(document);

  restoreApsaraCartButtons();

  if(popupProduct){
    updatePopupCartButton();
  }

  return false;
}


/* =================================
   RESTORE APSARA CART BUTTONS
================================= */

function restoreApsaraCartButtons(){

  const row =
    document.getElementById(
      "apsaraProductsRow"
    );

  if(!row) return;

  row
    .querySelectorAll(".apsaraProductCard")
    .forEach(card => {

      const table =
        card.dataset.table;

      const id =
        card.dataset.id;

      const key =
        `${table}_${id}`;

      const button =
        card.querySelector(
          ".apsaraProductAddBtn"
        );

      if(!button) return;

      button.dataset.key = key;

      if(cart[key]){

        button.classList.add(
          "apsaraQtyMode"
        );

        button.innerHTML = `

          <button
            type="button"
            onclick="return decreaseApsaraCart(event,this)"
          >
            −
          </button>

          <span class="apsaraProductQtyCount">
            ${cart[key].qty}
          </span>

          <button
            type="button"
            onclick="return increaseApsaraCart(event,this)"
          >
            +
          </button>

        `;

      }else{

        button.classList.remove(
          "apsaraQtyMode"
        );

        button.innerHTML =
          `<span>+</span>`;

      }

    });
}


/* =================================
   INCREASE QUANTITY
================================= */

function increaseApsaraCart(event, button){

  event.preventDefault();
  event.stopPropagation();

  const addButton =
    button.closest(
      ".apsaraProductAddBtn"
    );

  const key =
    addButton.dataset.key;

  if(!key || !cart[key]){
    return false;
  }

  cart[key].qty++;

  cart[key].addedTime =
    Date.now();

  saveCart();

  updateCartFloat();

  updatePopupCartSummary();

  restoreCartButtons(document);

  restoreApsaraCartButtons();

  if(popupProduct){
    updatePopupCartButton();
  }

  return false;
}


/* =================================
   DECREASE QUANTITY
================================= */

function decreaseApsaraCart(event, button){

  event.preventDefault();
  event.stopPropagation();

  const addButton =
    button.closest(
      ".apsaraProductAddBtn"
    );

  const key =
    addButton.dataset.key;

  if(!key || !cart[key]){
    return false;
  }

  cart[key].qty--;

  if(cart[key].qty <= 0){
    delete cart[key];
  }

  saveCart();

  updateCartFloat();

  updatePopupCartSummary();

  restoreCartButtons(document);

  restoreApsaraCartButtons();

  if(popupProduct){
    updatePopupCartButton();
  }

  return false;
}


