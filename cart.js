
/* =====================================================
   CEZOO PAYMENT LAUNCH LOCK
   Launch: Saturday, 1 August 2026 at 11:00 PM IST

   - Pay Online and Pay Cash/UPI remain disabled before launch.
   - A polished live countdown appears above the buttons.
   - At launch time, both buttons enable automatically.
   - After launch, this helper is removed permanently.
   - All remaining cart and payment code stays unchanged.
===================================================== */

/*
  11:00 PM IST = 17:30 UTC.
  Using an explicit timezone offset prevents browser timezone differences.
*/
const CEZOO_PAYMENT_LAUNCH_TIME =
  new Date("2026-08-01T23:00:00+05:30").getTime();

const CEZOO_PAYMENT_LAUNCHED_KEY =
  "cezooPaymentsLaunchedAug012026";

let cezooPaymentTimerInterval = null;

function getCezooPaymentButtons(){
  return {
    onlineButton:
      document.getElementById("payOnlineBtn"),

    cashButton:
      document.getElementById("payCashBtn")
  };
}

function addCezooPaymentLaunchStyles(){

  if(
    document.getElementById(
      "cezooPaymentLaunchStyles"
    )
  ){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "cezooPaymentLaunchStyles";

  style.textContent = `
    #cezooPaymentLaunchHelper{
      position:absolute;
      left:50%;
      bottom:calc(100% + 7px);
      transform:translateX(-50%);
      z-index:20;
      width:max-content;
      max-width:calc(100% - 24px);
      padding:7px 10px;
      border:1px solid #dbeafe;
      border-radius:11px;
      background:
        linear-gradient(
          135deg,
          #f0f9ff,
          #fefce8
        );
      box-shadow:0 5px 14px rgba(59,130,246,.10);
      color:#262626;
      font-family:inherit;
      overflow:visible;
    }

    .cezooPaymentLaunchCountdown{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:4px;
    }

    .cezooPaymentTimeBox{
      min-width:31px;
      height:30px;
      padding:3px 4px;
      border:1px solid #ececec;
      border-radius:7px;
      background:rgba(255,255,255,.82);
      text-align:center;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
    }

    .cezooPaymentTimeNumber{
      display:block;
      color:#222;
      font-size:12px;
      font-weight:800;
      line-height:1;
    }

    .cezooPaymentTimeLabel{
      display:block;
      margin-top:2px;
      color:#999;
      font-size:6px;
      font-weight:700;
      line-height:1;
      letter-spacing:.2px;
      text-transform:uppercase;
    }

    .cezooMiniCracker{
      position:absolute;
      width:6px;
      height:6px;
      border-radius:2px;
      background:#60a5fa;
      box-shadow:
        8px 2px 0 #f59e0b,
        -7px 5px 0 #34d399;
      pointer-events:none;
      opacity:0;
      animation:
        cezooMiniCrackerPop 1.6s ease-out infinite;
    }

    .cezooMiniCracker.c1{
      left:-8px;
      top:7px;
      animation-delay:0s;
    }

    .cezooMiniCracker.c2{
      right:-8px;
      top:8px;
      animation-delay:.35s;
    }

    .cezooMiniCracker.c3{
      left:20%;
      top:-7px;
      animation-delay:.7s;
    }

    .cezooMiniCracker.c4{
      right:20%;
      top:-7px;
      animation-delay:1.05s;
    }

    @keyframes cezooMiniCrackerPop{
      0%{
        opacity:0;
        transform:translate3d(0,0,0) scale(.5);
      }

      15%{
        opacity:1;
      }

      55%{
        opacity:.85;
        transform:translate3d(0,-10px,0) scale(1.12) rotate(18deg);
      }

      100%{
        opacity:0;
        transform:translate3d(0,-17px,0) scale(.75) rotate(38deg);
      }
    }

    #payOnlineBtn:disabled,
    #payCashBtn:disabled{
      opacity:.46;
      cursor:not-allowed;
      filter:grayscale(.18);
      transform:none;
      box-shadow:none;
    }
  `;

  document.head.appendChild(style);
}

function removeCezooPaymentLaunchHelper(){

  document
    .getElementById(
      "cezooPaymentLaunchHelper"
    )
    ?.remove();
}

function setCezooPaymentButtonsEnabled(
  enabled
){

  const {
    onlineButton,
    cashButton
  } = getCezooPaymentButtons();

  [
    onlineButton,
    cashButton
  ].forEach(button => {

    if(!button){
      return;
    }

    button.disabled = !enabled;

    if(enabled){

      button.removeAttribute(
        "aria-disabled"
      );

      button.style.pointerEvents = "";
      button.style.opacity = "";
      button.style.cursor = "";
      button.style.filter = "";

    }else{

      button.setAttribute(
        "aria-disabled",
        "true"
      );

      button.style.pointerEvents =
        "none";
    }

  });
}

function enableCezooPaymentButtonsForever(){

  clearInterval(
    cezooPaymentTimerInterval
  );

  cezooPaymentTimerInterval = null;

  localStorage.setItem(
    CEZOO_PAYMENT_LAUNCHED_KEY,
    "1"
  );

  setCezooPaymentButtonsEnabled(true);
  removeCezooPaymentLaunchHelper();
}

function ensureCezooPaymentLaunchHelper(){

  const payBar =
    document.querySelector(".cartPayBar");

  if(!payBar){
    return null;
  }

  addCezooPaymentLaunchStyles();

  let helper =
    document.getElementById(
      "cezooPaymentLaunchHelper"
    );

  if(!helper){

    helper =
      document.createElement("div");

    helper.id =
      "cezooPaymentLaunchHelper";

    helper.innerHTML = `
      <span class="cezooMiniCracker c1"></span>
      <span class="cezooMiniCracker c2"></span>
      <span class="cezooMiniCracker c3"></span>
      <span class="cezooMiniCracker c4"></span>

      <div class="cezooPaymentLaunchCountdown">
        <div class="cezooPaymentTimeBox">
          <span
            id="cezooPayDays"
            class="cezooPaymentTimeNumber"
          >00</span>
          <span class="cezooPaymentTimeLabel">
            D
          </span>
        </div>

        <div class="cezooPaymentTimeBox">
          <span
            id="cezooPayHours"
            class="cezooPaymentTimeNumber"
          >00</span>
          <span class="cezooPaymentTimeLabel">
            H
          </span>
        </div>

        <div class="cezooPaymentTimeBox">
          <span
            id="cezooPayMinutes"
            class="cezooPaymentTimeNumber"
          >00</span>
          <span class="cezooPaymentTimeLabel">
            M
          </span>
        </div>

        <div class="cezooPaymentTimeBox">
          <span
            id="cezooPaySeconds"
            class="cezooPaymentTimeNumber"
          >00</span>
          <span class="cezooPaymentTimeLabel">
            S
          </span>
        </div>
      </div>
    `;

    if(
      getComputedStyle(payBar).position ===
      "static"
    ){
      payBar.style.position =
        "relative";
    }

    payBar.appendChild(helper);
  }

  return helper;
}

function updateCezooPaymentCountdownUI(
  remaining
){

  const totalSeconds =
    Math.max(
      0,
      Math.floor(remaining / 1000)
    );

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  const values = {
    cezooPayDays: days,
    cezooPayHours: hours,
    cezooPayMinutes: minutes,
    cezooPaySeconds: seconds
  };

  Object.entries(values)
    .forEach(([id, value]) => {

      const element =
        document.getElementById(id);

      if(element){
        element.innerText =
          String(value).padStart(2, "0");
      }

    });
}

function startCezooPaymentButtonTimer(){

  const now = Date.now();

  /*
    Once the fixed launch time has passed,
    payments stay enabled forever.
  */
  if(
    now >= CEZOO_PAYMENT_LAUNCH_TIME ||
    localStorage.getItem(
      CEZOO_PAYMENT_LAUNCHED_KEY
    ) === "1"
  ){
    enableCezooPaymentButtonsForever();
    return;
  }

  const {
    onlineButton,
    cashButton
  } = getCezooPaymentButtons();

  if(!onlineButton || !cashButton){
    return;
  }

  setCezooPaymentButtonsEnabled(false);
  ensureCezooPaymentLaunchHelper();

  function updateTimer(){

    const remaining =
      CEZOO_PAYMENT_LAUNCH_TIME -
      Date.now();

    if(remaining <= 0){
      enableCezooPaymentButtonsForever();
      return;
    }

    setCezooPaymentButtonsEnabled(false);
    ensureCezooPaymentLaunchHelper();

    updateCezooPaymentCountdownUI(
      remaining
    );
  }

  clearInterval(
    cezooPaymentTimerInterval
  );

  updateTimer();

  cezooPaymentTimerInterval =
    setInterval(
      updateTimer,
      1000
    );
}

document.addEventListener(
  "DOMContentLoaded",
  startCezooPaymentButtonTimer
);

document.getElementById("cartFloatBox").addEventListener("click", () => {
  openCartPagePopup();
});

document.getElementById("closeCartPage").addEventListener("click", () => {
  closeCartPagePopup();
});

function openCartPagePopup(){

  const popup =
    document.getElementById("cartPagePopup");

  const content =
    document.getElementById("cartPageContent");

  /* Clear all old locks first */
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  document.body.classList.remove(
    "print-open",
    "popup-open"
  );

  document.documentElement.classList.remove(
    "print-open",
    "popup-open"
  );

  document
    .getElementById("xeroxPopup")
    ?.classList.remove("show");

  document
    .getElementById("printPage")
    ?.classList.remove("show");

  popup.classList.add("open");

  /*
    Apply the payment lock when the cart opens.
    If it already completed earlier, buttons remain enabled
    and no helper message is shown.
  */
  startCezooPaymentButtonTimer();

  document
    .querySelector(".floatBarWrap")
    ?.classList.add("popupMode");

  document.getElementById(
    "cartHeaderVillage"
  ).innerText =
    document.getElementById("village")
      ?.innerText ||
    "Selected Location";

  document.getElementById(
    "cartHeaderStreet"
  ).innerText =
    document.getElementById("street")
      ?.innerText ||
    "Delivery address";

  showCartPageShimmer();

  setTimeout(() => {

    renderCartPage();

    /* Force Android scroll recovery */
    if(content){

      content.style.overflowY = "auto";
      content.style.webkitOverflowScrolling =
        "touch";

      content.scrollTop = 0;

      content.getBoundingClientRect();
    }

    popup.style.overflowY = "auto";
    popup.style.webkitOverflowScrolling =
      "touch";

  }, 150);
}

function closeCartPagePopup(){

  const popup =
    document.getElementById("cartPagePopup");

  popup?.classList.remove("open");

  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  document.body.classList.remove(
    "print-open",
    "popup-open"
  );

  document.documentElement.classList.remove(
    "print-open",
    "popup-open"
  );

  document
    .querySelector(".floatBarWrap")
    ?.classList.remove("popupMode");
}

function showCartPageShimmer(){
  const box = document.getElementById("cartPageContent");

  box.innerHTML = `
    <div class="cartShimmerBox">
      <div class="cartShimmerLine" style="width:70%;"></div>
      <div class="cartShimmerSmall"></div>

      ${Array(4).fill(`
        <div class="cartShimmerItem">
          <div class="cartShimmerImg"></div>
          <div>
            <div class="cartShimmerLine"></div>
            <div class="cartShimmerSmall"></div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cartShimmerBox">
      <div class="cartShimmerLine" style="width:60%;"></div>
      <div class="cartShimmerLine"></div>
      <div class="cartShimmerLine"></div>
      <div class="cartShimmerSmall"></div>
    </div>
  `;
}
let deliveryPartnerTip =
  Number(localStorage.getItem("cezooDeliveryPartnerTip")) || 0;

let selectedInstructions = JSON.parse(
  localStorage.getItem("cezooDeliveryInstructions") || "[]"
);

function getCartTotals(){

  const items = Object.values(cart || {});

  let mrpTotal = 0;
  let itemTotal = 0;
  let totalQty = 0;


  items.forEach(item => {

    const qty =
      Number(item.qty || 0);

    const mrp =
      Number(
        item.original_price ||
        item.discount_price ||
        0
      );

    const price =
      Number(
        item.discount_price || 0
      );


    mrpTotal += mrp * qty;

    itemTotal += price * qty;

    totalQty += qty;

  });


  /* =========================
     DELIVERY MODE
  ========================= */

  const deliveryMode =
    localStorage.getItem(
      "cezooDeliveryMode"
    ) || "instant";


  /* =========================
     USER LOCATION
  ========================= */

  const userLat =
    Number(
      localStorage.getItem(
        "cezooUserLat"
      )
    );


  const userLon =
    Number(
      localStorage.getItem(
        "cezooUserLon"
      )
    );


  let deliveryDistance = null;

  let deliveryFee = 35;


  /* =========================
     LOCATION AVAILABLE
  ========================= */

  if(
    Number.isFinite(userLat) &&
    Number.isFinite(userLon) &&
    userLat !== 0 &&
    userLon !== 0
  ){

    deliveryDistance =
      calculateDeliveryDistanceKm(
        CEZOO_STORE_LAT,
        CEZOO_STORE_LON,
        userLat,
        userLon
      );


    /* ₹5 PER KM
       METERS ALSO COUNT
       MAXIMUM ₹100
    */
if(deliveryDistance < 1){

  // BELOW 1 KM FREE DELIVERY
  deliveryFee = 0;

}else{

  // ₹5 PER KM AFTER 1 KM
  const calculatedFee =
    Math.round(deliveryDistance * 5);

  deliveryFee =
    Math.min(
      100,
      calculatedFee
    );

}

  }


  /* =========================
     DELIVERY PAYMENT
  ========================= */

  let deliveryPay = 0;


  if(deliveryMode === "12_hours"){

    // DAY DELIVERY ALWAYS FREE

    deliveryPay = 0;

  }else{

    // INSTANT DELIVERY

    if(itemTotal >= 300){

      // ₹300+ FREE DELIVERY

      deliveryPay = 0;

    }else{

      // LOCATION FEE OR ₹35 FALLBACK

      deliveryPay = deliveryFee;

    }

  }


  /* =========================
     HANDLING FEE
  ========================= */

  const handlingFee = 10;

  const handlingPay =
    totalQty > 15
      ? handlingFee
      : 0;


  /* =========================
     TOTAL
  ========================= */

  const toPay =
    itemTotal +
    deliveryPay +
    handlingPay +
    deliveryPartnerTip;


  /* =========================
     DELIVERY SAVINGS
  ========================= */

  const deliverySavings =
    deliveryPay === 0
      ? deliveryFee
      : 0;


  const savings =
    (mrpTotal - itemTotal) +
    deliverySavings;


  return {

    items,

    mrpTotal,

    itemTotal,

    totalQty,

    deliveryMode,

    deliveryDistance,

    deliveryFee,

    handlingFee,

    deliveryPay,

    handlingPay,

    toPay,

    deliverySavings,

    savings

  };

}




let savedCouponInput = "";


function renderCartPage(){
  const box = document.getElementById("cartPageContent");
  const t = getCartTotals();
  const appliedCoupon = JSON.parse(
  localStorage.getItem("cezooAppliedCoupon") || "null"
);

const couponDiscountAmount =
  Object.values(cart || {}).reduce((total, item) => {

    if(
      item.table !== "icecreams" ||
      item.coupon_original_price == null
    ){
      return total;
    }

    const oldPrice =
      Number(item.coupon_original_price || 0);

    const newPrice =
      Number(item.discount_price || 0);

    const qty =
      Number(item.qty || 0);

    return total + ((oldPrice - newPrice) * qty);

  }, 0);
const savedSchedule = JSON.parse(
  localStorage.getItem("cezooDeliverySchedule") || "null"
);

const deliveryTimeDisplay =
  savedSchedule?.time
    ? `Scheduled for ${savedSchedule.time}`
    : "Delivering in 10-15 mins";
  document.getElementById("cartToPayBottom").innerText = `₹${t.toPay}`;

  if(t.totalQty <= 0){
    box.innerHTML = `
      <div style="padding:50px;text-align:center;font-weight:900;">
        Your cart is empty
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="cartDeliveryCard">

   <div class="cartDeliveryTop">

  <div class="cartDeliveryLeft">

    <div class="cartClockIcon">
      <i class="fa-regular fa-clock"></i>
    </div>

    <div class="deliveryInfoWrap">

   <div
  class="deliveryTimeText"
  id="cartDeliverySchedule"
>
  ${
    t.deliveryMode === "12_hours"
      ? "Same-Day Delivery"
      : "Delivering in 10-15 mins"
  }
</div>

      <div class="deliveryItemsText">
        ${t.totalQty} items
      </div>

    </div>

  </div>

 <div class="deliveryModeBox">

  <label class="deliveryModeToggle">
    <input
  type="checkbox"
  id="deliveryToggleBtn"
  ${t.deliveryMode === "12_hours" ? "checked" : ""}
  onchange="changeDeliveryMode(this)"
>
    <span class="deliveryModeSlider"></span>
  </label>

  <div
  id="deliveryModeText"
  class="deliveryModeText
  ${t.deliveryMode === "12_hours" ? "hours" : ""}"
>
  ${t.deliveryMode === "12_hours"
    ? "Day Delivery"
    : "Instant"}
</div>
  <div class="deliveryHowWorks" onclick="openDeliveryHowWorks()">
    How it works?
  </div>

</div>
</div>

      ${t.items.map(item => renderCartItemRow(item)).join("")}

      <div class="addMoreCart">
        Forgot something? <span onclick="closeCartPagePopup()">Add More Items</span>
      </div>

    </div>
<div class="cartCouponCard">

  <div class="couponTitle">
    Apply Coupon
  </div>

  <div class="couponRow">

   <input
  type="text"
  id="couponCode"
  class="couponInput"
  placeholder="Enter coupon code"
  value="${savedCouponInput}"
  oninput="savedCouponInput=this.value">

    <button
      class="applyCouponBtn"
      onclick="applyCoupon()">
      APPLY
    </button>

  </div>
<div
  id="couponMessage"
  style="
    display:${
      localStorage.getItem("cezooAppliedCoupon")
        ? "flex"
        : "none"
    };

    width:100%;
    margin-top:12px;
    text-align:center;
    font-size:12px;
    font-weight:600;
    align-items:center;
    justify-content:center;
    gap:8px;
    color:#0aaa43;
  "
>
  ${
    localStorage.getItem("cezooAppliedCoupon")
      ? `
        <span style="flex:1;height:1px;background:#ddd;"></span>

        <span style="white-space:nowrap;">
          Coupon applied successfully
        </span>

        <span style="flex:1;height:1px;background:#ddd;"></span>
      `
      : ""
  }
</div>
</div>
    <div class="cartBillCard">

    <div class="billHeader">
  <div class="billIcon">
    <i class="fa-solid fa-receipt"></i>
  </div>
  <h3>Bill Summary</h3>
</div>
      <div class="billRows">

        <div class="billRow">
          <span>Item Total</span>
          <strong>
            <del>₹${t.mrpTotal}</del> ₹${t.itemTotal}
          </strong>
        </div>
<div class="billRow deliveryFeeBillRow">

  <span>
    Delivery Fee

    ${
      t.deliveryDistance !== null
        ? `
          <small class="deliveryDistanceSmall">
  ${t.deliveryDistance.toFixed(2)} km
</small>
        `
        : `
          <small
            class="deliveryDistanceSmall locationNeeded"
            onclick="openSheet()"
          >
            Allow location for exact fee
          </small>
        `
    }

  </span>


  <strong>

    ${
      t.deliveryPay === 0

        ? `<del>₹${t.deliveryFee}</del> FREE`

        : `₹${t.deliveryFee}`
    }

  </strong>

</div>











   <div class="billRow">
  <span>Handling Fee</span>
  <strong>
    ${t.handlingPay === 0 ? "₹0" : "₹10"}
  </strong>
</div>
${deliveryPartnerTip > 0 ? `
  <div class="billRow">
    <span>Delivery Partner Tip</span>
    <strong>₹${deliveryPartnerTip}</strong>
  </div>
` : ""}
${
  appliedCoupon && couponDiscountAmount > 0
    ? `
      <div class="billRow">

        <span>
          Game Coupon
          <small style="
            margin-left:5px;
            color:#0aaa43;
            font-size:11px;
            font-weight:700;
          ">
            ${Number(appliedCoupon.percent || 0)}% OFF
          </small>
        </span>

        <strong>
          <del style="
            color:#999;
            font-weight:500;
            margin-right:5px;
          ">
            ₹${Math.round(
              couponDiscountAmount /
              (Number(appliedCoupon.percent) / 100)
            )}
          </del>

          <span style="color:#0aaa43;">
            ₹${Math.round(
              (couponDiscountAmount /
              (Number(appliedCoupon.percent) / 100))
              - couponDiscountAmount
            )}
          </span>
        </strong>

      </div>
    `
    : ""
}

        <div class="billRow billTotal">
          <span>To Pay</span>
          <strong>
           <del>₹${t.mrpTotal}</del>
₹${t.toPay}
          </strong>
        </div>

      </div>
    </div>




<div class="tipInstructionCard">

  <div class="tipTabs">
    <button class="tipTab active"
      onclick="showTipSection('tip',this)">
      Give a Tip
    </button>

    <button class="tipTab"
      onclick="showTipSection('instruction',this)">
      Delivery Instructions
    </button>
  </div>

  <!-- GIVE A TIP -->
  <div id="tipSection" class="tipSection active">

    <div class="tipContent">

      <div class="tipText">

        <div class="tipHeading">
          Tip Delivery Partner
        </div>

        <div class="tipDesc">
          Help them earn a little extra for their effort. 100% of this tip will go to them.
        </div>

      <div class="tipSafety" onclick="openDeliverySafety()">
  Delivery Partner Safety
</div>

      </div>

      <div class="tipImage">
        <img src="tip.png" alt="">
      </div>

    </div>

    <div class="tipAmountRow">

   <button class="tipAmountBtn ${deliveryPartnerTip === 10 ? "active" : ""}" onclick="toggleDeliveryTip(10)">₹10</button>
<button class="tipAmountBtn ${deliveryPartnerTip === 20 ? "active" : ""}" onclick="toggleDeliveryTip(20)">₹20</button>
<button class="tipAmountBtn ${deliveryPartnerTip === 30 ? "active" : ""}" onclick="toggleDeliveryTip(30)">₹30</button>
<button class="tipAmountBtn ${deliveryPartnerTip === 40 ? "active" : ""}" onclick="toggleDeliveryTip(40)">₹40</button>
<button class="tipAmountBtn ${deliveryPartnerTip === 50 ? "active" : ""}" onclick="toggleDeliveryTip(50)">₹50</button>
    </div>

  </div>

  <!-- DELIVERY INSTRUCTIONS -->
  <div id="instructionSection" class="tipSection">

    <div class="deliveryInstructionRow">

<button class="instructionBtn ${selectedInstructions.includes("Leave with Security") ? "active" : ""}"
        onclick='toggleInstruction(this,"Leave with Security")'>
  <i class="fa-solid fa-shield-heart"></i>
  <span>Leave with<br>Security</span>
</button>

<button class="instructionBtn ${selectedInstructions.includes("Leave at Door") ? "active" : ""}"
        onclick='toggleInstruction(this,"Leave at Door")'>
  <i class="fa-solid fa-door-open"></i>
  <span>Leave at<br>Door</span>
</button>

<button class="instructionBtn ${selectedInstructions.includes("Dont Ring Bell") ? "active" : ""}"
        onclick='toggleInstruction(this,"Dont Ring Bell")'>
  <i class="fa-regular fa-bell-slash"></i>
  <span>Don't Ring<br>Bell</span>
</button>

<button class="instructionBtn ${selectedInstructions.includes("Beware of Pets") ? "active" : ""}"
        onclick='toggleInstruction(this,"Beware of Pets")'>
  <i class="fa-solid fa-paw"></i>
  <span>Beware of<br>Pets</span>
</button>
    </div>

  </div>

</div>





    <div class="cartSavingsCard">
      <div class="savingsTop">
        <span>Savings on this order</span>
        <span class="savingsBadge">₹${t.savings}</span>
      </div>

      <div class="savingsInner">
       <div class="savingLine">
  <span>Discount on MRP</span>
  <strong>₹${t.mrpTotal - t.itemTotal}</strong>
</div>

${t.deliverySavings > 0 ? `
  <div class="savingLine">
    <span>FREE delivery savings</span>
    <strong>₹${t.deliverySavings}</strong>
  </div>
` : ""}
      </div>

      
    </div>

    
    
  `;
}
function renderCartItemRow(item){
  const key = `${item.table}_${item.id}`;

  const itemQty = Math.max(
    1,
    Number(item.qty || 1)
  );

  const sellingUnitPrice =
    Number(item.discount_price || 0);

  const originalUnitPrice =
    item.type === "print_order"
      ? sellingUnitPrice + 10
      : Number(
          item.original_price ||
          item.discount_price ||
          0
        );

  const itemImage =
    item.imageType === "fontawesome"
      ? `
        <div class="xeroxCartProductIcon">
          <i class="${item.iconClass || "fa-solid fa-print"}"></i>
        </div>
      `
      : `
        <div class="cartImgLoader"></div>

        <img
          src="${item.image1 || ""}"
          alt="${item.name || "Product"}"
          onload="this.previousElementSibling?.remove()"
          onerror="
            this.previousElementSibling?.remove();
            this.style.display='none';
          "
        >
      `;

  const itemDetails =
    item.type === "print_order"
      ? `
        ${item.pages || 0} pages •
        ${item.copies || 1} copies<br>
        ${item.printTypeText || ""} •
        ${item.paperSize || ""}
      `
      : `
        ${item.quantity || ""} ${item.unit || ""}
      `;

  return `
    <div class="cartItem">

      <div class="cartItemImg">
        ${itemImage}
      </div>

      <div class="cartItemMiddle">

        <div class="cartItemName">
          ${item.name || ""}
        </div>

        <div class="cartItemQty">
          ${itemDetails}
        </div>

        <div class="cartPriceBox">
          <del>₹${originalUnitPrice * itemQty}</del>
          <span>₹${sellingUnitPrice * itemQty}</span>
        </div>

      </div>

      <div class="cartItemRight">

  <div class="cartQtyBox">
    <button onclick="cartPageDecrease('${key}')">−</button>
    <span>${item.qty}</span>
    <button onclick="cartPageIncrease('${key}')">+</button>
  </div>

  ${
    item.type === "print_order"
      ? `
        <button
          type="button"
          class="xeroxEditBtn"
          onclick="editXeroxCartProduct('${key}')"
        >
          Edit
        </button>
      `
      : ""
  }

</div>

    </div>
  `;
}

function cartPageDecrease(key){

  if(!cart[key]){
    return;
  }

  cart[key].qty--;

  if(cart[key].qty <= 0){
    delete cart[key];
  }

  validateGameCoupon();

  saveCart();
  updateCartFloat();
  updatePopupCartSummary();
  restoreCartButtons(document);

  const remainingItems =
    Object.keys(cart || {}).length;

  /*
    If user removed the final item,
    reset everything and close cart.
  */
  if(remainingItems === 0){

    deliveryPartnerTip = 0;

    localStorage.removeItem(
      "cezooDeliveryPartnerTip"
    );

    const totalBox =
      document.getElementById(
        "cartToPayBottom"
      );

    if(totalBox){
      totalBox.innerText = "₹0";
    }

    closeCartPagePopup();

    return;
  }

  renderCartPage();
}



function cartPageIncrease(key){
  if(!cart[key]) return;

  cart[key].qty++;

  saveCart();
  updateCartFloat();
  updatePopupCartSummary();
  restoreCartButtons(document);
  renderCartPage();
}
function applyCoupon(){

  const input =
    document.getElementById("couponCode");

  savedCouponInput = input.value;

  const code =
    input.value
      .trim()
      .toUpperCase();

  const msg =
    document.getElementById("couponMessage");


  function showMessage(text, success = false){

    msg.innerHTML = `
      <span style="flex:1;height:1px;background:#ddd;"></span>
      <span style="white-space:nowrap;">${text}</span>
      <span style="flex:1;height:1px;background:#ddd;"></span>
    `;

    msg.style.display = "flex";

    msg.style.color =
      success ? "#0aaa43" : "#e53935";
    clearTimeout(window.couponMsgTimer);

    window.couponMsgTimer = setTimeout(() => {
      msg.style.display = "none";
      msg.innerHTML = "";
    }, 5000);
  }


  if(!code){
    showMessage("Please enter a coupon code");
    return;
  }


  if(code !== "CREAMKULFY"){
    showMessage("Invalid coupon code");
    return;
  }


  const gameCoupon = JSON.parse(
    localStorage.getItem("cezooGameCoupon") || "null"
  );


  if(!gameCoupon){
    showMessage("Play the game first to unlock this coupon");
    return;
  }


  const iceCreamItems =
    Object.values(cart || {}).filter(
      item => item.table === "icecreams"
    );


  const iceCreamTotal =
    iceCreamItems.reduce((total, item) => {

      const basePrice = Number(
        item.coupon_original_price ||
        item.discount_price ||
        0
      );

      return total +
        basePrice * Number(item.qty || 0);

    }, 0);


  if(iceCreamTotal < 150){

    const remaining =
      Math.ceil(150 - iceCreamTotal);

    showMessage(
      `Add ₹${remaining} more ice creams to use this coupon`
    );

    return;
  }


  const percent =
    Number(gameCoupon.percent || 0);

  const maxDiscount =
    Number(gameCoupon.maxDiscount || 0);


  const percentageDiscount =
    iceCreamTotal * percent / 100;

  const finalDiscount =
    Math.min(
      percentageDiscount,
      maxDiscount
    );


  const effectivePercent =
    iceCreamTotal > 0
      ? (finalDiscount / iceCreamTotal) * 100
      : 0;


  Object.keys(cart).forEach(key => {

    const item = cart[key];

    if(item.table !== "icecreams"){
      return;
    }


    if(!item.coupon_original_price){

      item.coupon_original_price =
        Number(item.discount_price || 0);

    }


    const originalPrice =
      Number(item.coupon_original_price || 0);


    item.discount_price =
      Math.max(
        0,
        Math.round(
          originalPrice *
          (1 - effectivePercent / 100)
        )
      );


    item.game_coupon_applied = true;
    item.game_coupon_percent = percent;

  });


  localStorage.setItem(
    "cezooAppliedCoupon",
    JSON.stringify(gameCoupon)
  );


  saveCart();
  updateCartFloat();
  updatePopupCartSummary();
  restoreCartButtons(document);
  renderCartPage();


 

}
let cartSwipeStartX = 0;
let cartSwipeStartY = 0;
let cartSwipeEdge = "";

const cartPagePopup = document.getElementById("cartPagePopup");

cartPagePopup.addEventListener("touchstart", function(e){
  const touch = e.touches[0];

  cartSwipeStartX = touch.clientX;
  cartSwipeStartY = touch.clientY;

  const w = window.innerWidth;

  if(cartSwipeStartX <= 28){
    cartSwipeEdge = "left";
  }else if(cartSwipeStartX >= w - 28){
    cartSwipeEdge = "right";
  }else{
    cartSwipeEdge = "";
  }
});

cartPagePopup.addEventListener("touchend", function(e){
  if(!cartSwipeEdge) return;

  const touch = e.changedTouches[0];

  const diffX = touch.clientX - cartSwipeStartX;
  const diffY = Math.abs(touch.clientY - cartSwipeStartY);

  if(diffY > 60){
    cartSwipeEdge = "";
    return;
  }

  if(cartSwipeEdge === "left" && diffX > 90){
    closeCartPagePopup();
  }

  if(cartSwipeEdge === "right" && diffX < -90){
    closeCartPagePopup();
  }

  cartSwipeEdge = "";
});

function showTipSection(type, btn){

  document.querySelectorAll(".tipTab")
    .forEach(x => x.classList.remove("active"));

  btn.classList.add("active");

  document.getElementById("tipSection").classList.remove("active");
  document.getElementById("instructionSection").classList.remove("active");

  if(type === "tip"){
    document.getElementById("tipSection").classList.add("active");
  }else{
    document.getElementById("instructionSection").classList.add("active");
  }
}

function toggleDeliveryTip(amount){
  deliveryPartnerTip =
    deliveryPartnerTip === amount ? 0 : amount;

  localStorage.setItem(
    "cezooDeliveryPartnerTip",
    deliveryPartnerTip
  );

  renderCartPage();
}
function toggleInstruction(btn, text){
  btn.classList.toggle("active");

  if(selectedInstructions.includes(text)){
    selectedInstructions =
      selectedInstructions.filter(x => x !== text);
  }else{
    selectedInstructions.push(text);
  }

  localStorage.setItem(
    "cezooDeliveryInstructions",
    JSON.stringify(selectedInstructions)
  );
}

/* DELIVERY SAFETY BOTTOM SHEET - JS ONLY */
function createDeliverySafetySheet(){
  if(document.getElementById("deliverySafetySheet")) return;

  const style = document.createElement("style");
  style.innerHTML = `
    .deliverysafety{
      position:fixed;
      inset:0;
      z-index:999999999;
      display:none;
    }

    .deliverysafety.show{
      display:block;
    }

    .deliverysafetyOverlay{
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.45);
    }

    .deliverysafetyClose{
    position:fixed;

    left:50%;
    bottom:330px;   /* Adjust this value if your sheet height changes */

    transform:translateX(-50%);

    width:36px;
    height:36px;

    border:none;
    border-radius:50%;

    background:#fff;
    color:#333;

    font-size:18px;
    font-weight:600;
    line-height:36px;
    text-align:center;

    box-shadow:0 4px 14px rgba(0,0,0,.18);

    cursor:pointer;
    z-index:99999999;
}

    .deliverysafetyBox{
      position:absolute;
      left:0;
      right:0;
      bottom:0;
      background:#fff;
      border-radius:26px 26px 0 0;
      padding:28px 20px 30px;
      text-align:center;
      z-index:2;
    }

    .deliverysafetyImg{
    width:54px;
    height:54px;
    object-fit:contain;
    display:block;
    margin:0 auto 10px;
}
    .deliverysafetyBox h3{
    margin:0 0 12px;
    font-size:17px;
    font-weight:700;
    color:#222;
}
    .deliverysafetyPoints{
    display:flex;
    flex-direction:column;
    gap:8px;
}

.deliverysafetyPoints p{
    margin:0;
    padding:10px 12px;

    background:#f7f7f7;
    border-radius:10px;

    font-size:13px;
    font-weight:500;
    line-height:1.4;
    color:#555;
}
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <div id="deliverySafetySheet" class="deliverysafety">
      <div class="deliverysafetyOverlay" onclick="closeDeliverySafety()"></div>

      <button class="deliverysafetyClose" onclick="closeDeliverySafety()">×</button>

      <div class="deliverysafetyBox">
        <img src="tip.png" class="deliverysafetyImg" alt="">

        <h3>Delivery Partner Safety</h3>

        <div class="deliverysafetyPoints">
          <p>Delivery partner follows safe delivery guidelines.</p>
          <p>Your tip goes directly to the delivery partner.</p>
          <p>Contactless delivery is available when requested.</p>
          <p>Delivery instructions help complete the order safely.</p>
        </div>
      </div>
    </div>
  `);
}

function openDeliverySafety(){
  createDeliverySafetySheet();

  const sheet = document.getElementById("deliverySafetySheet");
  document.body.appendChild(sheet);
  sheet.classList.add("show");
}

function closeDeliverySafety(){
  document.getElementById("deliverySafetySheet")?.classList.remove("show");
}


function createLionSheet(){
  if(document.getElementById("lionSheet")) return;

  const style = document.createElement("style");
  style.innerHTML = `
    .lionSheet{
      position:fixed;
      inset:0;
      z-index:999999999;
      display:none;
      font-family:Arial, sans-serif;
    }

    .lionSheet.show{display:block;}

    .lionSheetOverlay{
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.38);
    }

    .lionSheetBox{
      position:absolute;
      left:0;
      right:0;
      bottom:0;
      background:#fff;
      border-radius:26px 26px 0 0;
      padding:14px 18px 20px;
      box-shadow:0 -10px 30px rgba(0,0,0,.14);
      animation:lionUp .25s ease;
    }

    @keyframes lionUp{
      from{transform:translateY(100%);}
      to{transform:translateY(0);}
    }

    .lionHandle{
      width:42px;
      height:4px;
      background:#ddd;
      border-radius:20px;
      margin:0 auto 16px;
    }

    .lionTop{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:14px;
    }

    .lionTitle{
      font-size:17px;
      font-weight:600;
      color:#222;
    }

    .lionSub{
      font-size:12px;
      color:#777;
      margin-top:3px;
      font-weight:400;
    }

   .lionClose{
  width:34px;
  height:34px;
  border:0;
  border-radius:50%;
  background:#f3f3f3;
  font-size:20px;
  color:#333;

  position: relative;
  top: -10px; /* Adjust: -2px, -4px, etc. */
}

    .lionTodayBox{
      padding:12px 14px;
      border-radius:15px;
      background:rgba(255,255,255,.82);
      border:1px solid #eee;
      margin-bottom:14px;
    }

    .lionTodaySmall{
      font-size:10px;
      font-weight:500;
      color:#999;
      margin-bottom:4px;
      letter-spacing:.3px;
    }

    .lionTodayText{
      font-size:14px;
      font-weight:500;
      color:#222;
    }

    .lionPickerLabelRow{
      display:grid;
      grid-template-columns:1fr 1fr 1fr;
      text-align:center;
      margin-bottom:6px;
      font-size:12px;
      font-weight:400;
      color:#777;
    }

    .lionPickerWrap{
      position:relative;
      height:165px;
      display:grid;
      grid-template-columns:1fr 1fr 1fr;
      gap:8px;
      overflow:hidden;
      margin-bottom:14px;
    }

    .lionPickerCenterLine{
      position:absolute;
      left:0;
      right:0;
      top:57px;
      height:50px;
      background:#f6f6f6;
      border-top:1px solid #e9e9e9;
      border-bottom:1px solid #e9e9e9;
      border-radius:14px;
      z-index:1;
      pointer-events:none;
    }

    .lionPickerWrap:before,
    .lionPickerWrap:after{
      content:"";
      position:absolute;
      left:0;
      right:0;
      height:52px;
      z-index:4;
      pointer-events:none;
    }

    .lionPickerWrap:before{
      top:0;
      background:linear-gradient(to bottom,#fff,rgba(255,255,255,.7),transparent);
    }

    .lionPickerWrap:after{
      bottom:0;
      background:linear-gradient(to top,#fff,rgba(255,255,255,.7),transparent);
    }

    .lionWheel{
      position:relative;
      z-index:2;
      height:165px;
      overflow-y:auto;
      scroll-snap-type:y mandatory;
      scrollbar-width:none;
      padding:57px 0;
      box-sizing:border-box;
    }

    .lionWheel::-webkit-scrollbar{display:none;}

    .lionWheelItem{
      height:50px;
      display:flex;
      align-items:center;
      justify-content:center;
      scroll-snap-align:center;
      font-size:20px;
      font-weight:400;
      color:#aaa;
      transition:.15s ease;
    }

    .lionWheelItem.active{
      color:#222;
      font-size:23px;
      font-weight:500;
    }

    .lionPreview{
      display:none;
      padding:12px 14px;
      border-radius:15px;
      background:rgba(255,255,255,.82);
      border:1px solid #eee;
      font-size:13px;
      font-weight:500;
      color:#222;
      margin-bottom:12px;
    }

    .lionPreview.show{display:block;}

    .lionInstantBtn{
      width:100%;
      height:46px;
      border:1px solid #e5e5e5;
      border-radius:14px;
      background:rgba(255,255,255,.82);
      color:#222;
      font-size:14px;
      font-weight:500;
      cursor:pointer;
      margin-bottom:10px;

      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
    }

    .lionInstantBtn i{
      font-size:13px;
      color:#555;
    }

    .lionBtnRow{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    }

    .lionCancel,
    .lionSet{
      height:48px;
      border:0;
      border-radius:14px;
      font-size:14px;
      font-weight:500;
      cursor:pointer;
    }

    .lionCancel{
      background:#f2f2f2;
      color:#333;
    }

    .lionSet{
      background:#222;
      color:#fff;
    }
  `;

  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <div id="lionSheet" class="lionSheet">
      <div class="lionSheetOverlay" onclick="closeLionSheet()"></div>

      <div class="lionSheetBox">
        <div class="lionHandle"></div>

        <div class="lionTop">
          <div>
            <div class="lionTitle">Schedule Delivery</div>
            <div class="lionSub">Choose delivery time</div>
          </div>
          <button class="lionClose" onclick="closeLionSheet()">×</button>
        </div>

        <div class="lionTodayBox">
          <div class="lionTodaySmall">TODAY</div>
          <div id="lionTodayText" class="lionTodayText"></div>
        </div>

        <div class="lionPickerLabelRow">
          <div>Hour</div>
          <div>Minute</div>
          <div>AM / PM</div>
        </div>

        <div class="lionPickerWrap">
          <div class="lionPickerCenterLine"></div>
          <div id="lionHourWheel" class="lionWheel"></div>
          <div id="lionMinuteWheel" class="lionWheel"></div>
          <div id="lionAmPmWheel" class="lionWheel"></div>
        </div>

        <div id="lionPreview" class="lionPreview"></div>

        <button class="lionInstantBtn" onclick="setLionInstantDelivery()">
          <i class="fa-solid fa-bolt"></i>
          Instant Delivery
        </button>

        <div class="lionBtnRow">
          <button class="lionCancel" onclick="closeLionSheet()">Cancel</button>
          <button class="lionSet" onclick="confirmLionSchedule()">Set</button>
        </div>
      </div>
    </div>
  `);

  buildLionWheels();
  setLionTodayDate();
}

