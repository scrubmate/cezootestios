/* =========================================================
   CEZOO BANNER IMAGE PERFORMANCE GUARD
   - Keeps all existing banner UI and animations unchanged
   - Enables asynchronous decoding for banner images
========================================================= */
document.querySelectorAll("img").forEach(img => {
  if (!img.decoding) {
    img.decoding = "async";
  }
});

const villageImages = document.querySelectorAll(".villageImg");

const villageObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const villageImg = entry.target;

            if(!villageImg.src){
                villageImg.src = villageImg.dataset.src;
            }

            villageImg.onload = ()=>{
                villageImg.classList.add("villageLoaded");
                villageImg.closest(".villageImageBox")
                    .classList.add("villageImageLoaded");
            };

            villageObserver.unobserve(villageImg);
        }
    });
},{
    root:null,
    threshold:0.2,
    rootMargin:"120px"
});

villageImages.forEach(img=>{
    villageObserver.observe(img);
});


const mallipudiImages = document.querySelectorAll(".mallipudiImg");

const mallipudiObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const img = entry.target;

            if(!img.src){
                img.src = img.dataset.src;
            }

            img.onload = ()=>{
                img.classList.add("mallipudiLoaded");
                img.closest(".mallipudiCard")
                   .classList.add("mallipudiImageLoaded");
            };

            mallipudiObserver.unobserve(img);
        }
    });
},{
    threshold:0.2,
    rootMargin:"120px"
});

mallipudiImages.forEach(img=>{
    mallipudiObserver.observe(img);
});


const rajupalemImages = document.querySelectorAll(".rajupalemImg");

const rajupalemObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const img = entry.target;

            if(!img.src){
                img.src = img.dataset.src;
            }

            img.onload = ()=>{
                img.classList.add("rajupalemLoaded");
                img.closest(".rajupalemCard")
                   .classList.add("rajupalemImageLoaded");
            };

            rajupalemObserver.unobserve(img);
        }
    });
},{
    root:null,
    threshold:0.1,
    rootMargin:"150px"
});

rajupalemImages.forEach(img=>{
    rajupalemObserver.observe(img);
});

const kovvurImages = document.querySelectorAll(".kovvurImg");

const kovvurObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const img = entry.target;

            if(!img.src){
                img.src = img.dataset.src;
            }

            img.onload = ()=>{
                img.classList.add("kovvurLoaded");
                img.closest(".kovvurCard")
                   .classList.add("kovvurImageLoaded");
            };

            kovvurObserver.unobserve(img);
        }
    });
},{
    threshold:0.1,
    rootMargin:"160px"
});

kovvurImages.forEach(img=>{
    kovvurObserver.observe(img);
});

const tanukuImages = document.querySelectorAll(".tanukuImg");

const tanukuObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const img = entry.target;

            if(!img.src){
                img.src = img.dataset.src;
            }

            img.onload = ()=>{
                img.classList.add("tanukuLoaded");
                img.closest(".tanukuCard")
                   .classList.add("tanukuImageLoaded");
            };

            tanukuObserver.unobserve(img);
        }
    });
},{
    threshold:0.1,
    rootMargin:"160px"
});

tanukuImages.forEach(img=>{
    tanukuObserver.observe(img);
});

const giftTypeObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(!entry.isIntersecting) return;

        const img = entry.target;
        img.src = img.dataset.src;

        img.onload = ()=>{
            img.classList.add("giftTypeLoaded");
            img.parentElement.classList.add("giftTypeImageLoaded");
        };

        giftTypeObserver.unobserve(img);
    });
},{
    threshold:0.15
});

document.querySelectorAll(".giftTypeImg").forEach(img=>{
    giftTypeObserver.observe(img);
});

const giftBannerTrack = document.getElementById("giftBannerTrack");
const giftBannerDots = document.querySelectorAll(".giftBannerDot");
const giftBannerImages = document.querySelectorAll(".giftBannerImg");

giftBannerTrack.addEventListener("scroll", ()=>{
  const index = Math.round(
    giftBannerTrack.scrollLeft / giftBannerTrack.clientWidth
  );

  giftBannerDots.forEach(dot => dot.classList.remove("active"));
  giftBannerDots[index]?.classList.add("active");
});

const giftBannerObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;

    const img = entry.target;

    if(!img.src){
      img.src = img.dataset.src;
    }

    img.onload = ()=>{
      img.classList.add("giftBannerLoaded");
      img.closest(".giftBannerSlide")
         .classList.add("giftBannerImageLoaded");
    };

    giftBannerObserver.unobserve(img);
  });
},{
  threshold:0.15,
  rootMargin:"160px"
});

giftBannerImages.forEach(img=>{
  giftBannerObserver.observe(img);
});

const vijayawadaBannerTrack =
  document.getElementById("vijayawadaBannerTrack");

const vijayawadaBannerDots =
  document.querySelectorAll(".vijayawadaBannerDot");

const vijayawadaBannerImages =
  document.querySelectorAll(".vijayawadaBannerImg");


/* DOT CHANGE ON SCROLL */

vijayawadaBannerTrack.addEventListener("scroll", ()=>{

  const index = Math.round(
    vijayawadaBannerTrack.scrollLeft /
    vijayawadaBannerTrack.clientWidth
  );

  vijayawadaBannerDots.forEach(dot=>{
    dot.classList.remove("active");
  });

  vijayawadaBannerDots[index]?.classList.add("active");

});


/* LAZY LOAD IMAGES */

const vijayawadaBannerObserver =
  new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

      if(!entry.isIntersecting) return;

      const img = entry.target;

      if(!img.src){
        img.src = img.dataset.src;
      }

      img.onload = ()=>{

        img.classList.add(
          "vijayawadaBannerLoaded"
        );

        img.closest(".vijayawadaBannerSlide")
          .classList.add(
            "vijayawadaBannerImageLoaded"
          );
      };

      vijayawadaBannerObserver.unobserve(img);

    });

  },{
    threshold:0.15,
    rootMargin:"160px"
  });


vijayawadaBannerImages.forEach(img=>{
  vijayawadaBannerObserver.observe(img);
});

const pervaliImages =
  document.querySelectorAll(".pervaliImg");


const pervaliObserver =
  new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

      if(!entry.isIntersecting) return;


      const img = entry.target;


      /* LOAD ONLY WHEN NEAR VIEW */

      if(!img.src){
        img.src = img.dataset.src;
      }


      img.onload = ()=>{

        img.classList.add(
          "pervaliLoaded"
        );

        img.closest(".pervaliCard")
          .classList.add(
            "pervaliImageLoaded"
          );

      };


      pervaliObserver.unobserve(img);

    });

  },{
    root:null,
    threshold:0.1,
    rootMargin:"120px"
  });


pervaliImages.forEach(img=>{

  pervaliObserver.observe(img);

});



/* ==============================
   RIGHT IMAGE LAZY LOAD
============================== */

const ravulapalemImages =
  document.querySelectorAll(
    ".ravulapalemImg"
  );


const ravulapalemObserver =
  new IntersectionObserver((entries)=>{


    entries.forEach(entry=>{


      if(!entry.isIntersecting){
        return;
      }


      const img = entry.target;


      if(!img.src){

        img.src =
          img.dataset.src;

      }


      img.onload = ()=>{


        img.classList.add(
          "ravulapalemLoaded"
        );


        img.closest(
          ".ravulapalemImageBox"
        )
        .classList.add(
          "ravulapalemImageLoaded"
        );


      };


      ravulapalemObserver
        .unobserve(img);


    });


  },{
    root:null,

    threshold:0.1,

    rootMargin:"120px"
  });


ravulapalemImages.forEach(img=>{

  ravulapalemObserver
    .observe(img);

});



/* ==============================
   LEFT IMAGE LAZY LOAD
============================== */

const ravulapalemLeftImages =
  document.querySelectorAll(
    ".ravulapalemLeftImg"
  );


const ravulapalemLeftObserver =
  new IntersectionObserver((entries)=>{


    entries.forEach(entry=>{


      if(!entry.isIntersecting){
        return;
      }


      const img = entry.target;


      if(!img.src){

        img.src =
          img.dataset.src;

      }


      img.onload = ()=>{


        img.classList.add(
          "ravulapalemLeftLoaded"
        );


        img.closest(
          ".ravulapalemLeftImageBox"
        )
        .classList.add(
          "ravulapalemLeftImageLoaded"
        );


      };


      ravulapalemLeftObserver
        .unobserve(img);


    });


  },{
    threshold:0.1,

    rootMargin:"120px"
  });


