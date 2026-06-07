/**
 * Club-Sharks E-Commerce Storefront Engine
 * Safe and secure client-side interactive logic.
 */

// --- Product Data Database ---
const PRODUCTS = [
  {
    id: 1,
    name: "Club-Sharks Heirloom Tomatoes",
    category: "Seasonal Vegetables",
    price: 5.99,
    unit: "lb",
    stock: 12,
    harvestDate: "Harvested Today",
    nutrition: "Rich in Lycopene, Vitamin C, Vitamin K, and Potassium. Low calorie and high hydration.",
    image: "assets/product_veggies.png"
  },
  {
    id: 2,
    name: "Crisp Organic Butterhead Lettuce",
    category: "Fresh Greens",
    price: 3.49,
    unit: "head",
    stock: 8,
    harvestDate: "Harvested Yesterday",
    nutrition: "Excellent source of Vitamin A, Vitamin K, and folate. High dietary fiber and iron.",
    image: "assets/product_veggies.png"
  },
  {
    id: 3,
    name: "Artisanal White Sage Honey",
    category: "Premium Farm Foods",
    price: 12.99,
    unit: "jar",
    stock: 15,
    harvestDate: "Harvested Oct 12",
    nutrition: "100% Raw, unfiltered honey. Rich in antioxidants, active enzymes, and natural antibacterial compounds.",
    image: "assets/product_veggies.png"
  },
  {
    id: 4,
    name: "Rainbow Chard Bouquet",
    category: "Fresh Greens",
    price: 4.29,
    unit: "bunch",
    stock: 5,
    harvestDate: "Harvested Today",
    nutrition: "Extremely high in Vitamin K, Vitamin A, and Vitamin C. Packed with antioxidant carotenoids.",
    image: "assets/product_veggies.png"
  },
  {
    id: 5,
    name: "Sweet Baby Carrots",
    category: "Seasonal Vegetables",
    price: 2.99,
    unit: "bunch",
    stock: 20,
    harvestDate: "Harvested Today",
    nutrition: "High Beta-Carotene (Vitamin A), biotin, potassium, and vitamins B6 and K1.",
    image: "assets/product_veggies.png"
  },
  {
    id: 6,
    name: "Cold-Pressed Estate Olive Oil",
    category: "Premium Farm Foods",
    price: 24.99,
    unit: "bottle",
    stock: 9,
    harvestDate: "Harvested Sep 20",
    nutrition: "Extra virgin olive oil from early harvest olives. Packed with monounsaturated fats and polyphenols.",
    image: "assets/product_veggies.png"
  }
];

// --- E-Commerce Cart State Manager ---
let cart = [];

// Initialize Cart from LocalStorage
function initCart() {
  const storedCart = localStorage.getItem("club_sharks_cart");
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
      // Validate cart structure to avoid tampering
      if (!Array.isArray(cart)) cart = [];
      cart = cart.filter(item => item && typeof item.productId === 'number' && typeof item.quantity === 'number');
    } catch (e) {
      cart = [];
    }
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("club_sharks_cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    if (existingItem.quantity + quantity <= product.stock) {
      existingItem.quantity += quantity;
    } else {
      alert(`Sorry, only ${product.stock} items are in stock.`);
      existingItem.quantity = product.stock;
    }
  } else {
    cart.push({ productId, quantity });
  }
  saveCart();
  openCartDrawer();
}

function updateQuantity(productId, quantity) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const itemIndex = cart.findIndex(item => item.productId === productId);
  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else if (quantity <= product.stock) {
      cart[itemIndex].quantity = quantity;
    } else {
      alert(`Only ${product.stock} items in stock.`);
      cart[itemIndex].quantity = product.stock;
    }
    saveCart();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getCartCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// --- Dynamic Storefront UI Rendering (SECURE DOM API Only) ---
