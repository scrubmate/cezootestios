function isCezooUserLoggedIn(){
  const user = JSON.parse(localStorage.getItem("cezooUser") || "null");

  return user &&
    user.name &&
    user.mobile &&
    user.otp &&
    user.login === true;
}

function showOrderPlacedPopup(){

  if(document.getElementById("orderPlacedPopup")){
    document.getElementById("orderPlacedPopup").classList.add("show");
    return;
  }

  const style = document.createElement("style");
  style.innerHTML = `
    .orderPlacedPopup{
      position:fixed;
      inset:0;
      z-index:999999999;
      background:#16a34a;
      display:none;
      align-items:center;
      justify-content:center;
      overflow:hidden;
      font-family:Arial, Helvetica, sans-serif;
    }

    .orderPlacedPopup.show{
      display:flex;
    }

    .orderSuccessBox{
      width:100%;
      text-align:center;
      color:white;
      padding:20px;
      animation:orderPageShow .8s ease forwards;
    }

    @keyframes orderPageShow{
      from{opacity:0; transform:translateY(25px);}
      to{opacity:1; transform:translateY(0);}
    }

    .orderAnimationArea{
      width:190px;
      height:170px;
      margin:0 auto 25px;
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .orderTickCircle{
      width:135px;
      height:135px;
      background:#fff;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 18px 35px rgba(0,0,0,.22);
      animation:orderCirclePop .8s cubic-bezier(.22,1.2,.36,1) forwards;
    }

    @keyframes orderCirclePop{
      0%{transform:scale(0); opacity:0;}
      65%{transform:scale(1.12); opacity:1;}
      100%{transform:scale(1); opacity:1;}
    }

    .orderTickSvg{
      width:105px;
      height:105px;
      overflow:visible;
      animation:orderTickBounce .45s ease 1.25s forwards;
    }

    .orderTickPath{
      fill:none;
      stroke:#16a34a;
      stroke-width:13;
      stroke-linecap:round;
      stroke-linejoin:round;
      stroke-dasharray:1;
      stroke-dashoffset:1;
      animation:orderDrawTick .85s cubic-bezier(.35,0,.2,1) .45s forwards;
    }

    @keyframes orderDrawTick{to{stroke-dashoffset:0;}}

    @keyframes orderTickBounce{
      0%{transform:scale(1);}
      50%{transform:scale(1.12);}
      100%{transform:scale(1);}
    }

    .orderStar{
      position:absolute;
      color:#fff;
      font-size:30px;
      opacity:0;
      text-shadow:0 5px 14px rgba(0,0,0,.18);
      animation:orderStarMove 2.3s ease-in-out infinite;
    }

    .orderStar1{top:2px; left:5px; animation-delay:.1s;}
    .orderStar2{top:2px; right:5px; animation-delay:.3s;}
    .orderStar3{bottom:5px; left:10px; animation-delay:.5s;}
    .orderStar4{bottom:5px; right:10px; animation-delay:.7s;}
    .orderStar5{top:45%; left:-12px; animation-delay:.9s;}
    .orderStar6{top:45%; right:-12px; animation-delay:1.1s;}
    .orderStar7{top:-18px; left:50%; transform:translateX(-50%); animation-delay:1.3s; font-size:24px;}
    .orderStar8{bottom:-10px; left:50%; transform:translateX(-50%); animation-delay:1.5s; font-size:24px;}

    @keyframes orderStarMove{
      0%{transform:scale(0) rotate(0deg); opacity:0;}
      35%{transform:scale(1.25) rotate(120deg); opacity:1;}
      70%{transform:scale(1) rotate(240deg); opacity:.85;}
      100%{transform:scale(0) rotate(360deg); opacity:0;}
    }

    .orderSuccessBox h1{
      font-size:29px;
      font-weight:800;
      margin-bottom:12px;
    }

    .orderSuccessBox p{
  margin:0;

  font-size:16px;
  line-height:1.6;

  font-weight:500;
  letter-spacing:.2px;

  color:rgba(255,255,255,.92);

  max-width:300px;
  margin-left:auto;
  margin-right:auto;
}
  `;

  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <div id="orderPlacedPopup" class="orderPlacedPopup show">
      <div class="orderSuccessBox">

        <div class="orderAnimationArea">

          <span class="orderStar orderStar1">✦</span>
          <span class="orderStar orderStar2">✦</span>
          <span class="orderStar orderStar3">✦</span>
          <span class="orderStar orderStar4">✦</span>
          <span class="orderStar orderStar5">✦</span>
          <span class="orderStar orderStar6">✦</span>
          <span class="orderStar orderStar7">✦</span>
          <span class="orderStar orderStar8">✦</span>

          <div class="orderTickCircle">
            <svg class="orderTickSvg" viewBox="0 0 120 120">
              <path class="orderTickPath" pathLength="1" d="M30 62 L51 83 L92 36"></path>
            </svg>
          </div>

        </div>

        <h1>Order Placed</h1>
        <p>Your order has been placed successfully.</p>

      </div>
    </div>
  `);
}

async function openPlacedOrderAutomatically(
  orderId,
  orderType
){

  try{

    /*
      Hide success and cart popups.
    */
    document
      .getElementById("orderPlacedPopup")
      ?.classList.remove("show");

    document
      .getElementById("cashConfirmOverlay")
      ?.classList.remove("open");

    document
      .getElementById("cartPagePopup")
      ?.classList.remove("open");

    document
      .getElementById("loginPopup")
      ?.classList.remove("open");


    /*
      Clear cart after successful order.
    */
    cart = {};

    localStorage.removeItem("cezooCart");


    document
      .querySelector(".floatBarWrap")
      ?.classList.remove("popupMode");


    if(typeof updateCartFloat === "function"){
      updateCartFloat();
    }


    if(typeof restoreCartButtons === "function"){
      restoreCartButtons(document);
    }


    /*
      Read logged-in user.
    */
    const user = JSON.parse(
      localStorage.getItem("cezooUser") || "null"
    );


    if(!user || !user.mobile){
      document.body.style.overflow = "";
      return;
    }


    /*
      Fill profile information.
    */
    const capitalName = String(user.name || "")
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map(function(word){
        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      })
      .join(" ");


    const profileName =
      document.getElementById(
        "profileUserName"
      );

    const profileMobile =
      document.getElementById(
        "profileUserMobile"
      );


    if(profileName){
      profileName.innerText = capitalName;
    }


    if(profileMobile){
      profileMobile.innerText =
        "+91 " + user.mobile;
    }


    /*
      Open profile page.
    */
    document
      .getElementById("cezooProfilePopup")
      ?.classList.add("open");


    /*
      Open Your Orders page behind details.
    */
    document
      .getElementById("yourOrdersPopup")
      ?.classList.add("open");


    document.body.style.overflow = "hidden";


    /*
      Show loading state while fetching new order.
    */
    const ordersContainer =
      document.getElementById(
        "yourOrdersContent"
      );


    if(ordersContainer){

      ordersContainer.innerHTML = `
        <div class="userOrdersState">

          <div class="userOrdersSpinner"></div>

          <h3>Opening your order</h3>

          <p>Please wait...</p>

        </div>
      `;

    }


    /*
      Load latest orders from Supabase.
    */
    await loadLoggedUserOrders();


    /*
      Find the newly created order.
    */
    const newOrderIndex =
      loggedUserOrders.findIndex(
        function(order){

          const sameOrderId =
            String(order.order_id) ===
            String(orderId);

          const sameOrderType =
            String(
              order._order_type || "cash"
            ) === String(orderType);

          return sameOrderId && sameOrderType;

        }
      );


    if(newOrderIndex === -1){

      console.warn(
        "New order was not found:",
        orderId,
        orderType
      );

      /*
        Keep Your Orders page open if the exact
        order is not available yet.
      */
      return;
    }


    /*
      Open newly placed order details.
    */
    await window.openUserOrderDetails(
      newOrderIndex
    );


    window.scrollTo({
      top:0,
      behavior:"auto"
    });


  }catch(error){

    console.error(
      "Automatic order opening failed:",
      error
    );

    /*
      Fallback: keep Your Orders page open.
    */
    document
      .getElementById("cezooProfilePopup")
      ?.classList.add("open");

    document
      .getElementById("yourOrdersPopup")
      ?.classList.add("open");

    document.body.style.overflow = "hidden";

  }

}

document.getElementById("payCashBtn").addEventListener("click", function(){

  const user = JSON.parse(localStorage.getItem("cezooUser") || "null");

  if(!user || !user.name || !user.mobile || !user.otp || user.login !== true){
    openLoginPopup();
    return;
  }

  openCashOrderConfirm();
});


function openCashOrderConfirm(){

  const total = document.getElementById("cartToPayBottom")?.innerText || "₹0";

 const savedLocations = JSON.parse(
  localStorage.getItem("recentLocations") || "[]"
);

const changedMapAddress =
  localStorage.getItem("cezooLastLocationAddress") || "";

let deliveryAddress = "Selected delivery address";

/*
  If user changed location from cart map,
  use the newly changed address.
*/
if(changedMapAddress){

  deliveryAddress = changedMapAddress;

/*
  Otherwise keep your original first address.
*/
}else if(
  savedLocations.length > 0 &&
  savedLocations[0].name
){

  deliveryAddress = savedLocations[0].name;

}else{

  const village =
    document.getElementById("village")
      ?.innerText
      ?.trim() || "";

  const street =
    document.getElementById("street")
      ?.innerText
      ?.trim() || "";

  deliveryAddress =
    `${village} ${street}`.trim();
}

  if(!document.getElementById("cashConfirmStyle")){
    const style = document.createElement("style");
    style.id = "cashConfirmStyle";

    style.innerHTML = `
      .cashConfirmOverlay{
        position:fixed;
        inset:0;
        z-index:999999999;
        background:rgba(0,0,0,.30);
        opacity:0;
        visibility:hidden;
        transition:.22s ease;
      }

      .cashConfirmOverlay.open{
        opacity:1;
        visibility:visible;
      }

      .cashConfirmSheet{
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        background:#fff;
        border-radius:22px 22px 0 0;
        padding:9px 15px calc(18px + env(safe-area-inset-bottom));
        transform:translateY(105%);
        transition:transform .32s cubic-bezier(.22,.9,.32,1);
      }

      .cashConfirmOverlay.open .cashConfirmSheet{
        transform:translateY(0);
      }

      .cashConfirmHandle{
        width:42px;
        height:4px;
        background:#cfcfcf;
        border-radius:10px;
        margin:0 auto 16px;
      }

      .cashConfirmTitle{
        margin:0;
        font-size:22px;
        line-height:1.15;
        font-weight:800;
        color:#20232d;
      }

      .cashConfirmSub{
        margin:6px 0 15px;
        font-size:13px;
        line-height:1.35;
        color:#747b89;
      }

      .cashInfoRow{
        display:flex;
        align-items:center;
        gap:11px;
        padding:10px 0;
      }

      .cashInfoIcon{
        width:43px;
        height:43px;
        border-radius:12px;
        background:#f3f4f6;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        color:#606775;
        flex-shrink:0;
      }

      .cashInfoText{
        flex:1;
        min-width:0;
      }

      .cashAmount{
        display:block;
        font-size:18px;
        line-height:1.2;
        font-weight:800;
        color:#20232d;
        margin-bottom:2px;
      }

      .cashSmallText{
        font-size:12px;
        color:#777e8b;
      }

      .cashDashedLine{
        border-top:1.2px dashed #d8d8d8;
        margin:2px 0;
      }

      .cashAddressTitle{
        margin:0 0 3px;
        font-size:14px;
        font-weight:700;
        color:#202124;
      }

      .cashAddressText{
        margin:0;
        font-size:12px;
        line-height:1.4;
        color:#747b88;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .cashPlaceOrderBtn{
        position:relative;
        width:100%;
        height:49px;
        margin-top:16px;
        border:none;
        border-radius:14px;
        background:#ff0f64;
        color:#fff;
        font-size:15px;
        font-weight:800;
        overflow:hidden;
        cursor:pointer;
        box-shadow:0 8px 18px rgba(255,15,100,.22);
      }

      .cashPlaceOrderBtn span{
        position:relative;
        z-index:3;
      }

      .cashPlaceOrderBtn::before{
        content:"";
        position:absolute;
        top:0;
        left:0;
        width:0%;
        height:100%;
        background:#b90048;
        z-index:1;
      }

      .cashPlaceOrderBtn.loading::before{
        animation:cashOrderFill 3.2s linear forwards;
      }

      @keyframes cashOrderFill{
        from{width:0%;}
        to{width:100%;}
      }

      .cashCancelBtn{
        width:100%;
        margin-top:11px;
        padding:6px;
        border:none;
        background:transparent;
        color:#ff336d;
        font-size:14px;
        font-weight:700;
      }
    `;

    document.head.appendChild(style);
  }

  if(!document.getElementById("cashConfirmOverlay")){

    document.body.insertAdjacentHTML("beforeend", `
      <div id="cashConfirmOverlay" class="cashConfirmOverlay">
        <div class="cashConfirmSheet">

          <div class="cashConfirmHandle"></div>

          <h2 class="cashConfirmTitle">Ordering now</h2>

          <p class="cashConfirmSub">
            Pay with Cash or UPI at the time of delivery.
          </p>

          <div class="cashInfoRow">
            <div class="cashInfoIcon">
              <i class="fa-solid fa-indian-rupee-sign"></i>
            </div>

            <div class="cashInfoText">
              <strong id="cashConfirmTotal" class="cashAmount">₹0</strong>
              <span class="cashSmallText">Amount to Pay</span>
            </div>
          </div>

          <div class="cashDashedLine"></div>

          <div class="cashInfoRow">
            <div class="cashInfoIcon">
              <i class="fa-solid fa-house"></i>
            </div>

            <div class="cashInfoText">
              <h3 class="cashAddressTitle">Delivering to Home</h3>
              <p id="cashConfirmAddress" class="cashAddressText"></p>
            </div>
          </div>

          <button id="cashPlaceOrderNowBtn" class="cashPlaceOrderBtn">
            <span>Place Order Now</span>
          </button>

          <button id="cashCancelOrderBtn" class="cashCancelBtn">
            Cancel Order
          </button>

        </div>
      </div>
    `);

    document.getElementById("cashCancelOrderBtn").onclick = closeCashOrderConfirm;

    document.getElementById("cashConfirmOverlay").onclick = function(e){
      if(e.target === this){
        closeCashOrderConfirm();
      }
    };
  }

  document.getElementById("cashConfirmTotal").innerText = total;
  document.getElementById("cashConfirmAddress").innerText = deliveryAddress;

  const btn = document.getElementById("cashPlaceOrderNowBtn");

btn.dataset.processing = "false";
btn.classList.remove("loading");
btn.querySelector("span").innerText = "Place Order Now";


/* CLICK BUTTON = PLACE ORDER IMMEDIATELY */

btn.onclick = function(){

  // Order is already being saved—ignore extra click
  if(cezooCashOrderSaving){
    return;
  }

  clearTimeout(cashAutoStartTimer);
  cashAutoStartTimer = null;

  clearTimeout(cashOrderTimer);
  cashOrderTimer = null;

  btn.dataset.processing = "false";

  startAutoCashOrder(0);
};

  requestAnimationFrame(function(){
    document.getElementById("cashConfirmOverlay").classList.add("open");
  });

  document.body.style.overflow = "hidden";

  clearTimeout(cashAutoStartTimer);

cashAutoStartTimer = setTimeout(function(){

  cashAutoStartTimer = null;

  const overlay =
    document.getElementById("cashConfirmOverlay");

  if(overlay?.classList.contains("open")){
    startAutoCashOrder();
  }

}, 100);
}

let cashOrderTimer = null;
let cashAutoStartTimer = null;


function startAutoCashOrder(delay = 3200){
  const btn = document.getElementById("cashPlaceOrderNowBtn");

  if(!btn) return;

  // stop any old order timer
  clearTimeout(cashOrderTimer);
  cashOrderTimer = null;

  if(btn.dataset.processing === "true") return;

  btn.dataset.processing = "true";

  // restart fill animation from 0
  if(delay > 0){

  btn.classList.remove("loading");

  void btn.offsetWidth;

  btn.classList.add("loading");

}else{

  btn.classList.remove("loading");

}

  // always same text
  btn.querySelector("span").innerText = "Place Order Now";


 cashOrderTimer = setTimeout(async function(){

  cashOrderTimer = null;

  const cashResult =
    await saveCashOrderToSupabase();

  if(!cashResult.success){

  // Ignore duplicate trigger without showing alert
  if(cashResult.message === "Order is already being placed."){
    return;
  }

  alert(cashResult.message);

  btn.dataset.processing = "false";
  btn.classList.remove("loading");

  btn.querySelector("span").innerText =
    "Place Order Now";

  return;
}

  console.log(
    "Cash Order ID:",
    cashResult.orderId
  );

  closeCashOrderConfirm(false);

  setTimeout(function(){

    showOrderPlacedPopup();

  }, 200);

setTimeout(async function(){

  await openPlacedOrderAutomatically(
    cashResult.orderId,
    "cash"
  );


  btn.dataset.processing = "false";

  btn.classList.remove("loading");

  btn.querySelector("span").innerText =
    "Place Order Now";


}, 4000);
    

 }, delay);
}


function closeCashOrderConfirm(cancelOrder = true){

  document
    .getElementById("cashConfirmOverlay")
    ?.classList.remove("open");


  if(cancelOrder){

    // cancel auto-start delay
    clearTimeout(cashAutoStartTimer);
    cashAutoStartTimer = null;


    // cancel running order timer
    clearTimeout(cashOrderTimer);
    cashOrderTimer = null;


    const btn =
      document.getElementById("cashPlaceOrderNowBtn");


    if(btn){

      btn.dataset.processing = "false";

      btn.classList.remove("loading");

      btn.querySelector("span").innerText =
        "Place Order Now";
    }
  }


  document.body.style.overflow = "hidden";
}









document
.getElementById("payOnlineBtn")
.addEventListener("click", async function(){

  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );

  if(!user || !user.name || !user.mobile || !user.otp || user.login !== true){
    openLoginPopup();
    return;
  }

  function showPaySpinner(){

    if(!document.getElementById("paySpinnerStyle")){
      const style = document.createElement("style");
      style.id = "paySpinnerStyle";
      style.innerHTML = `
  .paySpinnerOverlay{
    position:fixed;
    inset:0;
    z-index:999999999;

    background:rgba(255,255,255,.15);

    display:flex;
    align-items:center;
    justify-content:center;
  }

  .iosPaySpinner{
    position:relative;

    width:38px;
    height:38px;
  }

  .iosPaySpinner span{
    position:absolute;

    left:17px;
    top:2px;

    width:4px;
    height:10px;

    background:#555;

    border-radius:4px;

    transform-origin:2px 17px;

    animation:iosPayFade 1.2s linear infinite;
  }

  .iosPaySpinner span:nth-child(1){
    transform:rotate(0deg);
    animation-delay:-1.1s;
  }

  .iosPaySpinner span:nth-child(2){
    transform:rotate(30deg);
    animation-delay:-1s;
  }

  .iosPaySpinner span:nth-child(3){
    transform:rotate(60deg);
    animation-delay:-.9s;
  }

  .iosPaySpinner span:nth-child(4){
    transform:rotate(90deg);
    animation-delay:-.8s;
  }

  .iosPaySpinner span:nth-child(5){
    transform:rotate(120deg);
    animation-delay:-.7s;
  }

  .iosPaySpinner span:nth-child(6){
    transform:rotate(150deg);
    animation-delay:-.6s;
  }

  .iosPaySpinner span:nth-child(7){
    transform:rotate(180deg);
    animation-delay:-.5s;
  }

  .iosPaySpinner span:nth-child(8){
    transform:rotate(210deg);
    animation-delay:-.4s;
  }

  .iosPaySpinner span:nth-child(9){
    transform:rotate(240deg);
    animation-delay:-.3s;
  }

  .iosPaySpinner span:nth-child(10){
    transform:rotate(270deg);
    animation-delay:-.2s;
  }

  .iosPaySpinner span:nth-child(11){
    transform:rotate(300deg);
    animation-delay:-.1s;
  }

  .iosPaySpinner span:nth-child(12){
    transform:rotate(330deg);
    animation-delay:0s;
  }

  @keyframes iosPayFade{
    0%{
      opacity:1;
    }

    100%{
      opacity:.12;
    }
  }
`;
      document.head.appendChild(style);
    }

    if(!document.getElementById("paySpinnerOverlay")){
      document.body.insertAdjacentHTML("beforeend", `
  <div id="paySpinnerOverlay" class="paySpinnerOverlay">

    <div class="iosPaySpinner">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

  </div>
`);
    }else{
      document.getElementById("paySpinnerOverlay").style.display = "flex";
    }
  }

  function hidePaySpinner(){
    const loader = document.getElementById("paySpinnerOverlay");
    if(loader){
      loader.style.display = "none";
    }
  }

  try{

    showPaySpinner();

    const finalAmount = Number(
  document
    .getElementById("cartToPayBottom")
    .innerText
    .replace(/[^\d.]/g, "")
);
    if(!finalAmount || finalAmount <= 0){
      hidePaySpinner();
      console.log("Invalid amount");
      return;
    }

    const response = await fetch(
      "https://razropay.onrender.com/create-order",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          amount: finalAmount * 100
        })
      }
    );

    const data = await response.json();

    console.log("RAZORPAY RESPONSE:", data);

    if(!data || !data.success || !data.order){
      hidePaySpinner();
      console.log("Razorpay order failed");
      return;
    }

    const options = {
      key:"rzp_live_SqrUSaPO5pA6gt",

      amount:data.order.amount,
      currency:data.order.currency,
      order_id:data.order.id,

      name:"CEZOO",
      description:"Order Payment",

      prefill:{
        name:user.name,
        contact:user.mobile
      },

      theme:{
        color:"#0BD957"
      },

      handler:async function(paymentResponse){

  console.log(
    "Payment Success:",
    paymentResponse
  );

  const upiResult =
    await saveUpiOrderToSupabase({

      razorpay_order_id:
        paymentResponse.razorpay_order_id,

      razorpay_payment_id:
        paymentResponse.razorpay_payment_id,

      razorpay_signature:
        paymentResponse.razorpay_signature

    });

  if(!upiResult.success){

    alert(upiResult.message);

    return;
  }

  console.log(
    "UPI Order ID:",
    upiResult.orderId
  );

  showOrderPlacedPopup();

        setTimeout(async function(){

  await openPlacedOrderAutomatically(
    upiResult.orderId,
    "upi"
  );

}, 4000);
      },

      modal:{
        ondismiss:function(){
          hidePaySpinner();
          console.log("Razorpay closed");
        }
      }
    };

    const razorpay = new Razorpay(options);

    hidePaySpinner();

    setTimeout(function(){
      razorpay.open();
    }, 150);

  }catch(error){

    hidePaySpinner();

    console.error("Payment error:", error);

  }

});

function openDeliveryHowWorks(){
  createHoursSheet();

  const sheet = document.getElementById("hoursSheet");
  sheet.classList.add("show");

  showHoursSheetFirst();
}

function closeHoursSheet(){
  document.getElementById("hoursSheet")?.classList.remove("show");
}


let hoursSheetPage = 1;

let hoursTouchStartX = 0;
let hoursTouchEndX = 0;


function createHoursSheet(){

  if(document.getElementById("hoursSheet")) return;


  const style = document.createElement("style");

  style.innerHTML = `

    .hoursSheet{
      position:fixed;
      inset:0;
      z-index:999999999;
      display:none;
    }


    .hoursSheet.show{
      display:block;
    }


    .hoursSheetOverlay{
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.45);
    }


    .hoursSheetBox{
      position:absolute;
      left:10px;
      right:10px;
      bottom:0;

      background:#fff;

      border-radius:24px 24px 0 0;

      padding:22px 16px 24px;

      text-align:center;

      animation:hoursSheetUp .25s ease;

      overflow:hidden;
    }


    @keyframes hoursSheetUp{

      from{
        transform:translateY(100%);
      }

      to{
        transform:translateY(0);
      }

    }


    .hoursSheetClose{

      position:absolute;

      right:14px;
      top:12px;

      width:30px;
      height:30px;

      border:none;
      border-radius:50%;

      background:#f2f2f2;

      color:#222;

      font-size:20px;
      font-weight:800;

      z-index:10;
    }


    .hoursSheetContent{
      width:100%;
      touch-action:pan-y;
    }


    .hoursSheetImg{

      width:68px;
      height:68px;

      object-fit:contain;

      display:block;

      margin:8px auto 10px;
    }


    .hoursSheetTitle{

      margin:0 0 12px;

      font-size:16px;
      font-weight:900;

      color:#111;
    }


    .hoursSheetPoints{

      display:flex;

      flex-direction:column;

      gap:7px;

      text-align:left;
    }


    .hoursSheetPoints p{

      margin:0;

      padding:9px 11px;

      background:#f7f7f7;

      border-radius:10px;

      font-size:12.5px;
      font-weight:650;

      color:#555;

      line-height:1.32;
    }


    .hoursSlideLeft{
      animation:hoursSlideLeft .25s ease;
    }


    @keyframes hoursSlideLeft{

      from{
        opacity:0;
        transform:translateX(50px);
      }

      to{
        opacity:1;
        transform:translateX(0);
      }

    }


    .hoursSlideRight{
      animation:hoursSlideRight .25s ease;
    }


    @keyframes hoursSlideRight{

      from{
        opacity:0;
        transform:translateX(-50px);
      }

      to{
        opacity:1;
        transform:translateX(0);
      }

    }


    .hoursDots{

      display:flex;

      align-items:center;

      justify-content:center;

      gap:6px;

      margin-top:14px;
    }


    .hoursDot{

      width:6px;
      height:6px;

      border-radius:50%;

      background:#d0d0d0;

      transition:.2s ease;
    }


    .hoursDot.active{

      width:18px;

      border-radius:10px;

      background:#111;
    }

  `;


  document.head.appendChild(style);


  document.body.insertAdjacentHTML("beforeend", `

    <div id="hoursSheet" class="hoursSheet">

      <div
        class="hoursSheetOverlay"
        onclick="closeHoursSheet()">
      </div>


      <div class="hoursSheetBox">

        <button
          class="hoursSheetClose"
          onclick="closeHoursSheet()">
          ×
        </button>


        <div
          id="hoursSheetContent"
          class="hoursSheetContent">
        </div>


        <div class="hoursDots">

          <span
            id="hoursDot1"
            class="hoursDot active">
          </span>

          <span
            id="hoursDot2"
            class="hoursDot">
          </span>

        </div>

      </div>

    </div>

  `);


  const content =
    document.getElementById("hoursSheetContent");


  content.addEventListener(
    "touchstart",
    function(e){

      hoursTouchStartX =
        e.changedTouches[0].screenX;

    },
    {passive:true}
  );


  content.addEventListener(
    "touchend",
    function(e){

      hoursTouchEndX =
        e.changedTouches[0].screenX;

      handleHoursSwipe();

    },
    {passive:true}
  );

}


function handleHoursSwipe(){

  const difference =
    hoursTouchStartX - hoursTouchEndX;


  // SWIPE LEFT

  if(difference > 50){

    if(hoursSheetPage === 1){

      showHoursSheetSecond("left");

    }

  }


  // SWIPE RIGHT

  if(difference < -50){

    if(hoursSheetPage === 2){

      showHoursSheetFirst("right");

    }

  }

}


function showHoursSheetFirst(direction = "right"){

  hoursSheetPage = 1;


  const content =
    document.getElementById("hoursSheetContent");


  content.className =
    "hoursSheetContent " +
    (
      direction === "right"
      ? "hoursSlideRight"
      : "hoursSlideLeft"
    );


  content.innerHTML = `

    <img
      src="banner/hours.png"
      class="hoursSheetImg"
      alt="">


    <h3 class="hoursSheetTitle">
      Day Delivery
    </h3>


    <div class="hoursSheetPoints">

      <p>1. Day Delivery has no delivery charges.</p>