ravulapalemLeftImages.forEach(img=>{

  ravulapalemLeftObserver
    .observe(img);

});



/* ==============================
   CENTER IMAGE LAZY LOAD
============================== */

const ravulapalemCenterImages =
  document.querySelectorAll(
    ".ravulapalemCenterImg"
  );


const ravulapalemCenterObserver =
  new IntersectionObserver((entries)=>{


    entries.forEach(entry=>{


      if(!entry.isIntersecting){
        return;
      }


      const img = entry.target;


      if(!img.src){

        img.src =
          img.dataset.src;

      }


      img.onload = ()=>{


        img.classList.add(
          "ravulapalemCenterLoaded"
        );


        img.closest(
          ".ravulapalemCenterImageBox"
        )
        .classList.add(
          "ravulapalemCenterImageLoaded"
        );


      };


      ravulapalemCenterObserver
        .unobserve(img);


    });


  },{
    threshold:0.1,

    rootMargin:"120px"
  });


ravulapalemCenterImages.forEach(img=>{

  ravulapalemCenterObserver
    .observe(img);

});
const kanuruBanner =
  document.getElementById("kanuruBanner");

let kanuruTimers = [];
let kanuruRunning = false;

function clearKanuruTimers(){
  kanuruTimers.forEach(timer=>{
    clearTimeout(timer);
  });

  kanuruTimers = [];
}

function resetKanuruBanner(){
  kanuruBanner.classList.remove(
    "kanuruShowIce",
    "kanuruHideIce",
    "kanuruShowPlay",
    "kanuruHidePlay"
  );
}

function runKanuruLoop(){
  if(!kanuruRunning){
    return;
  }

  resetKanuruBanner();

  void kanuruBanner.offsetWidth;

  kanuruBanner.classList.add("kanuruShowIce");

  kanuruTimers.push(
    setTimeout(()=>{
      kanuruBanner.classList.add("kanuruHideIce");
    },3500)
  );

  kanuruTimers.push(
    setTimeout(()=>{
      kanuruBanner.classList.add("kanuruShowPlay");
    },4100)
  );

  kanuruTimers.push(
    setTimeout(()=>{
      kanuruBanner.classList.add("kanuruHidePlay");
    },6500)
  );

  kanuruTimers.push(
    setTimeout(()=>{
      if(kanuruRunning){
        runKanuruLoop();
      }
    },7200)
  );
}

const kanuruObserver =
  new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{

      if(entry.isIntersecting){

        if(kanuruRunning){
          return;
        }

        kanuruRunning = true;

        clearKanuruTimers();
        runKanuruLoop();

      }else{

        kanuruRunning = false;

        clearKanuruTimers();
        resetKanuruBanner();

      }

    });
  },{
    threshold:0.35
  });

kanuruObserver.observe(kanuruBanner);






const jalandharBannerTrack =
  document.getElementById("jalandharBannerTrack");

const jalandharBannerDots =
  document.querySelectorAll(".jalandharBannerDot");

const jalandharBannerImages =
  document.querySelectorAll(".jalandharBannerImg");

jalandharBannerTrack.addEventListener("scroll", ()=>{

  const slideWidth =
    jalandharBannerTrack.querySelector(".jalandharBannerSlide").offsetWidth + 12;

  const index = Math.round(
    jalandharBannerTrack.scrollLeft / slideWidth
  );

  jalandharBannerDots.forEach(dot=>{
    dot.classList.remove("active");
  });

  jalandharBannerDots[index]?.classList.add("active");
});

const jalandharBannerObserver =
  new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

      if(!entry.isIntersecting) return;

      const img = entry.target;

      if(!img.src){
        img.src = img.dataset.src;
      }

      img.onload = ()=>{

        img.classList.add("jalandharBannerLoaded");

        img.closest(".jalandharBannerSlide")
          .classList.add("jalandharBannerImageLoaded");
      };

      jalandharBannerObserver.unobserve(img);
    });

  },{
    threshold:0.15,
    rootMargin:"160px"
  });

jalandharBannerImages.forEach(img=>{
  jalandharBannerObserver.observe(img);
});


const phagwaraBannerTrack =
  document.getElementById("phagwaraBannerTrack");

const phagwaraBannerDots =
  document.querySelectorAll(".phagwaraBannerDot");

const phagwaraBannerImages =
  document.querySelectorAll(".phagwaraBannerImg");