function openLionSheet(){
  createLionSheet();
  document.getElementById("lionSheet").classList.add("show");

  setTimeout(() => {
    setLionCurrentTime();
    updateLionWheelValues(false);
  }, 100);
}

function closeLionSheet(){
  document.getElementById("lionSheet")?.classList.remove("show");
}

function buildLionWheels(){
  const hourWheel = document.getElementById("lionHourWheel");
  const minuteWheel = document.getElementById("lionMinuteWheel");
  const ampmWheel = document.getElementById("lionAmPmWheel");

  hourWheel.innerHTML = "";
  minuteWheel.innerHTML = "";
  ampmWheel.innerHTML = "";

  for(let i = 1; i <= 12; i++){
    hourWheel.innerHTML += `<div class="lionWheelItem">${String(i).padStart(2,"0")}</div>`;
  }

  for(let i = 0; i < 60; i += 5){
    minuteWheel.innerHTML += `<div class="lionWheelItem">${String(i).padStart(2,"0")}</div>`;
  }

  ["AM","PM"].forEach(x => {
    ampmWheel.innerHTML += `<div class="lionWheelItem">${x}</div>`;
  });

  document.querySelectorAll(".lionWheel").forEach(wheel => {
    wheel.addEventListener("scroll", () => {
      clearTimeout(wheel._timer);
      wheel._timer = setTimeout(() => updateLionWheelValues(true), 90);
    });
  });
}

