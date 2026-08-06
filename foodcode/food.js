function setTanukuFoodsBannerImage(imageSrc){
  const tanukuImage = document.getElementById("tanukuFoodsImage");

  if(!tanukuImage) return;

  tanukuImage.src = imageSrc;
}