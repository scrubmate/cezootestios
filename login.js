
let firebaseAuth = null;
let confirmationResult = null;
let recaptchaVerifier = null;
let otpSending = false;
async function initializeFirebaseOtp(){

  try{

    const response = await fetch(
      "https://cezooooo-backend.onrender.com/firebase-config"
    );

    const firebaseConfig = await response.json();

    if(!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    firebaseAuth = firebase.auth();

    console.log("Firebase OTP ready");

  }catch(error){

    console.error("Firebase initialization error:", error);

    document.getElementById("error").innerText =
      "OTP service unavailable";
  }
}

initializeFirebaseOtp();
function openCezooProfile(){

  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );

  if(
    user &&
    user.name &&
    user.mobile &&
    user.otp &&
    user.login === true
  ){

    document.getElementById("profileUserName").innerText =
      user.name;

    document.getElementById("profileUserMobile").innerText =
      "+91 - " + user.mobile;

    document
      .getElementById("cezooProfilePopup")
      .classList.add("open");

    document.body.style.overflow = "hidden";

  }else{

    openLoginPopup();

  }
}

function shake(el){
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function showStep(id, text){
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.getElementById("title").innerText = text;
}

/* NAME: letters + space only */
const nameInput = document.getElementById("nameInput");

nameInput.addEventListener("input", function(){
  this.value = this.value
    .replace(/[^A-Za-z ]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
});

function goMobile(){
  const name = document.getElementById("nameInput");

  if(name.value.trim().length < 2){
    shake(name);
    return;
  }

  showStep("mobileStep","Enter mobile number");
  document.getElementById("mobileInput").focus();
}

/* MOBILE: numbers only */
const mobileInput = document.getElementById("mobileInput");

mobileInput.addEventListener("input", function(){
  this.value = this.value.replace(/[^0-9]/g,"").slice(0,10);
});
const CEZOO_OTP_MAX_ATTEMPTS = 5;
const CEZOO_OTP_LOCK_TIME =
  5 * 60 * 60 * 1000; // 5 hours

function getOtpSpamData(){

  try{

    return JSON.parse(
      localStorage.getItem("cezooOtpSpamData") || "{}"
    );

  }catch(error){

    return {};

  }
}

function saveOtpSpamData(data){

  localStorage.setItem(
    "cezooOtpSpamData",
    JSON.stringify(data)
  );

}
function hideLoginKeyboard(){

  document
    .querySelectorAll(
      "#loginPopup input, #loginPopup textarea"
    )
    .forEach(element => {
      element.blur();
    });

  if(document.activeElement){
    document.activeElement.blur();
  }
}
function getMobileOtpStatus(mobile){

  const now = Date.now();
  const data = getOtpSpamData();

  let record = data[mobile];

  if(!record){

    record = {
      attempts: 0,
      firstAttemptTime: now
    };

    data[mobile] = record;
    saveOtpSpamData(data);
  }

  /*
    Unlock after 5 hours
  */
  if(
    now - Number(record.firstAttemptTime || 0)
    >= CEZOO_OTP_LOCK_TIME
  ){

    record = {
      attempts: 0,
      firstAttemptTime: now
    };

    data[mobile] = record;
    saveOtpSpamData(data);
  }

  return {
    data,
    record,
    locked:
      Number(record.attempts || 0)
      >= CEZOO_OTP_MAX_ATTEMPTS
  };
}

function increaseMobileOtpAttempt(mobile){

  const now = Date.now();
  const data = getOtpSpamData();

  let record = data[mobile];

  if(
    !record ||
    now - Number(record.firstAttemptTime || 0)
      >= CEZOO_OTP_LOCK_TIME
  ){

    record = {
      attempts: 0,
      firstAttemptTime: now
    };
  }

  record.attempts =
    Number(record.attempts || 0) + 1;

  data[mobile] = record;

  saveOtpSpamData(data);
}
function resetFirebaseRecaptcha(){

  if(recaptchaVerifier){

    try{
      recaptchaVerifier.clear();
    }catch(error){
      console.warn(
        "reCAPTCHA clear warning:",
        error
      );
    }

    recaptchaVerifier = null;
  }

  const container =
    document.getElementById(
      "recaptcha-container"
    );

  if(container){
    container.innerHTML = "";
  }
}
async function goOtp(){

  if(otpSending){
    return;
  }

  const mobile =
    document.getElementById("mobileInput");

  const sendOtpBtn =
    document.getElementById("sendOtpBtn");

  mobile.value = mobile.value
    .replace(/[^0-9]/g, "")
    .slice(0, 10);

  if(mobile.value.length !== 10){

    shake(
      document.getElementById("mobileBox")
    );

    return;
  }

  /*
    Check this mobile number's OTP limit
  */
  const otpStatus =
    getMobileOtpStatus(mobile.value);

  if(otpStatus.locked){

    document.getElementById("error").innerText = "";

    shake(
      document.getElementById("mobileBox")
    );

    return;
  }

  if(!firebaseAuth){

    shake(
      document.getElementById("mobileBox")
    );

    return;
  }

  try{

    otpSending = true;

    sendOtpBtn.disabled = true;
    sendOtpBtn.classList.add("otpLoading");

    sendOtpBtn.innerHTML = `
      <div class="iosOtpSpinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;

    document.getElementById("error").innerText = "";

   resetFirebaseRecaptcha();

recaptchaVerifier =
  new firebase.auth.RecaptchaVerifier(
    "sendOtpBtn",
    {
      size: "invisible",

      callback: function(){
        console.log(
          "✅ reCAPTCHA verified"
        );
      },

      "expired-callback": function(){

        console.warn(
          "reCAPTCHA expired"
        );

        resetFirebaseRecaptcha();
      }
    }
  );

    confirmationResult =
      await firebaseAuth.signInWithPhoneNumber(
        "+91" + mobile.value,
        recaptchaVerifier
      );

    /*
      Count only after Firebase successfully sends OTP
    */
    increaseMobileOtpAttempt(
      mobile.value
    );

    showStep(
      "otpStep",
      "Enter OTP"
    );

    document
      .querySelector(".otpBoxes input")
      .focus();

    console.log(
      "OTP sent successfully"
    );

  }catch(error){

  console.error(
    "OTP send error:",
    error
  );

  confirmationResult = null;

  document.getElementById("error").innerText = "";

  shake(
    document.getElementById("mobileBox")
  );

  /*
    Completely destroy the failed reCAPTCHA.
    A fresh one will be created on the next attempt.
  */
  if(recaptchaVerifier){

    try{
      recaptchaVerifier.clear();
    }catch(clearError){
      console.warn(
        "reCAPTCHA clear failed:",
        clearError
      );
    }

    recaptchaVerifier = null;
  }

  /*
    Clean the container so Firebase can render again.
  */
  const recaptchaContainer =
    document.getElementById(
      "recaptcha-container"
    );

  if(recaptchaContainer){
    recaptchaContainer.innerHTML = "";
  }

}finally{

  otpSending = false;

  sendOtpBtn.disabled = false;
  sendOtpBtn.classList.remove("otpLoading");
  sendOtpBtn.innerHTML = "Send OTP";
}
}
/* OTP: numbers only */
const otpInputs = document.querySelectorAll(".otpBoxes input");

otpInputs.forEach((input,index) => {

  input.setAttribute("inputmode","numeric");
  input.setAttribute("pattern","[0-9]*");

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g,"").slice(0,1);

    if(input.value && otpInputs[index + 1]){
      otpInputs[index + 1].focus();
    }

    const otp = [...otpInputs].map(i => i.value).join("");

  if(otp.length === 6){

  if(!confirmationResult){

    document.getElementById("error").innerText = "";

    shake(document.getElementById("otpBoxes"));

    otpInputs.forEach(i => i.value = "");
    otpInputs[0].focus();

    return;
  }

  document.getElementById("error").innerText = "";

  const userOtpSpinner =
  document.getElementById("userOtpSpinner");

userOtpSpinner?.classList.add("show");

otpInputs.forEach(input => {
  input.disabled = true;
});

confirmationResult.confirm(otp)
  .then(result => {

      const user = {
        uid: result.user.uid,
        name: document.getElementById("nameInput").value.trim(),
        mobile: document.getElementById("mobileInput").value.trim(),
        phoneNumber: result.user.phoneNumber,
        otp: otp,
        login: true,
        verified: true,
        loginTime: new Date().toISOString()
      };

    
localStorage.setItem(
  "cezooUser",
  JSON.stringify(user)
);
userOtpSpinner?.classList.remove("show");

otpInputs.forEach(input => {
  input.disabled = false;
});
/* Load logged-user orders after successful login */
setTimeout(function(){

  if(
    typeof window.checkLoggedUserOrdersInConsole === "function"
  ){
    window.checkLoggedUserOrdersInConsole();
  }else{
    console.error(
      "❌ order-status-check.js is not loaded"
    );
  }

}, 500);

document.getElementById("error").innerText = "";

hideLoginKeyboard();

closeLoginPopup();

console.log(
  "✅ OTP verified successfully:",
  user
);
    })
    .catch(error => {

  console.error(
    "OTP verification error:",
    error
  );

  userOtpSpinner?.classList.remove("show");

  otpInputs.forEach(input => {
    input.disabled = false;
    input.value = "";
  });

  document.getElementById("error").innerText = "";

  shake(
    document.getElementById("otpBoxes")
  );

  otpInputs[0].focus();

});
}
});
  input.addEventListener("keydown", e => {
    if(e.key === "Backspace"){
      if(input.value){
        input.value = "";
        e.preventDefault();
      }else if(otpInputs[index - 1]){
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = "";
        e.preventDefault();
      }
    }
  });

});
function resetLoginPopup(){

  document.getElementById("nameInput").value = "";
  document.getElementById("mobileInput").value = "";

  document.querySelectorAll("#otpBoxes input")
    .forEach(input => {
      input.value = "";
      input.disabled = false;
    });

  document
    .getElementById("userOtpSpinner")
    ?.classList.remove("show");

  document.getElementById("error").innerText = "";

  confirmationResult = null;
resetFirebaseRecaptcha();
  showStep(
    "nameStep",
    "Log in or Sign up"
  );
}
function goBackMobile(){
  document.querySelectorAll(".otpBoxes input")
    .forEach(i => i.value = "");

  document.getElementById("error").innerText = "";

  showStep("mobileStep","Enter mobile number");
  document.getElementById("mobileInput").focus();
}
function openLoginPopup(){

  resetLoginPopup();

  document
    .getElementById("loginPopup")
    .classList.add("open");

  setTimeout(() => {

    document
      .getElementById("nameInput")
      .focus();

  }, 100);
}
function closeLoginPopup(){

  hideLoginKeyboard();

  document
    .getElementById("loginPopup")
    .classList.remove("open");
}
let loginStartX = 0;
let loginStartY = 0;

const loginPopup = document.getElementById("loginPopup");
/* Allow keyboard to open again when user taps inputs */
document
  .querySelectorAll("#loginPopup input")
  .forEach(input => {

    input.addEventListener("pointerdown", function(){

      this.focus();

    });

  });
loginPopup.addEventListener("touchstart", function(e){
  const touch = e.touches[0];

  loginStartX = touch.clientX;
  loginStartY = touch.clientY;
});

loginPopup.addEventListener("touchend", function(e){
  const touch = e.changedTouches[0];

  const diffX = touch.clientX - loginStartX;
  const diffY = touch.clientY - loginStartY;

  if(Math.abs(diffX) > 90 && Math.abs(diffY) < 70){
    closeLoginPopup();
  }
});

let cart = JSON.parse(localStorage.getItem("cezooCart") || "{}");
