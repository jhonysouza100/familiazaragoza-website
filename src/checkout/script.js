/*=============== CHECKOUT ===============*/
// Reutiliza el mismo carrito guardado en localStorage por la página principal.
// Clave: "cart" -> array de objetos producto { id, name, image, price, stock, minCant, quantity }

document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "cart";
  // TODO: reemplazar por el endpoint real cuando la API esté creada.
  const ORDERS_ENDPOINT = "/api/orders";

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

    if (submitBtn) submitBtn.disabled = false;

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
  const handleDeliveryChange = () => {
    const method = form.querySelector('input[name="deliveryMethod"]:checked')?.value;
    const isPickup = method === "sucursal";
    if (addressInput) {
      addressInput.disabled = isPickup;
      addressInput.required = !isPickup;
      if (isPickup) addressInput.value = "";
    }
  };
  form.querySelectorAll('input[name="deliveryMethod"]').forEach((radio) => {
    radio.addEventListener("change", handleDeliveryChange);
  });

  /** ✅ Muestra un mensaje de estado */
  const setMessage = (text, type = "") => {
    messageEl.textContent = text;
    messageEl.className = "form_message" + (type ? ` is-${type}` : "");
  };

  /** 🔓 Abre el modal de pago */
  const openPaymentModal = (orderId, total) => {
    document.getElementById("payment-order-id").textContent = orderId;
    document.getElementById("payment-order-total").textContent = formatPrice(total);
    paymentModal.setAttribute("aria-hidden", "false");
    paymentModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  /** 🔒 Cierra el modal de pago */
  const closePaymentModal = () => {
    paymentModal.setAttribute("aria-hidden", "true");
    paymentModal.style.display = "none";
    document.body.style.overflow = "";
  };

  // Cerrar modal con botón close
  if (paymentModalClose) {
    paymentModalClose.addEventListener("click", closePaymentModal);
  }

  // Cerrar modal al hacer click en el overlay
  if (paymentModalOverlay) {
    paymentModalOverlay.addEventListener("click", closePaymentModal);
  };

  // Cerrar modal con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && paymentModal.getAttribute("aria-hidden") === "false") {
      closePaymentModal();
    }
  });

  /** 📤 Envío del formulario a la API mediante fetch */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      setMessage("Tu carrito está vacío.", "error");
      return;
    }

    // Validación nativa del formulario
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const shipping = {
      fullName: formData.get("fullName")?.trim(),
      dni: formData.get("dni")?.trim(),
      deliveryMethod: formData.get("deliveryMethod"),
      address: formData.get("address")?.trim() || null,
      city: formData.get("city")?.trim(),
      postalCode: formData.get("postalCode")?.trim(),
      province: formData.get("province"),
    };

    const total = cart.reduce((sum, item) => {
      const price = parsePrice(item.price);
      const minCant = Number(item.minCant) > 0 ? Number(item.minCant) : 1;
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : minCant;
      return sum + price * quantity;
    }, 0);

    const payload = {
      shipping,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: parsePrice(item.price),
        quantity: Number(item.quantity) || Number(item.minCant) || 1,
      })),
      total,
      createdAt: new Date().toISOString(),
    };

    // Estado de carga
    submitBtn.disabled = true;
    setMessage("Enviando tu pedido...", "loading");

    try {
      const response = await fetch("ORDERS_ENDPOINT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con estado ${response.status}`);
      }

      // Pedido enviado correctamente - abrir modal de pago
      const orderId = `ORD-${Date.now()}`;
      openPaymentModal(orderId, total);
      localStorage.removeItem(CART_KEY);
      form.reset();
      renderCart();
    } catch (error) {
      openPaymentModal(1, 100);
      console.log("[v0] Error al enviar el pedido:", error.message);
      setMessage("No pudimos enviar el pedido. Revisá tu conexión e intentá nuevamente.", "error");
      submitBtn.disabled = false;
    }
  });

  // Inicializar
  renderCart();
  handleDeliveryChange();
});