function renderCatalog(filteredProducts = PRODUCTS) {
  const container = document.getElementById("catalog-grid");
  if (!container) return;
  
  // Clear the container securely
  container.replaceChildren();

  if (filteredProducts.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "cart-empty-state";
    emptyMsg.textContent = "No products found matching your search.";
    container.appendChild(emptyMsg);
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card reveal";
    
    // Product Image Wrapper
    const imgWrap = document.createElement("div");
    imgWrap.className = "product-img-wrap";
    
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    imgWrap.appendChild(img);
    
    // Badge
    const badge = document.createElement("div");
    badge.className = "product-badge";
    if (product.stock === 0) {
      badge.className += " out-of-stock";
      badge.textContent = "Out of Stock";
    } else {
      badge.textContent = product.harvestDate;
    }
    imgWrap.appendChild(badge);
    card.appendChild(imgWrap);
    
    // Info Container
    const info = document.createElement("div");
    info.className = "product-info";
    
    const category = document.createElement("div");
    category.className = "product-category";
    category.textContent = product.category;
    info.appendChild(category);
    
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;
    // Open nutritional info modal on click
    name.addEventListener("click", () => openNutritionModal(product));
    info.appendChild(name);
    
    const meta = document.createElement("div");
    meta.className = "product-meta";
    
    const stockSpan = document.createElement("span");
    stockSpan.textContent = `Stock: ${product.stock} left`;
    meta.appendChild(stockSpan);
    
    const nutritionBtn = document.createElement("span");
    nutritionBtn.style.cursor = "pointer";
    nutritionBtn.style.color = "var(--color-secondary)";
    nutritionBtn.style.fontWeight = "600";
    nutritionBtn.textContent = "Nutrition Details";
    nutritionBtn.addEventListener("click", () => openNutritionModal(product));
    meta.appendChild(nutritionBtn);
    info.appendChild(meta);
    
    // Price Row
    const priceRow = document.createElement("div");
    priceRow.className = "product-price-row";
    
    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `$${product.price.toFixed(2)} / ${product.unit}`;
    priceRow.appendChild(price);
    info.appendChild(priceRow);
    
    // Add to Cart Button
    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-shop";
    addBtn.textContent = product.stock > 0 ? "Add to Cart" : "Out of Stock";
    if (product.stock === 0) {
      addBtn.disabled = true;
      addBtn.style.opacity = "0.5";
    } else {
      addBtn.addEventListener("click", () => addToCart(product.id));
    }
    info.appendChild(addBtn);
    
    card.appendChild(info);
    container.appendChild(card);
  });

  // Re-run animations trigger for newly generated elements
  observeAnimations();
}

// --- Cart UI Synchronization (SECURE DOM API) ---
function updateCartUI() {
  const countBadge = document.getElementById("cart-badge-count");
  if (countBadge) {
    countBadge.textContent = getCartCount().toString();
  }

  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  cartContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "cart-empty-state";
    
    // Using DOMParser to safely load static structural SVG
    const svgParser = new DOMParser();
    const svgDoc = svgParser.parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
      "image/svg+xml"
    );
    emptyState.appendChild(svgDoc.documentElement);

    const emptyText = document.createElement("p");
    emptyText.textContent = "Your cart is empty. Fill it with premium farm harvest!";
    emptyState.appendChild(emptyText);
    
    cartContainer.appendChild(emptyState);
    
    document.getElementById("cart-subtotal").textContent = "$0.00";
    document.getElementById("checkout-btn").disabled = true;
    return;
  }

  document.getElementById("checkout-btn").disabled = false;

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.className = "cart-item-img";
    cartItem.appendChild(img);

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const title = document.createElement("h4");
    title.textContent = product.name;
    details.appendChild(title);

    const price = document.createElement("div");
    price.className = "cart-item-price";
    price.textContent = `$${product.price.toFixed(2)} / ${product.unit}`;
    details.appendChild(price);

    // Quantity Controls
    const qtyCtrl = document.createElement("div");
    qtyCtrl.className = "cart-qty-ctrl";

    const minusBtn = document.createElement("span");
    minusBtn.className = "cart-qty-btn";
    minusBtn.textContent = "-";
    minusBtn.addEventListener("click", () => updateQuantity(product.id, item.quantity - 1));
    qtyCtrl.appendChild(minusBtn);

    const qtyVal = document.createElement("span");
    qtyVal.textContent = item.quantity.toString();
    qtyCtrl.appendChild(qtyVal);

    const plusBtn = document.createElement("span");
    plusBtn.className = "cart-qty-btn";
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => updateQuantity(product.id, item.quantity + 1));
    qtyCtrl.appendChild(plusBtn);

    details.appendChild(qtyCtrl);
    cartItem.appendChild(details);

    // Remove Action
    const removeBtn = document.createElement("div");
    removeBtn.className = "cart-item-remove";
    
    const svgParser = new DOMParser();
    const svgDoc = svgParser.parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
      "image/svg+xml"
    );
    removeBtn.appendChild(svgDoc.documentElement);
    removeBtn.addEventListener("click", () => removeFromCart(product.id));
    cartItem.appendChild(removeBtn);

    cartContainer.appendChild(cartItem);
  });

  document.getElementById("cart-subtotal").textContent = `$${getCartTotal().toFixed(2)}`;
}

