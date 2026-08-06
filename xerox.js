

function openXeroxPopup(){

  const popup =
    document.getElementById("xeroxPopup");

  if(!popup){
    console.error("xeroxPopup element not found");
    return;
  }

  popup.classList.add("show");

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  document
    .querySelector(".floatBarWrap")
    ?.classList.add("popupMode");
}

function closeXeroxPopup(){

  const popup =
    document.getElementById("xeroxPopup");

  if(!popup){
    return;
  }

  popup.classList.remove("show");

  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  document
    .querySelector(".floatBarWrap")
    ?.classList.remove("popupMode");
}

/* Make functions available to HTML onclick handlers */
window.openXeroxPopup = openXeroxPopup;
window.closeXeroxPopup = closeXeroxPopup;

/* ===== Swipe from Left / Right edge to close ===== */

let xeroxStartX = 0;
let xeroxStartY = 0;
let xeroxEdge = "";

const xeroxPopup = document.getElementById("xeroxPopup");

if(xeroxPopup){

xeroxPopup.addEventListener("touchstart", function(e){

  const touch = e.touches[0];

  xeroxStartX = touch.clientX;
  xeroxStartY = touch.clientY;

  const w = window.innerWidth;

  if(xeroxStartX <= 28){
    xeroxEdge = "left";
  }else if(xeroxStartX >= w - 28){
    xeroxEdge = "right";
  }else{
    xeroxEdge = "";
  }

});

xeroxPopup.addEventListener("touchend", function(e){

  if(!xeroxEdge) return;

  const touch = e.changedTouches[0];

  const diffX =
    touch.clientX - xeroxStartX;

  const diffY =
    Math.abs(
      touch.clientY - xeroxStartY
    );

  xeroxEdge = "";

  if(diffY > 60) return;

  const validSwipe =
    diffX > 90 ||
    diffX < -90;

  if(!validSwipe) return;

  /*
    If print settings are open,
    swipe behaves exactly like Back.
  */
  if(
    printPage?.classList.contains("show")
  ){
    closePrintPage(true);
    return;
  }

  /*
    Otherwise close normal Xerox popup.
  */
  closeXeroxPopup();
});

}


const pdfUpload = document.getElementById("pdfUpload");
const fileName = document.getElementById("fileName");

const uploadPopup = document.getElementById("uploadPopup");
const uploadCard = document.getElementById("uploadCard");
const uploadTitle = document.getElementById("uploadTitle");
const uploadText = document.getElementById("uploadText");
const scanStatus = document.getElementById("scanStatus");
const progressBar = document.getElementById("progressBar");
const cancelUploadBtn = document.getElementById("cancelUpload");
const cancelUploadTop = document.getElementById("cancelUploadTop");

const printPage = document.getElementById("printPage");
const backPrint = document.getElementById("backPrint");
const previewFilesList = document.getElementById("previewFilesList");
const previewMeta = document.getElementById("previewMeta");
const addDocumentBtn = document.getElementById("addDocumentBtn");
const addPdfUpload = document.getElementById("addPdfUpload");

const pagesInput = document.getElementById("pagesInput");
const copiesInput = document.getElementById("copiesInput");
const decreaseCopies = document.getElementById("decreaseCopies");
const increaseCopies = document.getElementById("increaseCopies");
const printType = document.getElementById("printType");
const paperSize = document.getElementById("paperSize");
const sideType = document.getElementById("sideType");
const orientation = document.getElementById("orientation");
const binding = document.getElementById("binding");
const delivery = document.getElementById("delivery");

const totalPrice = document.getElementById("totalPrice");
const addToCartBtn = document.getElementById("addToCartBtn");