function setLionTodayDate(){
  const today = new Date();

  lionSelectedDate =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2,"0") + "-" +
    String(today.getDate()).padStart(2,"0");

  document.getElementById("lionTodayText").innerText =
    today.toLocaleDateString("en-IN",{
      weekday:"long",
      day:"numeric",
      month:"short",
      year:"numeric"
    });
}

function setLionCurrentTime(){
  const now = new Date();

  let hour = now.getHours();
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12;

  let minute = now.getMinutes();
  minute = Math.round(minute / 5) * 5;

  if(minute === 60){
    minute = 0;
    hour++;
    if(hour > 12) hour = 1;
  }

  document.getElementById("lionHourWheel").scrollTop = (hour - 1) * 50;
  document.getElementById("lionMinuteWheel").scrollTop = (minute / 5) * 50;
  document.getElementById("lionAmPmWheel").scrollTop = ampm === "AM" ? 0 : 50;
}

function getWheelValue(wheelId, smooth){
  const wheel = document.getElementById(wheelId);
  const items = wheel.querySelectorAll(".lionWheelItem");

  let index = Math.round(wheel.scrollTop / 50);
  index = Math.max(0, Math.min(index, items.length - 1));

  items.forEach(x => x.classList.remove("active"));
  items[index].classList.add("active");

  wheel.scrollTo({
    top:index * 50,
    behavior:smooth ? "smooth" : "auto"
  });

  return items[index].innerText;
}

