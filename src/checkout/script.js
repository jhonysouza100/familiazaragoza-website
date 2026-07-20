/*=============== CHECKOUT ===============*/
document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "cart";
  const ORDERS_ENDPOINT = "https://restful-api-v4.vercel.app/api/v1/orders";
  const SHIPMENT_ENDPOINT = "https://restful-api-v4.vercel.app/api/v1/shipments/generate/paqar";

  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const form = document.getElementById("shipping-form");
  const submitBtn = document.getElementById("submit-btn");
  const messageEl = document.getElementById("form-message");
  const addressInput = document.getElementById("address");
  const paymentModal = document.getElementById("payment-modal");
  const paymentModalClose = document.getElementById("payment-modal-close");
  const paymentModalOverlay = document.querySelector(".payment_modal-overlay");

  /** 📦 Lee el carrito desde localStorage */
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

  /** 💾 Guarda el carrito en localStorage */
  const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  const parsePrice = (value) => {
    if (typeof value !== 'string') {
      return Number(value || 0);
    }

    const raw = value.trim();
    const hasComma = raw.includes(',');
    const hasDot = raw.includes('.');

    if (hasComma && hasDot) {
      return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
    }

    if (hasComma) {
      return Number(raw.replace(',', '.')) || 0;
    }

    if (hasDot) {
      const lastDotIndex = raw.lastIndexOf('.');
      const decimals = raw.slice(lastDotIndex + 1);
      if (decimals.length === 3) {
        return Number(raw.replace(/\./g, '')) || 0;
      }
      return Number(raw) || 0;
    }

    return Number(raw) || 0;
  };

  /** 💵 Formatea un número como precio (mismo formato que la página principal) */
  const formatPrice = (value) => `$${parsePrice(value).toLocaleString('es-AR')}`;

  const getCartTotal = () => {
    return getCart().reduce((sum, item) => {
      const price = parsePrice(item.price);
      const minCant = Number(item.minCant) > 0 ? Number(item.minCant) : 1;
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : minCant;
      return sum + price * quantity;
    }, 0);
  };

  /** 🧾 Renderiza los productos del carrito y actualiza el total */
  const renderCart = () => {
    const cart = getCart();

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="checkout_empty">
          <i class="ri-shopping-basket-2-line"></i>
          <p>Tu carrito está vacío.</p>
          <a href="/src/index.html#catalog">Ver productos</a>
        </div>`;
      totalEl.textContent = formatPrice(0);
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    let total = 0;

    itemsContainer.innerHTML = cart.map((item) => {
      const price = parsePrice(item.price);
      const minCant = Number(item.minCant) > 0 ? Number(item.minCant) : 1;
      const stock = Number(item.stock) > 0 ? Number(item.stock) : Infinity;
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : minCant;
      const subtotal = price * quantity;
      total += subtotal;

      const minusDisabled = quantity <= minCant ? "disabled" : "";
      // El botón "-" elimina cuando ya está en el mínimo; el "+" avanza de a minCant
      const plusDisabled = quantity + minCant > stock ? "disabled" : "";

      return `
        <article class="cart-item" data-id="${item.id}">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h3 class="cart-item-name">${item.name}</h3>
            <span class="cart-item-price">${formatPrice(price)} c/u</span>
            <div class="cart-item-qty">
              <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Restar cantidad" ${minusDisabled}>
                <i class="ri-subtract-line"></i>
              </button>
              <span class="cart-qty-value">${quantity}u</span>
              <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}" aria-label="Sumar cantidad" ${plusDisabled}>
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>
          <div class="cart-item-end">
            <button type="button" class="cart-remove" data-action="remove" data-id="${item.id}" aria-label="Eliminar producto">
              <i class="ri-delete-bin-line"></i>
            </button>
            <span class="cart-item-subtotal">${formatPrice(subtotal)}</span>
          </div>
        </article>`;
    }).join("");

    totalEl.textContent = formatPrice(total);
  };

  /**
   * 🔢 Cambia la cantidad usando el minCant del producto como paso dinámico.
   * @param {string} productId
   * @param {number} direction - 1 incrementa, -1 decrementa
   */
  const changeQuantity = (productId, direction) => {
    const cart = getCart();
    const item = cart.find((p) => String(p.id) === String(productId));
    if (!item) return;

    const minCant = Number(item.minCant) > 0 ? Number(item.minCant) : 1;
    const stock = Number(item.stock) > 0 ? Number(item.stock) : Infinity;
    const current = Number(item.quantity) > 0 ? Number(item.quantity) : minCant;
    const next = current + direction * minCant;

    if (next > stock) return;

    // Por debajo del mínimo => eliminar (misma regla que el carrito principal)
    if (next < minCant) {
      removeProduct(productId);
      return;
    }

    item.quantity = next;
    saveCart(cart);
    renderCart();
  };

  /** 🗑️ Elimina un producto del carrito */
  const removeProduct = (productId) => {
    const cart = getCart().filter((item) => String(item.id) !== String(productId));
    saveCart(cart);
    renderCart();
  };

  /** 🎛️ Delegación de eventos para +, - y eliminar */
  itemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const productId = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "increase") changeQuantity(productId, 1);
    else if (action === "decrease") changeQuantity(productId, -1);
    else if (action === "remove") removeProduct(productId);
  });

  /*=============== FORMULARIO DE ENVÍO ===============*/

  /** 🔀 Habilita/deshabilita el domicilio según el método de entrega */
  const updateSubmitState = () => {
    const cart = getCart();
    const hasItems = cart.length > 0;
    const isValid = form.checkValidity();
    submitBtn.disabled = !hasItems || !isValid;
  };

  const handleDeliveryChange = () => {
    const method = form.querySelector('input[name="deliveryMethod"]:checked')?.value;
    const isPickup = method === "sucursal";
    if (addressInput) {
      addressInput.disabled = isPickup;
      addressInput.required = !isPickup;
      if (isPickup) addressInput.value = "";
    }
    updateSubmitState();
  };

  form.querySelectorAll('input[name="deliveryMethod"]').forEach((radio) => {
    radio.addEventListener("change", handleDeliveryChange);
  });

  form.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", updateSubmitState);
    control.addEventListener("change", updateSubmitState);
  });

  /** ✅ Muestra un mensaje de estado */
  const setMessage = (text, type = "") => {
    messageEl.textContent = text;
    messageEl.className = "form_message" + (type ? ` is-${type}` : "");
  };

  /**
   * ------ Mercado Pago SDK ------
   * Atención!
   * Cada vez que el usuario sale de la pantalla donde se
   * muestra algún Brick, es necesario destruir la instancia
   * actual con el comando window.walletBrickController.unmount().
   * Al ingresar nuevamente se debe generar una nueva instancia.
  */
  function unmountWalletBrick() {
    window.walletBrickController.unmount();
  }

  const mp = new MercadoPago('APP_USR-28a87365-abc1-49b7-b949-6fe097c1d4e7', { locale: "es-AR" });
  const bricksBuilder = mp.bricks();
  
  const renderWalletBrick = async (bricksBuilder) => {

    const settings = {
      initialization: {
        redirectMode: "modal", // modal, app, blank
      },
      customization: {
        theme: "default",
        valueProp: "security_safety",
        customStyle: {
          hideValueProp: false,
          valuePropColor: "white",
          buttonHeight: "48px",
          borderRadius: "6px",
          verticalPadding: "8px",
          horizontalPadding: "0px",
        },
        checkout: {
          theme: {
            elementsColor: "#4287F5",
            headerColor: "#4287F5",
          },
        },
      },
      callbacks: {
        onReady: () => {
          /**
           * Brick ready.
           * Here you can hide loadings from your site, for example.
          */
        },
        
        onSubmit: () => {
          /** 
           * The wallet brick handles form submission internally here.
           * Callback called when clicking Wallet Brick
           * this is possible because the brick is a button
           * at this time of submit, you must create the preference
           */
          const cart = getCart();
          if (cart.length === 0) {
            setMessage("Tu carrito está vacío.", "error");
            return;
          }

          const payload = {
            items: cart.map((item) => ({
              item_id: Number(item.id),
              quantity: Number(item.quantity) || Number(item.minCant) || 1,
            })),
            payment: {
              method: "Mercadopago",
            },
          };

          
          return new Promise((resolve, reject) => {
            fetch(ORDERS_ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": "x-api-123"
              },
              body: JSON.stringify(payload),
            }).then((response) => response.json())
            .then((response) => {
              // resolve the promise with the ID of the preference
              resolve(response.payment.preference_id);
              localStorage.removeItem(CART_KEY);
              form.reset();
              renderCart();
            }).catch((error) => {
              // handle error response when trying to create preference
              reject();
            });
          });
        },
      },
    };

    window.walletBrickController = await bricksBuilder.create(
      "wallet",
      "walletBrick_container",
      settings,
    );
  };

  /** 🔓 Abre el modal de pago */
  const openPaymentModal = (shipmentTotal, cartTotal) => {
    normalizeShipmentTotal = Number(shipmentTotal) || 0;
    document.getElementById("payment-order-cart-total").textContent = formatPrice(cartTotal);
    document.getElementById("payment-order-shipment").textContent = formatPrice(normalizeShipmentTotal);
    document.getElementById("payment-order-total").textContent = formatPrice(cartTotal + normalizeShipmentTotal);
    paymentModal.setAttribute("aria-hidden", "false");
    paymentModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  /** 🔒 Cierra el modal de pago */
  const closePaymentModal = () => {
    unmountWalletBrick();
    paymentModal.setAttribute("aria-hidden", "true");
    paymentModal.style.display = "none";
    document.body.style.overflow = "";
    setMessage("Compra en espera...", "loading");
    submitBtn.disabled = false;
  };

  // Cerrar modal con botón close
  if (paymentModalClose) {
    paymentModalClose.addEventListener("click", closePaymentModal);
  }

  /** Cerrar modal al hacer click en el overlay
  if (paymentModalOverlay) {
    paymentModalOverlay.addEventListener("click", closePaymentModal);
  };
  */

  // Cerrar modal con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && paymentModal.getAttribute("aria-hidden") === "false") {
      closePaymentModal();
    }
  });

  /** 📤 Envío del formulario a la API mediante fetch */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validación nativa del formulario
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const shippingData = Object.fromEntries(formData.entries());
    const cartTotal = getCartTotal();

    submitBtn.disabled = true;
    setMessage("Calculando costo de envío...", "loading");

    new Promise((resolve, reject) => {
      fetch(SHIPMENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "x-api-123"
        },
        body: JSON.stringify(shippingData),
      }).then((response) => response.json())
      .then((response) => {
        renderWalletBrick(bricksBuilder);
        openPaymentModal(response.total, cartTotal);
        setMessage("Listo, confirma el pago en el modal.", "success");
        resolve(response.total);
      }).catch((error) => {
        setMessage("No pudimos calcular el envío. Intentá nuevamente.", "error");
        submitBtn.disabled = false;
        reject();
      });
    });
  });

  // Inicializar
  renderCart();
  handleDeliveryChange();
});

