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
const swiper = new Swiper(".swiper-testimonials", {
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
window.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.products_grid');
  const formContainer = document.getElementById('select_product-container');

  try {
    const res = await fetch('/public/static/products.json');
    if (!res.ok) throw new Error('Failed to load products: ' + res.status);
    const products = await res.json();

    // Guardar para que el resto del script (carrito) pueda leerlos
    localStorage.setItem('products', JSON.stringify(products));

    // Obtener carrito actual para marcar productos seleccionados
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Renderizar grid de productos (cards grandes)
    if (grid) {
      grid.innerHTML = products.map(p => {
        const isInCart = cart.some(item => String(item.id) === String(p.id));
        return `
        <div class="product_card">
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
            </div>
          </label>
        </div>
      `}).join('');
    }

    // Renderizar checkboxes del formulario (miniaturas)
    if (formContainer) {
      formContainer.innerHTML = products.map(p => {
        const isInCart = cart.some(item => String(item.id) === String(p.id));
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
  } catch (error) {
    console.error('Error loading products:', error);
  }
});

// =============== ADD / REMOVE TO CART FUNCTIONALITY + TOOLTIP UPDATE (FIXED) ===============
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("cart-badge");

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
    const productCheckboxes = document.querySelectorAll(".product_checkbox");

    if (productCheckboxes.length === 0) {
      // Si aún no hay checkboxes, reintentar después de un corto tiempo
      setTimeout(syncCartButtonStates, 100);
      return;
    }

    productCheckboxes.forEach((checkbox) => {
      const productId = checkbox.getAttribute("data-id");
      const exists = cart.some((item) => String(item.id) === String(productId));
      checkbox.checked = exists;
    });
  };

  /** � Actualiza el enlace de WhatsApp con los productos del carrito */
  const updateWhatsAppLink = () => {
    try {
      const whatsappBtn = document.getElementById('whatsapp-btn');
      if (!whatsappBtn) return;

      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Mensaje base (coincide con el original del HTML)
      let message = 'Vengo desde la pagina web, me gustaría hacer una consulta.';

      if (cart.length > 0) {
        message += '\n\nProductos en mis favoritos:';
        cart.forEach((p, i) => {
          // Si existe nombre, lo agregamos. Si hubiera cantidad, podría incluirse.
          const name = p.name || p.title || `Producto ${i + 1}`;
          message += `\n- ${name}`;
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

  /** 🛒 Escuchar cambios en los checkboxes de productos */
  document.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".product_checkbox");
    if (checkbox) {
      const productId = checkbox.getAttribute("data-id");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => String(p.id) === String(productId));

      if (product) {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");

        if (checkbox.checked) {
          // 🟩 Checkbox marcado → agregar al carrito si no existe
          const exists = cart.some((item) => String(item.id) === String(productId));
          if (!exists) {
            cart.push(product);
          }
        } else {
          // 🟥 Checkbox desmarcado → eliminar del carrito
          cart = cart.filter((item) => String(item.id) !== String(productId));
        }

        // Guardar cambios
        localStorage.setItem("cart", JSON.stringify(cart));

        // 🔄 Actualizar tooltip y estados
        updateCartTooltip();
        syncCartButtonStates();
        // 🔄 Actualizar enlace de Whatsapp
        updateWhatsAppLink();
      }
    }
  });

  // Ejecutar una vez al cargar
  updateCartTooltip();
  syncCartButtonStates();
  updateWhatsAppLink();
});

const inputEmail = document.getElementById("input-email");
const inputName = document.getElementById("input-name");
const inputPhone = document.getElementById("input-phone");
const inputMessage = document.getElementById("input-message");
const submitButton = document.getElementById("submit-button");
const emailMessage = document.getElementById("email-message");

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

// =============== SCROLL REVEAL ANIMATION ===============
const sr = ScrollReveal({
  origin: 'bottom',
  distance: '60px',
  duration: 2500,
})

sr.reveal(`.home_img-reveal, .home_reflect-reveal`, { origin: 'top', opacity: 1, distance: '120px', delay: 400 })
sr.reveal(`.products_grid, .contact_form, .faq_list, .footer_bottom`)
sr.reveal(`.blog_image, .products_title, .about_title`, { origin: 'right'})
sr.reveal(`.blog_info, .contact_title, .testimonials_title, .faq_title`, { origin: 'left'})
sr.reveal(`.home_title`, { delay: 400 })
sr.reveal(`.about_description, .contact_description, .testimonials_description`, { delay: 600 })
sr.reveal(`.about_external`, { delay: 1200 })