function updateLionWheelValues(smooth = true){
  const hour = getWheelValue("lionHourWheel", smooth);
  const minute = getWheelValue("lionMinuteWheel", smooth);
  const ampm = getWheelValue("lionAmPmWheel", smooth);

  lionSelectedTime = `${hour}:${minute} ${ampm}`;

  const preview = document.getElementById("lionPreview");
  preview.innerText = `Selected: Today • ${lionSelectedTime}`;
  preview.classList.add("show");
}

function confirmLionSchedule(){
  updateLionWheelValues(false);

  const scheduleData = {
    date: lionSelectedDate,
    time: lionSelectedTime
  };

  localStorage.setItem(
    "cezooDeliverySchedule",
    JSON.stringify(scheduleData)
  );

  const scheduleText =
    document.querySelector(".scheduleBtn span");

  if(scheduleText){
    scheduleText.innerText = lionSelectedTime;
  }

  renderCartPage();

  closeLionSheet();
}


function changeDeliveryMode(toggle){

  const mainText =
    document.getElementById("cartDeliverySchedule");

  const modeText =
    document.getElementById("deliveryModeText");


  if(toggle.checked){

    // DAY DELIVERY
    localStorage.setItem(
      "cezooDeliveryMode",
      "12_hours"
    );

    if(mainText){
      mainText.innerText =
        "Delivery within the same day";
    }

    if(modeText){
      modeText.innerText = "Day Delivery";
      modeText.classList.add("hours");
    }


  }else{

    // INSTANT DELIVERY
    localStorage.setItem(
      "cezooDeliveryMode",
      "instant"
    );

    if(mainText){
      mainText.innerText =
        "Delivering in 10-15 mins";
    }

    if(modeText){
      modeText.innerText = "Instant";
      modeText.classList.remove("hours");
    }

  }


  // UPDATE DELIVERY FEE + TO PAY + SAVINGS
  renderCartPage();

}

