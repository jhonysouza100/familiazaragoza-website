/*=============== CHECKOUT ===============*/
document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "cart";
  const ORDERS_ENDPOINT = "https://restful-api-v4.vercel.app/api/v1/orders";
  const AGENCIES_ENDPOINT = "https://restful-api-v4.vercel.app/api/v1/shipments/micorreo/agencies?provinceCode="
  const SHIPMENT_ENDPOINT = "https://restful-api-v4.vercel.app/api/v1/shipments/micorreo/rates";
  const AGENCIES_KEY = "agencies";
  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const shipmentContainer = document.getElementById("checkout-shipment-cost");
  const shipmentButton = document.getElementById("shipment-calculate-btn");
  const form = document.getElementById("shipping-form");
  const submitBtn = document.getElementById("submit-btn");
  const messageEl = document.getElementById("form-message");
  const paymentModal = document.getElementById("payment-modal");
  let currentShipmentCost = 0;

  /*=============== CAMPOS DINÁMICOS DE ENVÍO ===============*/
  const provinceSelect = document.getElementById("provinceCode");
  const cityField = document.getElementById("city-field");
  const citySelect = document.getElementById("city");
  const cityLoading = document.getElementById("city-loading");
  const postalField = document.getElementById("postal-field");
  const postalInput = document.getElementById("postalCode");
  const deliveryField = document.getElementById("delivery-field");
  const deliverySelect = document.getElementById("deliveryMethod");
  const pickupFields = document.getElementById("pickup-fields");
  const pickupStreetName = document.getElementById("pickupStreetName");
  const pickupStreetNumber = document.getElementById("pickupStreetNumber");
  const homeFields = document.getElementById("home-fields");
  const addressInput = document.getElementById("address");
  const streetNumberInput = document.getElementById("streetNumber");
  const paymentModalClose = document.getElementById("payment-modal-close");
  const paymentModalOverlay = document.querySelector(".payment_modal-overlay");

  /** ✅ Muestra un mensaje de estado */
  const setMessage = (text, type = "") => {
    messageEl.textContent = text;
    messageEl.className = "form_message" + (type ? ` is-${type}` : "");
  };

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
      currentShipmentCost = 0;
      itemsContainer.innerHTML = `
        <div class="checkout_empty">
          <i class="ri-shopping-basket-2-line"></i>
          <p>Tu carrito está vacío.</p>
          <a href="/#catalog">Ver productos</a>
        </div>`;
      totalEl.textContent = formatPrice(0);
      if (submitBtn) submitBtn.disabled = true;
      renderShipmentCalculator();
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

    totalEl.textContent = formatPrice(total + currentShipmentCost);
    renderShipmentCalculator();
  };

  /**
   * Calcula las dimensiones y peso totales del carrito para la API de envío.
   */
  const calculateCartDimensions = () => {
    return getCart().reduce(
      (acc, item) => {
        const width = Number(item?.dimensions?.width) || 0;
        const height = Number(item?.dimensions?.height) || 0;
        const length = Number(item?.dimensions?.length) || 0;
        const weight = Number(item?.dimensions?.weight) || 0;
        const quantity = Number(item.quantity) > 0
          ? Number(item.quantity)
          : (Number(item.minCant) > 0 ? Number(item.minCant) : 1);

        const itemVolume = width * height * length;
        return {
          totalVolume: acc.totalVolume + itemVolume * quantity,
          totalWeight: acc.totalWeight + weight * quantity,
        };
      },
      { totalVolume: 0, totalWeight: 0 },
    );
  };

  const updateShipmentResultDisplay = (value, show = true, isLoading = false) => {
    const resultEl = shipmentContainer.querySelector("#shipment-result");
    const valueEl = shipmentContainer.querySelector("#shipment-cost-value");
    const loadingEl = shipmentContainer.querySelector("#shipment-loading");
    if (!resultEl || !valueEl || !loadingEl) return;

    if (isLoading) {
      valueEl.hidden = true;
      loadingEl.hidden = false;
      resultEl.hidden = false;
      return;
    }

    valueEl.textContent = formatPrice(value);
    valueEl.hidden = !show;
    loadingEl.hidden = true;
    resultEl.hidden = !show;
  };

  const renderShipmentCalculator = () => {
    const cart = getCart();
    if (cart.length === 0) {
      shipmentContainer.innerHTML = "";
      return;
    }

    const previousPostal = shipmentContainer.querySelector("#shipment-postal-code")?.value || "";

    shipmentContainer.innerHTML = `
    <form id="shipment-calculator-form" class="checkout_shipment-form shipment-calculator-container">
      <div class="form_field">
        <input class="form_input" id="shipment-postal-code" name="shipmentPostalCode" type="text" inputmode="numeric" pattern="[0-9]{4,4}" title="Ingresá exactamente 4 dígitos" placeholder="C.P" value="${previousPostal}" required />
      </div>
      <button type="submit" class="button checkout_submit" id="shipment-calculate-btn">
        Calcular envío
      </button>
    </form>
    <div class="checkout_shipment-result" id="shipment-result" ${currentShipmentCost > 0 ? "" : "hidden"}>
      <div class="shipment-loading" id="shipment-loading" hidden>
        <i class="ri-loader-2-line shipment-loading-icon" aria-hidden="true"></i>
      </div>
      <strong id="shipment-cost-value" ${currentShipmentCost > 0 ? "" : "hidden"}>${formatPrice(currentShipmentCost)}</strong>
    </div>
      `;
  };

  const getShipmentPostalCode = () => {
    return shipmentContainer.querySelector("#shipment-postal-code")?.value.trim() || "";
  };

  const calculateShipmentCost = async (postalCodeDestination) => {
    const cart = getCart();
    if (cart.length === 0) {
      throw new Error("El carrito está vacío.");
    }
    if (!postalCodeDestination) {
      throw new Error("Ingresa un código postal válido.");
    }

    const { totalVolume, totalWeight } = calculateCartDimensions();
    const cubeSide = Math.max(1, Math.ceil(Math.cbrt(totalVolume || 1)));

    const payload = {
      postalCodeDestination,
      dimensions: {
        weight: Math.max(1, Math.ceil(totalWeight)),
        height: cubeSide,
        width: cubeSide,
        length: cubeSide,
      },
    };

    const response = await fetch(SHIPMENT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const price = Number(data?.rates?.[0]?.price) || 0;
    if (price <= 0) {
      throw new Error("No se pudo obtener el costo de envío.");
    }

    currentShipmentCost = price;
    updateShipmentResultDisplay(price, true, false);
    renderCart();
    return price;
  };

  const recalculateShipmentIfPostalExists = () => {
    const postalCode = getShipmentPostalCode();
    if (!postalCode) return;
    updateShipmentResultDisplay(0, true, true);
    calculateShipmentCost(postalCode).catch(() => {
      currentShipmentCost = 0;
      updateShipmentResultDisplay(0, false, false);
      renderCart();
    });
  };

  shipmentContainer.addEventListener("submit", async (e) => {
    const formEl = e.target.closest("#shipment-calculator-form");
    if (!formEl) return;
    e.preventDefault();

    const postalCode = getShipmentPostalCode();
    if (!postalCode) {
      setMessage("Ingresá un código postal para calcular el envío.", "error");
      return;
    }

    submitBtn.disabled = true;
    updateShipmentResultDisplay(0, true, true);
    setMessage("Calculando costo de envío...", "loading");
    try {
      await calculateShipmentCost(postalCode);
      setMessage("Costo de envío actualizado.", "success");
    } catch (error) {
      currentShipmentCost = 0;
      updateShipmentResultDisplay(0, false, false);
      setMessage(error.message || "No pudimos calcular el envío. Intentá nuevamente.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

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
    recalculateShipmentIfPostalExists();
  };

  /** 🗑️ Elimina un producto del carrito */
  const removeProduct = (productId) => {
    const cart = getCart().filter((item) => String(item.id) !== String(productId));
    saveCart(cart);
    renderCart();
    recalculateShipmentIfPostalExists();
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

  /** 💾 Lee/guarda las sucursales cacheadas en localStorage */
  const getAgencies = () => JSON.parse(localStorage.getItem(AGENCIES_KEY) || "[]");
  const saveAgencies = (agencies) => localStorage.setItem(AGENCIES_KEY, JSON.stringify(agencies));

  /** Verifica si el código postal del objeto contiene el codigo  postal que le pasás por parámetro. */
  function filtrarPorCodigoPostal(sucursales, codigoBuscado) {
    // Convertimos el parámetro a String por si se pasa como número
    const postalCodeStr = String(codigoBuscado);
    
    return sucursales.filter(sucursal => {
        // Accedemos de forma segura a la propiedad postalCode
        const postalCode = sucursal?.location?.address?.postalCode;
        
        // Verificamos si existe el código y si incluye el valor buscado
        return postalCode && postalCode.includes(postalCodeStr);
    });
  }

  /** 🔎 Devuelve la agencia seleccionada según la ciudad elegida (índice guardado en el value) */
  const getSelectedAgency = () => {
    const index = citySelect.value;
    if (index === "") return null;
    return getAgencies()[Number(index)] || null;
  };

  /** ✅ Habilita el botón de envío solo si el carrito y el form son válidos */
  const updateSubmitState = () => {
    const cart = getCart();
    const hasItems = cart.length > 0;
    const isValid = form.checkValidity();
    submitBtn.disabled = !hasItems || !isValid;
  };

  /** 👁️ Muestra u oculta un contenedor de campos */
  const toggleField = (el, show) => {
    if (el) el.hidden = !show;
  };

  /** 🔻 Reinicia la cascada de campos a partir de la ciudad */
  const resetFromCity = () => {
    citySelect.innerHTML = '<option value="" disabled selected>Seleccioná una ciudad</option>';
    citySelect.disabled = true;
    resetFromPostal();
  };

  /** 🔻 Reinicia código postal, método de entrega y campos de dirección */
  const resetFromPostal = () => {
    postalInput.value = "";
    deliverySelect.innerHTML = '<option value="" disabled selected>Seleccioná un método</option>';
    deliverySelect.disabled = true;
    deliverySelect.required = false;
    toggleField(postalField, false);
    toggleField(deliveryField, false);
    resetDeliveryDetails();
  };

  /** 🔻 Limpia y oculta los campos de sucursal/domicilio */
  const resetDeliveryDetails = () => {
    toggleField(pickupFields, false);
    toggleField(homeFields, false);
    pickupStreetName.value = "";
    pickupStreetNumber.value = "";
    addressInput.value = "";
    addressInput.required = false;
    streetNumberInput.value = "";
    streetNumberInput.required = false;
  };

  /** 🌐 Consulta las sucursales de la provincia y arma el select de ciudades */
  const loadAgencies = async (provinceCode) => {
    resetFromCity();
    toggleField(cityField, true);
    cityLoading.hidden = false;
    citySelect.disabled = true;
    updateSubmitState();

    try {
      const response = await fetch(AGENCIES_ENDPOINT + provinceCode);
      const data = await response.json();

      // La API responde un array de arrays; lo aplanamos.
      const flat = Array.isArray(data) ? data.flat() : [];
      // Solo sucursales activas.
      const activeAgencies = flat
        .filter((a) => a && a.status === "ACTIVE")
        .sort((a, b) => {
          const cityA = a?.location?.address?.city || "";
          const cityB = b?.location?.address?.city || "";

          return cityA.localeCompare(cityB, "es", {
            sensitivity: "base",
          });
        });

      saveAgencies(activeAgencies);
      populateCities(activeAgencies);

      if (activeAgencies.length === 0) {
        setMessage("No hay sucursales disponibles en esta provincia.", "error");
      } else {
        setMessage("");
        // Código postal (Habilitado) para buscar por código postal dentro de la provincia
        toggleField(postalField, true);
        const postalCode = getShipmentPostalCode();
        if (postalCode) {
          postalField.value = postalCode;
          const filteredAgencies = filtrarPorCodigoPostal(activeAgencies, postalCode);
          populateCities(filteredAgencies);
        }
      }
    } catch (error) {
      saveAgencies([]);
      setMessage("No pudimos cargar las sucursales. Intentá nuevamente.", "error");
    } finally {
      cityLoading.hidden = true;
      updateSubmitState();
    }
  };

  /** 🏙️ Puebla el select de ciudades usando el índice de cada agencia como value */
  const populateCities = (agencies) => {
    citySelect.innerHTML = '<option value="" disabled selected>Seleccioná una sucursal</option>';
    agencies.forEach((agency, index) => {
      const city = agency?.location?.address?.city || agency?.name || "Sucursal";
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${city} - ${agency?.name || ""}`.trim();
      citySelect.appendChild(option);
    });
    citySelect.disabled = agencies.length === 0;
  };

  /** 🏙️ Al elegir una ciudad: muestra el código postal y arma el método de entrega */
  const handleCityChange = () => {
    resetFromPostal();
    const agency = getSelectedAgency();
    if (!agency) {
      updateSubmitState();
      return;
    }

    // Código postal (solo lectura)
    postalInput.value = agency?.location?.address?.postalCode || "";
    toggleField(postalField, true);

    // Método de entrega según los servicios habilitados
    const services = agency?.services || {};
    const canPickup = services.pickupAvailability === true;
    const canDeliver = services.packageReception === true;

    deliverySelect.innerHTML = '<option value="" disabled selected>Seleccioná un método</option>';
    if (canDeliver) {
      deliverySelect.insertAdjacentHTML("beforeend", '<option value="domicilio">Envío a domicilio</option>');
    }
    if (canPickup) {
      deliverySelect.insertAdjacentHTML("beforeend", '<option value="sucursal">Retiro en sucursal</option>');
    }

    // Si solo hay una opción disponible, la seleccionamos automáticamente.
    const options = deliverySelect.querySelectorAll('option[value]:not([value=""])');
    deliverySelect.disabled = options.length === 0;
    deliverySelect.required = options.length > 0;
    toggleField(deliveryField, options.length > 0);

    if (options.length === 1) {
      deliverySelect.value = options[0].value;
      handleDeliveryChange();
    }

    updateSubmitState();
  };

  /** 📄 Al cambiar el código postal: filtra las sucursales */
  const handlePostalCodeChange = (e) => {
    const postalCode = e.target.value.trim();
    if (!postalCode) {
      resetFromPostal();
      updateSubmitState();
      return;
    }

    const agencies = getAgencies();
    const filteredAgencies = filtrarPorCodigoPostal(agencies, postalCode);

    if (filteredAgencies.length === 0) {
      setMessage("No hay sucursales disponibles para este código postal.", "error");
      resetFromPostal();
      updateSubmitState();
      return;
    }

    populateCities(filteredAgencies);
    citySelect.disabled = false;
    toggleField(cityField, true);
    setMessage("");
    updateSubmitState();
  }

  /** 🚚 Al elegir el método de entrega: muestra los campos de sucursal o de domicilio */
  const handleDeliveryChange = () => {
    resetDeliveryDetails();
    const method = deliverySelect.value;
    const agency = getSelectedAgency();

    if (method === "sucursal") {
      pickupStreetName.value = agency?.location?.address?.streetName || "";
      pickupStreetNumber.value = agency?.location?.address?.streetNumber || "";
      toggleField(pickupFields, true);
    } else if (method === "domicilio") {
      addressInput.required = true;
      streetNumberInput.required = true;
      toggleField(homeFields, true);
    }
    updateSubmitState();
  };

  // Provincia → carga sucursales
  provinceSelect.addEventListener("change", () => {
    if (provinceSelect.value) loadAgencies(provinceSelect.value);
  });

  // 
  postalInput.addEventListener("change", handlePostalCodeChange);

  // Ciudad → muestra código postal y método de entrega
  citySelect.addEventListener("change", handleCityChange);

  // Método de entrega → muestra campos de sucursal o domicilio
  deliverySelect.addEventListener("change", handleDeliveryChange);

  form.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", updateSubmitState);
    control.addEventListener("change", updateSubmitState);
  });

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

  const mp = new MercadoPago('APP_USR-e8aac406-e839-47f9-9865-b6b0874b9b2d', { locale: "es-AR" });
  const bricksBuilder = mp.bricks();

  const renderWalletBrick = async (bricksBuilder) => {

    const settings = {
      initialization: {
        redirectMode: "blank", // modal, app, blank
      },
      customization: {
        theme: "default",
        valueProp: "security_safety",
        customStyle: {
          hideValueProp: false,
          valuePropColor: "white", // blue, white, black
          buttonHeight: "48px", // min 48px - max free
          borderRadius: "6px",
          verticalPadding: "8px", // min 8px - max free
          horizontalPadding: "0px" // min 0px - max free
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

          const formData = new FormData(form);
          const isPickup = formData.get("deliveryMethod") === "sucursal";
          const agency = getSelectedAgency();

          const payload = {
            items: cart.map((item) => ({
              item_id: Number(item.id),
              quantity: Number(item.quantity) || Number(item.minCant) || 1,
            })),
            payment: {
              method: "Mercadopago",
            },
            shipment: {
              deliveredType: isPickup ? "S" : "D",
              pickupLocation: isPickup ? (agency?.code || "") : "",
              fullName: formData.get("fullName"),
              dni: formData.get("dni"),
              phone: formData.get("phone"),
              email: formData.get("email"),
              streetName: isPickup
                ? (agency?.location?.address?.streetName || "")
                : formData.get("address"),
              streetNumber: isPickup
                ? (agency?.location?.address?.streetNumber || "")
                : formData.get("streetNumber"),
              city: formData.get("city") && agency
                ? (agency?.location?.address?.city || "")
                : "",
              provinceCode: formData.get("provinceCode"),
              postalCodeDestination: formData.get("postalCodeDestination")
            }
          };

          return new Promise((resolve, reject) => {
            fetch(ORDERS_ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload),
            })
              .then((response) => response.json())
              .then((response) => {
                // resolve the promise with the ID of the preference
                resolve(response.payment.preference_id);
                //localStorage.removeItem(CART_KEY);
                //form.reset();
                //renderCart();
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
    document.getElementById("payment-order-cart-total").textContent = formatPrice(cartTotal);
    document.getElementById("payment-order-shipment").textContent = formatPrice(shipmentTotal);
    document.getElementById("payment-order-total").textContent = formatPrice(cartTotal + shipmentTotal);
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
    const cartTotal = getCartTotal();

    const calculateVolume = async () => {
      const productsInCart = getCart();

      const dimensions = productsInCart.reduce((acc, item) => {
        const width = Number(item?.dimensions?.width) || 0;
        const height = Number(item?.dimensions?.height) || 0;
        const length = Number(item?.dimensions?.length) || 0;
        const weight = Number(item?.dimensions?.weight) || 0;

        // Cantidad de unidades del ítem (usa minCant como fallback)
        const quantity = Number(item.quantity) > 0
          ? Number(item.quantity)
          : (Number(item.minCant) > 0 ? Number(item.minCant) : 1);

        // Volumen de una unidad
        const volume = width * height * length;

        return {
          totalVolume: acc.totalVolume + (volume * quantity),
          totalweight: acc.totalweight + (weight * quantity),
        };
      }, {
        totalVolume: 0,
        totalweight: 0,
      });

      // Lado del cubo equivalente
      const cubeSide = Math.ceil(Math.cbrt(dimensions.totalVolume));

      return {
        width: cubeSide,
        height: cubeSide,
        length: cubeSide,
        weight: Math.ceil(dimensions.totalweight)
      };
    };

    const shipmentDimensions = await calculateVolume();

    const shippingData = {
      postalCodeDestination: formData.get("postalCodeDestination"),
      deliveredType: formData.get("deliveryMethod") === "sucursal" ? "S" : "D",
      dimensions: {
        weight: shipmentDimensions.weight,
        height: shipmentDimensions.height,
        width: shipmentDimensions.width,
        length: shipmentDimensions.length,
      },
    };

    submitBtn.disabled = true;
    setMessage("Calculando costo de envío...", "loading");

    new Promise((resolve, reject) => {
      fetch(SHIPMENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(shippingData),
      }).then((response) => response.json())
        .then((response) => {

          renderWalletBrick(bricksBuilder);
          openPaymentModal(response.rates.at(0).price, cartTotal);
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
  updateSubmitState();
});