<p>2. If you order from morning 6 AM to evening 6 PM, your order will be delivered by 7 PM same day.</p>
<p>3. If you order after 10 PM, your order will be delivered next day morning.</p>
<p>4. Best for planned grocery orders.</p>
<p>5. Fresh items are packed safely.</p>
<p>6. Helpful when urgent delivery is not needed.</p>

    </div>

  `;


  updateHoursDots();

}


function showHoursSheetSecond(direction = "left"){

  hoursSheetPage = 2;


  const content =
    document.getElementById("hoursSheetContent");


  content.className =
    "hoursSheetContent " +
    (
      direction === "left"
      ? "hoursSlideLeft"
      : "hoursSlideRight"
    );


  content.innerHTML = `

    <img
      src="banner/hours.png"
      class="hoursSheetImg"
      alt="">


    <h3 class="hoursSheetTitle">
      Instant Delivery
    </h3>


    <div class="hoursSheetPoints">

     <p>1. Instant Delivery is for quick and urgent orders.</p>
<p>2. Delivery charges may apply for instant orders.</p>
<p>3. Shop above ₹300 and get free delivery.</p>
<p>4. Your order will be prepared immediately.</p>
<p>5. Delivery time is usually 10–15 minutes.</p>
<p>6. Time may change based on distance and delivery partner availability.</p>

    </div>

  `;


  updateHoursDots();

}


function updateHoursDots(){

  const dot1 =
    document.getElementById("hoursDot1");

  const dot2 =
    document.getElementById("hoursDot2");


  if(hoursSheetPage === 1){

    dot1.classList.add("active");
    dot2.classList.remove("active");

  }else{

    dot1.classList.remove("active");
    dot2.classList.add("active");

  }

}