let uploadedFiles = [];
let pendingUploadFiles = [];
let pendingUploadMode = "replace";
let pendingUploadCountPromise = Promise.resolve([]);
let uploadTimer = null;
let progress = 0;
let previewRenderTimer = null;
let editingXeroxCartKey = null;
if(window.pdfjsLib){
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const statusMessages = [
  "Checking PDF file...",
  "Scanning document pages...",
  "Securing your document...",
  "Preparing print preview...",
  "Almost done..."
];

function resetUploadPopup(){
  clearInterval(uploadTimer);
  progress = 0;
  progressBar.style.width = "0%";
  uploadCard.classList.remove("done","cancelled");
  uploadTitle.textContent = "Validating Document";
  scanStatus.textContent = "Ensuring it's all set to print...";
}

function preparePdfUpload(files, mode){
  pendingUploadFiles.forEach(item => URL.revokeObjectURL(item.url));

  pendingUploadFiles = files.map(file => ({
    file,
    url: URL.createObjectURL(file),
    pageCount: 1,
    pageCountLoading: true,
    deletedPages: new Set()
  }));

  pendingUploadMode = mode;

  pendingUploadCountPromise = Promise.all(
    pendingUploadFiles.map(async item => {
      item.pageCount = await getPdfPageCount(item.file);
      item.pageCountLoading = false;
      return item;
    })
  );

  openUploadPopup(files);
}

function commitPendingUpload(){
  if(pendingUploadFiles.length === 0) return;

  if(pendingUploadMode === "replace"){
    uploadedFiles.forEach(item => URL.revokeObjectURL(item.url));
    uploadedFiles = pendingUploadFiles;
  }else{
    uploadedFiles = uploadedFiles.concat(pendingUploadFiles);
  }

  pendingUploadFiles = [];
  pendingUploadMode = "replace";
  pendingUploadCountPromise = Promise.resolve([]);
fileName.textContent = "Only PDF files are allowed";
fileName.style.color = "#0758ff";

  updatePageCountInput();
  renderAllPdfPreviews();
  updatePreviewAndPrice();
}

function getValidPdfFiles(input){
  return Array.from(input.files).filter(file => file.type === "application/pdf");
}

async function getPdfPageCount(file){
  try{
    if(window.pdfjsLib){
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data:buffer}).promise;
      return Math.max(1, Number(pdf.numPages) || 1);
    }

    const text = await file.text();
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return Math.max(1, matches ? matches.length : 1);
  }catch(error){
    return 1;
  }
}


async function getPdfDocumentForItem(item){
  if(!item.pdfDocPromise){
    item.pdfDocPromise = item.file.arrayBuffer()
      .then(buffer => pdfjsLib.getDocument({data:buffer}).promise);
  }

  return item.pdfDocPromise;
}

function getDeletedPages(item){
  if(!item.deletedPages){
    item.deletedPages = new Set();
  }

  return item.deletedPages;
}

function getActivePageCount(item){
  const totalPages = Math.max(1, Number(item.pageCount) || 1);
  const deletedPages = getDeletedPages(item);
  let activePages = 0;

  for(let pageNumber = 1; pageNumber <= totalPages; pageNumber++){
    if(!deletedPages.has(pageNumber)){
      activePages++;
    }
  }

  return activePages;
}

function getTotalPageCount(){
  return uploadedFiles.reduce((total,item) => {
    return total + getActivePageCount(item);
  },0);
}

function updatePageCountInput(){
  pagesInput.value = getTotalPageCount();
}

function pageCountText(count){
  const pages = Math.max(1, Number(count) || 1);
  return pages + (pages === 1 ? " page" : " pages");
}

function openUploadPopup(files){
  resetUploadPopup();
  uploadText.textContent = files.length + (files.length === 1 ? " document" : " documents");
  uploadPopup.classList.add("active");

  let messageIndex = 0;

  uploadTimer = setInterval(() => {
    progress += 4;
    progressBar.style.width = Math.min(progress,100) + "%";

    if(progress % 20 === 0){
      scanStatus.textContent = statusMessages[messageIndex % statusMessages.length];
      messageIndex++;
    }

    if(progress >= 100){
      clearInterval(uploadTimer);
      uploadSuccess();
    }
  }, 80);
}

function uploadSuccess(){
  uploadTitle.textContent = "Upload Successful";
  uploadCard.classList.add("done");

  setTimeout(async () => {
    await pendingUploadCountPromise;
    uploadPopup.classList.remove("active");
    commitPendingUpload();
    openPrintPage();
  }, 900);
}

