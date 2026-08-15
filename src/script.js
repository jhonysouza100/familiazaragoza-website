// =============== SHOW MENU ===============
const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close')

/* Show menu */
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu')
  })
}

/* Hide menu */
if (navClose) {
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu')
  })
}

// =============== REMOVE MENU MOBILE ===============
const navLink = document.querySelectorAll('.nav_link')

const linkAction = () => {
  const navMenu = document.getElementById('nav-menu')
  // When we click on each nav_link, we remove the show-menu class
  navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

// =============== SCROLL SECTIONS ACTIVE LINK ===============
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollDown = window.scrollY;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionsClass = document.querySelector(
        ".nav_menu a[href*=" + sectionId + "]"
      );

    if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
      sectionsClass.classList.add("active-link");
    } else {
      sectionsClass.classList.remove("active-link");
    }
  });
};
window.addEventListener("scroll", scrollActive);

// =============== CHANGE BACKGROUND HEADER ===============
const scrollHeader = () => {
  const header = document.getElementById('header')
  // Add the .blur-header class if the bottom scroll of the viewport is greater than 50
  this.scrollY >= 50 ? header.classList.add('blur-header')
    : header.classList.remove('blur-header')
}
window.addEventListener('scroll', scrollHeader)

// =============== SHOW SCROLL UP ===============
const scrollUp = () => {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
  window.scrollY >= 350
    ? scrollUp.classList.add("show-scroll")
    : scrollUp.classList.remove("show-scroll");
};
window.addEventListener("scroll", scrollUp);

// =============== SHOW DROP LIST ===============
const drop = document.querySelectorAll('.drop-btn')

drop.forEach(item => {
  const dropList = item.querySelector('.drop_list')

  item.addEventListener('click', () => {
    // 2. Close any other drop that are open
    const openItem = document.querySelector('.show-drop') // Search if there are any open drop

    // Check if there is an open drop
    if (openItem && openItem !== item) {
      const openList = openItem.querySelector('.drop_list')
      openList.removeAttribute('style')
      openItem.classList.remove('show-drop')
    }

    // 1. Show drop list (Ask if the drop is open or closed)
    if (item.classList.contains('show-drop')) {
      // If it's OPEN → IT CLOSES
      dropList.removeAttribute('style')
      item.classList.remove('show-drop')
    } else {
      // If it's CLOSED → IT OPENS
      dropList.style.height = dropList.scrollHeight + 'px'
      item.classList.add('show-drop')
    }
  })
})

// Inicializar el primer drop abierto
document.addEventListener('DOMContentLoaded', async () => {
  const openItem = document.querySelector('.show-drop')
  const dropList = openItem.querySelector('.drop_list')
  dropList.style.height = dropList.scrollHeight + 'px'
})

// =============== SWIPERJS TESTIMONIALS ===============
const swiperTestimonials = new Swiper(".testimonials_swiper", {
  autoplay: { delay: 5000, disableOnInteraction: true },
  loop: true,
  grabCursor: true,
  slidesPerView: 1,
  spaceBetween: 10,
  breakpoints: {
    575: {
      slidesPerView: 2,
      spaceBetween: 10,
    },
    725: {
      slidesPerView: 3,
      spaceBetween: 10,
    },
  },
});

// =============== LOAD PRODUCTS SIMPLE ===============
const parsePrice = (value) => {
  if (typeof value !== 'string') {
    return Number(value || 0);
  }

  const raw = value.trim();
  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');

  if (hasComma && hasDot) {
    // Formato AR / europeo: puntos de miles, coma decimal
    return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
  }

  if (hasComma) {
    // Solo coma: decimal
    return Number(raw.replace(',', '.')) || 0;
  }

  if (hasDot) {
    const lastDotIndex = raw.lastIndexOf('.');
    const decimals = raw.slice(lastDotIndex + 1);

    if (decimals.length === 3) {
      // Probablemente miles: 3.200, 3.200.000
      return Number(raw.replace(/\./g, '')) || 0;
    }

    // Probablemente decimal: 3200.00, 3.2
    return Number(raw) || 0;
  }

  return Number(raw) || 0;
};

const formatPrice = (value) => `$${parsePrice(value).toLocaleString('es-AR')}`;

