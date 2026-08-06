document.addEventListener("DOMContentLoaded", async function () {

  /* =========================================
     REQUIRED PAGE ELEMENTS
  ========================================= */

  const floatBarWrap =
    document.querySelector(".floatBarWrap");

  const deliveryFloatBar =
    document.querySelector(".deliveryFloatBar");

  const cartFloatBox =
    document.querySelector(".cartFloatBox");

  const cezooStatusBar =
    document.getElementById("cezooStatusBar");

  if (
    !floatBarWrap ||
    !deliveryFloatBar ||
    !cezooStatusBar
  ) {
    console.error(
      "CEZOO status bar required elements were not found."
    );

    return;
  }


  /* =========================================
     GET EXISTING SUPABASE CLIENT

     Supported existing variable names:

     const supabaseClient = ...
     window.supabaseClient = ...

     const cezooSupabase = ...
     window.cezooSupabase = ...

     const supabase = createClient(...)
  ========================================= */

  function getExistingSupabaseClient() {

    const possibleClients = [
      window._supabaseClient,
      window.supabaseClient,
      window.cezooSupabase,
      window.supabaseDb
    ];

    for (const client of possibleClients) {
      if (client && typeof client.from === "function") {
        return client;
      }
    }

    return null;
  }

  async function waitForSupabaseClient(
    timeoutMs = 10000
  ) {

    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {

      const client =
        getExistingSupabaseClient();

      if (client) {
        return client;
      }

      await new Promise(function (resolve) {
        setTimeout(resolve, 100);
      });
    }

    return null;
  }

  let db = null;


  /* =========================================
     CONFIGURATION
  ========================================= */

  const STATUS_TABLE =
    "cezoo_status_bar";

  const STATUS_ROW_ID = 1;

  let currentMode = "none";

  let realtimeChannel = null;

  let launchCountdownInterval = null;

  let statusTransitionId = 0;

  const STATUS_TRANSITION_MS = 280;


  /* =========================================
     ADD COMPLETE CSS USING JAVASCRIPT
  ========================================= */

  if (
    !document.getElementById(
      "cezooRealtimeStatusStyles"
    )
  ) {

    const style =
      document.createElement("style");

    style.id =
      "cezooRealtimeStatusStyles";

    style.textContent = `

      /* =====================================
         MAIN HOLDER

         Absolute positioning means this will
         not disturb floatBarWrap flex layout.
      ===================================== */

      #cezooStatusBar{
        position:absolute;

        left:0;
        bottom:58px;

        width:0;
        height:29px;

        display:none;

        z-index:5;

        pointer-events:none;
        box-sizing:border-box;
      }


      /* =====================================
         COMMON STATUS BAR
      ===================================== */

      .cezooStatusInner{
        position:relative;

        width:100%;
        height:29px;

        display:flex;
        align-items:center;

        padding:
          0
          clamp(11px, 3vw, 16px);

        box-sizing:border-box;
        overflow:hidden;

        border-radius:
          16px
          16px
          0
          0;

        border-bottom:
          1px solid
          rgba(0,0,0,.07);

        box-shadow:
          0 -4px 12px
          rgba(0,0,0,.07);

        isolation:isolate;
      }


      /* =====================================
         STATUS CHANGE TRANSITIONS

         Existing status moves down.
         New status comes smoothly from below.
      ===================================== */

      #cezooStatusBar{
        overflow:hidden;
      }


      #cezooStatusBar
      .cezooStatusInner{
        will-change:
          transform,
          opacity;

        transform:
          translate3d(0,0,0);

        opacity:1;
      }


      #cezooStatusBar
      .cezooStatusInner.cezooStatusEntering{
        transform:
          translate3d(0,115%,0);

        opacity:0;
      }


      #cezooStatusBar
      .cezooStatusInner.cezooStatusEntered{
        transform:
          translate3d(0,0,0);

        opacity:1;

        transition:
          transform
          280ms
          cubic-bezier(.22,.78,.28,1),
          opacity
          220ms
          ease;
      }


      #cezooStatusBar
      .cezooStatusInner.cezooStatusLeaving{
        transform:
          translate3d(0,115%,0);

        opacity:0;

        transition:
          transform
          260ms
          cubic-bezier(.55,.02,.72,.35),
          opacity
          190ms
          ease;
      }


      .cezooStatusIcon{
        position:relative;
        z-index:8;

        width:18px;
        height:18px;
        min-width:18px;

        display:flex;
        align-items:center;
        justify-content:center;

        margin-right:
          clamp(5px, 1.8vw, 8px);

        flex-shrink:0;
      }


      .cezooStatusIcon i{
        font-size:
          clamp(11px, 2.8vw, 13px);
      }


      .cezooStatusText{
        position:relative;
        z-index:8;

        flex:1;
        min-width:0;
        width:0;

        display:block;

        font-family:
          Arial,
          sans-serif;

        font-size:
          clamp(9px, 2.55vw, 11.5px);

        font-weight:700;
        line-height:1;

        letter-spacing:
          clamp(0px, .08vw, .15px);

        white-space:nowrap;
        word-break:keep-all;

        overflow:hidden;
        text-overflow:ellipsis;
      }


      /* =====================================
         1. RAIN UI
      ===================================== */

      .cezooStatusInner.rainMode{
        color:#ffffff;

        background:
          linear-gradient(
            135deg,
            #1f4b68 0%,
            #2b6c8d 48%,
            #20516f 100%
          );

        border-bottom-color:
          rgba(255,255,255,.14);
      }


      .rainMode .cezooStatusIcon i{
        color:#e8f7ff;

        filter:
          drop-shadow(
            0 1px 2px
            rgba(0,0,0,.25)
          );

        animation:
          cezooRainCloudFloat
          2s ease-in-out infinite;
      }


      .rainMode .cezooStatusText{
        color:#ffffff;

        text-shadow:
          0 1px 2px
          rgba(0,0,0,.3);
      }


      .cezooRainLayer{
        position:absolute;
        inset:0;

        z-index:3;

        overflow:hidden;
        pointer-events:none;
      }


      .cezooRainDrop{
        position:absolute;

        left:var(--rain-left);
        top:-13px;

        width:1px;
        height:9px;

        border-radius:20px;

        background:
          linear-gradient(
            to bottom,
            transparent,
            rgba(225,246,255,.95)
          );

        transform:rotate(14deg);

        animation:
          cezooRainFall
          var(--rain-speed)
          linear infinite;

        animation-delay:
          var(--rain-delay);
      }


      .rainMode::before{
        content:"";

        position:absolute;

        top:-22px;
        left:-40%;

        width:55%;
        height:75px;

        z-index:1;

        background:
          radial-gradient(
            circle,
            rgba(255,255,255,.16),
            transparent 68%
          );

        animation:
          cezooMovingGlow
          7s linear infinite;

        pointer-events:none;
      }


      .rainMode::after{
        content:"";

        position:absolute;

        left:0;
        right:0;
        bottom:0;

        height:7px;

        z-index:2;

        background:
          linear-gradient(
            to top,
            rgba(180,230,255,.09),
            transparent
          );

        pointer-events:none;
      }


      /* =====================================
         2. STORE CLOSED UI

         Clean white card with soft clouds
         and a floating closed board.
      ===================================== */

      .cezooStatusInner.closedMode{
        color:#27313d;

        background:
          linear-gradient(
            135deg,
            #ffffff 0%,
            #f7f9fb 48%,
            #ffffff 100%
          );

        border:
          1px solid
          rgba(31,45,61,.09);

        border-bottom:
          1px solid
          rgba(31,45,61,.13);

        box-shadow:
          0 -5px 16px
          rgba(31,45,61,.08);
      }


      .closedMode .cezooStatusText{
        color:#27313d;
        text-shadow:none;
      }


      .cezooClosedCloudLayer{
        position:absolute;
        inset:0;

        z-index:1;

        overflow:hidden;
        pointer-events:none;
      }


      .cezooClosedCloud{
        position:absolute;

        left:var(--cloud-left);
        top:var(--cloud-top);

        width:var(--cloud-width);
        height:
          calc(
            var(--cloud-width) * .32
          );

        opacity:var(--cloud-opacity);

        border-radius:999px;

        background:
          rgba(192,201,211,.34);

        filter:blur(.3px);

        animation:
          cezooClosedCloudMove
          var(--cloud-speed)
          linear infinite;

        animation-delay:
          var(--cloud-delay);
      }


      .cezooClosedCloud::before,
      .cezooClosedCloud::after{
        content:"";

        position:absolute;

        bottom:0;

        border-radius:50%;

        background:inherit;
      }


      .cezooClosedCloud::before{
        left:16%;

        width:42%;
        height:140%;
      }


      .cezooClosedCloud::after{
        right:15%;

        width:34%;
        height:115%;
      }


      .cezooClosedBoard{
        position:relative;
        z-index:8;

        width:38px;
        height:22px;
        min-width:38px;

        margin-right:
          clamp(6px, 1.9vw, 9px);

        display:flex;
        align-items:center;
        justify-content:center;

        border-radius:5px;

        background:
          linear-gradient(
            180deg,
            #fff 0%,
            #f0f3f6 100%
          );

        border:
          1px solid
          rgba(39,49,61,.18);

        box-shadow:
          0 3px 8px
          rgba(39,49,61,.12);

        transform-origin:
          50% -5px;

        animation:
          cezooClosedBoardFloat
          2.6s ease-in-out infinite;
      }


      .cezooClosedBoard::before,
      .cezooClosedBoard::after{
        content:"";

        position:absolute;

        top:-6px;

        width:1px;
        height:7px;

        background:
          rgba(39,49,61,.35);
      }


      .cezooClosedBoard::before{
        left:10px;
        transform:rotate(12deg);
      }


      .cezooClosedBoard::after{
        right:10px;
        transform:rotate(-12deg);
      }


      .cezooClosedBoardText{
        font-family:
          Arial,
          sans-serif;

        font-size:6.8px;
        font-weight:900;
        letter-spacing:.35px;
        color:#384250;
      }


      .closedMode::before{
        content:"";

        position:absolute;

        top:-19px;
        right:-18px;

        width:86px;
        height:58px;

        z-index:0;

        border-radius:50%;

        background:
          radial-gradient(
            circle,
            rgba(211,217,223,.32),
            transparent 70%
          );

        pointer-events:none;
      }


      .closedMode::after{
        content:"";

        position:absolute;

        left:-25px;
        bottom:-26px;

        width:98px;
        height:58px;

        z-index:0;

        border-radius:50%;

        background:
          radial-gradient(
            circle,
            rgba(229,233,237,.7),
            transparent 70%
          );

        pointer-events:none;
      }


      /* =====================================
         3. CUSTOM NOTE UI
      ===================================== */

      .cezooStatusInner.noteMode{
        color:#543b10;

        background:
          linear-gradient(
            135deg,
            #fffaf0 0%,
            #fff0bd 50%,
            #fffaf0 100%
          );

        border:
          1px solid
          rgba(168,116,21,.14);

        border-bottom:
          1px solid
          rgba(168,116,21,.18);

        box-shadow:
          0 -5px 15px
          rgba(143,101,19,.09);
      }


      .noteMode .cezooStatusText{
        color:#5d4213;
        text-shadow:none;
      }


      .cezooNotePaper{
        position:relative;
        z-index:8;

        width:24px;
        height:20px;
        min-width:24px;

        margin-right:
          clamp(6px, 1.8vw, 8px);

        border-radius:3px;

        background:
          linear-gradient(
            145deg,
            #fffdf5 0%,
            #fff7d7 100%
          );

        border:
          1px solid
          rgba(155,104,12,.16);

        box-shadow:
          0 3px 7px
          rgba(155,104,12,.12);

        transform:
          rotate(-3deg);

        animation:
          cezooNotePaperFloat
          2.8s ease-in-out infinite;
      }


      .cezooNotePaper::before{
        content:"";

        position:absolute;

        top:4px;
        left:5px;
        right:5px;

        height:1px;

        background:
          rgba(155,104,12,.28);

        box-shadow:
          0 4px 0
          rgba(155,104,12,.22),
          0 8px 0
          rgba(155,104,12,.16);
      }


      .cezooNotePin{
        position:absolute;

        top:-4px;
        left:50%;

        width:8px;
        height:8px;

        z-index:10;

        border-radius:50%;

        background:
          linear-gradient(
            180deg,
            #f59e0b 0%,
            #c97808 100%
          );

        box-shadow:
          0 2px 4px
          rgba(118,72,3,.25);

        transform:
          translateX(-50%);

        animation:
          cezooNotePinBounce
          2.2s ease-in-out infinite;
      }


      .cezooNotePin::after{
        content:"";

        position:absolute;

        left:50%;
        top:7px;

        width:1px;
        height:4px;

        background:#8b5a08;

        transform:
          translateX(-50%);
      }


      .cezooNoteLabel{
        font-weight:900;
      }


      .cezooNoteGlow{
        position:absolute;

        top:-30px;
        left:-35%;

        width:55%;
        height:85px;

        z-index:2;

        opacity:.72;

        background:
          radial-gradient(
            circle,
            rgba(255,255,255,.9),
            transparent 68%
          );

        animation:
          cezooMovingGlow
          7s linear infinite;

        pointer-events:none;
      }


      .noteMode::after{
        content:"";

        position:absolute;

        left:0;
        right:0;
        bottom:0;

        height:7px;

        z-index:1;

        background:
          linear-gradient(
            to top,
            rgba(188,127,15,.07),
            transparent
          );

        pointer-events:none;
      }



      /* =====================================
         4. LAUNCHING SOON UI

         Alarm clock at left.
         Background filled with soft CSS hearts.
         No emoji and no large heart icon.
      ===================================== */

      .cezooStatusInner.launchMode{
        color:#54152b;

        background:
          linear-gradient(
            135deg,
            #fff5f8 0%,
            #ffe7ee 48%,
            #fff8fa 100%
          );

        border:
          1px solid
          rgba(190,24,93,.14);

        border-bottom:
          1px solid
          rgba(190,24,93,.2);

        box-shadow:
          0 -5px 18px
          rgba(190,24,93,.1);

        overflow:hidden;
      }


      .launchMode::before{
        content:"";

        position:absolute;

        top:-28px;
        right:-24px;

        width:115px;
        height:82px;

        z-index:0;

        border-radius:50%;

        background:
          radial-gradient(
            circle,
            rgba(244,63,94,.14),
            rgba(244,63,94,.035) 54%,
            transparent 74%
          );

        animation:
          cezooLaunchAuraMove
          4.8s ease-in-out infinite;

        pointer-events:none;
      }


      .launchMode::after{
        content:"";

        position:absolute;

        left:-34px;
        bottom:-38px;

        width:120px;
        height:82px;

        z-index:0;

        border-radius:50%;

        background:
          radial-gradient(
            circle,
            rgba(236,72,153,.1),
            transparent 72%
          );

        animation:
          cezooLaunchAuraMoveTwo
          5.6s ease-in-out infinite;

        pointer-events:none;
      }


      .cezooLaunchHeartField{
        position:absolute;
        inset:0;

        z-index:1;

        overflow:hidden;
        pointer-events:none;
      }


      .cezooLaunchFloatingHeart{
        position:absolute;

        left:var(--heart-left);
        bottom:var(--heart-bottom);

        width:var(--heart-size);
        height:var(--heart-size);

        opacity:var(--heart-opacity);

        transform:
          rotate(-45deg)
          scale(.75);

        background:
          rgba(225,29,72,.28);

        border-radius:
          2px 0 2px 0;

        filter:
          blur(var(--heart-blur));

        animation:
          cezooLaunchHeartFloat
          var(--heart-speed)
          ease-in-out infinite;

        animation-delay:
          var(--heart-delay);
      }


      .cezooLaunchFloatingHeart::before,
      .cezooLaunchFloatingHeart::after{
        content:"";

        position:absolute;

        width:100%;
        height:100%;

        border-radius:50%;

        background:inherit;
      }


      .cezooLaunchFloatingHeart::before{
        top:-50%;
        left:0;
      }


      .cezooLaunchFloatingHeart::after{
        top:0;
        left:50%;
      }


      .cezooLaunchClockBadge{
        position:relative;
        z-index:8;

        width:34px;
        height:23px;
        min-width:34px;

        margin-right:
          clamp(6px, 1.9vw, 9px);

        display:flex;
        align-items:center;
        justify-content:center;

        border-radius:8px;

        background:
          linear-gradient(
            180deg,
            rgba(255,255,255,.96) 0%,
            rgba(255,235,241,.96) 100%
          );

        border:
          1px solid
          rgba(190,24,93,.17);

        box-shadow:
          0 4px 10px
          rgba(190,24,93,.11);

        animation:
          cezooLaunchClockBadgeFloat
          2.5s ease-in-out infinite;
      }


      .cezooAlarmClock{
        position:relative;

        width:15px;
        height:15px;

        border:
          1.4px solid
          #be123c;

        border-radius:50%;

        background:
          rgba(255,255,255,.72);

        box-shadow:
          0 1px 4px
          rgba(190,18,60,.15);
      }


      .cezooAlarmClock::before{
        content:"";

        position:absolute;

        left:50%;
        top:2px;

        width:1.2px;
        height:4.5px;

        border-radius:999px;

        background:#be123c;

        transform-origin:
          50% 100%;

        transform:
          translateX(-50%)
          rotate(15deg);

        animation:
          cezooAlarmHourMove
          6s linear infinite;
      }


      .cezooAlarmClock::after{
        content:"";

        position:absolute;

        left:50%;
        top:50%;

        width:4.7px;
        height:1.2px;

        border-radius:999px;

        background:#be123c;

        transform-origin:
          0 50%;

        transform:
          translateY(-50%)
          rotate(-25deg);

        animation:
          cezooAlarmMinuteMove
          2.4s linear infinite;
      }


      .cezooAlarmBell{
        position:absolute;

        top:-3px;

        width:5px;
        height:4px;

        border:
          1.2px solid
          #be123c;

        border-bottom:0;

        border-radius:
          5px 5px 0 0;

        background:
          rgba(255,255,255,.55);
      }


      .cezooAlarmBell.left{
        left:-2px;

        transform:
          rotate(-28deg);
      }


      .cezooAlarmBell.right{
        right:-2px;

        transform:
          rotate(28deg);
      }


      .cezooAlarmFoot{
        position:absolute;

        bottom:-3px;

        width:4px;
        height:1.2px;

        border-radius:999px;

        background:#be123c;
      }


      .cezooAlarmFoot.left{
        left:1px;

        transform:
          rotate(-28deg);
      }


      .cezooAlarmFoot.right{
        right:1px;

        transform:
          rotate(28deg);
      }


      .cezooLaunchContent{
        position:relative;
        z-index:8;

        min-width:0;
        flex:1;

        display:flex;
        align-items:center;

        gap:
          clamp(5px, 1.5vw, 8px);
      }


      .cezooLaunchLabelWrap{
        min-width:0;
        flex:1;

        display:flex;
        align-items:flex-start;
        justify-content:center;
      }


      .cezooLaunchLabel{
        display:block;

        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;

        font-family:
          Arial,
          sans-serif;

        font-size:
          clamp(8px, 2.2vw, 10.5px);

        font-weight:900;
        line-height:1;

        letter-spacing:.18px;

        color:#831843;

        text-transform:uppercase;
      }


      .cezooLaunchTimer{
        min-width:max-content;

        padding:
          4px 7px;

        border:
          1px solid
          rgba(190,24,93,.15);

        border-radius:7px;

        background:
          rgba(255,255,255,.7);

        box-shadow:
          inset 0 1px 0
          rgba(255,255,255,.78),
          0 2px 7px
          rgba(190,24,93,.08);

        font-family:
          Arial,
          sans-serif;

        font-size:
          clamp(8.3px, 2.35vw, 10.8px);

        font-weight:900;
        line-height:1;

        letter-spacing:.28px;

        color:#be123c;

        white-space:nowrap;

        animation:
          cezooLaunchTimerGlow
          2.1s ease-in-out infinite;
      }


      .cezooLaunchShine{
        position:absolute;

        top:-28px;
        left:-35%;

        width:42%;
        height:78px;

        z-index:2;

        opacity:.64;

        transform:
          rotate(8deg);

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.77),
            transparent
          );

        animation:
          cezooLaunchShineMove
          6s ease-in-out infinite;

        pointer-events:none;
      }


      /* =====================================
         ANIMATIONS
      ===================================== */

      @keyframes cezooRainCloudFloat{
        0%,100%{
          transform:translateY(0);
        }
        50%{
          transform:translateY(-1.5px);
        }
      }


      @keyframes cezooRainFall{
        0%{
          transform:
            translateY(-12px)
            rotate(14deg);
          opacity:0;
        }
        15%{
          opacity:.85;
        }
        100%{
          transform:
            translateY(46px)
            rotate(14deg);
          opacity:.08;
        }
      }


      @keyframes cezooMovingGlow{
        from{
          transform:translateX(0);
        }
        to{
          transform:translateX(285%);
        }
      }


      @keyframes cezooClosedCloudMove{
        from{
          transform:translateX(-90px);
        }
        to{
          transform:translateX(440px);
        }
      }


      @keyframes cezooClosedBoardFloat{
        0%,100%{
          transform:
            rotate(-2.5deg)
            translateY(0);
        }
        50%{
          transform:
            rotate(2.5deg)
            translateY(-1px);
        }
      }


      @keyframes cezooNotePaperFloat{
        0%,100%{
          transform:
            rotate(-3deg)
            translateY(0);
        }
        50%{
          transform:
            rotate(-1deg)
            translateY(-1px);
        }
      }


      @keyframes cezooNotePinBounce{
        0%,100%{
          transform:
            translateX(-50%)
            translateY(0);
        }
        50%{
          transform:
            translateX(-50%)
            translateY(-1px);
        }
      }


      @keyframes cezooLaunchBoardFloat{
        0%,100%{
          transform:
            rotate(-2deg)
            translateY(0);
        }
        50%{
          transform:
            rotate(2deg)
            translateY(-1px);
        }
      }


      @keyframes cezooLaunchRingRotate{
        from{
          transform:rotate(0deg);
        }
        to{
          transform:rotate(360deg);
        }
      }


      @keyframes cezooLaunchHourHand{
        from{
          transform:
            translateX(-50%)
            rotate(0deg);
        }
        to{
          transform:
            translateX(-50%)
            rotate(360deg);
        }
      }


      @keyframes cezooLaunchMinuteHand{
        from{
          transform:
            translateY(-50%)
            rotate(0deg);
        }
        to{
          transform:
            translateY(-50%)
            rotate(360deg);
        }
      }


      @keyframes cezooLaunchSoftMove{
        0%,100%{
          transform:translateX(0);
        }
        50%{
          transform:translateX(-15px);
        }
      }


      @keyframes cezooLaunchHeartRise{0%{opacity:0;transform:translateY(0) translateX(0) rotate(-45deg) scale(.55);}16%{opacity:.58;}52%{opacity:.32;transform:translateY(-20px) translateX(5px) rotate(-45deg) scale(.82);}100%{opacity:0;transform:translateY(-43px) translateX(-3px) rotate(-45deg) scale(1.05);}}
      @keyframes cezooLaunchBadgeFloat{0%,100%{transform:translateY(0) rotate(-1.5deg);}50%{transform:translateY(-1.5px) rotate(1.5deg);}}
      @keyframes cezooLaunchHeartBeat{0%,100%{transform:rotate(-45deg) scale(1);}18%{transform:rotate(-45deg) scale(1.13);}34%{transform:rotate(-45deg) scale(1);}52%{transform:rotate(-45deg) scale(1.08);}}
      @keyframes cezooLaunchHeartPulse{0%{opacity:.5;transform:scale(.58);}75%,100%{opacity:0;transform:scale(1.35);}}
      @keyframes cezooLaunchAuraMove{0%,100%{transform:translateX(0);}50%{transform:translateX(-14px);}}
      @keyframes cezooLaunchAuraMoveTwo{0%,100%{transform:translateX(0);}50%{transform:translateX(17px);}}
      @keyframes cezooLaunchTimerGlow{0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 2px 7px rgba(190,24,93,.08);}50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 3px 10px rgba(190,24,93,.16);}}
      @keyframes cezooLaunchShineMove{0%,15%{transform:translateX(0) rotate(8deg);opacity:0;}30%{opacity:.65;}55%,100%{transform:translateX(350%) rotate(8deg);opacity:0;}}



      @keyframes cezooLaunchHeartFloat{
        0%{
          opacity:0;
          transform:
            translate3d(0,7px,0)
            rotate(-45deg)
            scale(.64);
        }

        18%{
          opacity:var(--heart-opacity);
        }

        50%{
          opacity:
            calc(
              var(--heart-opacity) * .82
            );

          transform:
            translate3d(
              var(--heart-drift),
              -8px,
              0
            )
            rotate(-45deg)
            scale(.84);
        }

        100%{
          opacity:0;

          transform:
            translate3d(
              calc(
                var(--heart-drift) * -.6
              ),
              -24px,
              0
            )
            rotate(-45deg)
            scale(1.03);
        }
      }


      @keyframes cezooLaunchClockBadgeFloat{
        0%,100%{
          transform:
            translateY(0)
            rotate(-1deg);
        }

        50%{
          transform:
            translateY(-1.3px)
            rotate(1deg);
        }
      }


      @keyframes cezooAlarmHourMove{
        from{
          transform:
            translateX(-50%)
            rotate(0deg);
        }

        to{
          transform:
            translateX(-50%)
            rotate(360deg);
        }
      }


      @keyframes cezooAlarmMinuteMove{
        from{
          transform:
            translateY(-50%)
            rotate(0deg);
        }

        to{
          transform:
            translateY(-50%)
            rotate(360deg);
        }
      }


      @keyframes cezooLaunchAuraMove{
        0%,100%{
          transform:translateX(0);
        }

        50%{
          transform:translateX(-14px);
        }
      }


      @keyframes cezooLaunchAuraMoveTwo{
        0%,100%{
          transform:translateX(0);
        }

        50%{
          transform:translateX(17px);
        }
      }


      @keyframes cezooLaunchTimerGlow{
        0%,100%{
          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.78),
            0 2px 7px
            rgba(190,24,93,.08);
        }

        50%{
          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.92),
            0 3px 10px
            rgba(190,24,93,.15);
        }
      }


      @keyframes cezooLaunchShineMove{
        0%,15%{
          transform:
            translateX(0)
            rotate(8deg);

          opacity:0;
        }

        30%{
          opacity:.64;
        }

        55%,100%{
          transform:
            translateX(350%)
            rotate(8deg);

          opacity:0;
        }
      }

      /* =====================================
         SMALL MOBILE
      ===================================== */

      @media(max-width:360px){

        #cezooStatusBar{
          height:27px;
        }

        .cezooStatusInner{
          height:27px;
          padding:0 9px;
        }

        .cezooStatusIcon{
          width:16px;
          height:16px;
          min-width:16px;

          margin-right:4px;
        }

        .cezooStatusIcon i{
          font-size:10px;
        }

        .cezooStatusText{
          font-size:8.7px;
          letter-spacing:-.1px;
        }

      }


      /* =====================================
         COMPACT MODE WHEN CART APPEARS
      ===================================== */

      #cezooStatusBar.cezooCompactStatus
      .cezooStatusInner{
        padding:0 8px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooStatusIcon{
        width:15px;
        height:15px;
        min-width:15px;

        margin-right:4px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooStatusIcon i{
        font-size:9px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooClosedBoard{
        width:32px;
        min-width:32px;
        height:19px;
        margin-right:5px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooClosedBoardText{
        font-size:5.8px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooNotePaper{
        width:20px;
        min-width:20px;
        height:17px;
        margin-right:5px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooLaunchClockBadge{
        width:29px;
        min-width:29px;
        height:19px;
        margin-right:5px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooAlarmClock{
        width:13px;
        height:13px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooLaunchContent{
        gap:4px;
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooLaunchLabel{
        font-size:
          clamp(6.8px, 1.9vw, 8.2px);
      }


      #cezooStatusBar.cezooCompactStatus
      .cezooLaunchTimer{
        font-size:
          clamp(7.3px, 2vw, 9px);
        letter-spacing:.15px;
      }



      #cezooStatusBar.cezooCompactStatus
      .cezooStatusText{
        font-size:
          clamp(7.7px, 2.2vw, 9.4px);

        letter-spacing:-.18px;
      }


      /* =====================================
         ACCESSIBILITY
      ===================================== */

      @media(prefers-reduced-motion:reduce){

        .cezooStatusInner,
        .cezooStatusInner *,
        .cezooStatusInner::before,
        .cezooStatusInner::after{
          animation:none !important;
          transition:none !important;
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* =========================================
     CREATE RAIN DROPS
  ========================================= */

  function createRainDrops() {

    let html = "";

    const totalDrops = 26;

    for (
      let index = 0;
      index < totalDrops;
      index++
    ) {

      const left =
        Math.floor(Math.random() * 100);

      const delay =
        (
          Math.random() * 1.5
        ).toFixed(2);

      const speed =
        (
          0.55 +
          Math.random() * 0.5
        ).toFixed(2);

      html += `
        <span
          class="cezooRainDrop"
          style="
            --rain-left:${left}%;
            --rain-delay:-${delay}s;
            --rain-speed:${speed}s;
          "
        ></span>
      `;
    }

    return html;
  }


  /* =========================================
     CREATE CLOSED CLOUDS
  ========================================= */

  function createClosedClouds() {

    const clouds = [
      {
        left: "-12%",
        top: "8px",
        width: "38px",
        opacity: ".32",
        speed: "10s",
        delay: "-2s"
      },
      {
        left: "18%",
        top: "12px",
        width: "29px",
        opacity: ".23",
        speed: "13s",
        delay: "-8s"
      },
      {
        left: "51%",
        top: "6px",
        width: "42px",
        opacity: ".27",
        speed: "12s",
        delay: "-5s"
      },
      {
        left: "79%",
        top: "13px",
        width: "26px",
        opacity: ".2",
        speed: "14s",
        delay: "-11s"
      }
    ];

    return clouds.map(function (cloud) {

      return `
        <span
          class="cezooClosedCloud"
          style="
            --cloud-left:${cloud.left};
            --cloud-top:${cloud.top};
            --cloud-width:${cloud.width};
            --cloud-opacity:${cloud.opacity};
            --cloud-speed:${cloud.speed};
            --cloud-delay:${cloud.delay};
          "
        ></span>
      `;

    }).join("");
  }


  /* =========================================
     CREATE SOFT CSS HEART BACKGROUND
  ========================================= */

  function createLaunchHearts() {

    const totalHearts = 30;

    let html = "";

    for (
      let index = 0;
      index < totalHearts;
      index++
    ) {

      const left =
        1 +
        Math.floor(
          Math.random() * 97
        );

      const bottom =
        -8 +
        Math.floor(
          Math.random() * 35
        );

      const size =
        (
          3.8 +
          Math.random() * 5.4
        ).toFixed(1);

      const speed =
        (
          4.2 +
          Math.random() * 4.5
        ).toFixed(2);

      const delay =
        (
          Math.random() * 7
        ).toFixed(2);

      const opacity =
        (
          .11 +
          Math.random() * .18
        ).toFixed(2);

      const blur =
        (
          Math.random() * .65
        ).toFixed(2);

      const drift =
        (
          -8 +
          Math.random() * 16
        ).toFixed(1);

      html += `
        <span
          class="cezooLaunchFloatingHeart"
          style="
            --heart-left:${left}%;
            --heart-bottom:${bottom}px;
            --heart-size:${size}px;
            --heart-speed:${speed}s;
            --heart-delay:-${delay}s;
            --heart-opacity:${opacity};
            --heart-blur:${blur}px;
            --heart-drift:${drift}px;
          "
        ></span>
      `;
    }

    return html;
  }


  /* =========================================
     SAFE TEXT HELPER
  ========================================= */

  function setStatusMessage(
    selector,
    message
  ) {

    const textElement =
      cezooStatusBar.querySelector(
        selector
      );

    if (textElement) {
      textElement.textContent =
        message || "";
    }
  }


  /* =========================================
     MATCH DELIVERY BAR WIDTH
  ========================================= */

  function updateStatusBarSize() {

    if (
      getComputedStyle(cezooStatusBar)
        .display === "none"
    ) {
      return;
    }

    const wrapRect =
      floatBarWrap.getBoundingClientRect();

    const deliveryRect =
      deliveryFloatBar.getBoundingClientRect();

    const deliveryLeft =
      deliveryRect.left -
      wrapRect.left;

    const deliveryWidth =
      deliveryRect.width;

    cezooStatusBar.style.left =
      `${deliveryLeft}px`;

    cezooStatusBar.style.width =
      `${deliveryWidth}px`;

    cezooStatusBar.classList.toggle(
      "cezooCompactStatus",
      deliveryWidth < 245
    );
  }


  /* =========================================
     STATUS TRANSITION HELPERS
  ========================================= */

  function waitForStatusTransition(
    milliseconds = STATUS_TRANSITION_MS
  ) {

    return new Promise(function (resolve) {
      setTimeout(resolve, milliseconds);
    });
  }


  function isStatusBarVisible() {

    return (
      cezooStatusBar.style.display ===
      "block"
    );
  }


  async function renderStatusWithTransition(
    renderStatus
  ) {

    const transitionId =
      ++statusTransitionId;

    const oldStatus =
      cezooStatusBar.querySelector(
        ".cezooStatusInner"
      );

    if (
      isStatusBarVisible() &&
      oldStatus
    ) {

      oldStatus.classList.remove(
        "cezooStatusEntering",
        "cezooStatusEntered"
      );

      oldStatus.classList.add(
        "cezooStatusLeaving"
      );

      await waitForStatusTransition(
        STATUS_TRANSITION_MS
      );

      if (
        transitionId !==
        statusTransitionId
      ) {
        return false;
      }
    }

    renderStatus();

    if (
      transitionId !==
      statusTransitionId
    ) {
      return false;
    }

    openStatusBar();

    const newStatus =
      cezooStatusBar.querySelector(
        ".cezooStatusInner"
      );

    if (!newStatus) {
      return false;
    }

    newStatus.classList.add(
      "cezooStatusEntering"
    );

    /*
      Two animation frames guarantee the browser
      first paints the lower starting position.
    */

    requestAnimationFrame(function () {

      requestAnimationFrame(function () {

        if (
          transitionId !==
          statusTransitionId
        ) {
          return;
        }

        newStatus.classList.remove(
          "cezooStatusEntering"
        );

        newStatus.classList.add(
          "cezooStatusEntered"
        );
      });
    });

    return true;
  }


  /* =========================================
     OPEN STATUS BAR
  ========================================= */

  function openStatusBar() {

    cezooStatusBar.style.display =
      "block";

    deliveryFloatBar.style.borderRadius =
      "0 0 16px 16px";

    requestAnimationFrame(function () {
      updateStatusBarSize();
    });

    setTimeout(
      updateStatusBarSize,
      80
    );
  }


  /* =========================================
     SHOW RAIN UI
  ========================================= */

  async function showRainStatus(
    message =
      "Order may be delayed due to rain"
  ) {

    stopLaunchCountdown();

    currentMode = "rain";

    await renderStatusWithTransition(
      function () {

        cezooStatusBar.innerHTML = `

          <div class="cezooStatusInner rainMode">

            <div
              class="cezooRainLayer"
              aria-hidden="true"
            >
              ${createRainDrops()}
            </div>

            <div
              class="cezooStatusIcon"
              aria-hidden="true"
            >
              <i class="fa-solid fa-cloud-rain"></i>
            </div>

            <div class="cezooStatusText"></div>

          </div>

        `;

        setStatusMessage(
          ".cezooStatusText",
          message
        );
      }
    );
  }


  /* =========================================
     SHOW STORE CLOSED UI
  ========================================= */

  async function showStoreClosedStatus(
    message =
      "Store is currently closed"
  ) {

    stopLaunchCountdown();

    currentMode = "closed";

    await renderStatusWithTransition(
      function () {

        cezooStatusBar.innerHTML = `

          <div class="cezooStatusInner closedMode">

            <div
              class="cezooClosedCloudLayer"
              aria-hidden="true"
            >
              ${createClosedClouds()}
            </div>

            <div
              class="cezooClosedBoard"
              aria-hidden="true"
            >
              <span class="cezooClosedBoardText">
                CLOSED
              </span>
            </div>

            <div class="cezooStatusText"></div>

          </div>

        `;

        setStatusMessage(
          ".cezooStatusText",
          message
        );
      }
    );
  }


  /* =========================================
     SHOW CUSTOM NOTE UI
  ========================================= */

  async function showNoteStatus(
    message =
      "Please check the latest store update"
  ) {

    stopLaunchCountdown();

    currentMode = "note";

    await renderStatusWithTransition(
      function () {

        cezooStatusBar.innerHTML = `

          <div class="cezooStatusInner noteMode">

            <div
              class="cezooNoteGlow"
              aria-hidden="true"
            ></div>

            <div
              class="cezooNotePaper"
              aria-hidden="true"
            >
              <span class="cezooNotePin"></span>
            </div>

            <div class="cezooStatusText">
              <span class="cezooNoteLabel">
                Note:
              </span>

              <span class="cezooNoteMessage"></span>
            </div>

          </div>

        `;

        setStatusMessage(
          ".cezooNoteMessage",
          ` ${message}`
        );
      }
    );
  }


  /* =========================================
     LAUNCHING SOON COUNTDOWN

     Target: next Sunday at 1:00 PM
     Time zone: Asia/Kolkata
  ========================================= */

  function stopLaunchCountdown() {

    if (launchCountdownInterval) {

      clearInterval(
        launchCountdownInterval
      );

      launchCountdownInterval = null;
    }
  }


  function getNextSundayOnePmIndia() {

    /*
      India time is UTC +05:30.
      We calculate using a fixed offset so the
      result is correct on every device.
    */

    const indiaOffsetMs =
      5.5 * 60 * 60 * 1000;

    const nowUtc =
      Date.now();

    const indiaNow =
      new Date(
        nowUtc + indiaOffsetMs
      );

    const indiaYear =
      indiaNow.getUTCFullYear();

    const indiaMonth =
      indiaNow.getUTCMonth();

    const indiaDate =
      indiaNow.getUTCDate();

    const indiaDay =
      indiaNow.getUTCDay();

    let daysUntilSunday =
      (7 - indiaDay) % 7;

    const todayOnePmIndiaAsShiftedUtc =
      Date.UTC(
        indiaYear,
        indiaMonth,
        indiaDate,
        13,
        0,
        0,
        0
      );

    const shiftedIndiaNowMs =
      indiaNow.getTime();

    if (
      daysUntilSunday === 0 &&
      shiftedIndiaNowMs >=
        todayOnePmIndiaAsShiftedUtc
    ) {
      daysUntilSunday = 7;
    }

    const targetShiftedIndiaMs =
      Date.UTC(
        indiaYear,
        indiaMonth,
        indiaDate + daysUntilSunday,
        13,
        0,
        0,
        0
      );

    return new Date(
      targetShiftedIndiaMs -
      indiaOffsetMs
    );
  }


  function formatLaunchCountdown(
    milliseconds
  ) {

    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          milliseconds / 1000
        )
      );

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (totalSeconds % 86400) /
        3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
        60
      );

    const seconds =
      totalSeconds % 60;

    const pad =
      function (value) {
        return String(value)
          .padStart(2, "0");
      };

    if (days > 0) {
      return (
        `${pad(days)}d ` +
        `${pad(hours)}:` +
        `${pad(minutes)}:` +
        `${pad(seconds)}`
      );
    }

    return (
      `${pad(hours)}:` +
      `${pad(minutes)}:` +
      `${pad(seconds)}`
    );
  }


  function updateLaunchCountdown() {

    const timerElement =
      cezooStatusBar.querySelector(
        ".cezooLaunchTimer"
      );

    if (!timerElement) {
      stopLaunchCountdown();
      return;
    }

    const target =
      getNextSundayOnePmIndia();

    const remaining =
      target.getTime() -
      Date.now();

    timerElement.textContent =
      formatLaunchCountdown(
        remaining
      );
  }


  async function showLaunchingSoonStatus() {

    stopLaunchCountdown();

    currentMode = "launching";

    const rendered =
      await renderStatusWithTransition(
        function () {

          cezooStatusBar.innerHTML = `

            <div class="cezooStatusInner launchMode">

              <div
                class="cezooLaunchHeartField"
                aria-hidden="true"
              >
                ${createLaunchHearts()}
              </div>

              <span
                class="cezooLaunchShine"
                aria-hidden="true"
              ></span>

              <div
                class="cezooLaunchClockBadge"
                aria-hidden="true"
              >
                <span class="cezooAlarmClock">
                  <span class="cezooAlarmBell left"></span>
                  <span class="cezooAlarmBell right"></span>
                  <span class="cezooAlarmFoot left"></span>
                  <span class="cezooAlarmFoot right"></span>
                </span>
              </div>

              <div class="cezooLaunchContent">

                <span class="cezooLaunchLabelWrap">

                  <span class="cezooLaunchLabel">
                    Launching Soon
                  </span>

                </span>

                <span
                  class="cezooLaunchTimer"
                  aria-live="off"
                >
                  00:00:00
                </span>

              </div>

            </div>

          `;
        }
      );

    if (!rendered) {
      return;
    }

    updateLaunchCountdown();

    launchCountdownInterval =
      setInterval(
        updateLaunchCountdown,
        1000
      );
  }


  /* =========================================
     HIDE COMPLETE STATUS BAR
  ========================================= */

  async function hideCezooStatus() {

    stopLaunchCountdown();

    currentMode = "none";

    const transitionId =
      ++statusTransitionId;

    const currentStatus =
      cezooStatusBar.querySelector(
        ".cezooStatusInner"
      );

    if (
      isStatusBarVisible() &&
      currentStatus
    ) {

      currentStatus.classList.remove(
        "cezooStatusEntering",
        "cezooStatusEntered"
      );

      currentStatus.classList.add(
        "cezooStatusLeaving"
      );

      await waitForStatusTransition(
        STATUS_TRANSITION_MS
      );

      if (
        transitionId !==
        statusTransitionId
      ) {
        return;
      }
    }

    cezooStatusBar.style.display =
      "none";

    cezooStatusBar.innerHTML =
      "";

    cezooStatusBar.classList.remove(
      "cezooCompactStatus"
    );

    deliveryFloatBar.style.borderRadius =
      "16px";
  }


  /* =========================================
     APPLY SUPABASE ROW
  ========================================= */

  async function applyStatusRow(row) {

    if (!row) {
      await hideCezooStatus();
      return;
    }

    /*
      is_visible must be TRUE.
      FALSE or NULL hides everything.
    */

    if (row.is_visible !== true) {
      await hideCezooStatus();
      return;
    }

    const type =
      String(
        row.status_type || ""
      )
        .trim()
        .toLowerCase();

    const message =
      String(
        row.message || ""
      ).trim();

    switch (type) {

      case "rain":

        await showRainStatus(
          message ||
          "Order may be delayed due to rain"
        );

        break;


      case "closed":

        await showStoreClosedStatus(
          message ||
          "Store is currently closed"
        );

        break;


      case "note":

        /*
          Empty custom note should not show.
        */

        if (!message) {
          await hideCezooStatus();
          return;
        }

        await showNoteStatus(message);

        break;


      case "launching":
      case "launch":
      case "launching_soon":

        await showLaunchingSoonStatus();

        break;


      default:

        await hideCezooStatus();

    }
  }


  /* =========================================
     LOAD CURRENT STATUS FROM SUPABASE
  ========================================= */

  async function loadCurrentStatus() {

    if (!db) {

      console.error(
        "Supabase client is unavailable. Expected window._supabaseClient."
      );

      hideCezooStatus();

      return;
    }

    try {

      const {
        data,
        error
      } = await db
        .from(STATUS_TABLE)
        .select(
          "id,is_visible,status_type,message,updated_at"
        )
        .eq("id", STATUS_ROW_ID)
        .maybeSingle();

      if (error) {
        throw error;
      }

      await applyStatusRow(data);

    } catch (error) {

      console.error(
        "Unable to load CEZOO status:",
        error
      );

      hideCezooStatus();
    }
  }


  /* =========================================
     SUBSCRIBE TO REALTIME UPDATES
  ========================================= */

  function startRealtimeStatus() {

    if (!db) {
      return;
    }

    /*
      Remove old channel before creating
      another one.
    */

    if (realtimeChannel) {

      db.removeChannel(
        realtimeChannel
      );

      realtimeChannel = null;
    }

    realtimeChannel =
      db
        .channel(
          "cezoo-status-bar-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: STATUS_TABLE,
            filter:
              `id=eq.${STATUS_ROW_ID}`
          },
          function (payload) {

            console.log(
              "CEZOO status updated:",
              payload
            );

            if (
              payload.eventType === "DELETE"
            ) {
              void hideCezooStatus();
              return;
            }

            void applyStatusRow(
              payload.new
            );
          }
        )
        .subscribe(function (
          status,
          error
        ) {

          if (error) {

            console.error(
              "CEZOO realtime error:",
              error
            );

            return;
          }

          console.log(
            "CEZOO realtime status:",
            status
          );
        });
  }


  /* =========================================
     GLOBAL TEST FUNCTIONS
  ========================================= */

  window.showCezooRainStatus =
    showRainStatus;

  window.showCezooStoreClosed =
    showStoreClosedStatus;

  window.showCezooNoteStatus =
    showNoteStatus;

  window.showCezooLaunchingSoon =
    showLaunchingSoonStatus;

  window.hideCezooStatus =
    hideCezooStatus;

  window.reloadCezooStatus =
    loadCurrentStatus;

  window.getCezooStatusMode =
    function () {
      return currentMode;
    };


  /* =========================================
     RESPONSIVE WIDTH SUPPORT
  ========================================= */

  window.addEventListener(
    "resize",
    function () {

      requestAnimationFrame(
        updateStatusBarSize
      );

    }
  );


  window.addEventListener(
    "orientationchange",
    function () {

      setTimeout(
        updateStatusBarSize,
        150
      );

    }
  );


  if ("ResizeObserver" in window) {

    const resizeObserver =
      new ResizeObserver(function () {

        requestAnimationFrame(
          updateStatusBarSize
        );

      });

    resizeObserver.observe(
      floatBarWrap
    );

    resizeObserver.observe(
      deliveryFloatBar
    );

    if (cartFloatBox) {
      resizeObserver.observe(
        cartFloatBox
      );
    }
  }


  /* =========================================
     WATCH CART VISIBILITY CHANGES
  ========================================= */

  if (
    cartFloatBox &&
    "MutationObserver" in window
  ) {

    const cartObserver =
      new MutationObserver(function () {

        requestAnimationFrame(
          updateStatusBarSize
        );

        setTimeout(
          updateStatusBarSize,
          100
        );

      });

    cartObserver.observe(
      cartFloatBox,
      {
        attributes:true,
        attributeFilter:[
          "style",
          "class"
        ]
      }
    );
  }


  /* =========================================
     CLEAN REALTIME CONNECTION
  ========================================= */

  window.addEventListener(
    "pagehide",
    function () {

      stopLaunchCountdown();

      if (
        db &&
        realtimeChannel
      ) {

        db.removeChannel(
          realtimeChannel
        );

        realtimeChannel = null;
      }

    }
  );


  /* =========================================
     START
  ========================================= */

  cezooStatusBar.style.display =
    "none";

  cezooStatusBar.innerHTML =
    "";

  deliveryFloatBar.style.borderRadius =
    "16px";

  db = await waitForSupabaseClient();

  if (!db) {
    console.error(
      "Supabase client was not ready. Expected window._supabaseClient."
    );
    return;
  }

  console.log(
    "CEZOO status connected to existing Supabase client."
  );

  await loadCurrentStatus();

  startRealtimeStatus();

});