function cancelUpload(){
  clearInterval(uploadTimer);

  pendingUploadFiles.forEach(item => URL.revokeObjectURL(item.url));
  pendingUploadFiles = [];
  pendingUploadCountPromise = Promise.resolve([]);
  pdfUpload.value = "";
  addPdfUpload.value = "";

  if(uploadedFiles.length > 0){
    fileName.textContent = uploadedFiles.length + " PDF file(s) ready";
    fileName.style.color = "#0758ff";
  }else{
    fileName.textContent = "Upload is cancelled";
    fileName.style.color = "#e53935";
  }

  uploadCard.classList.add("cancelled");
  uploadTitle.textContent = "Upload Cancelled";

  setTimeout(() => {
    uploadPopup.classList.remove("active");
    renderAllPdfPreviews();
    updatePreviewAndPrice();
  }, 800);
}

function openPrintPage(){
  renderAllPdfPreviews();
  updatePreviewAndPrice();
  printPage.classList.add("show");
  document.body.classList.add("print-open");
}

function closePrintPage(cancelEdit = true){

  /* Close print settings */
  printPage?.classList.remove("show");

  /* Remove print/upload/Xerox overlays */
  document
    .getElementById("xeroxPopup")
    ?.classList.remove("show");

  document
    .getElementById("uploadPopup")
    ?.classList.remove("active");

  /* Keep cart closed */
  document
    .getElementById("cartPagePopup")
    ?.classList.remove("open");

  /* Remove every possible scroll-lock class */
  document.body.classList.remove(
    "print-open",
    "popup-open"
  );

  document.documentElement.classList.remove(
    "print-open",
    "popup-open"
  );

  /* Restore complete main-page scrolling */
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  document.body.style.position = "";
  document.documentElement.style.position = "";

  document.body.style.height = "";
  document.documentElement.style.height = "";

  document.body.style.touchAction = "";
  document.documentElement.style.touchAction = "";

  /* Restore floating bar */
  document
    .querySelector(".floatBarWrap")
    ?.classList.remove("popupMode");

  if(cancelEdit && editingXeroxCartKey){
    editingXeroxCartKey = null;

    addToCartBtn.disabled = false;
    addToCartBtn.textContent = "Add to Cart";
  }

  /* Force iOS/Android browser to restore body scrolling */
  requestAnimationFrame(() => {
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
  });
}
function removeFile(index){
  const removed = uploadedFiles.splice(index,1)[0];
  if(removed && removed.url){
    URL.revokeObjectURL(removed.url);
  }

 if(uploadedFiles.length === 0){
  updatePageCountInput();

  previewFilesList.innerHTML =
    '<div class="no-files-box">No PDF files selected for print.</div>';

  updatePreviewAndPrice();

  setTimeout(() => {
    closePrintPage();
  }, 200);

  return;
}

  updatePageCountInput();
  renderAllPdfPreviews();
  updatePreviewAndPrice();
}

function removePage(fileIndex,pageNumber){
  const item = uploadedFiles[fileIndex];

  if(!item){
    return;
  }

  const totalPages = Math.max(1, Number(item.pageCount) || 1);
  const safePageNumber = Math.min(Math.max(1, Number(pageNumber) || 1), totalPages);

  getDeletedPages(item).add(safePageNumber);

  if(getActivePageCount(item) === 0){
    removeFile(fileIndex);
    return;
  }

  fileName.textContent = uploadedFiles.length + " PDF file(s) ready";
  fileName.style.color = "#0758ff";

  updatePageCountInput();
  renderAllPdfPreviews();
  updatePreviewAndPrice();
}