const normalizeProduct = (product) => {
  const rawImages = product?.images;
  const images = typeof rawImages === 'string'
    ? [rawImages]
    : Array.isArray(rawImages)
      ? rawImages
      : [];
  const firstImage = images[0] || {};
  const imageUrl = product?.image || firstImage?.secure_url || firstImage?.url || firstImage || '';

  return {
    ...product,
    id: product?.id,
    name: product?.name || 'Producto',
    description: product?.description || '',
    image: imageUrl,
    tag: product?.tag || product?.category || product?.brand || '',
    minCant: Number(product?.minCount || product?.minCant || 1),
    price: parsePrice(product.price || 0),
    stock: Number(product?.stock || 0),
  };
};

let productsCatalog = [];

const renderProductCards = ({ updatedProductId = null } = {}) => {
  const grid = document.getElementById('products-wrapper');
  const formContainer = document.getElementById('select_product-container');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const getProductState = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const cartItem = cart.find((item) => String(item.id) === String(product.id));
    const favItem = favorites.find((item) => String(item.id) === String(product.id));
    
    // La cantidad viene del carrito si está ahí, sino de favoritos
    const quantity = cartItem 
      ? Number(cartItem.quantity) > 0 ? Number(cartItem.quantity) : 0
      : favItem
        ? Number(favItem.quantity) > 0 ? Number(favItem.quantity) : 0
        : 0;
    
    const isInCart = Boolean(cartItem);
    const isInFavorites = Boolean(favItem);
    const isSelected = isInCart || isInFavorites; // Seleccionado si está en carrito O favoritos
    const minCant = Number(product.minCant) > 0 ? Number(product.minCant) : 1;
    const stock = Number(product.stock) > 0 ? Number(product.stock) : Infinity;

    return {
      quantity,
      isInCart,
      isInFavorites,
      isSelected,
      minCant,
      stock,
      minusDisabled: quantity <= minCant,
      plusDisabled: quantity + minCant > stock,
    };
  };

  const updateProductCard = (productId) => {
    const product = productsCatalog.find((item) => String(item.id) === String(productId));
    if (!product) return;

    const state = getProductState(product);
    const checkbox = grid?.querySelector(`.product_checkbox[data-id="${productId}"]`);
    const productCard = checkbox?.closest('.product_card');

    if (productCard) {
      const cardCheckbox = productCard.querySelector('.product_checkbox');
      const decreaseBtn = productCard.querySelector('.cart-qty-btn[data-action="decrease"]');
      const increaseBtn = productCard.querySelector('.cart-qty-btn[data-action="increase"]');
      const qtyValue = productCard.querySelector('.cart-item-qty .cart-qty-value');

      // ✅ Solo marcar si está en CARRITO (icono solo visible en carrito)
      if (cardCheckbox) cardCheckbox.checked = state.isInCart;
      if (decreaseBtn) decreaseBtn.disabled = state.minusDisabled;
      if (increaseBtn) increaseBtn.disabled = state.plusDisabled;
      if (qtyValue) qtyValue.textContent = state.isInCart ? state.quantity || 0 : 0;
    }

    const formCheckbox = formContainer?.querySelector(`.product_checkbox[data-id="${productId}"]`);
    if (formCheckbox) {
      // ✅ Solo marcar si está en CARRITO (icono solo visible en carrito)
      formCheckbox.checked = state.isInCart;
    }
  };

  if (grid && !updatedProductId) {
    grid.innerHTML = productsCatalog.map((p) => {
      const state = getProductState(p);
      const { quantity, isInCart, isSelected, minCant, stock, minusDisabled, plusDisabled } = state;

      return `
        <div class="swiper-slide">
          <div class="product_card" title="Toca para elegir o eliminar">
            <input type="checkbox" name="products[]" id="product-${p.id}" value="${p.name}" class="product_checkbox" data-id="${p.id}" ${isInCart ? 'checked' : ''}>
            <label for="product-${p.id}" class="product_card-label">
              <span class="product_check-icon">
                <i class="ri-heart-fill"></i>
              </span>
              <div class="product_image-wrap">
                <img src="${p.image}" alt="${p.name}" />
              </div>
              <div class="product_card-info">
                <h3 class="product_name">${p.name}</h3>
                <p class="product_description">${p.description || ''}</p>
                <div class="cart-item-info">
                  <h3 class="bg_clip-text">${formatPrice(p.price)} c/u</h3>
                  <div class="cart-item-qty">
                    <button type="button" class="cart-qty-btn large" data-action="decrease" data-id="${p.id}" aria-label="Restar cantidad" ${minusDisabled ? 'disabled' : ''}>
                      <i class="ri-subtract-line"></i>
                    </button>
                    <span class="cart-qty-value">${quantity || 0}</span>
                    <button type="button" class="cart-qty-btn large" data-action="increase" data-id="${p.id}" aria-label="Sumar cantidad" ${plusDisabled ? 'disabled' : ''}>
                      <i class="ri-add-line"></i>
                    </button>
                    <button class="button add_to_cart-button santiago-class">Agregar al carrito</button>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
      `;
    }).join('');
  } else if (updatedProductId) {
    updateProductCard(updatedProductId);
  }

  if (formContainer && !updatedProductId) {
    formContainer.innerHTML = productsCatalog.map((p) => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const isInCart = cart.some((item) => String(item.id) === String(p.id));
      return `
        <input type="checkbox" name="products[]" id="product-form-${p.id}" value="${p.name}" class="product_checkbox" data-id="${p.id}" ${isInCart ? 'checked' : ''}>
        <label for="product-form-${p.id}" class="product_label">
          <img src="${p.image}" alt="${p.name}">
          <span class="product_check-icon">
          <i class="ri-check-line"></i>
          </span>
          <p class="product_check-name">${p.name}</p>
        </label>
      `;
    }).join('');
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('products-wrapper');
  const formContainer = document.getElementById('select_product-container');

  try {
    const res = await fetch('https://restful-api-v4.vercel.app/api/v1/products?tenant_id=2');
    if (!res.ok) throw new Error('Failed to load products: ' + res.status);

    const payload = await res.json();
    
    const productList = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : [];
    productsCatalog = productList.map(normalizeProduct);

    // Guardar para que el resto del script (carrito) pueda leerlos
    localStorage.setItem('products', JSON.stringify(productsCatalog));
    renderProductCards();
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    // =============== SWIPERJS PRODUCTS ===============
    // Inicializar SwiperJS para productos después de que el DOM esté listo y los productos hayan sido cargados
    const swiperProducts = new Swiper('.products_swiper', {
      autoplay: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: false,
      grabCursor: true,
      slidesPerView: 1,
      spaceBetween: 54,
      breakpoints: {
        // tablets
        520: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        // desktops
        970: {
          // Asegurarte de que tu slider tenga al menos el doble de diapositivas que el valor asignado a slidesPerView, o desactivar el loop dinámicamente si no hay suficientes elementos.
          loop: false,
          slidesPerView: 3,
          spaceBetween: 20,
        },
      },
    });
  }
});