/* =========================
   STORE LOCATION
========================= */

const CEZOO_STORE_LAT = 16.7475764;
const CEZOO_STORE_LON = 81.682095;


/* =========================
   DISTANCE CALCULATION
========================= */

function calculateDeliveryDistanceKm(
  lat1,
  lon1,
  lat2,
  lon2
){

  const R = 6371;

  const dLat =
    (lat2 - lat1) * Math.PI / 180;

  const dLon =
    (lon2 - lon1) * Math.PI / 180;


  const a =
    Math.sin(dLat / 2) ** 2 +

    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *

    Math.sin(dLon / 2) ** 2;


  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return R * c;
}





/* =====================================================
   CEZOO — SAVE ORDERS TO SUPABASE
   Requires existing:
   - supabaseClient
   - cart
   - getCartTotals()
   - deliveryPartnerTip
   - selectedInstructions
===================================================== */

let cezooCashOrderSaving = false;
let cezooCashOrderPromise = null;

let cezooUpiOrderSaving = false;

/* =====================================================
   CREATE UNIQUE ORDER ID
===================================================== */

function createCezooOrderId(paymentType){

  const now = new Date();

  const datePart =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const timePart =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const randomPart =
    Math.floor(1000 + Math.random() * 9000);

  return `CEZOO-${paymentType}-${datePart}-${timePart}-${randomPart}`;
}


