function showCartLocationBar(){
  document
    .querySelector(".cezooMapNoticeBar")
    ?.classList.add("show");
}

function hideCartLocationBar(){
  document
    .querySelector(".cezooMapNoticeBar")
    ?.classList.remove("show");
}
let cartMap;
let cartMapLat = 16.5062;
let cartMapLng = 81.5212;
let cartMapAddress = "";
let cartMapCity = "";
let cartMapStreet = "";
let cartMapSearchTimer;
let cartReverseTimer = null;
let cartReverseController = null;
let cartLastAddressKey = "";
let cartIgnoreNextMove = false;
const savedLat =
  Number(
    localStorage.getItem("cezooUserLat")
  );

const savedLng =
  Number(
    localStorage.getItem("cezooUserLon")
  );

const savedAddress =
  localStorage.getItem(
    "cezooLastLocationAddress"
  );
const savedCity =
  localStorage.getItem(
    "cezooLastLocationCity"
  );

const savedStreet =
  localStorage.getItem(
    "cezooLastLocationStreet"
  );
if (
  Number.isFinite(savedLat) &&
  Number.isFinite(savedLng)
) {
  cartMapLat = savedLat;
  cartMapLng = savedLng;
}

if (savedAddress) {
  cartMapAddress = savedAddress;
  cartMapCity = savedCity || "Selected Location";
  cartMapStreet = savedStreet || savedAddress;

  const addressElement =
    document.getElementById(
      "cartSelectedAddress"
    );

  if (addressElement) {
    addressElement.innerHTML = `
      <div style="
        font-size:16px;
        font-weight:700;
        color:#222;
        margin-bottom:4px;
      ">
        ${cartMapCity}
      </div>

      <div style="
        font-size:13px;
        color:#666;
        line-height:1.4;
      ">
        ${cartMapStreet}
      </div>

      <div style="
        font-size:11px;
        color:#999;
        margin-top:4px;
      ">
        ${cartMapLat.toFixed(6)},
        ${cartMapLng.toFixed(6)}
      </div>
    `;
  }
}
function openCartLocationMap() {
  document
    .getElementById("cartMapPage")
    .classList.add("show");

  setTimeout(() => {
    if (!cartMap) {
      cartMap = L.map("cartRealMap", {
        zoomControl: false
      }).setView(
        [cartMapLat, cartMapLng],
        15
      );

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors"
        }
      ).addTo(cartMap);

      cartMap.on("moveend", () => {
        if (cartIgnoreNextMove) {
          cartIgnoreNextMove = false;
          return;
        }

        const center = cartMap.getCenter();

        cartMapLat = center.lat;
        cartMapLng = center.lng;

        scheduleCartMapAddress(
          cartMapLat,
          cartMapLng
        );
      });
    }

    cartMap.invalidateSize();

    /*
      setView triggers moveend.
      Therefore, do not manually call
      getCartMapAddress() after setView.
    */
    cartMap.setView(
      [cartMapLat, cartMapLng],
      15
    );
  }, 300);
}
function closeCartLocationMap(){
  document.getElementById("cartMapPage").classList.remove("show");
}


async function getCartMapAddress(lat, lng) {
  lat = Number(lat);
  lng = Number(lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return;
  }

  const addressElement =
    document.getElementById(
      "cartSelectedAddress"
    );

  /*
    Round coordinates to avoid requesting
    the same nearby point repeatedly.
  */
  const requestLat = lat.toFixed(5);
  const requestLng = lng.toFixed(5);

  const locationKey =
    `${requestLat},${requestLng}`;

 if (
  locationKey === cartLastAddressKey &&
  cartMapCity
) {
  addressElement.innerHTML = `
    <div style="
      font-size:16px;
      font-weight:700;
      color:#222;
      margin-bottom:4px;
    ">
      ${cartMapCity}
    </div>

    <div style="
      font-size:13px;
      color:#666;
      line-height:1.4;
    ">
      ${cartMapStreet}
    </div>

    <div style="
      font-size:11px;
      color:#999;
      margin-top:4px;
    ">
      ${lat.toFixed(6)}, ${lng.toFixed(6)}
    </div>
  `;

  return;
}

  /*
    Coordinates are always shown, even if
    reverse geocoding fails.
  */
  addressElement.innerText =
    lat.toFixed(6) +
    ", " +
    lng.toFixed(6) +
    "\nFetching address...";

  /*
    Cancel an unfinished older request.
  */
  if (cartReverseController) {
    cartReverseController.abort();
  }

  cartReverseController =
    new AbortController();

  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse" +
      "?format=jsonv2" +
      `&lat=${requestLat}` +
      `&lon=${requestLng}` +
      "&zoom=18" +
      "&addressdetails=1";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      signal: cartReverseController.signal
    });

    if (!response.ok) {
      throw new Error(
        `Address request failed: ${response.status}`
      );
    }

    const data = await response.json();
    const address = data.address || {};

    
/* FIRST LINE: CITY / VILLAGE NAME */
cartMapCity =
  address.village ||
  address.town ||
  address.city ||
  address.municipality ||
  address.hamlet ||
  address.suburb ||
  address.county ||
  "Selected Location";