/* DOT CHANGE */

phagwaraBannerTrack.addEventListener("scroll", ()=>{

  const slide =
    phagwaraBannerTrack.querySelector(".phagwaraBannerSlide");

  const slideWidth =
    slide.offsetWidth + 12;

  const index = Math.round(
    phagwaraBannerTrack.scrollLeft / slideWidth
  );

  phagwaraBannerDots.forEach(dot=>{
    dot.classList.remove("active");
  });

  phagwaraBannerDots[index]?.classList.add("active");

});


/* LAZY LOAD */

const phagwaraBannerObserver =
  new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

      if(!entry.isIntersecting) return;

      const img = entry.target;

      if(!img.src){
        img.src = img.dataset.src;
      }

      img.onload = ()=>{

        img.classList.add("phagwaraBannerLoaded");

        img.closest(".phagwaraBannerSlide")
          .classList.add("phagwaraBannerImageLoaded");
      };

      phagwaraBannerObserver.unobserve(img);

    });

  },{
    threshold:0.15,
    rootMargin:"160px"
  });


phagwaraBannerImages.forEach(img=>{
  phagwaraBannerObserver.observe(img);
});
function initializePriyaaShimmer(){

  document
    .querySelectorAll(".priyaaProductArea img")
    .forEach(img => {

      if(img.dataset.priyaaReady === "true"){
        return;
      }

      img.dataset.priyaaReady = "true";

      function finishPriyaaLoading(){

        img.classList.add("priyaaLoaded");

        img
          .closest(".priyaaProductArea")
          ?.querySelector(".priyaaShimmer")
          ?.remove();
      }

      if(img.complete && img.naturalWidth > 0){

        finishPriyaaLoading();

      }else{

        img.addEventListener(
          "load",
          finishPriyaaLoading,
          { once:true }
        );

        img.addEventListener(
          "error",
          finishPriyaaLoading,
          { once:true }
        );
      }

    });
}

document.addEventListener(
  "DOMContentLoaded",
  initializePriyaaShimmer
);

window.openReportIssuePopup = function(){

  document
    .getElementById("reportIssuePopup")
    ?.classList.add("open");

  document.body.style.overflow = "hidden";
};


window.closeReportIssuePopup = function(){

  document
    .getElementById("reportIssuePopup")
    ?.classList.remove("open");

  document.body.style.overflow = "hidden";
};


const reportIssueMessage =
  document.getElementById("reportIssueMessage");

const reportIssueCharCount =
  document.getElementById("reportIssueCharCount");


reportIssueMessage?.addEventListener(
  "input",
  function(){

    reportIssueCharCount.innerText =
      String(this.value.length);

  }
);


window.submitReportIssue = async function(){
  const issueType =
    document
      .getElementById("reportIssueType")
      ?.value;

  const orderId =
    document
      .getElementById("reportIssueOrderId")
      ?.value
      ?.trim();

  const message =
    document
      .getElementById("reportIssueMessage")
      ?.value
      ?.trim();

  const status =
    document.getElementById("reportIssueStatus");


  status.className = "reportIssueStatus";
  status.innerText = "";


  if(!issueType){

    status.classList.add("error");
    status.innerText = "Please select an issue.";

    setTimeout(() => {
      status.className = "reportIssueStatus";
      status.innerText = "";
    }, 5000);

    return;
  }


  if(!message){

    status.classList.add("error");
    status.innerText = "Please describe your issue.";

    setTimeout(() => {
      status.className = "reportIssueStatus";
      status.innerText = "";
    }, 5000);

    return;
  }


  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );


  const { error } =
await window._supabaseClient
  .from("reported_issues")
  .insert([{

    issue_type: issueType,

    order_id: orderId || null,

    message: message,

    user_name: user?.name || "",

    user_mobile: user?.mobile || ""

  }]);

if(error){

  status.className = "reportIssueStatus error";
  status.innerText = "Unable to submit issue.";

  setTimeout(() => {
    status.className = "reportIssueStatus";
    status.innerText = "";
  }, 5000);

  return;
}


 const submitBtn =
  document.querySelector(".reportIssueSubmitBtn");

submitBtn.disabled = true;

submitBtn.innerHTML = `
  <span class="reportIssueSuccessTick">
    ✓
  </span>
`;

document.getElementById("reportIssueType").value = "";
document.getElementById("reportIssueOrderId").value = "";
document.getElementById("reportIssueMessage").value = "";