/* =====================================================
   GET FULL DELIVERY ADDRESS
===================================================== */


function getCezooOrderAddress(){

  const confirmAddress =
    document
      .getElementById("cashConfirmAddress")
      ?.innerText
      ?.trim();

  if(confirmAddress){
    return confirmAddress;
  }

  const cartAddress =
    document
      .getElementById("cartHeaderStreet")
      ?.innerText
      ?.trim();

  if(cartAddress){
    return cartAddress;
  }

  const mainAddress =
    document
      .getElementById("street")
      ?.innerText
      ?.trim();

  if(mainAddress){
    return mainAddress;
  }

  return "Delivery address";
}

/* =====================================================
   PREPARE COMMON ORDER DATA
===================================================== */
function makeSafeStorageFileName(name){

  const originalName =
    String(name || "document.pdf");

  const baseName = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);

  return `${baseName || "document"}.pdf`;
}


async function uploadXeroxPdfToSupabase(
  file,
  orderFolder,
  fileIndex
){

  const safeName =
    makeSafeStorageFileName(file.name);

  const storagePath =
    `${orderFolder}/${Date.now()}_${fileIndex}_${safeName}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from("xerox-pdfs")
      .upload(
        storagePath,
        file,
        {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false
        }
      );

  if(uploadError){
    throw new Error(
      `PDF upload failed: ${uploadError.message}`
    );
  }

  const { data: publicData } =
    supabaseClient.storage
      .from("xerox-pdfs")
      .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: publicData?.publicUrl || ""
  };
}

async function prepareCezooOrderData(paymentMethod){

  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );
const deviceToken =
  localStorage.getItem("cezooDeviceToken") || "";
  if(!user || !user.name || !user.mobile){
    throw new Error(
      "Please login before placing the order."
    );
  }


  const totals = getCartTotals();

  if(
    !totals.items ||
    totals.items.length === 0
  ){
    throw new Error("Your cart is empty.");
  }


  const latitude =
    Number(
      localStorage.getItem("cezooUserLat")
    );

  const longitude =
    Number(
      localStorage.getItem("cezooUserLon")
    );


  if(
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0
  ){
    throw new Error(
      "Please select your delivery location."
    );
  }


  const deliveryMode =
    localStorage.getItem(
      "cezooDeliveryMode"
    ) || "instant";


  const savedSchedule = JSON.parse(
    localStorage.getItem(
      "cezooDeliverySchedule"
    ) || "null"
  );


  const orderFolder =
    String(user.mobile).replace(
      /[^0-9a-zA-Z_-]/g,
      ""
    ) +
    "/" +
    Date.now();


  const orderItems = [];


  for(
    let itemIndex = 0;
    itemIndex < totals.items.length;
    itemIndex++
  ){

    const item = totals.items[itemIndex];


    /* =========================
       XEROX PRODUCT
    ========================= */

    if(item.type === "print_order"){

      const uploadedPdfFiles = [];

      const savedFiles =
        Array.isArray(item.files)
          ? item.files
          : [];


      for(
        let fileIndex = 0;
        fileIndex < savedFiles.length;
        fileIndex++
      ){

        const savedFile =
          savedFiles[fileIndex];


        const pdfRecord =
          await getPdfFromIndexedDB(
            savedFile.id
          );


        if(
          !pdfRecord ||
          !pdfRecord.file
        ){
          throw new Error(
            `PDF file not found: ${
              savedFile.name ||
              "document.pdf"
            }`
          );
        }


        let originalPdf =
          pdfRecord.file;


        if(!(originalPdf instanceof File)){

          originalPdf = new File(
            [pdfRecord.file],
            pdfRecord.name ||
              savedFile.name ||
              "document.pdf",
            {
              type:
                pdfRecord.type ||
                "application/pdf",

              lastModified:
                pdfRecord.lastModified ||
                Date.now()
            }
          );
        }


        const uploaded =
          await uploadXeroxPdfToSupabase(
            originalPdf,
            orderFolder,
            fileIndex
          );


        uploadedPdfFiles.push({

          indexed_db_id:
            savedFile.id || null,

          name:
            originalPdf.name,

          type:
            originalPdf.type ||
            "application/pdf",

          size:
            Number(
              originalPdf.size || 0
            ),

          storage_bucket:
            "xerox-pdfs",

          storage_path:
            uploaded.storagePath,

          public_url:
            uploaded.publicUrl,

          total_pages:
            Number(
              savedFile.totalPages || 1
            ),

          selected_pages:
            Number(
              savedFile.selectedPages ||
              savedFile.totalPages ||
              1
            ),

          deleted_pages:
            Array.isArray(
              savedFile.deletedPages
            )
              ? savedFile.deletedPages
              : []

        });
      }


      orderItems.push({

        product_id:
          String(
            item.id ||
            item.key ||
            `print_${Date.now()}`
          ),

        product_table:
          "printing",

        product_type:
          "print_order",

        name:
          item.name ||
          "CEZOO Xerox & Printing",

        qty:
          Number(item.qty || 1),

        pages:
          Number(item.pages || 0),

        copies:
          Number(item.copies || 1),

        print_type:
          item.printType || "",

        print_type_text:
          item.printTypeText || "",

        paper_size:
          item.paperSize || "",

        side_type:
          item.sideType || "",

        side_text:
          item.sideText || "",

        orientation:
          item.orientation || "",

        orientation_text:
          item.orientationText || "",

        binding:
          item.binding || "",

        binding_text:
          item.bindingText || "",

        delivery:
          item.delivery || "",

        file_count:
          uploadedPdfFiles.length,

        files:
          uploadedPdfFiles,

        unit_price:
          Number(
            item.discount_price || 0
          ),

        total_price:
          Number(
            item.discount_price || 0
          ) *
          Number(item.qty || 1)

      });

      continue;
    }


    /* =========================
       NORMAL PRODUCT
    ========================= */

    orderItems.push({

      product_id:
        Number(item.id),

      product_table:
        item.table,

      qty:
        Number(item.qty || 1)

    });
  }


  const deliveryDate =
    deliveryMode === "12_hours"
      ? savedSchedule?.date || null
      : null;


  const deliveryTime =
    deliveryMode === "12_hours"
      ? savedSchedule?.time || null
      : null;


  return {

    user_name:
      user.name.trim(),

    user_mobile:
      String(user.mobile).trim(),
device_token:
  deviceToken,
    village:
      document
        .getElementById(
          "cartHeaderVillage"
        )
        ?.innerText ||

      document
        .getElementById("village")
        ?.innerText ||

      "Selected Location",

    address:
      getCezooOrderAddress(),

    latitude:
      latitude,

    longitude:
      longitude,

    items:
      orderItems,

    total_items:
      Number(
        totals.totalQty || 0
      ),

    mrp_total:
      Number(
        totals.mrpTotal || 0
      ),

    item_total:
      Number(
        totals.itemTotal || 0
      ),

    delivery_mode:
      deliveryMode,

    delivery_distance:
      totals.deliveryDistance !== null
        ? Number(
            totals.deliveryDistance
              .toFixed(2)
          )
        : null,

    delivery_fee:
      Number(
        totals.deliveryPay || 0
      ),

    handling_fee:
      Number(
        totals.handlingPay || 0
      ),

    delivery_tip:
      Number(
        deliveryPartnerTip || 0
      ),

    total_amount:
      Number(
        totals.toPay || 0
      ),

    total_savings:
      Number(
        totals.savings || 0
      ),

    delivery_date:
      deliveryDate,

    delivery_time:
      deliveryTime,

    delivery_instructions:
      Array.isArray(
        selectedInstructions
      )
        ? selectedInstructions
        : [],

    payment_method:
      paymentMethod,

    order_status:
      "placed"

  };
}
/* =====================================================
   SAVE CASH ON DELIVERY ORDER
===================================================== */
async function saveCashOrderToSupabase(){

  if(cezooCashOrderPromise){
    return await cezooCashOrderPromise;
  }

  cezooCashOrderSaving = true;

  cezooCashOrderPromise = (async function(){

    try{

      const orderData =
  await prepareCezooOrderData(
    "cash_on_delivery"
  );

      orderData.order_id =
        createCezooOrderId("CASH");

      orderData.payment_status = "pending";

      const { data, error } =
        await supabaseClient
          .from("cash_delivery_orders")
          .insert([orderData])
          .select()
          .single();

      if(error){
        throw error;
      }

      console.log(
        "✅ Cash order saved:",
        data
      );

      return {
        success: true,
        order: data,
        orderId: data.order_id
      };

    }catch(error){

      console.error(
        "❌ Cash order save failed:",
        error
      );

      return {
        success: false,
        message:
          error.message ||
          "Unable to place cash order."
      };

    }finally{

      cezooCashOrderSaving = false;
      cezooCashOrderPromise = null;

    }

  })();

  return await cezooCashOrderPromise;
}

/* =====================================================
   SAVE SUCCESSFUL UPI ORDER
===================================================== */

async function saveUpiOrderToSupabase(paymentData = {}){

  if(cezooUpiOrderSaving){
    return {
      success: false,
      message: "UPI order is already being saved."
    };
  }

  cezooUpiOrderSaving = true;

  try{

   const orderData =
  await prepareCezooOrderData("upi");

    orderData.order_id =
      createCezooOrderId("UPI");

    orderData.payment_status = "paid";


    /*
      Supports Razorpay or your custom UPI names.
    */

    orderData.transaction_id =
      paymentData.transaction_id ||
      paymentData.transactionId ||
      paymentData.razorpay_payment_id ||
      null;

    orderData.razorpay_order_id =
      paymentData.razorpay_order_id ||
      null;

    orderData.razorpay_payment_id =
      paymentData.razorpay_payment_id ||
      null;

    orderData.razorpay_signature =
      paymentData.razorpay_signature ||
      null;


    const { data, error } =
      await supabaseClient
        .from("upi_orders")
        .insert([orderData])
        .select()
        .single();


    if(error){
      throw error;
    }


    console.log(
      "✅ UPI order saved:",
      data
    );


    return {
      success: true,
      order: data,
      orderId: data.order_id
    };

  }catch(error){

    console.error(
      "❌ UPI order save failed:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "UPI payment completed, but order could not be saved."
    };

  }finally{

    cezooUpiOrderSaving = false;

  }
}

function validateGameCoupon(){

  const appliedCoupon = JSON.parse(
    localStorage.getItem("cezooAppliedCoupon") || "null"
  );

  if(!appliedCoupon) return;


  let iceCreamTotal = 0;


  Object.values(cart || {}).forEach(item => {

    if(item.table !== "icecreams") return;

    const originalPrice = Number(
      item.coupon_original_price ??
      item.discount_price ??
      0
    );

    iceCreamTotal +=
      originalPrice * Number(item.qty || 0);

  });


  /* COUPON NO LONGER VALID */

  if(iceCreamTotal < 150){

    Object.keys(cart).forEach(key => {

      const item = cart[key];

      if(
        item.table === "icecreams" &&
        item.coupon_original_price != null
      ){

        /* RESTORE ORIGINAL PRODUCT PRICE */

        item.discount_price =
          Number(item.coupon_original_price);


        delete item.coupon_original_price;
        delete item.game_coupon_applied;
        delete item.game_coupon_percent;

      }

    });


    /* REMOVE ONLY APPLIED STATE */

    localStorage.removeItem(
      "cezooAppliedCoupon"
    );


    saveCart();

    return false;
  }


  return true;
}