/* SECOND LINE: REMAINING ADDRESS */
cartMapStreet = [
  address.road || "",
  address.neighbourhood || "",
  address.suburb &&
  address.suburb !== cartMapCity
    ? address.suburb
    : "",
  address.county &&
  address.county !== cartMapCity
    ? address.county
    : "",
  address.state_district &&
  address.state_district !== cartMapCity
    ? address.state_district
    : "",
  address.state || "",
  address.postcode || ""
]
  .filter(Boolean)
  .filter(
    (item, index, array) =>
      array.indexOf(item) === index
  )
  .join(", ");

if (!cartMapStreet) {
  cartMapStreet =
    data.display_name ||
    `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/* Full address used for saving */
cartMapAddress =
  cartMapCity +
  (cartMapStreet
    ? ", " + cartMapStreet
    : "");

cartLastAddressKey = locationKey;

/* MAP PAGE DISPLAY */
addressElement.innerHTML = `
  <div style="
    font-size:16px;
    font-weight:700;
    color:#222;
    margin-bottom:4px;
  ">
    ${cartMapCity}
  </div>

  <div style="
    font-size:13px;
    font-weight:400;
    color:#666;
    line-height:1.4;
  ">
    ${cartMapStreet}
  </div>

  <div style="
    font-size:11px;
    color:#999;
    margin-top:4px;
  ">
    ${lat.toFixed(6)}, ${lng.toFixed(6)}
  </div>
`;






  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error(
      "Cart address error:",
      error
    );

    /*
      Keep coordinates visible.
      Never leave it on Fetching address.
    */
    cartMapAddress =
      `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    addressElement.innerText =
      cartMapAddress;
  }
}



function confirmCartMapLocation() {
  localStorage.setItem(
    "cezooUserLat",
    String(cartMapLat)
  );

  localStorage.setItem(
    "cezooUserLon",
    String(cartMapLng)
  );

  localStorage.setItem(
    "cezooLastLocationCity",
    cartMapCity
  );
localStorage.setItem(
  "cezooLastLocationAddress",
  cartMapAddress || ""
);
  localStorage.setItem(
    "cezooLastLocationStreet",
    cartMapStreet
  );

  localStorage.setItem(
    "cezooLastLocationAddress",
    cartMapAddress
  );

  /*
    HOME HEADER:
    First line = Tanuku
  */
  const villageElement =
    document.getElementById("village");

  if (villageElement) {
    villageElement.innerText =
      cartMapCity || "Selected Location";
  }

  /*
    HOME HEADER:
    Second line = Remaining address
  */
  const streetElement =
    document.getElementById("street");

  if (streetElement) {
    streetElement.innerText =
      cartMapStreet || cartMapAddress;
  }

  /*
    CART HEADER:
    First line
  */
  const cartHeaderVillage =
    document.getElementById(
      "cartHeaderVillage"
    );

  if (cartHeaderVillage) {
    cartHeaderVillage.innerText =
      cartMapCity || "Selected Location";
  }

  /*
    CART HEADER:
    Second line
  */
  const cartHeaderStreet =
    document.getElementById(
      "cartHeaderStreet"
    );

  if (cartHeaderStreet) {
    cartHeaderStreet.innerText =
      cartMapStreet || cartMapAddress;
  }

  showCartLocationBar();

  if (
    document
      .getElementById("cartPagePopup")
      ?.classList.contains("open")
  ) {
    renderCartPage();
  }

  closeCartLocationMap();
}




document.addEventListener("DOMContentLoaded",()=>{
  hideCartLocationBar();
});

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const input =
      document.getElementById(
        "cartMapSearchInput"
      );

    if (!input) return;

    input.addEventListener("input", () => {
      clearTimeout(cartMapSearchTimer);

      const query =
        input.value.trim();

      if (query.length < 3) {
        return;
      }

      /*
        Wait 1.2 seconds after typing stops.
      */
      cartMapSearchTimer =
        setTimeout(async () => {
          try {
            const url =
              "https://nominatim.openstreetmap.org/search" +
              "?format=jsonv2" +
              "&limit=1" +
              "&countrycodes=in" +
              `&q=${encodeURIComponent(query)}`;

            const response =
              await fetch(url, {
                headers: {
                  "Accept": "application/json"
                }
              });

            if (!response.ok) {
              throw new Error(
                `Search failed: ${response.status}`
              );
            }

            const data =
              await response.json();

            if (!data.length) {
              return;
            }

            cartMapLat =
              Number(data[0].lat);

            cartMapLng =
              Number(data[0].lon);

            if (cartMap) {
              /*
                flyTo triggers moveend.
                moveend performs one reverse lookup.
              */
              cartMap.flyTo(
                [cartMapLat, cartMapLng],
                17
              );
            }

          } catch (error) {
            console.error(
              "Cart location search error:",
              error
            );
          }
        }, 1200);
    });
  }
);
function scheduleCartMapAddress(lat, lng) {
  clearTimeout(cartReverseTimer);

  document
    .getElementById("cartSelectedAddress")
    .innerText =
      `${lat.toFixed(6)}, ${lng.toFixed(6)}\nFetching address...`;

  /*
    Wait until the user stops moving the map.
    This prevents repeated API requests.
  */
  cartReverseTimer = setTimeout(() => {
    getCartMapAddress(lat, lng);
  }, 1200);
}