reportIssueCharCount.innerText = "0";

setTimeout(() => {

  submitBtn.disabled = false;

  submitBtn.innerHTML = "Submit Issue";

}, 5000);

};
let reportIssueStartX = 0;
let reportIssueStartY = 0;

const reportIssuePopupBox =
  document.getElementById("reportIssuePopup");


reportIssuePopupBox?.addEventListener(
  "touchstart",
  function(e){

    e.stopPropagation();

    const touch = e.touches[0];

    reportIssueStartX = touch.clientX;
    reportIssueStartY = touch.clientY;

  },
  { passive:true }
);


reportIssuePopupBox?.addEventListener(
  "touchend",
  function(e){

    e.stopPropagation();

    const touch = e.changedTouches[0];

    const diffX =
      touch.clientX - reportIssueStartX;

    const diffY =
      touch.clientY - reportIssueStartY;


    if(
      Math.abs(diffX) > 90 &&
      Math.abs(diffY) < 70
    ){
      closeReportIssuePopup();
    }

  },
  { passive:true }
);


window.openFaqPopup = function(){

  document
    .getElementById("faqPopup")
    ?.classList.add("open");

  document.body.style.overflow = "hidden";

};


window.closeFaqPopup = function(){

  document
    .getElementById("faqPopup")
    ?.classList.remove("open");

  // Profile popup is still open
  document.body.style.overflow = "hidden";

};


/* ===========================
   FAQ SWIPE BACK
=========================== */

let tirupathiiStartX = 0;
let tirupathiiStartY = 0;

const tirupathiiPopup =
  document.getElementById("faqPopup");


tirupathiiPopup?.addEventListener(
  "touchstart",
  function(e){

    e.stopPropagation();

    const touch = e.touches[0];

    tirupathiiStartX = touch.clientX;
    tirupathiiStartY = touch.clientY;

  },
  { passive:true }
);


tirupathiiPopup?.addEventListener(
  "touchend",
  function(e){

    e.stopPropagation();

    const touch = e.changedTouches[0];

    const diffX =
      touch.clientX - tirupathiiStartX;

    const diffY =
      touch.clientY - tirupathiiStartY;

    if(
      Math.abs(diffX) > 90 &&
      Math.abs(diffY) < 70
    ){

      closeFaqPopup();

    }

  },
  { passive:true }
);



window.openSuggestProductPopup = function(){

  document
    .getElementById("suggestProductPopup")
    ?.classList.add("open");

  document.body.style.overflow = "hidden";

};


window.closeSuggestProductPopup = function(){

  document
    .getElementById("suggestProductPopup")
    ?.classList.remove("open");

  document.body.style.overflow = "hidden";

};



window.submitSuggestedProduct = async function(){

  const productName =
    document
      .getElementById("shiridiProductName")
      ?.value
      ?.trim();

  const brandName =
    document
      .getElementById("shiridiBrandName")
      ?.value
      ?.trim();

  const approxPrice =
    document
      .getElementById("shiridiPrice")
      ?.value
      ?.trim();

  const status =
    document.getElementById("shiridiStatus");


  status.className = "reportIssueStatus";
  status.innerText = "";


  if(!productName){

    status.classList.add("error");
    status.innerText =
      "Please enter the product name.";

    setTimeout(()=>{

      status.className =
        "reportIssueStatus";

      status.innerText = "";

    },5000);

    return;
  }


  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );


  const { error } =
    await window._supabaseClient

      .from("product_suggestions")

      .insert([{

        product_name: productName,

        brand_name: brandName || null,

        approx_price: approxPrice || null,

        user_name: user?.name || "",

        user_mobile: user?.mobile || ""

      }]);


  if(error){

    status.classList.add("error");

    status.innerText =
      "Unable to submit suggestion.";

    setTimeout(()=>{

      status.className =
        "reportIssueStatus";

      status.innerText = "";

    },5000);

    return;
  }


  const submitBtn =
    document.querySelector(".shiridiSubmitBtn");


  submitBtn.disabled = true;

  submitBtn.innerHTML = `
    <span class="shiridiSuccessTick">
      ✓
    </span>
  `;


  document.getElementById(
    "shiridiProductName"
  ).value = "";

  document.getElementById(
    "shiridiBrandName"
  ).value = "";

  document.getElementById(
    "shiridiPrice"
  ).value = "";


  setTimeout(()=>{

    submitBtn.disabled = false;

    submitBtn.innerHTML =
      "Submit Suggestion";

  },5000);

};
let shiridiStartX = 0;
let shiridiStartY = 0;