function renderAllPdfPreviews(){
  previewFilesList.innerHTML = "";

  if(uploadedFiles.length === 0){
    updatePageCountInput();
    previewFilesList.innerHTML = '<div class="no-files-box">No PDF files selected for print.</div>';
    return;
  }

  let visiblePages = 0;

  uploadedFiles.forEach((item,fileIndex) => {
    const totalPages = Math.max(1, Number(item.pageCount) || 1);
    const deletedPages = getDeletedPages(item);

    for(let pageNumber = 1; pageNumber <= totalPages; pageNumber++){
      if(deletedPages.has(pageNumber)){
        continue;
      }

      visiblePages++;

      const card = document.createElement("div");
      card.className = "preview-file-card";

      card.innerHTML = `
        <div class="preview-file-title">
          <div class="preview-file-info">
            <h4>${escapeHtml(item.file.name)} • Page ${pageNumber} of ${totalPages}</h4>
          </div>
        </div>

<div class="preview-box ${printType.value} ${
  paperSize.value === "a4" ? "xeroxPaperA4" : "xeroxPaperA3"
} ${orientation.value}">          <div class="preview-page-wrap">
            <canvas class="preview-canvas" data-file-index="${fileIndex}" data-page-number="${pageNumber}" aria-label="PDF page ${pageNumber} preview"></canvas>
            <iframe class="preview-frame" src="${makePdfViewerUrl(item.url,pageNumber)}" title="PDF Preview ${pageNumber}"></iframe>
            <button class="remove-file-btn" type="button" data-file-index="${fileIndex}" data-page-number="${pageNumber}" aria-label="Remove this page from print">🗑</button>
          </div>
        </div>
      `;

      previewFilesList.appendChild(card);
    }
  });

 if(visiblePages === 0){
  uploadedFiles.forEach(item => {
    if(item.url){
      URL.revokeObjectURL(item.url);
    }
  });

  uploadedFiles = [];

  updatePageCountInput();

  fileName.textContent = "Only PDF files are allowed";
  fileName.style.color = "#0758ff";

  pdfUpload.value = "";
  addPdfUpload.value = "";

  previewFilesList.innerHTML =
    '<div class="no-files-box">No PDF files selected for print.</div>';

  updatePreviewAndPrice();

  setTimeout(() => {
    closePrintPage();
  }, 200);

  return;
}
  previewFilesList.scrollTop = 0;
  previewFilesList.scrollLeft = 0;
}
function makePdfViewerUrl(url,pageNumber = 1){
  return url + "#page=" + pageNumber + "&toolbar=0&navpanes=0&scrollbar=0&view=Fit";
}

function schedulePdfPreviewRender(){
  clearTimeout(previewRenderTimer);
  previewRenderTimer = setTimeout(renderPdfCanvases, 120);
}

async function renderPdfCanvases(){
  const canvases = document.querySelectorAll(".preview-canvas");

  if(canvases.length === 0){
    return;
  }

  if(!window.pdfjsLib){
    document.querySelectorAll(".preview-page-wrap").forEach(wrap => {
      wrap.classList.add("use-fallback");
    });
    return;
  }

  for(const canvas of canvases){
    const fileIndex = Number(canvas.dataset.fileIndex);
    const pageNumber = Math.max(1, Number(canvas.dataset.pageNumber) || 1);
    const item = uploadedFiles[fileIndex];
    const wrap = canvas.closest(".preview-page-wrap");

    if(!item || !wrap){
      continue;
    }

    try{
      wrap.classList.remove("use-fallback");

      const boxWidth = Math.max(10, wrap.clientWidth - 20);
      const boxHeight = Math.max(10, wrap.clientHeight - 20);
      const pdf = await getPdfDocumentForItem(item);
      const safePageNumber = Math.min(pageNumber, pdf.numPages);
      const page = await pdf.getPage(safePageNumber);
      const baseViewport = page.getViewport({scale:1});
      const scale = Math.min(boxWidth / baseViewport.width, boxHeight / baseViewport.height);
      const viewport = page.getViewport({scale:Math.max(scale,0.1)});
      const pixelRatio = window.devicePixelRatio || 1;
      const context = canvas.getContext("2d");

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";

      context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
      context.clearRect(0,0,viewport.width,viewport.height);

      await page.render({
        canvasContext:context,
        viewport:viewport
      }).promise;
    }catch(error){
      if(wrap){
        wrap.classList.add("use-fallback");
      }
    }
  }
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, function(match){
    return {
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[match];
  });
}

function calculatePrice(){
  if(uploadedFiles.length === 0){
    return 0;
  }

  updatePageCountInput();

  const pages = getTotalPageCount();
  const copies = Math.max(1, Number(copiesInput.value) || 1);

  // Base price
  let pricePerPage = (printType.value === "color") ? 10 : 5;

  // Double-side discount
  if(sideType.value === "double"){
    pricePerPage -= 3;
  }

  // A3 extra charge
  if(paperSize.value === "a3"){
    pricePerPage += 4;
  }

  return pages * copies * pricePerPage;
}

