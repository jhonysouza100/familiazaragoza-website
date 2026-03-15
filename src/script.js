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

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const productsList = cart.length > 0
    ? cart.map(el => `<li style="padding:8px 0; border-bottom:1px solid #eee;">${el.name}</li>`).join('')
    : '<li style="padding:8px 0; color:#888;">No se seleccionaron productos</li>';

  // =============== EMAIL SMTP ===============
  const emailHtmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es" xml:lang="es">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin-inline: 1rem; font-family:'Montserrat', sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin:20px auto;">
      <!-- Header -->
      <tbody>
        <tr>
          <td align="center" style="padding:30px 20px;background: linear-gradient(145deg, hsl(148.33deg 32% 49%) 0%, hsl(55.38deg 38% 58%) 50%, hsl(0deg 95.15% 70.58%) 100%);border-radius:12px 12px 0 0;">
            <h1 style="margin:0; color:#ffffff; font-size:24px;">Contactos RRHH Puerto Iguazu</h1>
          </td>
        </tr>
    
        <!-- Lista de Emails -->
        <tr>
          <td style="padding:30px 30px 20px;">
            <h2 style="margin:0 0 15px; color:#333; font-size:18px; border-bottom:2px solid hsl(31, 32%, 49%); padding-bottom:10px;">Contactos RRHH</h2>
            <ul style="margin:0; padding:0 0 0 20px; list-style:none;">
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh.empresas.igr@gmail.com">rrhh.empresas.igr@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:busquedacm.iguazu@gmail.com">busquedacm.iguazu@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:info@iguazuargentina.com">info@iguazuargentina.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:_iguazu@awasi.com">_iguazu@awasi.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:iguazurrhh22@gmail.com">iguazurrhh22@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@iguazuargentina.com">rrhh@iguazuargentina.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:daniel.gonzalez@accor.com">daniel.gonzalez@accor.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:gerencia@selvadelaurel.com.ar">gerencia@selvadelaurel.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:sumate@grupobordin.com">sumate@grupobordin.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:terraiguazusuites@gmail.com">terraiguazusuites@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@hotelsaintgeorge.com">rrhh@hotelsaintgeorge.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:gerencia@brutalcreativos.com">gerencia@brutalcreativos.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhhiguazuportal@gmail.com">rrhhiguazuportal@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:administracion.rrhh@brunohnos.com">administracion.rrhh@brunohnos.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:iguazu.rrhh@citycenter-iguazu.com.ar">iguazu.rrhh@citycenter-iguazu.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh.iguazu2023@gmail.com">rrhh.iguazu2023@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh.melia@melia.com">rrhh.melia@melia.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@citysalud.com.ar">rrhh@citysalud.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@crucerodelnorte.com.ar">rrhh@crucerodelnorte.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@dfspi.com">rrhh@dfspi.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@distridelnorte.com.ar">rrhh@distridelnorte.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@dln-logistica.com.ar">rrhh@dln-logistica.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@grandhotelslux.com">rrhh@grandhotelslux.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rr.hh@hotelesbagu.com">rr.hh@hotelesbagu.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:recursoshumanos@iguazujunglelodge.com">recursoshumanos@iguazujunglelodge.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:berenice.marcoppido@swissport.com">berenice.marcoppido@swissport.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:busqueda@electro.com.ar">busqueda@electro.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:bvdesingventas@gmail.com">bvdesingventas@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:capitalhumano@viacorreo.com.ar">capitalhumano@viacorreo.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:culturaspark@gmail.com">culturaspark@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:cv.dagusupermercado@gmail.com">cv.dagusupermercado@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:fortincataratas@gmail.com">fortincataratas@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:gestiondepersonas@serviciosnea.com.ar">gestiondepersonas@serviciosnea.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:gestionrrhhfortin@gmail.com">gestionrrhhfortin@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:giofarmaiguazu@gmail.com">giofarmaiguazu@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:grupoantonowicz@gmail.com">grupoantonowicz@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:housekeepinghe@raicesdelplata.com">housekeepinghe@raicesdelplata.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:cv_iguazu@ruta17.com">cv_iguazu@ruta17.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:iguazufoodpatagonia@gmail.com">iguazufoodpatagonia@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:Iguazuurbanhotel@gmail.com">Iguazuurbanhotel@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:mensugrandhotel@gmail.com">mensugrandhotel@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:personal@iguazujungle.com">personal@iguazujungle.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:simplementelamejor1260@gmail.com">simplementelamejor1260@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh_cuenca@cuencadelplata.com">rrhh_cuenca@cuencadelplata.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@lareservavirginlodge.com">rrhh@lareservavirginlodge.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:reclutamiento@brunohnos.com">reclutamiento@brunohnos.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:seleccion@mooksrrhh.com">seleccion@mooksrrhh.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@yvyhotel.com.ar">rrhh@yvyhotel.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@logexsrl.com.ar">rrhh@logexsrl.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh.granmelia.iguazu@melia.com">rrhh.granmelia.iguazu@melia.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:area.rrhh@siliconmisiones.gob.ar">area.rrhh@siliconmisiones.gob.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:roxana.mancilla@flybondi.com">roxana.mancilla@flybondi.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhhpandelaabuela@gmail.com">rrhhpandelaabuela@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:argwineinfo@gmail.com">argwineinfo@gmail.com</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh_seleccion@parbras.com.ar">rrhh_seleccion@parbras.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:rrhh@treiguazu.com.ar">rrhh@treiguazu.com.ar</a></li>
              <li style="padding:8px 0; border-bottom:1px solid #eee;"><a href="mailto:kaizenconsultora.info@gmail.com">kaizenconsultora.info@gmail.com</a></li>
            </ul>
          </td>
        </tr>
      
        <!-- Footer -->
        <tr>
          <td align="center" style="padding:20px; background:#f9f9f9; border-radius:0 0 12px 12px; font-size:12px; color:#888;">
            © Desarrolado por Jhonatan Leon Souza | 2026
          </td>
        </tr>
      </tbody>
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
    const res = await fetch(
      "https://vercel-deploy-delta-sandy.vercel.app/api/v1/emails",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SMTPBody),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al enviar el correo.");

    emailMessage.textContent = "Correo enviado con éxito.";
    emailMessage.classList.add("success-message");
    inputEmail.value = "";
    inputName.value = "";
    inputPhone.value = "";
    inputMessage.value = "";
  } catch (error) {
    emailMessage.innerHTML = "Error al enviar el correo.";
    emailMessage.classList.add("error-message");
  }
});

// =============== SCROLL REVEAL ANIMATION ===============
const sr = ScrollReveal({
  origin: 'bottom',
  distance: '60px',
  duration: 2500
})

sr.reveal(`.home_img, .footer_columns`, { opacity: 1, distance: '120px', delay: 400 })
sr.reveal(`.home_badge-right, .faq_list, .testimonials_title`, { origin: 'right', distance: '120px', delay: 400 })
sr.reveal(`.products_description, .testimonials_description`, { delay: 600 })
sr.reveal(`.home_badge-left, .products_grid`, { origin: 'left', distance: '120px', delay: 400 })
sr.reveal(`.home_title, .products_title, .contact_title, .faq_title`, { delay: 1000 })
sr.reveal(`.home_description`, { delay: 1200 })
sr.reveal(`.home_button`, { delay: 1400 })
sr.reveal(`.home_footer`, { delay: 1600 })
