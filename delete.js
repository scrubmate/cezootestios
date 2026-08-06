/* =========================================
   DELETE ACCOUNT SHEET
========================================= */

const deleteSheetOverlay =
  document.getElementById("deleteSheetOverlay");

function openDeleteAccountPopup(){

  deleteSheetOverlay.classList.add("open");

  document.body.style.overflow = "hidden";
}

function closeDeleteAccountPopup(){

  deleteSheetOverlay.classList.remove("open");

  document.body.style.overflow = "hidden";
}

/* Tap outside sheet */
deleteSheetOverlay.addEventListener("click", function(e){

  if(e.target === deleteSheetOverlay){
    closeDeleteAccountPopup();
  }

});

/* Swipe to close */

let deleteSheetStartX = 0;
let deleteSheetStartY = 0;

const deleteSheet =
  document.querySelector(".deleteSheet");

deleteSheet.addEventListener("touchstart", function(e){

  e.stopPropagation();

  const touch = e.touches[0];

  deleteSheetStartX = touch.clientX;
  deleteSheetStartY = touch.clientY;

},{passive:true});

deleteSheet.addEventListener("touchend", function(e){

  e.stopPropagation();

  const touch = e.changedTouches[0];

  const diffX =
    touch.clientX - deleteSheetStartX;

  const diffY =
    touch.clientY - deleteSheetStartY;

  if(
    Math.abs(diffX) > 90 &&
    Math.abs(diffY) < 70
  ){
    closeDeleteAccountPopup();
  }

},{passive:true});


const deleteSheetDeleteBtn =
  document.getElementById("deleteSheetDeleteBtn");

deleteSheetDeleteBtn.addEventListener("click", async function(){

  if(deleteSheetDeleteBtn.disabled){
    return;
  }

  const user = JSON.parse(
    localStorage.getItem("cezooUser") || "null"
  );

 if(!user?.mobile){

  deleteSheetDeleteBtn.innerHTML = `
    <i class="fa-solid fa-xmark"></i>
  `;

  deleteSheetDeleteBtn.classList.add("error");
  deleteSheetDeleteBtn.disabled = true;

  setTimeout(function(){

    deleteSheetDeleteBtn.disabled = false;

    deleteSheetDeleteBtn.innerHTML =
      "Delete Account";

    deleteSheetDeleteBtn.classList.remove("error");

  }, 1500);

  return;
}

  const mobile =
    String(user.mobile)
      .replace(/\D/g, "")
      .slice(-10);

  const mobileVariants = [
    mobile,
    `91${mobile}`,
    `+91${mobile}`,
    `+91 ${mobile}`
  ];

  deleteSheetDeleteBtn.disabled = true;
  deleteSheetDeleteBtn.innerHTML = "Deleting...";

  try{

    const supabase =
      window._supabaseClient ||
      window.supabaseClient;

    if(!supabase){
      throw new Error("Supabase client is not connected");
    }

    const cashDelete =
      await supabase
        .from("cash_delivery_orders")
        .delete()
        .in("user_mobile", mobileVariants);

    if(cashDelete.error){
      throw cashDelete.error;
    }

    const upiDelete =
      await supabase
        .from("upi_orders")
        .delete()
        .in("user_mobile", mobileVariants);

    if(upiDelete.error){
      throw upiDelete.error;
    }

    deleteSheetDeleteBtn.innerHTML = `
      <i class="fa-solid fa-check"></i>
    `;

    deleteSheetDeleteBtn.classList.add("success");

    setTimeout(function(){

      localStorage.removeItem("cezooUser");
      localStorage.removeItem("cezooLastName");
      localStorage.removeItem("recentLocations");

      closeDeleteAccountPopup();

      document
        .getElementById("cezooProfilePopup")
        ?.classList.remove("open");

      document.getElementById("nameInput").value = "";
      document.getElementById("mobileInput").value = "";

      document
        .querySelectorAll("#otpBoxes input")
        .forEach(input => input.value = "");

      document.getElementById("error").innerText = "";

      confirmationResult = null;

      showStep(
        "nameStep",
        "Log in or Sign up"
      );

      setTimeout(function(){
        openLoginPopup();
        document
          .getElementById("nameInput")
          ?.focus();
      }, 200);

      setTimeout(function(){

        deleteSheetDeleteBtn.disabled = false;
        deleteSheetDeleteBtn.innerHTML =
          "Delete Account";

        deleteSheetDeleteBtn
          .classList
          .remove("success");

      }, 500);

    }, 1000);
}catch(error){

  console.error(
    "Delete account error:",
    error
  );

  deleteSheetDeleteBtn.innerHTML = `
    <i class="fa-solid fa-xmark"></i>
  `;

  deleteSheetDeleteBtn.classList.remove("success");
  deleteSheetDeleteBtn.classList.add("error");

  setTimeout(function(){

    deleteSheetDeleteBtn.disabled = false;

    deleteSheetDeleteBtn.innerHTML =
      "Delete Account";

    deleteSheetDeleteBtn.classList.remove("error");

  }, 1500);

}

});