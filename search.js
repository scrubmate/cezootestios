/* =========================================
   CEZOO SMART DATABASE SEARCH
   Loads directly from Supabase
========================================= */

let cezooSearchProducts = [];
let cezooSearchTimer = null;
let cezooSearchLoading = false;
let cezooSearchLoaded = false;


/* =========================================
   SEARCH ALIASES
========================================= */

const cezooSearchAliases = {

  panchadara: "sugar",
  panchadhara: "sugar",
  panchadhra: "sugar",
  chakkara: "sugar",
  chekkara: "sugar",

  uppu: "salt",
  bellam: "jaggery",
  biyyam: "rice",

  paalu: "milk",
  palu: "milk",

  perugu: "curd",

  nune: "oil",
  noone: "oil",

  ullipaya: "onion",
  ullipayalu: "onion",

  bangaladumpa: "potato",
  alugadda: "potato",

  atukulu: "poha",

  mirapakaya: "chilli",
  mirapakayalu: "chilli",

  tamata: "tomato",
  tamata: "tomato",

  neellu: "water",
  nellu: "water",

  cooldrink: "soft drink",
  cooldrinks: "soft drink",
  colddrink: "soft drink",
  colddrinks: "soft drink",
  softdrinks: "soft drink",

  thumsup: "thums up",
  thumsupp: "thums up",
  thumbsup: "thums up",
  thumpsup: "thums up",
  thums: "thums up",

  cocacola: "coca cola",
  coke: "coca cola",

  sevenup: "7up",

  mountainDew: "mountain dew",

  icecream: "ice cream",
  icecreams: "ice cream",

  giftitems: "gift",
  giftarticles: "gift",

  stationary: "stationery"
};


/* =========================================
   NORMALIZE TEXT
========================================= */

function normalizeSearchText(value){

  return String(value || "")
    .toLowerCase()

    /* Common litre spellings */
    .replace(/\blitres\b/g, " litre ")
    .replace(/\bliters\b/g, " litre ")
    .replace(/\bliter\b/g, " litre ")
    .replace(/\bltr\b/g, " litre ")
    .replace(/\bltrs\b/g, " litre ")
    .replace(/\blt\b/g, " litre ")
    .replace(/\bl\b/g, " litre ")

    /* Millilitre spellings */
    .replace(/\bmillilitres\b/g, " ml ")
    .replace(/\bmilliliters\b/g, " ml ")
    .replace(/\bmillilitre\b/g, " ml ")
    .replace(/\bmilliliter\b/g, " ml ")

    /* Kilogram spellings */
    .replace(/\bkilograms\b/g, " kg ")
    .replace(/\bkilogram\b/g, " kg ")
    .replace(/\bkgs\b/g, " kg ")

    /* Gram spellings */
    .replace(/\bgrams\b/g, " g ")
    .replace(/\bgram\b/g, " g ")
    .replace(/\bgms\b/g, " g ")

    /* Keep decimal points */
    .replace(/[^a-z0-9\u0C00-\u0C7F.\s]/g, " ")

    .replace(/\s+/g, " ")
    .trim();
}


/* Compact version:
   "Thums Up" becomes "thumsup"
*/

function compactSearchText(value){

  return normalizeSearchText(value)
    .replace(/\s+/g, "");
}


/* =========================================
   SAFE HTML
========================================= */

