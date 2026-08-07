function setTanukuFoodsBannerImage(imageSrc){
  const tanukuImage = document.getElementById("tanukuFoodsImage");

  if(!tanukuImage) return;

  tanukuImage.src = imageSrc;
}
function setCezooBirthdayBannerImage(imageSrc){
  const birthdayImage =
    document.getElementById("cezooBirthdayImage");

  if(!birthdayImage) return;

  birthdayImage.src = imageSrc;
}

(function setupSpecialHangerVisibility(){

  const hangerSection =
    document.getElementById("cezooSpecialHangers");

  if(!hangerSection){
    return;
  }


  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          hangerSection.classList.toggle(
            "is-visible",
            entry.isIntersecting
          );

        });

      },
      {
        threshold:0.08
      }
    );


  observer.observe(hangerSection);

})();