const shiridiPopup =
  document.getElementById("suggestProductPopup");

shiridiPopup?.addEventListener(
  "touchstart",
  function(e){

    /* Stop Profile swipe */
    e.stopPropagation();

    const touch = e.touches[0];

    shiridiStartX = touch.clientX;
    shiridiStartY = touch.clientY;

  },
  { passive:true }
);

shiridiPopup?.addEventListener(
  "touchend",
  function(e){

    /* Stop Profile swipe */
    e.stopPropagation();

    const touch = e.changedTouches[0];

    const diffX =
      touch.clientX - shiridiStartX;

    const diffY =
      touch.clientY - shiridiStartY;

    if(
      Math.abs(diffX) > 90 &&
      Math.abs(diffY) < 70
    ){
      closeSuggestProductPopup();
    }

  },
  { passive:true }
);

/* =========================================================
   CEZOO iOS SMOOTH PROGRESSIVE CONTENT + ALL PRODUCT ROWS
   - First real section in every category is visible immediately
   - Spinner appears only when user reaches the next batch
   - Next 3 visual blocks appear after at least 2 seconds
   - All horizontal product rows reveal 4 cards at a time
   - Preserves See All, popups, swipe-back, cart and local iOS src
========================================================= */
(() => {
  "use strict";

  const INITIAL_SECTION_BLOCKS = 1;
  const SECTION_BATCH_SIZE = 3;
  const SECTION_SPINNER_TIME = 2000;
  const SECTION_MARGIN = "70px 0px";

  const PRODUCT_BATCH_SIZE = 4;
  const PRODUCT_SPINNER_TIME = 900;
  const PRODUCT_END_DISTANCE = 90;

  const sectionStates = new WeakMap();
  const rowStates = new WeakMap();

  let openingFinished =
    !document.getElementById("cezooOpeningLoader");

  function isHeading(node){
    return Boolean(node.matches?.(
      "h1,h2,h3,.sectionTitle,.sectionTitless,.sectionTitleWrap,.idolGiftHeading"
    ));
  }

  function isMajor(node){
    return Boolean(node?.matches?.(
      "section,#contentSection,#freshSection,#coolSection," +
      "#grocerySection,#chocoSection,.poster,.smallBanner," +
      ".budgetSection,.skin-wrapper,.gift-banner-single," +
      ".ravulapalemBanner,.vijayawadaBanner,.kanuruBanner"
    ));
  }

  function buildBlocks(section){
    const children = [...section.children].filter(node => {
      if (!(node instanceof HTMLElement)) return false;
      if (node.classList.contains("cezooProgressiveLoader")) return false;
      if (node.classList.contains("cezooSpace")){
        node.setAttribute("aria-hidden","true");
        return false;
      }
      return !node.matches("script,style,template");
    });

    const blocks = [];
    let current = [];

    const finish = () => {
      if (!current.length) return;
      blocks.push(current);
      current = [];
    };

    children.forEach(node => {
      if (isMajor(node)){
        finish();
        blocks.push([node]);
        return;
      }

      if (isHeading(node) && current.length){
        finish();
      }

      current.push(node);

      if (node.classList.contains("seeAllBar")){
        finish();
      }
    });

    finish();
    return blocks;
  }

  function refreshImages(roots){
    roots.forEach(root => {
      window.CezooSafeImageLoader?.registerInside?.(root);
      window.CezooImageLoader?.refresh?.(root);
    });

    document.dispatchEvent(
      new CustomEvent("cezooProgressiveContentRevealed",{
        detail:{roots}
      })
    );
  }

  function revealNodes(nodes, animate){
    nodes.forEach(node => {
      node.classList.remove("cezooDeferredContent");

      if (animate){
        node.classList.remove("cezooProgressiveReveal");
        void node.offsetWidth;
        node.classList.add("cezooProgressiveReveal");
        setTimeout(
          () => node.classList.remove("cezooProgressiveReveal"),
          380
        );
      }
    });

    refreshImages(nodes);
    setTimeout(() => scanProductRows(nodes), 0);
  }

  function nextSectionBatch(state){
    const start = state.visible;
    const end = Math.min(
      start + SECTION_BATCH_SIZE,
      state.blocks.length
    );

    return {
      end,
      nodes:state.blocks.slice(start,end).flat()
    };
  }

  function updateSectionLoader(state){
    const hasMore = state.visible < state.blocks.length;
    const active = state.section.classList.contains("active");

    state.loader.classList.toggle(
      "has-more",
      openingFinished && active && hasMore
    );

    state.loader.classList.toggle(
      "is-visible",
      openingFinished && active && hasMore && state.loading
    );
  }

  function requestSectionBatch(state){
    if (
      state.loading ||
      state.visible >= state.blocks.length ||
      !state.section.classList.contains("active")
    ){
      return;
    }

    state.loading = true;
    updateSectionLoader(state);
    state.observer?.unobserve(state.loader);

    const batch = nextSectionBatch(state);

    setTimeout(() => {
      if (!state.section.classList.contains("active")){
        state.loading = false;
        updateSectionLoader(state);
        state.observer?.observe(state.loader);
        return;
      }

      revealNodes(batch.nodes,true);
      state.visible = batch.end;
      state.loading = false;
      updateSectionLoader(state);

      if (state.visible < state.blocks.length){
        state.observer?.observe(state.loader);
      }
    },SECTION_SPINNER_TIME);
  }

  function activateSection(state){
    if (!openingFinished) return;
    updateSectionLoader(state);
    state.observer?.observe(state.loader);
  }

  function prepareSection(section){
    if (sectionStates.has(section)){
      return sectionStates.get(section);
    }

    const blocks = buildBlocks(section);
    const loader = document.createElement("div");

    loader.className = "cezooProgressiveLoader";
    loader.setAttribute("aria-hidden","true");
    loader.innerHTML =
      '<span class="cezooProgressiveSpinner"></span>';

    section.appendChild(loader);

    blocks.flat().forEach(node => {
      node.classList.add("cezooDeferredContent");
    });

    const state = {
      section,
      blocks,
      loader,
      visible:0,
      loading:false,
      observer:null
    };

    const firstEnd = Math.min(
      INITIAL_SECTION_BLOCKS,
      blocks.length
    );

    const firstNodes = blocks.slice(0,firstEnd).flat();
    state.visible = firstEnd;
    revealNodes(firstNodes,false);

    if ("IntersectionObserver" in window){
      state.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (
            entry.isIntersecting &&
            openingFinished &&
            section.classList.contains("active")
          ){
            requestSectionBatch(state);
          }
        });
      },{
        root:null,
        rootMargin:SECTION_MARGIN,
        threshold:.01
      });
    }

    sectionStates.set(section,state);
    updateSectionLoader(state);
    return state;
  }

  function observeCategoryActivation(){
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const section = mutation.target;

        if (
          section instanceof HTMLElement &&
          section.matches(".content-section[data-section]") &&
          section.classList.contains("active")
        ){
          activateSection(prepareSection(section));
          scanProductRows([section]);
        }
      });
    });

    document
      .querySelectorAll(".content-section[data-section]")
      .forEach(section => {
        observer.observe(section,{
          attributes:true,
          attributeFilter:["class"]
        });
      });
  }

  function isHorizontalProductRow(element){
    if (!(element instanceof HTMLElement)) return false;
    if (element.closest(
      ".productPopup,.normalSeeAllPopup,#categoryProductsPopup," +
      ".categoryProductsPopup,.popup"
    )) return false;

    const cards = [...element.children].filter(child =>
      child.classList?.contains("productCard")
    );

    if (cards.length < 5) return false;

    if (
      element.id?.endsWith("ProductsRow") ||
      element.classList.contains("productRow") ||
      element.classList.contains("productsRow")
    ){
      return true;
    }

    const style = getComputedStyle(element);
    return (
      style.display === "flex" &&
      (style.overflowX === "auto" || style.overflowX === "scroll")
    );
  }

  function rowCards(row){
    return [...row.children].filter(child =>
      child.classList?.contains("productCard")
    );
  }

  function updateRowLoader(state){
    const hasMore = state.visible < state.cards.length;

    state.loader.classList.toggle("has-more",hasMore);
    state.loader.classList.toggle(
      "is-visible",
      hasMore && state.loading
    );

    if (!hasMore){
      state.loader.remove();
    }
  }

  function requestProductBatch(state){
    if (state.loading || state.visible >= state.cards.length){
      return;
    }

    state.loading = true;
    updateRowLoader(state);

    setTimeout(() => {
      const end = Math.min(
        state.visible + PRODUCT_BATCH_SIZE,
        state.cards.length
      );

      const revealed = [];

      for (let index = state.visible; index < end; index += 1){
        const card = state.cards[index];
        card.classList.remove("cezooProductCardDeferred");
        card.classList.add("cezooProgressiveReveal");
        revealed.push(card);

        setTimeout(
          () => card.classList.remove("cezooProgressiveReveal"),
          380
        );
      }

      state.visible = end;
      state.loading = false;
      refreshImages(revealed);
      updateRowLoader(state);
    },PRODUCT_SPINNER_TIME);
  }

  function prepareProductRow(row){
    const cards = rowCards(row);

    if (cards.length < 5) return;

    let state = rowStates.get(row);

    if (state){
      const newCards = cards.filter(card => !state.cards.includes(card));

      if (newCards.length){
        state.cards.push(...newCards);
        newCards.forEach(card =>
          card.classList.add("cezooProductCardDeferred")
        );

        if (!state.loader.isConnected){
          row.appendChild(state.loader);
        }

        updateRowLoader(state);
      }

      return;
    }

    const loader = document.createElement("div");
    loader.className = "cezooProductRowLoader";
    loader.setAttribute("aria-hidden","true");
    loader.innerHTML = '<span class="cezooRowSpinner"></span>';

    cards.forEach((card,index) => {
      if (index >= PRODUCT_BATCH_SIZE){
        card.classList.add("cezooProductCardDeferred");
      }
    });

    row.appendChild(loader);

    state = {
      row,
      cards,
      loader,
      visible:Math.min(PRODUCT_BATCH_SIZE,cards.length),
      loading:false,
      ticking:false
    };

    const onScroll = () => {
      if (state.ticking) return;

      state.ticking = true;

      requestAnimationFrame(() => {
        state.ticking = false;

        const distance =
          row.scrollWidth -
          row.clientWidth -
          row.scrollLeft;

        if (distance <= PRODUCT_END_DISTANCE){
          requestProductBatch(state);
        }
      });
    };

    row.addEventListener("scroll",onScroll,{passive:true});
    rowStates.set(row,state);

    refreshImages(cards.slice(0,state.visible));
    updateRowLoader(state);
  }

  function scanProductRows(roots=[document]){
    const candidates = new Set();

    roots.forEach(root => {
      if (!(root instanceof Element || root === document)) return;

      if (root instanceof Element && isHorizontalProductRow(root)){
        candidates.add(root);
      }

      root.querySelectorAll?.(
        ".content-section [id$='ProductsRow']," +
        ".content-section .productRow," +
        ".content-section .productsRow," +
        ".content-section div"
      ).forEach(element => {
        if (isHorizontalProductRow(element)){
          candidates.add(element);
        }
      });
    });

    candidates.forEach(prepareProductRow);
  }

  function finishOpening(){
    openingFinished = true;

    document
      .querySelectorAll(".content-section[data-section]")
      .forEach(section => {
        const state = prepareSection(section);
        updateSectionLoader(state);

        if (section.classList.contains("active")){
          activateSection(state);
        }
      });

    scanProductRows();
  }

  function start(){
    document
      .querySelectorAll(".content-section[data-section]")
      .forEach(prepareSection);

    observeCategoryActivation();
    scanProductRows();

    const dynamicObserver = new MutationObserver(mutations => {
      const roots = [];

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element){
            roots.push(node);
          }
        });
      });

      if (roots.length){
        setTimeout(() => scanProductRows(roots),0);
      }
    });

    dynamicObserver.observe(document.body,{
      childList:true,
      subtree:true
    });

    if (openingFinished){
      finishOpening();
    } else {
      document.addEventListener(
        "cezooOpeningLoaderFinished",
        finishOpening,
        {once:true}
      );

      const loader = document.getElementById("cezooOpeningLoader");

      if (loader){
        const loaderObserver = new MutationObserver(() => {
          if (!document.getElementById("cezooOpeningLoader")){
            loaderObserver.disconnect();
            finishOpening();
          }
        });

        loaderObserver.observe(document.body,{
          childList:true,
          subtree:true
        });
      }
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  } else {
    start();
  }
})();