function escapeSearchHTML(value){

  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================
   LEVENSHTEIN DISTANCE
   Used for spelling mistakes
========================================= */

function cezooSearchDistance(first, second){

  first = String(first || "");
  second = String(second || "");

  const rows = first.length + 1;
  const columns = second.length + 1;

  const matrix =
    Array.from(
      { length:rows },
      () => Array(columns).fill(0)
    );

  for(let row = 0; row < rows; row++){
    matrix[row][0] = row;
  }

  for(let column = 0; column < columns; column++){
    matrix[0][column] = column;
  }

  for(let row = 1; row < rows; row++){

    for(let column = 1; column < columns; column++){

      const cost =
        first[row - 1] === second[column - 1]
          ? 0
          : 1;

      matrix[row][column] =
        Math.min(
          matrix[row - 1][column] + 1,
          matrix[row][column - 1] + 1,
          matrix[row - 1][column - 1] + cost
        );

    }

  }

  return matrix[first.length][second.length];
}


/* =========================================
   FUZZY WORD MATCH
========================================= */
function isCezooFuzzyWordMatch(searchWord, productWord){

  if(!searchWord || !productWord){
    return false;
  }

  if(searchWord === productWord){
    return true;
  }

  /*
    Allow typed beginning:
    thum → thums
    face → facewash
  */
  if(
    searchWord.length >= 3 &&
    productWord.startsWith(searchWord)
  ){
    return true;
  }

  /*
    Never allow product word to match merely because
    it is a short part of the user's word.
  */
  const shortestLength =
    Math.min(
      searchWord.length,
      productWord.length
    );

  if(shortestLength <= 3){
    return false;
  }

  const distance =
    cezooSearchDistance(
      searchWord,
      productWord
    );

  if(shortestLength <= 5){
    return distance <= 1;
  }

  if(shortestLength <= 8){
    return distance <= 2;
  }

  return distance <= 2;
}

/* =========================================
   LOAD PRODUCTS FROM SUPABASE
========================================= */

async function loadSimpleSearchProducts(){

  if(cezooSearchLoaded){
    return true;
  }

  if(cezooSearchLoading){

    while(cezooSearchLoading){

      await new Promise(resolve =>
        setTimeout(resolve, 60)
      );

    }

    return cezooSearchLoaded;
  }


  cezooSearchLoading = true;

  try{

    const [
      freshResult,
      groceryResult,
      iceCreamResult
    ] = await Promise.all([

      supabaseClient
        .from("fresh_products")
        .select("*"),

      supabaseClient
        .from("cezoogroceries")
        .select("*"),

      supabaseClient
        .from("icecreams")
        .select("*")

    ]);


    if(freshResult.error){

      console.error(
        "fresh_products search error:",
        freshResult.error
      );

    }


    if(groceryResult.error){

      console.error(
        "cezoogroceries search error:",
        groceryResult.error
      );

    }


    if(iceCreamResult.error){

      console.error(
        "icecreams search error:",
        iceCreamResult.error
      );

    }


    const freshProducts =
      (freshResult.data || []).map(product => ({
        ...product,
        searchTable:"fresh_products"
      }));


    const groceryProducts =
      (groceryResult.data || []).map(product => ({
        ...product,
        searchTable:"cezoogroceries"
      }));


    const iceCreamProducts =
      (iceCreamResult.data || []).map(product => ({
        ...product,
        searchTable:"icecreams"
      }));


    cezooSearchProducts = [
      ...freshProducts,
      ...groceryProducts,
      ...iceCreamProducts
    ];


    cezooSearchLoaded =
      cezooSearchProducts.length > 0;


    console.log(
      "✅ Search products loaded:",
      cezooSearchProducts.length
    );


    return cezooSearchLoaded;

  }
  catch(error){

    console.error(
      "Search database error:",
      error
    );

    return false;

  }
  finally{

    cezooSearchLoading = false;

  }

}


/* =========================================
   PRICE SEARCH
========================================= */

function getSearchMaximumPrice(query){

  const match =
    query.match(
      /(?:under|below|less than|upto|up to|max)\s*₹?\s*(\d+)/i
    );

  if(match){
    return Number(match[1]);
  }


  const onlyNumber =
    query.match(
      /^₹?\s*(\d+)\s*(?:rs|rupees?)?$/i
    );


  return onlyNumber
    ? Number(onlyNumber[1])
    : null;
}


/* =========================================
   APPLY ALIASES
========================================= */

function applyCezooSearchAlias(query){

  const normalized =
    normalizeSearchText(query);

  const compact =
    compactSearchText(normalized);


  if(cezooSearchAliases[normalized]){

    return normalizeSearchText(
      cezooSearchAliases[normalized]
    );

  }


  if(cezooSearchAliases[compact]){

    return normalizeSearchText(
      cezooSearchAliases[compact]
    );

  }


  return normalized;
}


/* =========================================
   CREATE SEARCHABLE PRODUCT TEXT
========================================= */
function getCezooProductSearchText(product){

  const name =
    String(product.name || "");

  const nameLower =
    name.toLowerCase();

  const categoryWords = [];

/* Snacks */

if(
  nameLower.includes("chips") ||
  nameLower.includes("biscuit") ||
  nameLower.includes("lays") ||
  nameLower.includes("kurkure") ||
  nameLower.includes("bingo") ||
  nameLower.includes("namkeen") ||
  nameLower.includes("chocolate") ||
  nameLower.includes("wafer")
){
  categoryWords.push(
    "snack snacks chips biscuits namkeen"
  );
}


/* Tea */

if(
  nameLower.includes("tea") ||
  nameLower.includes("chai")
){
  categoryWords.push(
    "tea chai hot drinks"
  );
}
  /* Cool drinks */

  if(
    nameLower.includes("thums") ||
    nameLower.includes("pepsi") ||
    nameLower.includes("sprite") ||
    nameLower.includes("fanta") ||
    nameLower.includes("limca") ||
    nameLower.includes("coca") ||
    nameLower.includes("7up") ||
    nameLower.includes("dew") ||
    nameLower.includes("maaza")
  ){
    categoryWords.push(
      "cool drink cool drinks soft drink beverage soda"
    );
  }


  /* Face wash and skin care */

  if(
    nameLower.includes("face wash") ||
    nameLower.includes("facewash") ||
    nameLower.includes("cleanser")
  ){
    categoryWords.push(
      "face wash facewash skin care skincare cleanser"
    );
  }


  /* Fruits */

  if(
    product.searchTable === "fresh_products"
  ){
    categoryWords.push(
      "fresh fruits vegetables"
    );
  }


  return normalizeSearchText([
    name,
    compactSearchText(name),
    product.name_telugu,
    product.brand,
    product.category,
    product.subcategory,
    product.quantity,
    product.unit,
    ...categoryWords
  ].join(" "));
}
/* =========================================
   PRODUCT MATCH SCORE
========================================= */
function getCezooProductMatchScore(
  product,
  searchQuery
){

  const query =
    applyCezooSearchAlias(searchQuery);

  const productText =
    getCezooProductSearchText(product);

  const productName =
    normalizeSearchText(product.name);

  const queryCompact =
    compactSearchText(query);

  const productNameCompact =
    compactSearchText(product.name);

  const queryWords =
    query
      .split(" ")
      .filter(word => word.length >= 2);

  const productWords =
    productText
      .split(" ")
      .filter(Boolean);


  if(!queryWords.length){
    return 0;
  }


  let score = 0;
  let matchedWords = 0;


  /* Best direct matches */

  if(productName === query){
    score += 1200;
  }

  if(productNameCompact === queryCompact){
    score += 1100;
  }

  if(productName.startsWith(query)){
    score += 800;
  }

  if(productNameCompact.startsWith(queryCompact)){
    score += 750;
  }

  if(productText.includes(query)){
    score += 650;
  }


  for(const searchWord of queryWords){

    let bestWordScore = 0;

    for(const productWord of productWords){

      if(productWord === searchWord){

        bestWordScore =
          Math.max(bestWordScore, 180);

      }
      else if(
        searchWord.length >= 3 &&
        productWord.startsWith(searchWord)
      ){

        bestWordScore =
          Math.max(bestWordScore, 130);

      }
      else if(
        isCezooFuzzyWordMatch(
          searchWord,
          productWord
        )
      ){

        bestWordScore =
          Math.max(bestWordScore, 80);

      }

    }


    if(bestWordScore > 0){

      matchedWords++;
      score += bestWordScore;

    }

  }


  /*
    Very important:
    For multi-word searches, all words must match.

    face wash:
    face must match
    wash must match
  */

  if(
    queryWords.length >= 2 &&
    matchedWords !== queryWords.length
  ){
    return 0;
  }


  /*
    Single-word search must match at least once.
  */

  if(
    queryWords.length === 1 &&
    matchedWords === 0
  ){
    return 0;
  }


  if(
    matchedWords === queryWords.length
  ){
    score += 300;
  }


  return score;
}
/* =========================================
   SEARCH PRODUCTS
========================================= */

function searchSimpleProducts(searchValue){

  const originalQuery =
    normalizeSearchText(searchValue);


  if(!originalQuery){
    return [];
  }


  const maximumPrice =
    getSearchMaximumPrice(originalQuery);


  /* Searches like under 50 */

  if(maximumPrice !== null){

    return cezooSearchProducts
      .filter(product => {

        const price =
          Number(
            product.discount_price ||
            product.original_price ||
            0
          );

        return (
          price > 0 &&
          price <= maximumPrice
        );

      })
      .sort((first, second) => {

        const firstPrice =
          Number(
            first.discount_price ||
            first.original_price ||
            0
          );

        const secondPrice =
          Number(
            second.discount_price ||
            second.original_price ||
            0
          );

        return firstPrice - secondPrice;

      })
      .slice(0, 60);

  }


  return cezooSearchProducts
    .map(product => ({
      product,
      score:getCezooProductMatchScore(
        product,
        originalQuery
      )
    }))
    .filter(item => item.score > 0)
    .sort((first, second) =>
      second.score - first.score
    )
    .slice(0, 60)
    .map(item => item.product);

}


/* =========================================
   PINK LOADING SHIMMER
========================================= */

function showCezooSearchShimmer(){

  const results =
    document.getElementById(
      "cezooSearchResults"
    );


  if(!results){
    return;
  }


  results.innerHTML = `
    <div class="cezooSearchLoading">

      ${Array(5).fill(`
        <div class="cezooSearchShimmerItem">

          <div class="cezooSearchShimmerImage"></div>

          <div class="cezooSearchShimmerContent">

            <div class="cezooSearchShimmerName"></div>

            <div class="cezooSearchShimmerPrice"></div>

          </div>

        </div>
      `).join("")}

    </div>
  `;


  results.classList.add("show");

}


/* =========================================
   IMAGE LOADED
========================================= */

function cezooSearchImageLoaded(image){

  image
    .previousElementSibling
    ?.remove();
}


/* =========================================
   NO PRODUCTS
========================================= */

function showCezooNoProducts(){

  const results =
    document.getElementById(
      "cezooSearchResults"
    );


  if(!results){
    return;
  }


  results.innerHTML = `
    <div class="cezooSearchEmpty">

      <div class="cezooSearchEmptyTitle">
        No products found
      </div>

      <div class="cezooSearchEmptySub">
        Try searching for one of these
      </div>

      <div class="cezooSearchSuggestions">

        <button
          type="button"
          class="cezooSearchSuggestion"
          data-search="tea">
          Tea
        </button>

        <button
          type="button"
          class="cezooSearchSuggestion"
          data-search="cool drinks">
          Cool Drinks
        </button>

        <button
          type="button"
          class="cezooSearchSuggestion"
          data-search="snacks">
          Snacks
        </button>

        <button
          type="button"
          class="cezooSearchSuggestion"
          data-search="under 50">
          Under ₹50
        </button>

      </div>

    </div>
  `;


  results.classList.add("show");

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderSimpleSearchResults(products){

  const results =
    document.getElementById(
      "cezooSearchResults"
    );


  if(!results){
    return;
  }


  if(products.length === 0){

    showCezooNoProducts();

    return;
  }


  results.innerHTML =
    products.map(product => {

      const image =
        escapeSearchHTML(
          product.image1 || ""
        );

      const name =
        escapeSearchHTML(
          product.name || "Product"
        );

      const discountPrice =
        Number(
          product.discount_price ||
          product.original_price ||
          0
        );

      const originalPrice =
        Number(
          product.original_price || 0
        );


      return `
        <div
  class="cezooSearchItem"
  data-product-id="${product.id}"
  data-product-table="${escapeSearchHTML(product.searchTable)}"
>
          <div class="cezooSearchImageWrap">

            <div class="cezooSearchImageLoader"></div>

            <img
              class="cezooSearchImage"
              src="${image}"
              alt="${name}"
              loading="lazy"
              onload="cezooSearchImageLoaded(this)"
              onerror="
                cezooSearchImageLoaded(this);
                this.style.display='none';
              "
            >

          </div>

          <div class="cezooSearchDetails">

            <div class="cezooSearchName">
              ${name}
            </div>

            <div class="cezooSearchPrice">

              <span class="cezooSearchDiscount">
                ₹${discountPrice}
              </span>

              ${
                originalPrice > discountPrice
                  ? `
                    <span class="cezooSearchOriginal">
                      ₹${originalPrice}
                    </span>
                  `
                  : ""
              }

            </div>

          </div>

        </div>
      `;

    }).join("");


  results.classList.add("show");

}


/* =========================================
   RUN SEARCH
========================================= */

async function runCezooProductSearch(value){

  showCezooSearchShimmer();


  const loaded =
    await loadSimpleSearchProducts();


  if(!loaded){

    showCezooNoProducts();

    return;
  }


  const products =
    searchSimpleProducts(value);


  renderSimpleSearchResults(products);

}


/* =========================================
   INITIALIZE SEARCH
========================================= */

function initializeSimpleProductSearch(){

  const input =
    document.getElementById(
      "cezooProductSearchInput"
    );

  const results =
    document.getElementById(
      "cezooSearchResults"
    );


  if(!input || !results){

    console.error(
      "Search input or result box missing"
    );

    return;
  }


  /* Start loading database products */

  loadSimpleSearchProducts();


  input.addEventListener(
    "input",
    function(){

      clearTimeout(cezooSearchTimer);


      const value =
        this.value.trim();


      if(!value){

        results.innerHTML = "";
        results.classList.remove("show");

        return;
      }


      showCezooSearchShimmer();


      cezooSearchTimer =
        setTimeout(() => {

          runCezooProductSearch(value);

        }, 220);

    }
  );
/* When keyboard closes, hide results */

input.addEventListener("blur", function(){

  setTimeout(() => {

    results.classList.remove("show");

  }, 120);

});

 

results.addEventListener("click", function(event){

  /*
    Suggestion button clicked
  */
  const suggestion =
    event.target.closest(
      ".cezooSearchSuggestion"
    );

  if(suggestion){

    event.preventDefault();
    event.stopPropagation();

    const searchValue =
      suggestion.dataset.search?.trim();

    if(!searchValue){
      return;
    }

    input.value = searchValue;

    results.classList.add("show");

    input.dispatchEvent(
      new Event("input", {
        bubbles:true
      })
    );

    input.focus();

    return;
  }


  /*
    Search product clicked
  */
  const productItem =
    event.target.closest(
      ".cezooSearchItem"
    );

  if(!productItem){
    return;
  }

  event.preventDefault();
  event.stopPropagation();


  const productId =
    String(
      productItem.dataset.productId || ""
    );

  const productTable =
    String(
      productItem.dataset.productTable || ""
    );


  /*
    Use the product already loaded in memory.
    No second Supabase request.
  */
  const selectedProduct =
    cezooSearchProducts.find(function(product){

      return (
        String(product.id) === productId &&
        String(product.searchTable) === productTable
      );

    });


  if(!selectedProduct){

    console.error(
      "Search product not found:",
      productId,
      productTable
    );

    return;
  }


  /*
    Hide search results and keyboard.
  */
  results.classList.remove("show");

  input.blur();


  /*
    Use your existing product popup.
  */
  if(typeof openProductPopup === "function"){

    openProductPopup({
      ...selectedProduct,
      table:selectedProduct.searchTable
    });

  }else{

    console.error(
      "openProductPopup function not found"
    );

  }

});

  /* Show previous results again on focus */

  input.addEventListener(
    "focus",
    function(){

      const value =
        this.value.trim();


      if(value){

        runCezooProductSearch(value);

      }

    }
  );


 

document.addEventListener("click", function(event){

  if(event.target.closest(".search-container")){
    return;
  }

  if(document.activeElement === input){

    input.blur();
    return;

  }

  results.classList.remove("show");

});


/* Close keyboard and search during page/back action */

window.addEventListener("pagehide", function(){

  input.blur();
  results.classList.remove("show");

});

window.addEventListener("popstate", function(){

  input.blur();
  results.classList.remove("show");

});

}


/* Works even if page already loaded */

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    initializeSimpleProductSearch
  );

}else{

  initializeSimpleProductSearch();

}

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    initializeSimpleProductSearch
  );

}else{

  initializeSimpleProductSearch();

}

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    initializeSimpleProductSearch
  );

}else{

  initializeSimpleProductSearch();

}