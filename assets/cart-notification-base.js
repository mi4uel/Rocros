class CartNotificationBase extends HTMLElement {
  constructor() {
    super();

    this.notification = this.querySelector("#cart-notification-base");
    this.backgroundOverlay = document.querySelector("#background-overlay-base");
    this.header = document.querySelector("sticky-header");
    this.cartIcon = document.querySelector("#cart-icon-bubble");
    this.deleteItemBtns = null;
    this.deleteSingleItemBtn = null;
    this.btnKeepBuying = null;
    this.overlayCart = null;
    this.btnCloseCart = null;

    this.notification.addEventListener("keyup", (evt) => evt.code === "Escape" && this.close());
    this.cartIcon.addEventListener("click", this.open.bind(this));

    this.setHeaderCartIconAccessibility();
    this.updateQuantityEvent();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector("#cart-icon-bubble");
    cartLink.setAttribute("role", "button");
    cartLink.setAttribute("aria-haspopup", "dialog");
    cartLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.open();
    });
    cartLink.addEventListener("keydown", (event) => {
      if (event.code.toUpperCase() === "SPACE") {
        event.preventDefault();
        this.open();
      }
    });
  }

  open() {
    this.deleteItemBtns = this.querySelectorAll(".remove-item-js");
    this.btnKeepBuying = this.querySelector("#btn-keep-buying-base");
    this.overlayCart = this.querySelector("#background-overlay-base");
    this.btnCloseCart = this.querySelector("#close-btn-base");
    this.notification.classList.add("animate", "active");
    this.backgroundOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    this.notification.addEventListener(
      "transitionend",
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    this.deleteItemBtns.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        this.deleteSingleItemBtn = item;
        this.removeElementEvent(event); // Aquí la función se ejecuta
      });
    });
    

    this.btnCloseCart &&
      this.btnCloseCart.addEventListener("click", () => {
        this.close();
        document.body.style.overflow = "auto";
      });

    this.btnKeepBuying &&
      this.btnKeepBuying.addEventListener("click", () => {
        this.close();
        document.body.style.overflow = "auto";
      });
    this.overlayCart &&
      this.overlayCart.addEventListener("click", () => {
        this.close();
        document.body.style.overflow = "auto";
      });
  }

  close() {
    console.log("Close Base");

    this.notification.classList.remove("active");
    this.backgroundOverlay.classList.remove("active");
    document.body.removeEventListener("click", this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-notification-product",
        selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
      },
      {
        id: "cart-icon-bubble",
      },
    ];
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser().parseFromString(html, "text/html").querySelector(selector).innerHTML;
  }


  setActiveElement(element) {
    this.activeElement = element;
  }

  removeElementEvent(event) {
    event.preventDefault();

    const url = this.deleteSingleItemBtn.getAttribute("href");
    const removeId = url.match(/id=([^&]*)/)[1];
    console.log("RemoveId: ", removeId);

    fetch(url)
      .then((response) => {
        this.updateCartContent();
        this.removeItemFromModal(removeId);
      })
      .catch((error) => {
        console.error("Error al eliminar el artículo:", error);
      });
  }

  updateQuantityEvent() {
    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener("change", (event) => {
        const dropdown = event.target.closest(".quantity-selector");
        if (dropdown) {
          const newQuantity = dropdown.value;
          const line = dropdown.getAttribute("data-line");
          this.updateCartQuantity(line, newQuantity);
        }
      });
    });
  }

  updateCartContent() {
    fetch("/cart.js")
      .then((response) => response.json())
      .then((cart) => {
        this.updateHeaderButton(cart);
      });
  }

  updateHeaderButton(cart = {}) {
    const cartCountBubble = document.querySelector(".cart-count-bubble");
    const cartFooterPrice = document.querySelector(".totals__total-value");
    if (cartFooterPrice) {
      cartFooterPrice.textContent = Shopify.formatMoney(cart.total_price, "{{amount_no_decimals}}€");
    }
    if (cartCountBubble) {
      if (cart.item_count > 0) {
        document.querySelector("#CartDrawer-LiveRegionText")?.classList.add("visually-hidden");
        cartCountBubble.style.display = "block";
        const itemCountElement = cartCountBubble.querySelector('span[aria-hidden="true"]');
        if (itemCountElement) {
          itemCountElement.textContent = `(${cart.item_count})`;
        }

        const visuallyHiddenElement = cartCountBubble.querySelector(".visually-hidden");
        if (visuallyHiddenElement) {
          visuallyHiddenElement.textContent = `${cart.item_count} artículos en el carrito`;
        }
      } else {
        console.log("Ya no hay");
        document.querySelector("#CartDrawer-LiveRegionText")?.classList.remove("visually-hidden");
        cartCountBubble.style.display = "none";
      }
    }
  }

  removeItemFromModal(itemId) {
    console.log({ itemId });
    let itemElement = document.getElementById("cart-notification-product-" + itemId);
    if (!itemElement) return;
    itemElement.innerHTML = "";
    itemElement.remove();
  }

  updateCartQuantity(line, quantity) {
    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        line: line,
        quantity: quantity,
      }),
    })
      .then((response) => response.json())
      .then((cart) => {
        this.updateCartContent();
      })
      .catch((error) => {});
  }
}

customElements.define("cart-notification-base", CartNotificationBase);