function updatePreviewAndPrice(){
  const typeText = printType.value === "color" ? "Color" : "Black & White";
  const sizeText = paperSize.value.toUpperCase();
  const sideText = sideType.value === "single" ? "Single side" : "Double side";
  const orientationText = orientation.value === "portrait" ? "Portrait" : "Landscape";

  previewMeta.textContent = `${typeText} • ${sizeText} • ${sideText} • ${orientationText}`;
  totalPrice.textContent = "₹" + calculatePrice();

  document.querySelectorAll(".preview-box").forEach(box => {
  box.classList.remove(
    "color",
    "bw",
    "xeroxPaperA4",
    "xeroxPaperA3",
    "portrait",
    "landscape"
  );

  box.classList.add(
    printType.value,
    paperSize.value === "a4"
      ? "xeroxPaperA4"
      : "xeroxPaperA3",
    orientation.value
  );
});

  schedulePdfPreviewRender();
}

window.addEventListener("resize", function(){
  if(printPage.classList.contains("show")){
    schedulePdfPreviewRender();
  }
});

pdfUpload.addEventListener("change", function(){
  const files = getValidPdfFiles(this);

  if(files.length === 0){
    fileName.textContent = "Please select PDF files only";
    fileName.style.color = "#e53935";
    this.value = "";
    return;
  }

  fileName.textContent = files.length + " PDF file(s) selected";
  fileName.style.color = "#0758ff";

  preparePdfUpload(files, "replace");
  this.value = "";
});

addDocumentBtn.addEventListener("click", function(){
  addPdfUpload.click();
});

addPdfUpload.addEventListener("change", function(){
  const files = getValidPdfFiles(this);

  if(files.length === 0){
    alert("Please select PDF files only.");
    this.value = "";
    return;
  }

  preparePdfUpload(files, "append");
  this.value = "";
});

cancelUploadBtn.addEventListener("click", cancelUpload);
cancelUploadTop.addEventListener("click", cancelUpload);

previewFilesList.addEventListener("click", function(event){
  const removeButton = event.target.closest(".remove-file-btn");
  if(removeButton){
    removePage(
      Number(removeButton.dataset.fileIndex),
      Number(removeButton.dataset.pageNumber)
    );
  }
});

backPrint.addEventListener("click", function(){
  closePrintPage(true);
});

increaseCopies.addEventListener("click", function(){
  copiesInput.value = Number(copiesInput.value) + 1;
  updatePreviewAndPrice();
});

decreaseCopies.addEventListener("click", function(){
  copiesInput.value = Math.max(1, Number(copiesInput.value) - 1);
  updatePreviewAndPrice();
});

[printType, paperSize, sideType, orientation, binding, delivery].forEach(input => {
  input.addEventListener("input", updatePreviewAndPrice);
  input.addEventListener("change", updatePreviewAndPrice);
});


const PRINT_DB_NAME = "cezooPrintDatabase";
const PRINT_DB_VERSION = 1;
const PRINT_FILES_STORE = "printFiles";

function openPrintDatabase(){
  return new Promise((resolve,reject) => {
    const request = indexedDB.open(PRINT_DB_NAME, PRINT_DB_VERSION);

    request.onupgradeneeded = function(event){
      const db = event.target.result;

      if(!db.objectStoreNames.contains(PRINT_FILES_STORE)){
        db.createObjectStore(PRINT_FILES_STORE, {
          keyPath:"id"
        });
      }
    };

    request.onsuccess = function(){
      resolve(request.result);
    };

    request.onerror = function(){
      reject(request.error);
    };
  });
}