// --- Cart Drawer Interface Actions ---
function openCartDrawer() {
  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.classList.add("open");
}

function closeCartDrawer() {
  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.classList.remove("open");
}

// --- Modals Layout Handling (SECURE DOM API) ---
function openNutritionModal(product) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const modalBody = overlay.querySelector(".modal-body");
  modalBody.replaceChildren();

  // Create Title
  const h3 = document.createElement("h3");
  h3.style.color = "var(--color-primary)";
  h3.style.marginBottom = "1rem";
  h3.textContent = product.name;
  modalBody.appendChild(h3);

  // Nutritional Details Header
  const subtitle = document.createElement("h4");
  subtitle.style.fontSize = "0.95rem";
  subtitle.style.marginBottom = "0.5rem";
  subtitle.style.color = "var(--color-secondary)";
  subtitle.textContent = "Nutritional Density & Facts:";
  modalBody.appendChild(subtitle);

  // Facts Description
  const p = document.createElement("p");
  p.style.fontSize = "0.95rem";
  p.style.color = "var(--color-text-light)";
  p.style.lineHeight = "1.6";
  p.textContent = product.nutrition;
  modalBody.appendChild(p);

  // Harvest Detail
  const harvestDiv = document.createElement("div");
  harvestDiv.style.marginTop = "1.5rem";
  harvestDiv.style.paddingTop = "1rem";
  harvestDiv.style.borderTop = "1px solid var(--color-border)";
  harvestDiv.style.display = "flex";
  harvestDiv.style.justifyContent = "space-between";
  harvestDiv.style.fontSize = "0.9rem";
  
  const spanHarvestLabel = document.createElement("span");
  spanHarvestLabel.textContent = "Harvest Schedule:";
  harvestDiv.appendChild(spanHarvestLabel);
  
  const spanHarvestValue = document.createElement("strong");
  spanHarvestValue.textContent = product.harvestDate;
  harvestDiv.appendChild(spanHarvestValue);
  modalBody.appendChild(harvestDiv);

  // Close Button inside Body
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-shop";
  closeBtn.style.marginTop = "2rem";
  closeBtn.textContent = "Close Details";
  closeBtn.addEventListener("click", closeNutritionModal);
  modalBody.appendChild(closeBtn);

  overlay.classList.add("open");
}

function closeNutritionModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.classList.remove("open");
}

// --- Checkout Modal Setup & Payment Logic ---
function openCheckoutModal() {
  closeCartDrawer();
  const overlay = document.getElementById("checkout-overlay");
  if (overlay) overlay.classList.add("open");
}

function closeCheckoutModal() {
  const overlay = document.getElementById("checkout-overlay");
  if (overlay) overlay.classList.remove("open");
}

// --- Postcode Delivery Checker Interactivity ---
function initPostcodeChecker() {
  const form = document.getElementById("zip-check-form");
  if (!form) return;

  const resultContainer = document.getElementById("zip-check-result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputField = form.querySelector("input");
    const postcode = inputField.value.trim();
    
    // Clear previous classes/messages
    resultContainer.replaceChildren();
    resultContainer.className = "form-feedback";

    if (!postcode) {
      resultContainer.classList.add("error");
      resultContainer.textContent = "Please enter a valid postal code.";
      return;
    }

    // Dummy Postcode Check: Validates length of standard postal structure
    const postPattern = /^[0-9a-zA-Z\s]{3,8}$/;
    if (!postPattern.test(postcode)) {
      resultContainer.classList.add("error");
      resultContainer.textContent = "Invalid postcode format.";
      return;
    }

    // Demo Delivery Zone logic: checks if first digit is odd/even or first character is in delivery zones
    const firstChar = postcode.charAt(0);
    const mockDeliveryZones = ['9', '1', '2', 'a', 'A', 'b', 'B', 'm', 'M', 'e', 'E', 'l', 'L'];
    
    if (mockDeliveryZones.includes(firstChar) || postcode.length % 2 === 0) {
      resultContainer.classList.add("success");
      resultContainer.textContent = `Excellent! ${postcode} is in our Premium Farm-to-Table direct delivery zone. We deliver daily.`;
    } else {
      resultContainer.classList.add("error");
      resultContainer.textContent = `Sorry, ${postcode} is currently outside our direct delivery zone. Contact our Hub to arrange custom carrier shipping.`;
    }
  });
}

