// =============== SHOW MENU ===============
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Show menu */
if(navToggle){
   navToggle.addEventListener('click', () =>{
      navMenu.classList.add('show-menu')
   })
}

/* Hide menu */
if(navClose){
   navClose.addEventListener('click', () =>{
      navMenu.classList.remove('show-menu')
   })
}

// =============== REMOVE MENU MOBILE ===============
const navLink = document.querySelectorAll('.nav_link')

const linkAction = () =>{
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
const scrollHeader = () =>{
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
  if (!grid) return;

  try {
    const res = await fetch('/public/static/products.json');
    if (!res.ok) throw new Error('Failed to load products: ' + res.status);
    const products = await res.json();

    // Guardar para que el resto del script (carrito) pueda leerlos
    localStorage.setItem('products', JSON.stringify(products));

    grid.innerHTML = products.map(p => `
      <div class="product_card">
        <button class="product_add-btn btn_transition" aria-label="Agregar a favoritos" title="Agregar a favoritos" data-id="${p.id}">
          <i class="ri-heart-line"></i>
        </button>
        <div class="product_image-wrap">
          <img src="${p.image}" alt="${p.name}" />
        </div>
        <div class="product_card-info">
          <h3 class="product_name">${p.name}</h3>
          <p class="product_description">${p.description || ''}</p>
        </div>
      </div>
    `).join('');
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

  /** 🎯 Marca los botones de carrito activos según el localStorage */
  const syncCartButtonStates = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartButtons = document.querySelectorAll(".product_add-btn");

    if (cartButtons.length === 0) {
      // Si aún no hay botones, reintentar después de un corto tiempo
      setTimeout(syncCartButtonStates, 100);
      // 👉 syncCartButtonStates() se ejecuta antes de que los productos se hayan renderizado en
      // el DOM, por eso los botones .product_add-btn aún no existen cuando se llama por primera vez, y
      // los estilos “in-cart” no se aplican hasta que ocurre una interacción.
      // Esto pasa normalmente si los productos se inyectan dinámicamente en el DOM después del
      // DOMContentLoaded (por ejemplo, desde otra función que los renderiza).
      return;
    }

    cartButtons.forEach((btn) => {
      const productId = btn.getAttribute("data-id");
      const exists = cart.some((item) => String(item.id) === String(productId));
      btn.classList.toggle("in-cart", exists);

      const icon = btn.querySelector("i");
      if (icon) {
        // Reemplaza la clase del icono según el estado
        icon.className = exists ? "ri-heart-fill" : "ri-heart-line";
      } else {
        // Si no hay elemento <i>, inyectarlo
        btn.innerHTML = exists ? '<i class="ri-heart-fill"></i>' : '<i class="ri-heart-line"></i>';
      }
    });
  };

  /** 🛒 Escuchar clics en botones de carrito */
  document.addEventListener("click", (e) => {
    const cartBtn = e.target.closest(".product_add-btn");
    if (cartBtn) {
      const productId = cartBtn.getAttribute("data-id");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => String(p.id) === String(productId));

      if (product) {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");

        const index = cart.findIndex((item) => String(item.id) === String(productId));

        if (index === -1) {
          // 🟩 No existe → agregar al carrito
          cart.push(product);
          cartBtn.classList.add("in-cart");
        } else {
          // 🟥 Ya existe → eliminar del carrito
          cart.splice(index, 1);
          cartBtn.classList.remove("in-cart");
        }

        // Guardar cambios
        localStorage.setItem("cart", JSON.stringify(cart));

        // 🔄 Actualizar tooltip y estados
        updateCartTooltip();
        syncCartButtonStates();
      }
    }
  });

  // Ejecutar una vez al cargar
  updateCartTooltip();
  syncCartButtonStates();
});

// =============== EMAIL SMTP ===============
const emailHtmlContent = `
<!DOCTYPE html  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
  <meta httpt-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="720" style="max-width:720px; background-color:#ffffff; border-top-left-radius: 24px; border-top-right-radius: 24px; border-bottom-right-radius:8px; border-bottom-left-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin:20px auto;">
    <tr>
      <td align="center" style="padding:20px; font-size:12px; color:#888;">
        &copy; 2026 Familia Zaragoza | Todos los derechos reservados
      </td>
    </tr>
  </table>
  </body>
</html>
`;

const inputEmail = document.getElementById("input-email");
const submitButton = document.getElementById("submit-button");
const emailMessage = document.getElementById("email-message");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = inputEmail.value.trim();
  if (!email) return;

  const SMTPBody = {
    from: "Familia Zaragoza Yerba Mate",
    subject: "Prueba de email desde la web",
    to: [`${email}`],
    htmlContent: emailHtmlContent,
  };

  try {
    const res = await fetch(
      "http://localhost:3000/api/v1/emails",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "api-789" },
        body: JSON.stringify(SMTPBody),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al enviar el correo.");

    emailMessage.textContent = "Correo enviado con éxito.";
    emailMessage.classList.add("success-message");
    inputEmail.value = "";
  } catch (error) {
    emailMessage.innerHTML = "Error al enviar el correo.";
    emailMessage.classList.add("error-message");
    inputEmail.value = "";
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
sr.reveal(`.home_title, .products_title, .faq_title`, { delay: 1000 })
sr.reveal(`.home_description`, { delay: 1200 })
sr.reveal(`.home_button`, { delay: 1400 })
sr.reveal(`.home_footer`, { delay: 1600 })