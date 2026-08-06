/*=========================================================
   CEZOO SAFE + SMOOTH IMAGE LOADER — iOS
   - Keeps existing iOS/local src paths
   - Loads visible top images immediately
   - Loads lower images only near the mobile viewport
   - Uses one shared IntersectionObserver
   - Prevents duplicate requests and permanent shimmer
   - Supports dynamically inserted and progressively revealed images
   - Does not keep timers running
========================================================= */

(() => {
  "use strict";

  const MOBILE_PRELOAD_MARGIN = "320px 0px";

  const IMAGE_RULES = {
    profileImg: {
      immediate: true,
      loadedClass: "profileLoaded",
      wrapperSelector: ".profile",
      shimmerSelector: ".Dera"
    },
    catLazy: {
      immediate: true,
      loadedClass: "loaded",
      wrapperSelector: ".cat-item",
      shimmerSelector: ".catPinkShimmer"
    },
    posterLazy: {
      immediate: true,
      loadedClass: "posterLoaded",
      shimmerSelector: ".posterShimmer"
    },
    BordiLazy: {
      immediate: true,
      loadedClass: "BordiLoaded",
      shimmerSelector: ".BordiShimmer"
    },
    BalarampurLazy: {
      immediate: false,
      loadedClass: "BalarampurLoaded",
      wrapperSelector: ".BalarampurImageWrap",
      shimmerSelector: ".BalarampurShimmer"
    },
    IceShapeLazy: {
      immediate: true,
      loadedClass: "IceShapeLoaded",
      shimmerSelector: ".IceShapeShimmer"
    },
    LaunchLazy: {
      immediate: true,
      loadedClass: "LaunchLoaded",
      shimmerSelector: ".LaunchShimmer"
    },
    BannerMiniLazy: {
      immediate: false,
      loadedClass: "BannerMiniLoaded",
      shimmerSelector: ".BannerMiniShimmer"
    },
    FruitBannerLazy: {
      immediate: false,
      loadedClass: "FruitBannerLoaded",
      shimmerSelector: ".FruitBannerShimmer"
    },
    CoolLazy: {
      immediate: true,
      wrapperLoadedClass: "loaded"
    },
    CoolBottomLazy: {
      immediate: false,
      loadedClass: "CoolBottomLoaded",
      shimmerSelector: ".CoolBottomShimmer"
    },
    BijnorLazy: {
      immediate: false,
      loadedClass: "BijnorLoaded",
      shimmerSelector: ".BijnorShimmer"
    },
    SkinLazy: {
      immediate: false,
      loadedClass: "SkinLoaded",
      shimmerSelector: ".SkinShimmer"
    },
    DeoriaLazy: {
      immediate: false,
      loadedClass: "DeoriaLoaded",
      shimmerSelector: ".DeoriaShimmer"
    },
    FaizabadLazy: {
      immediate: false,
      loadedClass: "FaizabadLoaded",
      shimmerSelector: ".FaizabadShimmer"
    },
    WiproPinkLazy: {
      immediate: true,
      loadedClass: "WiproPinkLoaded",
      shimmerSelector: ".WiproPinkShimmer"
    },
    FatehpurLazy: {
      immediate: false,
      loadedClass: "FatehpurLoaded",
      shimmerSelector: ".FatehpurShimmer"
    },
    NavLazy: {
      immediate: true,
      wrapperSelector: ".NavContent",
      wrapperLoadedClass: "NavLoaded",
      shimmerRootSelector: ".nav-item",
      shimmerSelector: ".NavPinkShimmer"
    },
    PrinterLazy: {
      immediate: true,
      loadedClass: "PrinterLoaded",
      shimmerSelector: ".PrinterShapeShimmer"
    },
    ArcIdleLazy: {
      immediate: false
    },
    BrandLazy: {
      immediate: false,
      loadedClass: "BrandLoaded",
      shimmerSelector: ".BrandShimmer"
    },
    ProductScrollLazy: {
      immediate: false,
      loadedClass: "productImageLoaded",
      wrapperSelector: ".productImageWrap",
      wrapperLoadedClass: "productImageReady"
    },
    productImage: {
      immediate: false,
      loadedClass: "productImageLoaded",
      wrapperSelector: ".productImageWrap",
      wrapperLoadedClass: "productImageReady"
    }
  };

  const watchedSelector = [
    "#profileImg",
    ...Object.keys(IMAGE_RULES)
      .filter(className => className !== "profileImg")
      .map(className => `.${className}`)
  ].join(",");

  function getRule(img) {
    if (img.id === "profileImg") {
      return IMAGE_RULES.profileImg;
    }

    for (const className of Object.keys(IMAGE_RULES)) {
      if (
        className !== "profileImg" &&
        img.classList.contains(className)
      ) {
        return IMAGE_RULES[className];
      }
    }

    return null;
  }

  function getWrapper(img, rule) {
    return rule.wrapperSelector
      ? img.closest(rule.wrapperSelector)
      : img.parentElement;
  }

  function finishImage(img, rule) {
    if (img.dataset.cezooFinished === "1") {
      return;
    }

    img.dataset.cezooFinished = "1";
    img.dataset.loaded = "1";

    if (rule.loadedClass) {
      img.classList.add(rule.loadedClass);
    }

    const wrapper = getWrapper(img, rule);

    if (rule.wrapperLoadedClass) {
      wrapper?.classList.add(rule.wrapperLoadedClass);
    }

    const shimmerRoot = rule.shimmerRootSelector
      ? img.closest(rule.shimmerRootSelector)
      : wrapper;

    if (rule.shimmerSelector) {
      shimmerRoot
        ?.querySelector(rule.shimmerSelector)
        ?.remove();
    }
  }

  function loadImage(img) {
    const rule = getRule(img);

    if (!rule || img.dataset.cezooLoading === "1") {
      return;
    }

    img.dataset.cezooLoading = "1";

    const finish = () => finishImage(img, rule);

    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });

    /*
      Never replace an existing src.
      This protects iOS local/app asset URLs.
    */
    if (!img.getAttribute("src")) {
      const source = (
        img.dataset.img ||
        img.dataset.src ||
        ""
      ).trim();

      if (source) {
        img.src = source;
      } else {
        finish();
        return;
      }
    }

    if (img.complete) {
      queueMicrotask(finish);
    }
  }

  const lazyObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              return;
            }

            loadImage(entry.target);
            lazyObserver.unobserve(entry.target);
          });
        },
        {
          root: null,
          rootMargin: MOBILE_PRELOAD_MARGIN,
          threshold: 0.01
        }
      )
    : null;

  function registerImage(img) {
    if (!(img instanceof HTMLImageElement)) {
      return;
    }

    const rule = getRule(img);

    if (!rule || img.dataset.cezooRegistered === "1") {
      return;
    }

    img.dataset.cezooRegistered = "1";
    img.decoding = "async";

    if (rule.immediate || !lazyObserver) {
      loadImage(img);
    } else {
      lazyObserver.observe(img);
    }
  }

  function registerInside(root = document) {
    if (
      root instanceof HTMLImageElement &&
      root.matches(watchedSelector)
    ) {
      registerImage(root);
    }

    root
      .querySelectorAll?.(watchedSelector)
      .forEach(registerImage);
  }

  function refresh(root = document) {
    registerInside(root);

    root
      .querySelectorAll?.(watchedSelector)
      .forEach(img => {
        const rule = getRule(img);

        if (
          rule &&
          img.dataset.cezooFinished !== "1" &&
          img.getClientRects().length
        ) {
          if (rule.immediate) {
            loadImage(img);
          } else if (lazyObserver) {
            lazyObserver.observe(img);
          } else {
            loadImage(img);
          }
        }
      });
  }

  function start() {
    registerInside(document);

    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            registerInside(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    document.addEventListener(
      "cezooProgressiveContentRevealed",
      event => {
        const roots = event.detail?.roots || [];
        roots.forEach(refresh);
      }
    );

    window.CezooSafeImageLoader = {
      registerInside,
      loadImage,
      refresh
    };

    /* Compatibility with existing progressive code. */
    window.CezooImageLoader = {
      refresh
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }
})();