async function savePdfToIndexedDB(file, orderId, fileIndex){
  const db = await openPrintDatabase();

  const fileId =
    orderId + "_file_" + fileIndex + "_" + Date.now();

  const pdfRecord = {
    id:fileId,
    orderId:orderId,
    name:file.name,
    type:file.type,
    size:file.size,
    lastModified:file.lastModified,
    file:file,
    savedAt:new Date().toISOString()
  };

  return new Promise((resolve,reject) => {
    const transaction = db.transaction(
      PRINT_FILES_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(PRINT_FILES_STORE);
    const request = store.put(pdfRecord);

    request.onsuccess = function(){
      resolve(fileId);
    };

    request.onerror = function(){
      reject(request.error);
    };

    transaction.oncomplete = function(){
      db.close();
    };
  });
}

async function getPdfFromIndexedDB(fileId){
  const db = await openPrintDatabase();

  return new Promise((resolve,reject) => {
    const transaction = db.transaction(
      PRINT_FILES_STORE,
      "readonly"
    );

    const store = transaction.objectStore(PRINT_FILES_STORE);
    const request = store.get(fileId);

    request.onsuccess = function(){
      resolve(request.result || null);
    };

    request.onerror = function(){
      reject(request.error);
    };

    transaction.oncomplete = function(){
      db.close();
    };
  });
}
async function editXeroxCartProduct(cartKey){

  const product = cart[cartKey];

  if(!product || product.type !== "print_order"){
    return;
  }

  editingXeroxCartKey = cartKey;

  uploadedFiles.forEach(item => {
    if(item.url){
      URL.revokeObjectURL(item.url);
    }
  });

  uploadedFiles = [];

  try{

    for(const savedFile of product.files || []){

      const record = await getPdfFromIndexedDB(savedFile.id);

      if(!record || !record.file){
        continue;
      }

      let restoredFile = record.file;

      if(!(restoredFile instanceof File)){
        restoredFile = new File(
          [record.file],
          record.name || savedFile.name || "document.pdf",
          {
            type: record.type || "application/pdf",
            lastModified: record.lastModified || Date.now()
          }
        );
      }

      uploadedFiles.push({
        file: restoredFile,
        url: URL.createObjectURL(restoredFile),

        pageCount: Math.max(
          1,
          Number(savedFile.totalPages || 1)
        ),

        pageCountLoading: false,

        deletedPages: new Set(
          savedFile.deletedPages || []
        )
      });
    }

    copiesInput.value =
      Math.max(1, Number(product.copies || 1));

    printType.value =
      product.printType || "color";

    paperSize.value =
      String(product.paperSize || "A4").toLowerCase();

    sideType.value =
      product.sideType || "single";

    orientation.value =
      product.orientation || "portrait";

    binding.value =
      product.binding || "none";

    delivery.value =
      product.delivery || delivery.value;

    fileName.textContent =
      uploadedFiles.length + " PDF file(s) ready";

    fileName.style.color = "#0758ff";

    updatePageCountInput();
    renderAllPdfPreviews();
    updatePreviewAndPrice();

    addToCartBtn.textContent = "Update Cart";

   closeCartPagePopup();

/* Keep parent available without showing upload screen */
document
  .getElementById("xeroxPopup")
  ?.classList.add("show");

document
  .querySelector(".floatBarWrap")
  ?.classList.add("popupMode");

requestAnimationFrame(() => {
  openPrintPage();
});

  }catch(error){

    console.error(
      "Unable to edit Xerox product:",
      error
    );

    editingXeroxCartKey = null;
    addToCartBtn.textContent = "Add to Cart";
  }
}
addToCartBtn.addEventListener("click", async function(){
  if(uploadedFiles.length === 0){
    alert("Please keep at least one PDF file for print.");
    return;
  }

  addToCartBtn.disabled = true;
  addToCartBtn.textContent = "Saving PDFs...";

  try{
    const pages = getTotalPageCount();
    const copies = Math.max(
      1,
      Number(copiesInput.value) || 1
    );

    const amount = calculatePrice();

  const existingXeroxProduct =
  editingXeroxCartKey
    ? cart[editingXeroxCartKey]
    : null;

const orderId =
  existingXeroxProduct?.id ||
  (
    "print_order_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2,8)
  );

    const savedFiles = [];

    for(let index = 0; index < uploadedFiles.length; index++){
      const item = uploadedFiles[index];

      const fileId = await savePdfToIndexedDB(
        item.file,
        orderId,
        index
      );

      savedFiles.push({
        id:fileId,
        name:item.file.name,
        type:item.file.type,
        size:item.file.size,
        totalPages:Math.max(
          1,
          Number(item.pageCount) || 1
        ),
        selectedPages:getActivePageCount(item),

        deletedPages:Array.from(
          getDeletedPages(item)
        )
      });
    }

    const printProduct = {
      id:orderId,
      key:orderId,

      type:"print_order",
      category:"printing",

      name:"CEZOO Xerox & Printing",
      productName:"CEZOO Xerox & Printing",

      imageType:"fontawesome",
      iconClass:"fa-solid fa-print",
      image:"",

      qty:1,
      quantity:1,

      price:amount,
      discount_price:amount,
      original_price:amount,
      total:amount,

      pages:pages,
      copies:copies,

      printType:printType.value,
      printTypeText:
        printType.value === "color"
          ? "Color"
          : "Black & White",

      paperSize:paperSize.value.toUpperCase(),

      sideType:sideType.value,
      sideText:
        sideType.value === "double"
          ? "Double Side"
          : "Single Side",

      orientation:orientation.value,
      orientationText:
        orientation.value === "landscape"
          ? "Landscape"
          : "Portrait",

      binding:binding.value,
      bindingText:
        binding.value === "staple"
          ? "Staple"
          : "No Binding",

      delivery:delivery.value,

      fileCount:savedFiles.length,

      // Actual files are in IndexedDB.
      // These IDs connect the cart product to them.
      files:savedFiles,

      addedAt:new Date().toISOString()
    };

   const xeroxCartKey =
  editingXeroxCartKey ||
  `printing_${orderId}`;

const oldXeroxQty =
  editingXeroxCartKey &&
  cart[editingXeroxCartKey]
    ? Math.max(
        1,
        Number(cart[editingXeroxCartKey].qty || 1)
      )
    : 1;

cart[xeroxCartKey] = {
  ...printProduct,

  id: orderId,
  key: xeroxCartKey,
  table: "printing",

  qty: oldXeroxQty,
  quantity: oldXeroxQty,

  imageType: "fontawesome",
  iconClass: "fa-solid fa-print",

  image1: "",
  image: "",

  addedTime:
    cart[xeroxCartKey]?.addedTime ||
    Date.now(),

  updatedTime: Date.now()
};

saveCart();
updateCartFloat();
updatePopupCartSummary();
restoreCartButtons(document);
    addToCartBtn.textContent = "Added";

setTimeout(() => {

  if(editingXeroxCartKey){

    closePrintPage(false);
    /* Completely close hidden Xerox parent */
    document
      .getElementById("xeroxPopup")
      ?.classList.remove("show");

    document
      .querySelector(".floatBarWrap")
      ?.classList.remove("popupMode");

    document.body.classList.remove(
      "print-open"
    );

    document.documentElement.classList.remove(
      "print-open"
    );

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

   editingXeroxCartKey = null;

setTimeout(() => {

  const cartPopup =
    document.getElementById(
      "cartPagePopup"
    );

  const cartContent =
    document.getElementById(
      "cartPageContent"
    );

  openCartPagePopup();

  requestAnimationFrame(() => {

    cartPopup?.getBoundingClientRect();

    if(cartContent){

      cartContent.style.overflowY =
        "auto";

      cartContent.style.touchAction =
        "pan-y";

      cartContent.style.webkitOverflowScrolling =
        "touch";

      cartContent.scrollTop = 0;
    }
  });

}, 80);
  }else{

    closePrintPage();

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
      uploadedFiles.forEach(item => {
        if(item.url){
          URL.revokeObjectURL(item.url);
        }
      });

      uploadedFiles = [];
      pendingUploadFiles = [];

      pdfUpload.value = "";
      addPdfUpload.value = "";

      pagesInput.value = 0;
      copiesInput.value = 1;

      fileName.textContent = "Only PDF files are allowed";
      fileName.style.color = "#0758ff";

      previewFilesList.innerHTML = "";
      totalPrice.textContent = "₹0";

      addToCartBtn.disabled = false;
      addToCartBtn.textContent = "Add to Cart";
    }, 500);

  }catch(error){
  console.error("PDF save failed:", error);
editingXeroxCartKey = null;
  addToCartBtn.disabled = false;
  addToCartBtn.textContent = "Add to Cart";
}
});

updatePageCountInput();
updatePreviewAndPrice();
renderAllPdfPreviews();