// --- Forms Submission and Verification ---
function initFormsValidation() {
  // Inquiry Form
  const inquiryForm = document.getElementById("delivery-inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("iq-name").value.trim();
      const email = document.getElementById("iq-email").value.trim();
      const postcode = document.getElementById("iq-zip").value.trim();
      const message = document.getElementById("iq-message").value.trim();
      
      let hasError = false;

      // Validation logic
      const nameError = document.getElementById("err-iq-name");
      if (!name) {
        nameError.textContent = "Name is required.";
        nameError.className = "form-feedback error";
        hasError = true;
      } else {
        nameError.textContent = "";
        nameError.className = "form-feedback";
      }

      const emailError = document.getElementById("err-iq-email");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        emailError.textContent = "Please enter a valid email address.";
        emailError.className = "form-feedback error";
        hasError = true;
      } else {
        emailError.textContent = "";
        emailError.className = "form-feedback";
      }

      const zipError = document.getElementById("err-iq-zip");
      if (!postcode) {
        zipError.textContent = "Postal code is required.";
        zipError.className = "form-feedback error";
        hasError = true;
      } else {
        zipError.textContent = "";
        zipError.className = "form-feedback";
      }

      if (hasError) return;

      // Successful inquiry mock response (TODO(security) sanitize if echoed in DOM)
      const submitSuccess = document.createElement("div");
      submitSuccess.className = "form-feedback success";
      submitSuccess.style.marginTop = "1rem";
      submitSuccess.textContent = `Thank you ${name}! Your inquiry for postcode ${postcode} was received. Our logistics coordinator will reach out to you at ${email} shortly.`;
      
      inquiryForm.replaceWith(submitSuccess);
    });
  }

  // Checkout Form
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    const paymentBtns = document.querySelectorAll(".payment-btn");
    let selectedPayment = "card";

    paymentBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        paymentBtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedPayment = btn.dataset.method;
        
        // Show/hide card details based on selected option
        const cardFields = document.getElementById("credit-card-fields");
        if (selectedPayment === "card") {
          cardFields.style.display = "block";
        } else {
          cardFields.style.display = "none";
        }
      });
    });

    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("ck-email").value.trim();
      const address = document.getElementById("ck-address").value.trim();
      
      let hasError = false;

      const emailError = document.getElementById("err-ck-email");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        emailError.textContent = "Valid email address is required.";
        emailError.className = "form-feedback error";
        hasError = true;
      } else {
        emailError.textContent = "";
        emailError.className = "form-feedback";
      }

      const addrError = document.getElementById("err-ck-address");
      if (!address) {
        addrError.textContent = "Delivery address is required.";
        addrError.className = "form-feedback error";
        hasError = true;
      } else {
        addrError.textContent = "";
        addrError.className = "form-feedback";
      }

      if (selectedPayment === "card") {
        const cardNum = document.getElementById("ck-card").value.trim();
        const cardError = document.getElementById("err-ck-card");
        const cardRegex = /^[0-9\s]{12,19}$/; // simple digit check
        if (!cardRegex.test(cardNum.replace(/\s/g, ''))) {
          cardError.textContent = "Enter a valid card number.";
          cardError.className = "form-feedback error";
          hasError = true;
        } else {
          cardError.textContent = "";
          cardError.className = "form-feedback";
        }
      }

      if (hasError) return;

      // Complete checkout simulation
      const checkoutBody = document.querySelector("#checkout-overlay .modal-body");
      checkoutBody.replaceChildren();

      const successTitle = document.createElement("h3");
      successTitle.style.color = "var(--color-success)";
      successTitle.style.marginBottom = "1rem";
      successTitle.textContent = "✓ Order Placed Successfully!";
      checkoutBody.appendChild(successTitle);

      const successText = document.createElement("p");
      successText.style.color = "var(--color-text-light)";
      successText.style.marginBottom = "1.5rem";
      successText.textContent = `Thank you for shopping at Club-Sharks! A receipt has been sent to ${email}. Your fresh organic items are scheduled for our early-morning delivery round tomorrow.`;
      checkoutBody.appendChild(successText);

      const successClose = document.createElement("button");
      successClose.className = "btn btn-shop";
      successClose.textContent = "Continue Shopping";
      successClose.addEventListener("click", () => {
        closeCheckoutModal();
        clearCart();
        // Reload page if on shop page to update product buttons, otherwise redirect
        if (document.getElementById("catalog-grid")) {
          renderCatalog();
        } else {
          window.location.href = "shop.html";
        }
      });
      checkoutBody.appendChild(successClose);
    });
  }
}

