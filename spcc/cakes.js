(function(){
"use strict";

const SECTION_ID="cezooSpecialCakeItems";
const TABLE="cakes";
const CART_KEY="cezooCakeCart";

let section=null;
let cakes=[];
let cart={};

let loaded=false;
let loading=false;
let seen=false;

let selectedCake=null;

let overlay=null;
let sheet=null;
let cartBar=null;

let io=null;
let modeObs=null;
let channel=null;


document.readyState==="loading"
?document.addEventListener("DOMContentLoaded",init,{once:true})
:init();


function init(){

  section=
    document.getElementById(
      SECTION_ID
    );


  if(!section){

    console.error(
      "#"+SECTION_ID+" not found"
    );

    return;
  }


  if(
    section.dataset.cakesReady===
    "1"
  ){
    return;
  }


  section.dataset.cakesReady=
    "1";


  loadCart();

  injectCSS();

  createSheet();

  createCart();

  bind();

  lazyWatch();

  modeWatch();

  realtime();

  syncCart();

}


/* =========================================================
   SPECIAL MODE
========================================================= */

function special(){

  return (
    document.body.getAttribute(
      "data-cezoo-mode"
    ) === "special"
  );

}


/* =========================================================
   NO PRELOAD
   Cakes load only when this section becomes visible
   AND Special mode is active.
========================================================= */

function lazyWatch(){

  if(io){
    return;
  }


  io=
    new IntersectionObserver(
      entries=>{

        if(
          entries.some(
            entry=>
              entry.isIntersecting
          )
        ){

          seen=true;


          io.disconnect();

          io=null;


          if(
            special() &&
            !loaded &&
            !loading
          ){

            loadCakes();

          }

        }

      },
      {
        threshold:.01,
        rootMargin:"0px"
      }
    );


  io.observe(
    section
  );

}


function modeWatch(){

  if(modeObs){
    return;
  }


  modeObs=
    new MutationObserver(
      ()=>{

        syncCart();


        if(
          special() &&
          seen &&
          !loaded &&
          !loading
        ){

          loadCakes();

        }

      }
    );


  modeObs.observe(
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
   REALTIME
========================================================= */

function realtime(){

  if(
    channel ||
    !window._supabaseClient
  ){
    return;
  }


  channel=
    window._supabaseClient
      .channel(
        "cezoo-cakes-live"
      )
      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:TABLE
        },
        ()=>{

          if(
            special() &&
            seen
          ){

            loaded=false;

            loadCakes();

          }

        }
      )
      .subscribe();

}


/* =========================================================
   CART STORAGE
========================================================= */

function loadCart(){

  try{

    const saved=
      JSON.parse(
        localStorage.getItem(
          CART_KEY
        ) || "{}"
      );


    cart=
      saved &&
      typeof saved==="object" &&
      !Array.isArray(saved)

      ? saved
      : {};


  }catch{

    cart={};

  }


  cleanCart();

}


function cleanCart(){

  Object.keys(
    cart
  ).forEach(
    key=>{

      if(
        (
          Number(
            cart[key]?.qty
          ) || 0
        ) <= 0
      ){

        delete cart[key];

      }

    }
  );


  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

}


function saveCart(){

  cleanCart();

  updateCart();


  window.dispatchEvent(
    new CustomEvent(
      "cezooCakeCartChanged",
      {
        detail:{
          cart:
            JSON.parse(
              JSON.stringify(cart)
            )
        }
      }
    )
  );

}


/* =========================================================
   CSS
========================================================= */

function injectCSS(){

  if(document.getElementById("czCakeStyles")){
    return;
  }

  const style=document.createElement("style");
  style.id="czCakeStyles";

  style.textContent=`
  #${SECTION_ID},
  #${SECTION_ID} *{
    box-sizing:border-box;
  }

  #${SECTION_ID}{
    width:100%;
    padding:10px 14px 24px;
    background:#fff;
    color:#161616;
    font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
  }

  /* ---------- STATES ---------- */

  .czCakeState{
    min-height:130px;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px 14px;
    color:#787878;
    font-size:12px;
    font-weight:600;
    text-align:center;
  }

  /* ---------- SHIMMER ---------- */

  .czCakeShimmer,
  .czCakeGrid{
    width:100%;
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:18px 12px;
  }

  .czCakeShimmerCard{
    min-width:0;
  }

  .czCakeShimmerImage,
  .czCakeShimmerLine{
    position:relative;
    overflow:hidden;
    background:#f2f3f5;
  }

  .czCakeShimmerImage{
    width:100%;
    aspect-ratio:1 / 1;
    border-radius:18px;
  }

  .czCakeShimmerLine{
    height:10px;
    margin-top:8px;
    border-radius:999px;
  }

  .czCakeShimmerLine.short{
    width:62%;
  }

  .czCakeShimmerImage::after,
  .czCakeShimmerLine::after{
    content:"";
    position:absolute;
    inset:0;
    transform:translateX(-100%);
    background:linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,.9) 50%,
      transparent 100%
    );
    animation:czCakeShimmer 1.15s infinite;
  }

  @keyframes czCakeShimmer{
    100%{transform:translateX(100%);}
  }

  /* ---------- PRODUCT GRID ---------- */

  .czCakeCard{
    width:100%;
    min-width:0;
    padding:0;
    border:0;
    background:transparent;
    border-radius:0;
    outline:none;
    overflow:visible;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
  }

  .czCakeCard:active .czCakeImageBox{
    transform:scale(.985);
  }

  .czCakeImageBox{
    position:relative;
    width:100%;
    aspect-ratio:1 / 1;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    border:1px solid #f0f0f0;
    border-radius:18px;
    background:linear-gradient(180deg,#fafafa 0%,#fff 100%);
    transition:transform .16s ease;
  }

  .czCakeImage{
    width:100%;
    height:100%;
    display:block;
    padding:8px;
    object-fit:contain;
    object-position:center;
    user-select:none;
    pointer-events:none;
    -webkit-user-drag:none;
  }

  .czCakeInfo{
    width:100%;
    padding:9px 2px 0;
    text-align:left;
  }

  .czCakeName{
    margin:0;
    min-height:25px;
    display:-webkit-box;
    overflow:hidden;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:2;
    color:#181818;
    font-size:14px;
    font-weight:750;
    line-height:1.22;
    letter-spacing:-.18px;
  }

  .czCakeWeights{
    margin-top:4px;
    overflow:hidden;
    color:#818181;
    font-size:10px;
    font-weight:550;
    line-height:1.25;
    white-space:nowrap;
    text-overflow:ellipsis;
  }

  .czCakeBottom{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:8px;
    margin-top:9px;
  }

  .czCakePriceWrap{
    min-width:0;
    flex:1;
  }

  .czCakeStarting{
    color:#8d8d8d;
    font-size:9px;
    font-weight:550;
    line-height:1.1;
  }

  .czCakePrice{
    margin-top:3px;
    color:#111;
    font-size:15px;
    font-weight:800;
    line-height:1;
    letter-spacing:-.2px;
  }

  /* ---------- ADD / QTY ---------- */

  .czCakeAdd,
  .czCakeOptionAdd{
    flex:0 0 auto;
    width:72px;
    height:34px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:0;
    margin:0;
    border:1px solid #dfe9e4;
    border-radius:10px;
    background:#fff;
    color:#14875c;
    font-size:11px;
    font-weight:800;
    line-height:1;
    cursor:pointer;
    box-shadow:0 1px 2px rgba(0,0,0,.03);
    transition:background .15s ease,border-color .15s ease,transform .15s ease;
  }

  .czCakeAdd:active,
  .czCakeOptionAdd:active{
    transform:scale(.96);
    background:#f5fbf8;
  }

  .czCakeAdd:disabled{
    color:#aaa;
    border-color:#ececec;
    background:#fafafa;
    cursor:default;
    box-shadow:none;
  }

  .czCakeQty,
  .czCakeOptionQty{
    flex:0 0 auto;
    width:72px;
    height:34px;
    display:grid;
    grid-template-columns:24px 24px 24px;
    align-items:center;
    justify-items:center;
    overflow:hidden;
    border-radius:10px;
    background:#168c60;
    box-shadow:0 4px 10px rgba(22,140,96,.16);
  }

  .czCakeQty button,
  .czCakeOptionQty button{
    width:24px;
    height:34px;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0;
    margin:0;
    border:0;
    background:transparent;
    color:#fff;
    font:500 17px/1 Arial,sans-serif;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
  }

  .czCakeQty span,
  .czCakeOptionQty span{
    width:24px;
    height:34px;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    font-size:11px;
    font-weight:800;
    line-height:1;
  }

  /* ---------- OVERLAY / BOTTOM SHEET ---------- */

  .czCakeOverlay{
    position:fixed;
    inset:0;
    z-index:2147483500;
    background:rgba(18,18,18,.38);
    opacity:0;
    visibility:hidden;
    pointer-events:none;
    backdrop-filter:blur(2px);
    -webkit-backdrop-filter:blur(2px);
    transition:opacity .2s ease,visibility .2s ease;
  }

  .czCakeOverlay.show{
    opacity:1;
    visibility:visible;
    pointer-events:auto;
  }

  .czCakeSheet{
    position:fixed;
    left:50%;
    bottom:0;
    z-index:2147483501;
    width:min(100%,520px);
    max-height:min(78vh,720px);
    overflow-y:auto;
    overscroll-behavior:contain;
    padding:8px 16px calc(18px + env(safe-area-inset-bottom));
    border:1px solid #ececec;
    border-bottom:0;
    border-radius:24px 24px 0 0;
    background:#fff;
    box-shadow:0 -18px 48px rgba(0,0,0,.14);
    transform:translate3d(-50%,105%,0);
    transition:transform .24s cubic-bezier(.22,.75,.25,1);
    scrollbar-width:none;
  }

  .czCakeSheet::-webkit-scrollbar{
    display:none;
  }

  .czCakeSheet.show{
    transform:translate3d(-50%,0,0);
  }

  .czCakeHandle{
    width:38px;
    height:4px;
    margin:1px auto 8px;
    border-radius:999px;
    background:#d7d7d7;
  }

  .czCakeClose{
    position:absolute;
    top:12px;
    right:13px;
    z-index:2;
    width:34px;
    height:34px;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0;
    border:1px solid #ededed;
    border-radius:50%;
    background:rgba(255,255,255,.94);
    color:#252525;
    font-size:20px;
    line-height:1;
    cursor:pointer;
  }

  .czCakeSheetImageBox{
    width:100%;
    height:188px;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    border-radius:18px;
    background:#fafafa;
  }

  .czCakeSheetImage{
    width:min(72%,250px);
    height:170px;
    display:block;
    object-fit:contain;
    object-position:center;
  }

  .czCakeSheetName{
    margin:14px 44px 0 2px;
    color:#171717;
    font-size:19px;
    font-weight:800;
    line-height:1.18;
    letter-spacing:-.3px;
  }

  /* ---------- VARIANTS ---------- */

  .czCakeOptionsList{
    display:flex;
    flex-direction:column;
    gap:8px;
    margin-top:14px;
  }

  .czCakeOptionRow{
    min-height:66px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    padding:11px 12px;
    border:1px solid #ededed;
    border-radius:14px;
    background:#fff;
  }

  .czCakeOptionText{
    flex:1;
    min-width:0;
  }

  .czCakeOptionTitle{
    color:#1b1b1b;
    font-size:13px;
    font-weight:750;
    line-height:1.2;
  }

  .czCakeOptionQuantity{
    margin-top:4px;
    color:#888;
    font-size:10px;
    font-weight:550;
    line-height:1.15;
  }

  .czCakeOptionPrice{
    margin-top:6px;
    color:#111;
    font-size:13px;
    font-weight:800;
    line-height:1;
  }

  .czCakeOptionAction{
    flex:0 0 auto;
  }

  /* ---------- FLY TO CART ---------- */

  .czCakeFlyingImage{
    position:fixed;
    z-index:2147483646;
    width:58px;
    height:58px;
    display:block;
    object-fit:contain;
    pointer-events:none;
    transform:translate3d(0,0,0) scale(1);
    opacity:1;
    will-change:transform,opacity;
    filter:drop-shadow(0 8px 12px rgba(0,0,0,.12));
  }

  /* ---------- FLOATING CART ---------- */

  .czCakeCart{
    position:fixed;
    left:50%;
    bottom:calc(18px + env(safe-area-inset-bottom));
    z-index:2147483450;
    width:min(calc(100% - 24px),496px);
    min-height:66px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:9px 9px 9px 11px;
    border:1px solid #e9e9e9;
    border-radius:18px;
    background:rgba(255,255,255,.97);
    box-shadow:0 12px 34px rgba(0,0,0,.14);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    transform:translate3d(-50%,100px,0);
    opacity:0;
    pointer-events:none;
    transition:transform .24s cubic-bezier(.22,.75,.25,1),opacity .18s ease;
  }

  .czCakeCart.show{
    transform:translate3d(-50%,0,0);
    opacity:1;
    pointer-events:auto;
  }

  .czCakeCartLeft{
    flex:1;
    min-width:0;
    display:flex;
    align-items:center;
    gap:10px;
    overflow:hidden;
  }

  .czCakeCartImages{
    min-width:42px;
    display:flex;
    align-items:center;
  }

  .czCakeThumb{
    width:42px;
    height:42px;
    flex:0 0 42px;
    display:block;
    object-fit:contain;
    border:2px solid #fff;
    border-radius:12px;
    background:#f5f5f5;
    box-shadow:0 2px 7px rgba(0,0,0,.12);
  }

  .czCakeThumb + .czCakeThumb{
    margin-left:-10px;
  }

  .czCakeThumbFallback{
    display:flex;
    align-items:center;
    justify-content:center;
    color:#777;
    font-size:10px;
    font-weight:700;
  }

  .czCakeCartText{
    flex:1;
    min-width:0;
    overflow:hidden;
  }

  .czCakeCartTitle{
    overflow:hidden;
    color:#202020;
    font-size:12px;
    font-weight:750;
    line-height:1.2;
    white-space:nowrap;
    text-overflow:ellipsis;
  }

  .czCakeCartSub{
    margin-top:3px;
    color:#8c8c8c;
    font-size:9px;
    font-weight:550;
  }

  .czCakeComingSoon{
    position:relative;
    flex:0 0 auto;
    width:94px;
    height:50px;
    display:flex;
    align-items:flex-start;
    justify-content:center;
    padding:0;
    border:0;
    background:transparent;
    user-select:none;
    overflow:visible;
  }

  .czCakeHanger{
    position:relative;
    width:88px;
    height:48px;
    transform-origin:50% 0;
    animation:czCakeBoardSwing 2.2s ease-in-out infinite;
  }

  .czCakeHanger::before,
  .czCakeHanger::after{
    content:"";
    position:absolute;
    top:0;
    width:1.5px;
    height:13px;
    background:#6f6f6f;
    border-radius:999px;
  }

  .czCakeHanger::before{
    left:18px;
    transform:rotate(8deg);
    transform-origin:top;
  }

  .czCakeHanger::after{
    right:18px;
    transform:rotate(-8deg);
    transform-origin:top;
  }

  .czCakeComingSoonBoard{
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
    font-weight:850;
    line-height:1;
    letter-spacing:.25px;
    white-space:nowrap;
    box-shadow:0 2px 5px rgba(0,0,0,.08);
  }

  .czCakeComingSoonBoard::before,
  .czCakeComingSoonBoard::after{
    content:"";
    position:absolute;
    top:-3px;
    width:5px;
    height:5px;
    border-radius:50%;
    background:#333;
  }

  .czCakeComingSoonBoard::before{
    left:14px;
  }

  .czCakeComingSoonBoard::after{
    right:14px;
  }

  @keyframes czCakeBoardSwing{
    0%,100%{transform:rotate(-3deg);}
    50%{transform:rotate(3deg);}
  }

  @media(min-width:700px){
    #${SECTION_ID}{
      padding-left:18px;
      padding-right:18px;
    }

    .czCakeShimmer,
    .czCakeGrid{
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:22px 16px;
    }
  }

  @media(max-width:370px){
    #${SECTION_ID}{
      padding-left:10px;
      padding-right:10px;
    }

    .czCakeShimmer,
    .czCakeGrid{
      gap:15px 8px;
    }

    .czCakeName{
      font-size:13px;
    }

    .czCakeWeights{
      font-size:9px;
    }

    .czCakeAdd,
    .czCakeOptionAdd,
    .czCakeQty,
    .czCakeOptionQty{
      width:66px;
    }

    .czCakeQty,
    .czCakeOptionQty{
      grid-template-columns:22px 22px 22px;
    }

    .czCakeQty button,
    .czCakeOptionQty button,
    .czCakeQty span,
    .czCakeOptionQty span{
      width:22px;
    }
  }

  @media(prefers-reduced-motion:reduce){
    .czCakeOverlay,
    .czCakeSheet,
    .czCakeCart,
    .czCakeImageBox{
      transition:none;
    }

    .czCakeShimmerImage::after,
    .czCakeShimmerLine::after{
      animation:none;
    }

    .czCakeFlyingImage{
      display:none !important;
    }

    .czCakeHanger{
      animation:none;
    }
  }
  `;

  document.head.appendChild(style);
}


/* =========================================================
   SHIMMER
========================================================= */

function shimmer(){

  section.innerHTML=`

    <div class="czCakeShimmer">

      ${
        Array.from(
          {length:4}
        )
        .map(
          ()=>`

            <div
              class="czCakeShimmerCard"
            >

              <div
                class="czCakeShimmerImage"
              ></div>

              <div
                class="czCakeShimmerLine"
              ></div>

              <div
                class="czCakeShimmerLine short"
              ></div>

            </div>

          `
        )
        .join("")
      }

    </div>

  `;

}


/* =========================================================
   LOAD
========================================================= */

async function loadCakes(){

  if(
    loading ||
    loaded ||
    !special() ||
    !seen
  ){
    return;
  }


  if(
    !window._supabaseClient
  ){

    console.error(
      "Supabase client not found"
    );

    return;
  }


  loading=true;

  shimmer();


  try{

    const {
      data,
      error
    }=
      await window._supabaseClient
        .from(
          TABLE
        )
        .select(
          "id,cake_name,image,prices,bakery_name,is_available,created_at"
        )
        .order(
          "id",
          {
            ascending:true
          }
        );


    if(error){
      throw error;
    }


    cakes=
      Array.isArray(data)
      ? data
      : [];


    loaded=true;


    render();

    updateCart();


  }catch(error){

    console.error(
      "Cake load error:",
      error
    );


    section.innerHTML=`

      <div class="czCakeState">Unable to load cakes</div>

    `;


  }finally{

    loading=false;

  }

}


/* =========================================================
   MAIN CARDS
========================================================= */

function availableWeights(
  cake
){

  const cakePrices=
    prices(
      cake.prices
    );


  const set=
    new Set();


  Object.values(
    cakePrices
  ).forEach(
    group=>{

      if(
        group &&
        typeof group==="object"
      ){

        Object.keys(
          group
        ).forEach(
          weight=>
            set.add(
              weight
            )
        );

      }

    }
  );


  const order=[
    "0.5kg",
    "1kg",
    "1.5kg",
    "2kg"
  ];


  return order
    .filter(
      weight=>
        set.has(
          weight
        )
    )
    .map(
      showWeight
    )
    .join(" • ");

}


function render(){

  if(
    !cakes.length
  ){

    section.innerHTML=`

      <div class="czCakeState">No cakes available</div>

    `;

    return;
  }


  section.innerHTML=`

    <div class="czCakeGrid">

      ${
        cakes.map(
          cake=>{

            const qty=
              cakeTotal(
                cake.id
              );


            return `

              <article
                class="czCakeCard"
                data-card="${cake.id}"
              >

                <div
                  class="czCakeImageBox"
                >

                  ${
                    cake.image

                    ? `
                      <img
                        class="czCakeImage"
                        src="${esc(cake.image)}"
                        alt="${esc(cake.cake_name||"")}"
                        loading="lazy"
                        decoding="async"
                      >
                    `

                    : ""
                  }

                </div>


                <div class="czCakeInfo">

                  <div class="czCakeName">
                    ${esc(cake.cake_name||"")}
                  </div>


                  <div class="czCakeWeights">
                    ${esc(
                      availableWeights(
                        cake
                      )
                    )}
                  </div>


                  <div class="czCakeBottom">

                    <div class="czCakePriceWrap">

                      <div class="czCakeStarting">
                        Starting from
                      </div>

                      <div class="czCakePrice">
                        ₹${money(minPrice(cake))}
                      </div>

                    </div>


                    <div
                      data-action="${cake.id}"
                    >
                      ${
                        cake.is_available===false

                        ? soon()

                        : qty>0

                          ? qtyHTML(
                              cake.id,
                              qty
                            )

                          : addHTML(
                              cake.id
                            )
                      }
                    </div>

                  </div>

                </div>

              </article>

            `;

          }
        )
        .join("")
      }

    </div>

  `;

}


function addHTML(
  id
){

  return `

    <button
      class="czCakeAdd"
      type="button"
      data-open="${id}"
    >
      ADD
    </button>

  `;

}


function soon(){

  return `

    <button
      class="czCakeAdd"
      type="button"
      disabled
    >
      Soon
    </button>

  `;

}


function qtyHTML(
  id,
  qty
){

  return `

    <div class="czCakeQty">

      <button
        data-minus="${id}"
        type="button"
        aria-label="Decrease"
      >
        −
      </button>

      <span>
        ${qty}
      </span>

      <button
        data-plus="${id}"
        type="button"
        aria-label="Increase"
      >
        +
      </button>

    </div>

  `;

}


/* =========================================================
   SHEET
========================================================= */

function createSheet(){

  overlay=
    document.createElement(
      "div"
    );


  overlay.className=
    "czCakeOverlay";


  document.body.appendChild(
    overlay
  );


  sheet=
    document.createElement(
      "div"
    );


  sheet.className=
    "czCakeSheet";


  sheet.innerHTML=`

    <div
      class="czCakeHandle"
    ></div>

    <button
      class="czCakeClose"
      type="button"
      aria-label="Close"
    >
      ×
    </button>

    <div
      id="czCakeSheetInner"
    ></div>

  `;


  document.body.appendChild(
    sheet
  );

}


function openSheet(
  cake
){

  selectedCake=
    cake;


  renderSheet();


  overlay.classList.add(
    "show"
  );


  sheet.classList.add(
    "show"
  );

}


function closeSheet(){

  overlay.classList.remove(
    "show"
  );


  sheet.classList.remove(
    "show"
  );


  selectedCake=null;

}


function optionActionHTML(
  cake,
  type,
  weight
){

  const id=
    cartId(
      cake.id,
      type,
      weight
    );


  const qty=
    Number(
      cart[id]?.qty
    ) || 0;


  if(
    qty>0
  ){

    return `

      <div
        class="czCakeOptionQty"
      >

        <button
          type="button"
          data-option-minus="${esc(id)}"
        >
          −
        </button>

        <span>
          ${qty}
        </span>

        <button
          type="button"
          data-option-plus="${esc(id)}"
        >
          +
        </button>

      </div>

    `;

  }


  return `

    <button
      class="czCakeOptionAdd"
      type="button"
      data-option-add="${esc(id)}"
    >
      ADD
    </button>

  `;

}


function renderSheet(){

  if(
    !selectedCake
  ){
    return;
  }


  const inner=
    document.getElementById(
      "czCakeSheetInner"
    );


  const cakePrices=
    prices(
      selectedCake.prices
    );


  const options=[];


  Object.entries(
    cakePrices
  ).forEach(
    ([type,weights])=>{

      if(
        !weights ||
        typeof weights!=="object"
      ){
        return;
      }


      Object.entries(
        weights
      ).forEach(
        ([weight,value])=>{

          const price=
            Number(value) || 0;


          if(
            price<=0
          ){
            return;
          }


          options.push(
            {
              type,
              weight,
              price
            }
          );

        }
      );

    }
  );


  const order={
    "0.5kg":0,
    "1kg":1,
    "1.5kg":2,
    "2kg":3
  };


  options.sort(
    (a,b)=>{

      if(
        a.type!==b.type
      ){

        if(
          a.type==="egg"
        ){
          return -1;
        }


        if(
          b.type==="egg"
        ){
          return 1;
        }

      }


      return (
        order[a.weight] ?? 99
      ) -
      (
        order[b.weight] ?? 99
      );

    }
  );


  inner.innerHTML=`

    <div
      class="czCakeSheetImageBox"
    >

      ${
        selectedCake.image

        ? `
          <img
            id="czCakeActiveSheetImage"
            class="czCakeSheetImage"
            src="${esc(selectedCake.image)}"
            alt="${esc(selectedCake.cake_name||"")}"
            loading="lazy"
            decoding="async"
          >
        `

        : ""
      }

    </div>


    <div class="czCakeSheetName">
      ${esc(selectedCake.cake_name||"")}
    </div>


    <div class="czCakeOptionsList">

      ${
        options.map(
          option=>{

            const typeName=
              option.type==="eggless"

              ? "Eggless"

              : "Egg";


            const id=
              cartId(
                selectedCake.id,
                option.type,
                option.weight
              );


            return `

              <div
                class="czCakeOptionRow"
                data-option-row="${esc(id)}"
              >

                <div
                  class="czCakeOptionText"
                >

                  <div
                    class="czCakeOptionTitle"
                  >
                    ${esc(typeName)}
                  </div>


                  <div
                    class="czCakeOptionQuantity"
                  >
                    Quantity:
                    ${esc(
                      showWeight(
                        option.weight
                      )
                    )}
                  </div>


                  <div
                    class="czCakeOptionPrice"
                  >
                    ₹${money(option.price)}
                  </div>

                </div>


                <div
                  class="czCakeOptionAction"
                  data-option-action="${esc(id)}"
                >
                  ${
                    optionActionHTML(
                      selectedCake,
                      option.type,
                      option.weight
                    )
                  }
                </div>

              </div>

            `;

          }
        )
        .join("")
      }

    </div>

  `;

}


/* =========================================================
   EVENTS
========================================================= */

function bind(){

  section.addEventListener(
    "click",
    event=>{

      const open=
        event.target.closest(
          "[data-open]"
        );


      if(open){

        event.preventDefault();

        event.stopPropagation();


        const cake=
          findCake(
            open.dataset.open
          );


        if(cake){
          openSheet(cake);
        }


        return;
      }


      const minus=
        event.target.closest(
          "[data-minus]"
        );


      if(minus){

        event.preventDefault();

        event.stopPropagation();


        const cake=
          findCake(
            minus.dataset.minus
          );


        if(cake){
          openSheet(cake);
        }


        return;
      }


      const plus=
        event.target.closest(
          "[data-plus]"
        );


      if(plus){

        event.preventDefault();

        event.stopPropagation();


        const cake=
          findCake(
            plus.dataset.plus
          );


        if(cake){
          openSheet(cake);
        }


        return;
      }


      const card=
        event.target.closest(
          "[data-card]"
        );


      if(card){

        const cake=
          findCake(
            card.dataset.card
          );


        if(cake){
          openSheet(cake);
        }

      }

    }
  );


  overlay.addEventListener(
    "click",
    closeSheet
  );


  sheet
    .querySelector(
      ".czCakeClose"
    )
    .addEventListener(
      "click",
      closeSheet
    );


  sheet.addEventListener(
    "click",
    handleSheetClick
  );

}


function handleSheetClick(
  event
){

  if(
    !selectedCake
  ){
    return;
  }


  const add=
    event.target.closest(
      "[data-option-add]"
    );


  if(add){

    event.preventDefault();

    event.stopPropagation();


    const parsed=
      parseCartId(
        add.dataset.optionAdd
      );


    if(!parsed){
      return;
    }


    const sheetImage=
      document.getElementById(
        "czCakeActiveSheetImage"
      );


    flyCakeToCart(
      selectedCake,
      sheetImage || add,
      ()=>{

        setVariantQty(
          selectedCake,
          parsed.type,
          parsed.weight,
          1
        );

      }
    );


    return;
  }


  const minus=
    event.target.closest(
      "[data-option-minus]"
    );


  if(minus){

    event.preventDefault();

    event.stopPropagation();


    const id=
      minus.dataset.optionMinus;


    const parsed=
      parseCartId(
        id
      );


    if(!parsed){
      return;
    }


    setVariantQty(
      selectedCake,
      parsed.type,
      parsed.weight,
      (
        Number(
          cart[id]?.qty
        ) || 0
      ) - 1
    );


    return;
  }


  const plus=
    event.target.closest(
      "[data-option-plus]"
    );


  if(plus){

    event.preventDefault();

    event.stopPropagation();


    const id=
      plus.dataset.optionPlus;


    const parsed=
      parseCartId(
        id
      );


    if(!parsed){
      return;
    }


    setVariantQty(
      selectedCake,
      parsed.type,
      parsed.weight,
      (
        Number(
          cart[id]?.qty
        ) || 0
      ) + 1
    );

  }

}


/* =========================================================
   VARIANT CART
========================================================= */

function cartId(
  cakeId,
  type,
  weight
){

  return `cake_${cakeId}_${type}_${weight}`;

}


function parseCartId(
  id
){

  if(
    !selectedCake
  ){
    return null;
  }


  const prefix=
    `cake_${selectedCake.id}_`;


  if(
    !String(id).startsWith(
      prefix
    )
  ){
    return null;
  }


  const rest=
    String(id).slice(
      prefix.length
    );


  const underscore=
    rest.indexOf(
      "_"
    );


  if(
    underscore<0
  ){
    return null;
  }


  return {
    type:
      rest.slice(
        0,
        underscore
      ),

    weight:
      rest.slice(
        underscore+1
      )
  };

}


function setVariantQty(
  cake,
  type,
  weight,
  qty
){

  qty=
    Math.max(
      0,
      Number(qty) || 0
    );


  const cakePrices=
    prices(
      cake.prices
    );


  const price=
    Number(
      cakePrices?.[type]?.[weight]
    ) || 0;


  const id=
    cartId(
      cake.id,
      type,
      weight
    );


  if(
    qty<=0
  ){

    delete cart[id];


  }else{

    const old=
      cart[id];


    cart[id]={
      id,

      cake_id:
        cake.id,

      name:
        cake.cake_name || "",

      image:
        cake.image || "",

      bakery_name:
        cake.bakery_name || "",

      type,
      weight,
      price,
      qty,

      added_at:
        old?.added_at ||
        Date.now()
    };

  }


  saveCart();


  updateCard(
    cake.id
  );


  updateOptionAction(
    cake,
    type,
    weight
  );

}


function updateOptionAction(
  cake,
  type,
  weight
){

  const id=
    cartId(
      cake.id,
      type,
      weight
    );


  const action=
    Array.from(
      document.querySelectorAll(
        "[data-option-action]"
      )
    )
    .find(
      element=>
        String(
          element.getAttribute(
            "data-option-action"
          )
        ) ===
        String(id)
    );


  if(
    !action
  ){
    return;
  }


  action.innerHTML=
    optionActionHTML(
      cake,
      type,
      weight
    );

}


/* =========================================================
   MAIN CARD ACTION ONLY
   No full grid re-render = no blinking.
========================================================= */

function updateCard(
  cakeId
){

  const cake=
    findCake(
      cakeId
    );


  if(
    !cake
  ){
    return;
  }


  const action=
    Array.from(
      section.querySelectorAll(
        "[data-action]"
      )
    )
    .find(
      element=>
        String(
          element.dataset.action
        ) ===
        String(cakeId)
    );


  if(
    !action
  ){
    return;
  }


  const qty=
    cakeTotal(
      cakeId
    );


  action.innerHTML=
    cake.is_available===false

    ? soon()

    : qty>0

      ? qtyHTML(
          cakeId,
          qty
        )

      : addHTML(
          cakeId
        );

}


function cakeTotal(
  cakeId
){

  return Object.values(
    cart
  )
  .reduce(
    (sum,item)=>
      String(
        item.cake_id
      ) ===
      String(cakeId)

      ? sum+
        (
          Number(
            item.qty
          ) || 0
        )

      : sum,
    0
  );

}


/* =========================================================
   FLY CAKE TO CART
   Cart bar appears only after the image reaches the target.
========================================================= */

function flyCakeToCart(
  cake,
  sourceElement,
  done
){

  const finish=
    typeof done==="function"

    ? done

    : ()=>{};


  if(
    !cake?.image ||
    !sourceElement ||
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ){

    finish();

    return;
  }


  const sourceRect=
    sourceElement
      .getBoundingClientRect();


  const size=
    Math.min(
      58,
      Math.max(
        46,
        sourceRect.width*.35
      )
    );


  const startX=
    sourceRect.left+
    sourceRect.width/2-
    size/2;


  const startY=
    sourceRect.top+
    sourceRect.height/2-
    size/2;


  const cartImages=
    document.getElementById(
      "czCakeCartImages"
    );


  let targetX=
    28;


  let targetY=
    window.innerHeight-
    82;


  if(
    cartBar?.classList.contains(
      "show"
    ) &&
    cartImages
  ){

    const targetRect=
      cartImages
        .getBoundingClientRect();


    targetX=
      targetRect.left+
      Math.max(
        18,
        targetRect.width/2
      )-
      size/2;


    targetY=
      targetRect.top+
      targetRect.height/2-
      size/2;

  }


  const flying=
    document.createElement(
      "img"
    );


  flying.src=
    cake.image;


  flying.className=
    "czCakeFlyingImage";


  flying.style.width=
    `${size}px`;


  flying.style.height=
    `${size}px`;


  flying.style.left=
    `${startX}px`;


  flying.style.top=
    `${startY}px`;


  document.body.appendChild(
    flying
  );


  const dx=
    targetX-
    startX;


  const dy=
    targetY-
    startY;


  const animation=
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
              ${dx*.45}px,
              ${dy*.36}px,
              0
            ) scale(.82)`,
          opacity:.95,
          offset:.46
        },

        {
          transform:
            `translate3d(
              ${dx}px,
              ${dy}px,
              0
            ) scale(.28)`,
          opacity:.05
        }
      ],
      {
        duration:460,

        easing:
          "cubic-bezier(.22,.75,.25,1)",

        fill:"forwards"
      }
    );


  let completed=false;


  const complete=
    ()=>{

      if(
        completed
      ){
        return;
      }


      completed=true;


      flying.remove();


      finish();

    };


  animation.onfinish=
    complete;


  animation.oncancel=
    complete;

}


/* =========================================================
   CART
========================================================= */

function cartItems(){

  return Object.values(
    cart
  )
  .filter(
    item=>
      (
        Number(
          item.qty
        ) || 0
      ) > 0
  )
  .sort(
    (a,b)=>
      (
        Number(
          a.added_at
        ) || 0
      ) -
      (
        Number(
          b.added_at
        ) || 0
      )
  );

}


function createCart(){

  cartBar=
    document.createElement(
      "div"
    );


  cartBar.className=
    "czCakeCart";


  cartBar.id=
    "czCakeCart";


  cartBar.innerHTML=`

    <div class="czCakeCartLeft">

      <div
        id="czCakeCartImages"
        class="czCakeCartImages"
      ></div>


      <div
        class="czCakeCartText"
      >

        <div
          id="czCakeCartTitle"
          class="czCakeCartTitle"
        >
          Cake Cart
        </div>


        <div
          id="czCakeCartSub"
          class="czCakeCartSub"
        ></div>

      </div>

    </div>


    <div
      class="czCakeComingSoon"
      aria-label="Coming soon"
    >
      <div class="czCakeHanger" aria-hidden="true">
        <div class="czCakeComingSoonBoard">
          Coming Soon
        </div>
      </div>
    </div>

  `;


  document.body.appendChild(
    cartBar
  );

}


function updateCart(){

  if(
    !cartBar
  ){
    return;
  }


  const items=
    cartItems();


  const total=
    items.reduce(
      (sum,item)=>
        sum+
        (
          Number(
            item.qty
          ) || 0
        ),
      0
    );


  const images=
    document.getElementById(
      "czCakeCartImages"
    );


  if(
    total<=0
  ){

    cartBar.classList.remove(
      "show"
    );


    if(images){

      images.innerHTML="";

      images.dataset.sig="";

    }


    return;
  }


  const visible=
    items.slice(
      -3
    );


  const sig=
    visible
      .map(
        item=>
          `${item.id}|${item.image}`
      )
      .join(
        "||"
      );


  if(
    images &&
    images.dataset.sig!==sig
  ){

    images.dataset.sig=
      sig;


    images.innerHTML=
      visible.map(
        (item,index)=>

          item.image

          ? `
            <img
              class="czCakeThumb"
              src="${esc(item.image)}"
              alt=""
              decoding="async"
            >
          `

          : `
            <div
              class="czCakeThumb czCakeThumbFallback"
            >
              ${index+1}
            </div>
          `
      )
      .join("");

  }


  document.getElementById(
    "czCakeCartTitle"
  ).textContent=

    items.length===1

    ? (
        items[0].name ||
        "Cake Cart"
      )

    : `${items.length} cakes added`;


  document.getElementById(
    "czCakeCartSub"
  ).textContent=

    total===1

    ? "1 item"

    : `${total} items`;


  syncCart();

}


function syncCart(){

  if(
    !cartBar
  ){
    return;
  }


  const total=
    cartItems()
      .reduce(
        (sum,item)=>
          sum+
          (
            Number(
              item.qty
            ) || 0
          ),
        0
      );


  cartBar.classList.toggle(
    "show",
    special() &&
    total>0
  );

}


/* =========================================================
   PRICE HELPERS
========================================================= */

function prices(
  value
){

  if(
    value &&
    typeof value==="object" &&
    !Array.isArray(value)
  ){

    return value;
  }


  try{

    return JSON.parse(
      value || "{}"
    );

  }catch{

    return {};

  }

}


function minPrice(
  cake
){

  const values=[];


  Object.values(
    prices(
      cake.prices
    )
  )
  .forEach(
    group=>{

      if(
        group &&
        typeof group==="object"
      ){

        Object.values(
          group
        )
        .forEach(
          value=>{

            const number=
              Number(value);


            if(
              Number.isFinite(number) &&
              number>0
            ){

              values.push(
                number
              );

            }

          }
        );

      }

    }
  );


  return values.length

  ? Math.min(
      ...values
    )

  : 0;

}


function showWeight(
  weight
){

  return (
    {
      "0.5kg":"½ KG",
      "1kg":"1 KG",
      "1.5kg":"1.5 KG",
      "2kg":"2 KG"
    }
  )[weight] || weight;

}


/* =========================================================
   UTILS
========================================================= */

function findCake(
  id
){

  return cakes.find(
    cake=>
      String(
        cake.id
      ) ===
      String(id)
  ) || null;

}


function money(
  value
){

  const number=
    Number(value);


  return Number.isFinite(
    number
  )

  ? (
      Number.isInteger(
        number
      )

      ? String(number)

      : number.toFixed(2)
    )

  : "0";

}


function esc(
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


/* =========================================================
   GLOBAL HELPERS
========================================================= */

window.getCezooCakeCart=
  ()=>JSON.parse(
    JSON.stringify(cart)
  );


window.clearCezooCakeCart=
  ()=>{

    cart={};


    saveCart();


    cakes.forEach(
      cake=>
        updateCard(
          cake.id
        )
    );


    if(
      selectedCake
    ){

      renderSheet();

    }

  };


window.reloadCezooCakeItems=
  async()=>{

    loaded=false;


    if(
      seen &&
      special()
    ){

      await loadCakes();

    }

  };


window.addEventListener(
  "storage",
  event=>{

    if(
      event.key===
      CART_KEY
    ){

      loadCart();

      updateCart();


      cakes.forEach(
        cake=>
          updateCard(
            cake.id
          )
      );


      if(
        selectedCake
      ){

        renderSheet();

      }

    }

  }
);

})();
