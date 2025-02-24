class CartNotification extends HTMLElement {
  constructor() {
    super();
    this.cartModal = document.querySelector("cart-notification-base");
    this.notification = document.getElementById("cart-notification");
    this.backgroundOverlay = document.getElementById("background-overlay");
    this.header = document.querySelector("sticky-header");
    this.deleteItemBtn = null;
    this.btnKeepBuying = null
    this.overlayCart = null
    this.btnCloseCart = null

    this.notification.addEventListener("keyup", (evt) => evt.code === "Escape" && this.close());

    this.updateQuantityEvent();
    this.checkoutEventBtn();
  }

  openCart() {
    this.deleteItemBtn = this.querySelector(".remove-item-js");
    this.btnKeepBuying = this.querySelector("#btn-keep-buying");
    this.overlayCart = this.querySelector("#background-overlay");
    this.btnCloseCart = this.querySelector("#close-btn");

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

    this.deleteItemBtn.addEventListener("click", this.removeElementEvent.bind(this));
    this.btnCloseCart &&
      this.btnCloseCart.addEventListener("click", () => {
        console.log("close");
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
    this.openCart();
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
    const url = this.deleteItemBtn.getAttribute("href");
    fetch(url)
      .then((response) => {
        console.log("Update from Remove");
        this.updateCartContent();
        this.removeItemFromModal();
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

  renderModalContent() {
    fetch("/cart.js")
      .then((response) => response.json())
      .then((cart) => {
        const modalContainer = document.getElementById("CartDrawer-Form");
        modalContainer.innerHTML = cart.items.map(this.createCartItemHTML).join("");
      });
  }

  updateHeaderButton(cart = {}) {
    const cartCountBubble = document.querySelector(".cart-count-bubble");
    if (cartCountBubble) {
      if (cart.item_count > 0) {
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
        cartCountBubble.style.display = "none";
      }
    }
  }

  removeItemFromModal() {
    let itemElement = this.querySelector("#cart-notification-product");
    if (!itemElement) return;
    itemElement.innerHTML = "";
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

  createCartItemHTML(item) {
    console.log("Item;: ", item);

    return `
      <div id="cart-notification-product-${item.key}" class="cart-item cart-notification-product product-template">
        ${
          item.image
            ? `
          <div class="cart-notification-product__image global-media-settings color-scheme-2">
            <img
              src="${item.image.url}&width=140"
              alt="${item.image.alt || ""}"
              width="100"
              height="${Math.ceil(100 / item.image.aspect_ratio)}"
              loading="lazy"
            >
          </div>
        `
            : ""
        }
        <div>
          <h3 class="cart-notification-product__name h4">${item.product_title}</h3>
          <dl>
            ${item.options_with_values
              .map(
                (option) => `
              <div class="product-option">
                <p>${option.name}:</p>
                <dd>${option.value}</dd>
              </div>
            `
              )
              .join("")}
            ${Object.entries(item.properties)
              .map(
                ([key, value]) => `
              <div class="product-option">
                <dt>${key}:</dt>
                <dd>${value.includes("/uploads/") ? `<a href="${value}" class="link" target="_blank">${value.split("/").pop()}</a>` : value}</dd>
              </div>
            `
              )
              .join("")}
          </dl>
          <div class="product-option">${item.final_line_price / 100}€</div>
          <div class="options-container">
            <select id="quantity-${item.key}" class="quantity-selector" data-line="${item.index}">
              ${Array.from(
                { length: 10 },
                (_, i) => `
                <option value="${i + 1}" ${item.quantity == i + 1 ? "selected" : ""}>${i + 1}</option>
              `
              ).join("")}
            </select>
            <a
              href="/cart/change?id=${item.key}&quantity=0"
              class="button button--tertiary remove-item-js"
              aria-label="Eliminar ${item.title}">
              <svg> <!-- SVG del icono de eliminar aquí --> </svg>
            </a>
          </div>
          ${item.selling_plan_allocation ? `<p class="product-option">${item.selling_plan_allocation.selling_plan.name}</p>` : ""}
        </div>
      </div>
    `;
  }

  reloadCartModal() {
    fetch("/?section_id=header")
      .then((response) => response.text())
      .then((html) => {
        // Crear un parser de HTML para insertar la respuesta
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Seleccionar el nuevo contenido de la sección del carrito
        const newModalContent = doc.querySelector("#cart-notification-base");
        // Reemplazar el contenido actual del modal con el nuevo
        if (newModalContent) {
          document.getElementById("cart-notification-base").innerHTML = newModalContent.innerHTML;
        }
      })
      .catch((error) => console.error("Error al recargar el modal del carrito:", error));
  }

  checkoutEventBtn() {
    document.getElementById("cart-notification-button").addEventListener("click", (event) => {
      event.preventDefault();
      this.close();
      this.cartModal.updateCartContent()
      this.cartModal.open();
    });
  }
}

customElements.define("cart-notification", CartNotification);