// --- Scroll Effects & Entrance Animations ---
function observeAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // trigger animation once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach(el => {
    observer.observe(el);
  });
}

function handleScrollHeader() {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

// --- Page Category Filter Event Handlers ---
function initCatalogFilters() {
  const searchInput = document.getElementById("product-search");
  const categoryRadios = document.querySelectorAll('input[name="category-filter"]');
  const stockCheckbox = document.getElementById("in-stock-only");

  if (!searchInput && categoryRadios.length === 0 && !stockCheckbox) return;

  function filterProducts() {
    let results = [...PRODUCTS];

    // 1. Text Search Filter
    if (searchInput) {
      const query = searchInput.value.toLowerCase().trim();
      if (query) {
        results = results.filter(p => p.name.toLowerCase().includes(query) || p.nutrition.toLowerCase().includes(query));
      }
    }

    // 2. Category Filter
    const selectedCategoryRadio = document.querySelector('input[name="category-filter"]:checked');
    if (selectedCategoryRadio) {
      const catVal = selectedCategoryRadio.value;
      if (catVal !== "all") {
        results = results.filter(p => p.category === catVal);
      }
    }

    // 3. Stock Level Filter
    if (stockCheckbox && stockCheckbox.checked) {
      results = results.filter(p => p.stock > 0);
    }

    renderCatalog(results);
  }

  if (searchInput) searchInput.addEventListener("input", filterProducts);
  categoryRadios.forEach(radio => radio.addEventListener("change", filterProducts));
  if (stockCheckbox) stockCheckbox.addEventListener("change", filterProducts);
}

// --- Menu Bar Interactivity on Mobile ---
function initMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle-btn");
  const navMenu = document.getElementById("nav-menu-bar");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      const isExpanded = navMenu.style.display === "flex";
      if (isExpanded) {
        navMenu.style.display = "none";
      } else {
        navMenu.style.display = "flex";
        navMenu.style.flexDirection = "column";
        navMenu.style.position = "absolute";
        navMenu.style.top = "80px";
        navMenu.style.left = "0";
        navMenu.style.width = "100%";
        navMenu.style.backgroundColor = "white";
        navMenu.style.padding = "2rem";
        navMenu.style.borderBottom = "1px solid var(--color-border)";
        navMenu.style.boxShadow = "var(--shadow-md)";
      }
    });
  }
}

// --- Document Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Load local state
  initCart();
  
  // Render storefront if present
  renderCatalog();
  
  // Event bindings
  const cartBtn = document.getElementById("cart-btn-toggle");
  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
  
  const cartClose = document.getElementById("cart-close-btn");
  if (cartClose) cartClose.addEventListener("click", closeCartDrawer);

  const cartOverlay = document.getElementById("cart-overlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", (e) => {
      if (e.target === cartOverlay) closeCartDrawer();
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckoutModal);

  const modalClose = document.getElementById("modal-close-btn");
  if (modalClose) modalClose.addEventListener("click", closeNutritionModal);
  
  const checkoutClose = document.getElementById("checkout-close-btn");
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckoutModal);

  // Initialize UI features
  initPostcodeChecker();
  initCatalogFilters();
  initFormsValidation();
  initMobileMenu();
  
  // Animations and Scroll bindings
  observeAnimations();
  window.addEventListener("scroll", handleScrollHeader);
});