// Escuchar cambios en los checkboxes de productos y actualizar el carrito en localStorage
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("cart-badge");
  
  // 🚫 Bandera para evitar que syncCartButtonStates() dispare eventos change
  let isUpdatingCheckboxesUI = false;

  /** 🧮 Actualiza el contador visual del carrito */
  const updateCartTooltip = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemCount = cart.length;

    if (tooltip) {
      if (itemCount > 0) {
        tooltip.textContent = itemCount;
        tooltip.classList.add("tooltip-active");
      } else {
        tooltip.textContent = "0";
        tooltip.classList.remove("tooltip-active");
      }
    }
  };

  /** 🎯 Marca los checkboxes de productos activos según el localStorage */
  const syncCartButtonStates = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const productCheckboxes = document.querySelectorAll(".product_checkbox");

    if (productCheckboxes.length === 0) {
      // Si aún no hay checkboxes, reintentar después de un corto tiempo
      setTimeout(syncCartButtonStates, 100);
      return;
    }

    // 🚫 Activar bandera para evitar que el evento change se dispare
    isUpdatingCheckboxesUI = true;

    productCheckboxes.forEach((checkbox) => {
      const productId = checkbox.getAttribute("data-id");
      // 👉 Solo marcar si está en CARRITO (no en favoritos)
      // Esto asegura que el icono solo se muestre cuando está en carrito
      const existsInCart = cart.some((item) => String(item.id) === String(productId));
      checkbox.checked = existsInCart;
    });

    // 🚫 Desactivar bandera después de actualizar
    isUpdatingCheckboxesUI = false;
  };

  /** � Actualiza el enlace de WhatsApp con los productos del carrito */
  const updateWhatsAppLink = () => {
    try {
      const whatsappBtn = document.getElementById('whatsapp-btn');
      if (!whatsappBtn) return;

      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Mensaje base (coincide con el original del HTML)
      let message = 'Hola. Mi nombre es ___ y quiero ofrecer Familia Zaragoza en mi negocio. Entiendo que la compra mínima para este canal es de 20 kilos.';

      if (cart.length > 0) {
        message += '\n\nItems de mi interés:';
        cart.forEach((p, i) => {
          // Si existe nombre, lo agregamos. Incluimos la cantidad si está disponible.
          const name = p.name || p.title || `Producto ${i + 1}`;
          const qty = Number(p.quantity) > 0 ? ` (x${p.quantity})` : '';
          message += `\n- ${name}${qty}`;
        });
      }

      // Añadir URL al final (opcional)
      message += '\n\nhttps://familiazaragoza.com';

      const encoded = encodeURIComponent(message);
      const phone = '543755531691';
      whatsappBtn.setAttribute('href', `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`);
    } catch (err) {
      // No bloquear si algo falla
      console.error('updateWhatsAppLink error:', err);
    }
  };

  // =============== SISTEMA DE FAVORITOS (ALMACENAMIENTO OCULTO) ===============
  /**
   * 🔄 Métodos reutilizables para manejar la lógica de carrito y favoritos
   * 
   * Los favoritos actúan como almacenamiento oculto para preservar:
   * - Cantidades de productos removidos del carrito
   * - Estado de productos que pueden ser restaurados al carrito
   * 
   * FLUJO:
   * 1. Click en checkbox → toggle estado: carrito → favoritos → carrito → ...
   * 2. Si no está en ninguno → agregar al carrito con cantidad mínima
   * 3. Si está en carrito → mover a favoritos (preservando cantidad)
   * 4. Si está en favoritos → mover a carrito (restaurando cantidad)
   * 5. Usar + / - en favorito → restaura al carrito e incrementa/decrementa
   * 
   * ALMACENAMIENTO:
   * - localStorage.cart: productos activos en el carrito
   * - localStorage.favorites: productos ocultos (preserva cantidades)
   */

  /** 📥 Obtiene favoritos del localStorage */
  const getFavorites = () => JSON.parse(localStorage.getItem("favorites") || "[]");

  /** 💾 Guarda favoritos en localStorage */
  const saveFavorites = (favorites) => localStorage.setItem("favorites", JSON.stringify(favorites));

  /**
   * 🔄 Mueve un producto del carrito a favoritos (preservando cantidad)
   * @param {string} productId - ID del producto
   */
  const moveToFavorites = (productId) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productIndex = cart.findIndex((item) => String(item.id) === String(productId));
    
    if (productIndex === -1) return; // Producto no existe en carrito

    const product = cart[productIndex];
    let favorites = getFavorites();
    
    // Guardar en favoritos con su cantidad actual
    favorites = favorites.filter((item) => String(item.id) !== String(productId)); // Evitar duplicados
    favorites.push(product);
    saveFavorites(favorites);

    // Remover del carrito
    cart.splice(productIndex, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  /**
   * 🔄 Mueve un producto de favoritos al carrito (restaurando cantidad)
   * @param {string} productId - ID del producto
   */
  const moveToCart = (productId) => {
    const favorites = getFavorites();
    const productIndex = favorites.findIndex((item) => String(item.id) === String(productId));
    
    if (productIndex === -1) return; // Producto no existe en favoritos

    const product = favorites[productIndex];
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Remover duplicados del carrito (en caso de que exista)
    const cartFilteredCart = cart.filter((item) => String(item.id) !== String(productId));
    cartFilteredCart.push(product);
    localStorage.setItem("cart", JSON.stringify(cartFilteredCart));

    // Remover de favoritos
    favorites.splice(productIndex, 1);
    saveFavorites(favorites);
  };

  /**
   * ✅ Alterna estado de un producto: carrito ↔ favoritos
   * Si no está en ninguno, lo agrega al carrito
   * @param {string} productId - ID del producto
   */
  const toggleProductState = (productId) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const favorites = getFavorites();

    const inCart = cart.some((item) => String(item.id) === String(productId));
    const inFavorites = favorites.some((item) => String(item.id) === String(productId));

    if (inCart) {
      // Si está en carrito → mover a favoritos
      moveToFavorites(productId);
    } else if (inFavorites) {
      // Si está en favoritos → mover a carrito
      moveToCart(productId);
    } else {
      // Si no está en ninguno → agregar al carrito con cantidad mínima
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => String(p.id) === String(productId));
      
      if (product) {
        const minCant = Number(product.minCant) > 0 ? Number(product.minCant) : 1;
        cart.push({ ...product, quantity: minCant });
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    }
  };

  /**
   * 🔍 Obtiene el estado completo de un producto
   * @param {string} productId - ID del producto
   * @returns {Object} Estado del producto (ubicación, cantidad, etc)
   */
  const getProductFullState = (productId) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const favorites = getFavorites();
    
    const inCart = cart.find((item) => String(item.id) === String(productId));
    const inFavorites = favorites.find((item) => String(item.id) === String(productId));
    
    return {
      productId,
      isInCart: Boolean(inCart),
      isInFavorites: Boolean(inFavorites),
      quantity: inCart?.quantity || inFavorites?.quantity || 0,
      cartItem: inCart || null,
      favoriteItem: inFavorites || null,
    };
  };

  /**
   * 🗑️ Limpia los favoritos (útil después de checkout)
   */
  const clearFavorites = () => {
    localStorage.removeItem("favorites");
  };

  /** 🛒 Escuchar cambios en los checkboxes de productos */
  document.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".product_checkbox");
    if (checkbox) {
      // 🚫 Ignorar si estamos actualizando la UI automáticamente
      if (isUpdatingCheckboxesUI) {
        return;
      }

      const productId = checkbox.getAttribute("data-id");

      // Usar la lógica unificada de toggle
      toggleProductState(productId);

      // 🔄 Actualizar tooltip y estados
      updateCartTooltip();
      syncCartButtonStates();
      // 🔄 Actualizar enlace de Whatsapp
      updateWhatsAppLink();
      // 🔄 Actualizar panel lateral del carrito
      renderCartPanel();
      renderProductCards({ updatedProductId: productId });
    }
  });

  document.addEventListener("click", (e) => {
    const qtyButton = e.target.closest(".product_card .cart-qty-btn");
    if (!qtyButton) return;

    const productId = qtyButton.getAttribute("data-id");
    const action = qtyButton.getAttribute("data-action");
    if (!productId || !action) return;

    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const favorites = getFavorites();
    const minCant = Number(product.minCant) > 0 ? Number(product.minCant) : 1;
    const stock = Number(product.stock) > 0 ? Number(product.stock) : Infinity;
    
    let existingIndex = cart.findIndex((item) => String(item.id) === String(productId));
    let existingItem = existingIndex >= 0 ? cart[existingIndex] : null;

    // Si no está en carrito pero está en favoritos, moverlo al carrito primero
    if (!existingItem) {
      const favIndex = favorites.findIndex((item) => String(item.id) === String(productId));
      if (favIndex >= 0) {
        // Mover de favoritos a carrito
        existingItem = favorites[favIndex];
        cart.push(existingItem);
        existingIndex = cart.length - 1;
        // Remover de favoritos
        favorites.splice(favIndex, 1);
        saveFavorites(favorites);
      }
    }

    const currentQty = existingItem && Number(existingItem.quantity) > 0 ? Number(existingItem.quantity) : 0;

    if (action === "increase") {
      const nextQty = currentQty + minCant;
      if (nextQty > stock) return;

      if (existingItem) {
        existingItem.quantity = nextQty;
      } else {
        cart.push({ ...product, quantity: minCant });
      }
    } else if (action === "decrease") {
      if (!existingItem) return;

      const nextQty = currentQty - minCant;
      if (nextQty < minCant) {
        // Cuando la cantidad llega al mínimo y se sigue disminuyendo, mover a favoritos
        moveToFavorites(productId);
      } else {
        existingItem.quantity = nextQty;
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    }

    if (action === "increase") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    updateCartTooltip();
    syncCartButtonStates();
    updateWhatsAppLink();
    renderCartPanel();
    renderProductCards({ updatedProductId: productId });
  });

  // =============== CARRITO LATERAL (PANEL DESLIZANTE) ===============
  const cartPanel = document.getElementById("cart-panel");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartCheckout = document.getElementById("cart-checkout");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  /** 🧾 Renderiza los productos del carrito dentro del panel y actualiza el total */
  const renderCartPanel = () => {
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="checkout_empty">
          <i class="ri-shopping-basket-2-line"></i>
          <p>Tu carrito está vacío.</p>
          <a href="/#catalog" class="empty-cart-link">Ver productos</a>
        </div>`;
      
      // Agregar evento para cerrar el carrito al hacer click en el enlace
      const emptyCartLink = cartItemsContainer.querySelector('.empty-cart-link');
      if (emptyCartLink) {
        emptyCartLink.addEventListener('click', closeCart);
      }
      
      if (cartTotalEl) cartTotalEl.textContent = formatPrice(0);
      // Deshabilitar botón de checkout cuando el carrito está vacío
      if (cartCheckout) cartCheckout.classList.add("disabled");
      return;
    }

    let total = 0;

    cartItemsContainer.innerHTML = cart.map((item) => {
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
        </article>
      `;
    }).join("");

    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);
    // Habilitar botón de checkout cuando hay productos
    if (cartCheckout) cartCheckout.classList.remove("disabled");
  };

  /** 📂 Abrir / cerrar el panel lateral */
  const openCart = () => {
    if (!cartPanel) return;
    renderCartPanel();
    cartPanel.classList.add("show-cart");
    cartOverlay.classList.add("show-cart");
    cartPanel.setAttribute("aria-hidden", "false");
    if (cartToggle) cartToggle.setAttribute("aria-expanded", "true");
  };
  const closeCart = () => {
    if (!cartPanel) return;
    cartPanel.classList.remove("show-cart");
    cartOverlay.classList.remove("show-cart");
    cartPanel.setAttribute("aria-hidden", "true");
    if (cartToggle) cartToggle.setAttribute("aria-expanded", "false");
  };

  if (cartToggle) cartToggle.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (cartCheckout) cartCheckout.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartPanel && cartPanel.classList.contains("show-cart")) {
      closeCart();
    }
  });

  /**
   * 🔢 Cambia la cantidad de un producto usando su minCant como paso dinámico.
   * @param {string} productId - id del producto
   * @param {number} direction - 1 para incrementar, -1 para decrementar
   */
  const changeQuantity = (productId, direction) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find((p) => String(p.id) === String(productId));
    if (!item) return;

    // El paso es siempre el minCant del propio producto (cada uno puede tener uno distinto)
    const minCant = Number(item.minCant) > 0 ? Number(item.minCant) : 1;
    const stock = Number(item.stock) > 0 ? Number(item.stock) : Infinity;
    const current = Number(item.quantity) > 0 ? Number(item.quantity) : minCant;
    const next = current + direction * minCant;

    // No permitir superar el stock
    if (next > stock) return;

    // Si al decrementar quedaría por debajo del mínimo, eliminar reutilizando la lógica existente
    if (next < minCant) {
      removeProduct(productId);
      return;
    }

    item.quantity = next;
    localStorage.setItem("cart", JSON.stringify(cart));

    // 🔄 Reutilizar funciones existentes + refrescar panel
    updateCartTooltip();
    updateWhatsAppLink();
    renderCartPanel();
  };

  /** 🗑️ Elimina un producto reutilizando el flujo existente del checkbox */
  const removeProduct = (productId) => {
    const checkbox = document.querySelector(`.product_checkbox[data-id="${productId}"]`);
    if (checkbox) {
      // Desmarcar y disparar el evento 'change' → reutiliza la lógica de borrado existente
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Fallback si el checkbox no está en el DOM
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart = cart.filter((item) => String(item.id) !== String(productId));
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartTooltip();
      syncCartButtonStates();
      updateWhatsAppLink();
      renderCartPanel();
    }
  };

  /** 🎛️ Delegación de eventos para los botones del panel (+ / - / eliminar) */
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const productId = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "increase") changeQuantity(productId, 1);
      else if (action === "decrease") changeQuantity(productId, -1);
      else if (action === "remove") removeProduct(productId);
    });
  }

  const whatsappAnchor = document.getElementById('whatsapp-btn');
  const whatsappModalOverlay = document.getElementById('whatsapp-modal-overlay');
  const whatsappModalConfirm = document.getElementById('whatsapp-modal-confirm');
  // Seleccionar todos los elementos que cierran el modal (id o clases comunes)
  const whatsappModalCloseButtons = document.querySelectorAll('#whatsapp-modal-close, #whatsapp-modal-cancel, .modal-close, .whatsapp-modal-cancel');

  // Guardar elemento que tenía el foco antes de abrir el modal
  let previousActiveElement = null;

  const openWhatsAppModal = () => {
    if (!whatsappModalOverlay) return;
    // Guardar foco previo
    previousActiveElement = document.activeElement;
    whatsappModalOverlay.classList.add('show-modal');
    whatsappModalOverlay.setAttribute('aria-hidden', 'false');
    // Mover foco al primer elemento interactivo dentro del modal
    const focusable = whatsappModalOverlay.querySelector('#whatsapp-modal-confirm, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable && typeof focusable.focus === 'function') {
      focusable.focus();
    }
  };

  const closeWhatsAppModal = () => {
    if (!whatsappModalOverlay) return;
    // Restaurar foco ANTES de ocultar el modal para evitar aria-hidden en elemento enfocado
    try {
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      } else if (whatsappAnchor && typeof whatsappAnchor.focus === 'function') {
        whatsappAnchor.focus();
      }
    } catch (err) {
      // no bloquear si focus falla
      console.error('restore focus error', err);
    }

    whatsappModalOverlay.classList.remove('show-modal');
    whatsappModalOverlay.setAttribute('aria-hidden', 'true');
    // Restaurar scroll
    document.body.style.overflow = '';
    previousActiveElement = null;
  };

  if (whatsappAnchor) {
    whatsappAnchor.addEventListener('click', (event) => {
      if (!whatsappModalOverlay) return;
      event.preventDefault();
      openWhatsAppModal();
    });
  }

  if (whatsappModalCloseButtons && whatsappModalCloseButtons.length) {
    whatsappModalCloseButtons.forEach((btn) => btn.addEventListener('click', closeWhatsAppModal));
  }
  if (whatsappModalOverlay) {
    whatsappModalOverlay.addEventListener('click', (event) => {
      if (event.target === whatsappModalOverlay) closeWhatsAppModal();
    });
  }

  if (whatsappModalConfirm) {
    whatsappModalConfirm.addEventListener('click', () => {
      if (!whatsappAnchor) return;
      const href = whatsappAnchor.getAttribute('href');
      if (href) window.open(href, '_blank');
      closeWhatsAppModal();
    });
  }

  // Ejecutar una vez al cargar
  updateCartTooltip();
  syncCartButtonStates();
  updateWhatsAppLink();
  renderCartPanel();
});

const inputEmail = document.getElementById("input-email");
const inputName = document.getElementById("input-name");
const inputPhone = document.getElementById("input-phone");
const inputMessage = document.getElementById("input-message");
const submitButton = document.getElementById("submit-button");
const emailMessage = document.getElementById("email-message");

if(submitButton) {
  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const email = inputEmail?.value.trim() || "";
    const name = inputName?.value.trim() || "";
    const phone = inputPhone?.value.trim() || "";
    const message = inputMessage?.value.trim() || "";
    
    if (!email) return;
  
    // Guardar estado del botón para restaurar luego
    const originalButtonContent = submitButton.innerHTML;
    const originalDisabled = submitButton.disabled;
    // Funciones auxiliares para mostrar/ocultar loader
    const showLoader = () => {
      submitButton.classList.add("sending");
      submitButton.setAttribute("aria-busy", "true");
      submitButton.innerHTML = `
        Enviando...
        <i class="ri-loader-4-line"></i>
      `;
    };
  
    const hideLoader = () => {
      submitButton.disabled = originalDisabled;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = originalButtonContent;
      submitButton.classList.remove("sending");
    };
  
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productsList = cart.length > 0 
      ? cart.map(el => `<li style="padding:8px 0; border-bottom:1px solid #eee;">${el.name}</li>`).join('')
      : '<li style="padding:8px 0; color:#888;">No se seleccionaron productos</li>';
  
    // =============== EMAIL SMTP ===============
    const emailHtmlContent = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="es" xml:lang="es">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin-inline: 1rem; font-family:'Montserrat', sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin:20px auto;">
      <!-- Header -->
      <tr>
        <td align="center" style="padding:30px 20px; background:linear-gradient(145deg, hsl(31, 32%, 49%) 0%, hsl(32, 38%, 58%) 50%, hsl(35, 26%, 73%) 100%); border-radius:12px 12px 0 0;">
          <h1 style="margin:0; color:#ffffff; font-size:24px;">Familia Zaragoza Website</h1>
          <!-- <p style="margin:8px 0 0; color:#ffffff; font-size:18px;">Website</p> -->
        </td>
      </tr>
      
      <!-- Datos del contacto -->
      <tr>
        <td style="padding:30px 30px 20px;">
          <h2 style="margin:0 0 20px; color:#333; font-size:18px; border-bottom:2px solid hsl(31, 32%, 49%); padding-bottom:10px;">Datos del Contacto</h2>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:10px 10px 10px 0; color:#666; font-size:14px; width:80px;"><strong>Nombre:</strong></td>
              <td style="padding:10px 0; color:#333; font-size:14px; max-width: 620px; word-wrap: break-word;">${name || 'No especificado'}</td>
            </tr>
            <tr>
              <td style="padding:10px 10px 10px 0; color:#666; font-size:14px;"><strong>Email:</strong></td>
              <td style="padding:10px 0; font-size:14px; max-width: 620px;">${email ? `<a href="mailto:${email}" style="color:#D2691E; text-decoration:none; word-wrap: break-word;">${email ? email : 'No especificado'}</a>` : 'No especificado'}</td>
            </tr>
            <tr>
              <td style="padding:10px 10px 10px 0; color:#666; font-size:14px;"><strong>Telefono:</strong></td>
              <td style="padding:10px 0; font-size:14px; max-width: 620px;">${phone ? `<a href="https://api.whatsapp.com/send?phone=54${phone.replace(/\D/g, '')}" style="color:#25D366; text-decoration:none; word-wrap: break-word;">${phone}</a>` : 'No especificado'}</td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Mensaje -->
      <tr>
        <td style="padding:0 30px 20px; max-width: 620px;">
          <h2 style="margin:0 0 15px; color:#333; font-size:18px; border-bottom:2px solid hsl(31, 32%, 49%); padding-bottom:10px;">Mensaje</h2>
          <p style="margin:0; padding:15px; background:#f9f9f9; border-radius:8px; color:#333; font-size:14px; line-height:1.6; word-wrap: break-word;">${message || 'Sin mensaje'}</p>
        </td>
      </tr>
      
      <!-- Productos de interes -->
      <tr>
        <td style="padding:0 30px 30px;">
          <h2 style="margin:0 0 15px; color:#333; font-size:18px; border-bottom:2px solid hsl(31, 32%, 49%); padding-bottom:10px;">Productos de Interes</h2>
          <ul style="margin:0; padding:0 0 0 20px; list-style:none;">
            ${productsList}
          </ul>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td align="center" style="padding:20px; background:#f9f9f9; border-radius:0 0 12px 12px; font-size:12px; color:#888;">
          &copy; Impulsado por ChillHop Studio | 2026
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  
    const SMTPBody = {
      from: "Consulta desde la web",
      subject: `${name ? `Consulta de ${name}` : 'Nueva consulta desde la web'}`,
      to: [`hola@familiazaragoza.com`], // ${email}
      htmlContent: emailHtmlContent,
    };
  
    try {
      showLoader();
  
      const res = await fetch(
        "https://vercel-deploy-delta-sandy.vercel.app/api/v1/emails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(SMTPBody),
        }
      );
  
      const data = await res.json();
  
      if(!res.ok) {
        throw new Error(data.message || 'Error desconocido al enviar el correo');
      }
      emailMessage.textContent = "Correo enviado con éxito.";
      emailMessage.classList.add("success-message");
      inputEmail.value = "";
      inputName.value = "";
      inputPhone.value = "";
      inputMessage.value = "";
    } catch (error) {
      emailMessage.innerHTML = "Error al enviar el correo.";
      emailMessage.classList.add("error-message");
    } finally {
      // Asegurar restauración del botón incluso si hay error
      hideLoader();
      // Actualizar enlace de WhatsApp y tooltip si es necesario
      try { updateWhatsAppLink(); updateCartTooltip(); } catch(e) {}
    }
  });
}

// =============== SCROLL REVEAL ANIMATION ===============
const sr = ScrollReveal({
  origin: 'bottom',
  distance: '60px',
  duration: 1000,
})

// HERO SCROLL SCROLL ANIMATIONS
sr.reveal(`.hero_img-reveal, .hero_reflect-reveal`, { origin: 'top', delay: 600, duration: 2500 })
sr.reveal(`.hero_title`, { delay: 600, duration: 2500 })
sr.reveal(`.hero_description`, { delay: 1200, duration: 2500 })

// SECTION TEXT SCROLL ANIMATIONS
sr.reveal(`.section_title, .section_description`)

// ELEMETS SCROLL ANIMATIONS
sr.reveal(`.history_info, .manifest_grid, .contact_form, .faq_list, .footer_content, .footer_bottom`, { duration: 1200 })