// ✅ app.js — Complete Catering Reservation System Frontend 🇮🇳

// ------------------ Firebase Setup Imports ------------------
import { db } from './firebase-config.js';
import { onValue, ref, push, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ------------------ Modular Function Imports ------------------
import { register, login, logout, onAuthChange } from './auth.js';
import { uploadProduct, updateProduct, deleteProduct } from './products.js';
// Note: We no longer need getUserOrdersOnce(), but keep other order functions
import { updateOrderStatus, deleteOrder } from './orders.js'; 

// ------------------ Global Variables ------------------
const ADMIN_EMAIL = "admin@catering.com";
let currentUser = null;

// ------------------ Helper Functions & Validation ------------------
function showAlert(msg) {
  console.log(`ALERT: ${msg}`);
  alert(msg);
}

function resetModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => form.reset());
    const errorMessages = modal.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.textContent = '');
  }
}

/**
 * Validates input fields using standard HTML5 validation and custom checks.
 */
function validateForm(form, errorEl) {
    errorEl.textContent = ''; 
    
    if (!form.checkValidity()) {
        const invalidEl = form.querySelector(':invalid');
        if (invalidEl) {
            let message = invalidEl.validationMessage || 'Please fill out all required fields correctly.';
            
            if (invalidEl.id === 'regPhone' || invalidEl.id === 'orderPhone') {
                message = 'Phone number must be exactly 10 digits (e.g., 9876543210).';
            } else if (invalidEl.id === 'regPassword') {
                message = 'Password must be at least 6 characters.';
            } else if (invalidEl.id === 'orderGuests') {
                message = 'Number of guests must be 10 or more.';
            }

            errorEl.textContent = `❌ Error: ${message}`;
            invalidEl.focus();
            console.error(`VALIDATION ERROR on ${invalidEl.id}: ${message}`);
            return false;
        }
    }
    
    // Check Event Date for future date
    if (form.id === 'checkoutForm') {
        const dateInput = document.getElementById('orderEventDate');
        const eventDate = new Date(dateInput.value);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); 
        tomorrow.setHours(0,0,0,0);
        
        if (eventDate < tomorrow) {
            errorEl.textContent = '❌ Error: Event date must be tomorrow or later.';
            dateInput.focus();
            return false;
        }
    }

    return true; 
}

// ------------------ Authentication Handlers ------------------

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("regError");
    if (!validateForm(registerForm, errorEl)) return;

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    try {
      await register(name, email, phone, password); 
      showAlert("✅ Account created successfully! Logging you in...");
      window.closeModal('authModal');
      resetModal('authModal');
    } catch (error) {
      errorEl.textContent = "❌ Registration failed: " + (error.message.includes('email-already-in-use') ? 'Email already in use.' : 'Invalid email or weak password.');
      console.error("ERROR: Registration failed", error);
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    if (!validateForm(loginForm, errorEl)) return; 

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      await login(email, password); 
      showAlert("✅ Login successful!");
      window.closeModal('authModal');
      resetModal('authModal');
    } catch (error) {
      errorEl.textContent = "❌ Login failed: Invalid email or password.";
      console.error("ERROR: Login failed", error);
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await logout(); 
    console.log("LOG: User logged out.");
    showAlert("👋 Logged out successfully!");
  });
}

// ------------------ Auth State Listener ------------------
onAuthChange(async (user) => { 
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const viewCartBtn = document.getElementById("viewCartBtn");
  const userDashboard = document.getElementById("userDashboard");
  const authMessage = document.getElementById("authMessage");
  const searchBar = document.getElementById("searchBar");
  
  userDashboard.style.display = "none";
  viewCartBtn.style.display = "none"; 

  if (user) {
    currentUser = user;
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    authMessage.style.display = "none"; 
    
    // Hide mobile menu on login
    document.getElementById('mainNav').classList.remove('active');

    if (user.email === ADMIN_EMAIL) {
      renderAdminDashboard();
      searchBar.style.display = "none";
    } else {
      renderMenu(); 
      renderUserDashboard(user.uid); // Pass UID to start listener
      userDashboard.style.display = "block";
      searchBar.style.display = "block";
      viewCartBtn.style.display = "inline"; 
    }
    updateCartUI(); 
  } else {
    currentUser = null;
    loginBtn.style.display = "inline";
    registerBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    authMessage.style.display = "block";
    searchBar.style.display = "block";
    renderMenu(); 
    updateCartUI(); 
  }
});


// ------------------ Menu and Dashboard Rendering ------------------
function renderMenu() { 
  const menu = document.getElementById("menuPreview");
  onValue(ref(db, "products"), (snapshot) => { 
    menu.innerHTML = "";
    if (!snapshot.exists()) {
      menu.innerHTML = "<p>No items found.</p>";
      return;
    }
    snapshot.forEach((child) => {
      const p = child.val();
      const id = child.key;
      const card = document.createElement("div");
      card.className = "product";
      card.innerHTML = `
        <img src="${p.imageURL || "https://via.placeholder.com/200"}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <p><strong>₹${p.price}</strong></p>
        <button class="btn" onclick="addToCart('${id}','${p.name}',${p.price})">Add to Cart</button>
      `;
      menu.appendChild(card);
    });
  });
}

// FIX: Real-Time Order History Update
function renderUserDashboard(uid) { 
  const orderList = document.getElementById("myOrderList");
  // Query orders for the current user, ordered by userId (for indexing)
  const q = query(ref(db, 'orders'), orderByChild('userId'), equalTo(uid));
  
  // Use onValue for real-time updates
  onValue(q, (snapshot) => {
    const orders = [];
    if (!snapshot.exists()) {
      orderList.innerHTML = "<p>You have no current or past orders.</p>";
      return;
    }
    
    snapshot.forEach(child => {
      orders.push({ id: child.key, ...child.val() });
    });
    
    // Sort orders by creation date descending (latest first)
    orders.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    
    orderList.innerHTML = ""; // Clear for new render
    
    orders.forEach(o => {
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-item';
      orderDiv.style.border = `1px solid ${o.status === 'Pending' ? '#ff9933' : o.status === 'Confirmed' ? '#007bff' : '#138808'}`;
      orderDiv.style.padding = '15px';
      orderDiv.style.marginBottom = '10px';
      orderDiv.style.borderRadius = '8px';
      
      const itemsList = o.items.map(i => `<li>${i.name} x${i.quantity}</li>`).join('');
      
      orderDiv.innerHTML = `
        <h4>Order ID: ${o.id.substring(0, 8)}...</h4>
        <p><strong>Status: <span style="color: ${o.status === 'Pending' ? '#ff9933' : '#138808'};">${o.status}</span></strong></p>
        <p>Event: ${o.eventType} on ${o.eventDate} for ${o.guests} guests</p>
        <p>Details: ${o.address}</p>
        <h5>Items Ordered:</h5>
        <ul>${itemsList}</ul>
        <hr>
      `;
      orderList.appendChild(orderDiv);
    });
  }, (error) => {
      console.error("ERROR: Failed to fetch user orders in real-time:", error);
      orderList.innerHTML = "<p>Failed to load orders.</p>";
  });
}


// ------------------ Cart Handling ------------------

window.addToCart = (id, name, price) => {
  if (!currentUser || currentUser.email === ADMIN_EMAIL) return showAlert("Please login as a User to add items.");
  
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((x) => x.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name, price: Number(price), quantity: 1 }); 
  localStorage.setItem("cart", JSON.stringify(cart));
  showAlert(`${name} added to cart`);
  
  updateCartUI(); 
};

window.viewCart = () => {
    if (!currentUser || currentUser.email === ADMIN_EMAIL) return showAlert("Please login as a User to view cart.");
    renderCartModal();
    window.openModal('cartModal');
};
document.getElementById('viewCartBtn').addEventListener('click', window.viewCart);


function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemCountEl = document.getElementById("cartItemCount");
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemCountEl.textContent = totalItems;

    if (document.getElementById('cartModal').style.display === 'flex') {
        renderCartModal();
    }
}

function renderCartModal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('proceedToCheckoutBtn');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Your cart is empty. Time to start feasting!</p>';
        totalEl.textContent = 'Total: ₹0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let totalAmount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item-row'; 
        
        cartItemDiv.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">₹${item.price.toFixed(2)}</span>
            <div class="item-quantity-control">
                <button onclick="updateCartItemQuantity('${item.id}', -1)" class="quantity-btn minus">-</button>
                <input type="number" value="${item.quantity}" min="1" readonly class="quantity-input">
                <button onclick="updateCartItemQuantity('${item.id}', 1)" class="quantity-btn plus">+</button>
            </div>
            <span class="item-subtotal">₹${itemTotal.toFixed(2)}</span>
            <button onclick="removeItemFromCart('${item.id}')" class="remove-btn"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(cartItemDiv);
    });
    
    totalEl.innerHTML = `<h3>Grand Total: <span style="color: var(--saffron);">₹${totalAmount.toFixed(2)}</span></h3>`;
    checkoutBtn.disabled = false;
}

window.updateCartItemQuantity = (id, delta) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(x => x.id === id);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;

        if (cart[itemIndex].quantity < 1) {
            cart.splice(itemIndex, 1); 
            showAlert(`Item removed from cart.`);
        } else {
             showAlert(`Quantity updated for ${cart[itemIndex].name}.`);
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartUI(); 
    }
};

window.removeItemFromCart = (id) => {
    if (confirm("Are you sure you want to remove this item?")) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const itemIndex = cart.findIndex(x => x.id === id);
        
        if (itemIndex > -1) {
            const name = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            showAlert(`${name} removed from cart.`);
            updateCartUI(); 
        }
    }
};

window.clearCart = () => {
    if (confirm("Are you sure you want to clear the entire cart?")) {
        localStorage.removeItem("cart");
        showAlert("Cart cleared.");
        updateCartUI();
        window.closeModal('cartModal');
    }
};

document.getElementById('proceedToCheckoutBtn').addEventListener('click', () => {
    window.closeModal('cartModal');
    resetModal('checkoutModal');
    window.openModal('checkoutModal');
});

// ------------------ Order Placement ------------------

document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const errorEl = document.getElementById("checkoutError");
  if (!validateForm(document.getElementById("checkoutForm"), errorEl)) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart.length) {
    errorEl.textContent = "❌ Your cart is empty. Please add items to order.";
    return;
  }

  const name = document.getElementById("orderName").value;
  const phone = document.getElementById("orderPhone").value;
  const eventType = document.getElementById("orderEventType").value;
  const eventDate = document.getElementById("orderEventDate").value;
  const address = document.getElementById("orderAddress").value;
  const guests = document.getElementById("orderGuests").value;

  const order = {
    name,
    phone,
    eventType,
    eventDate,
    address,
    guests: Number(guests),
    items: cart,
    userId: currentUser.uid, 
    userEmail: currentUser.email,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  try {
    await push(ref(db, "orders"), order); 
    localStorage.removeItem("cart");
    showAlert("✅ Order placed successfully! Check 'My Orders' for status.");
    
    window.closeModal('checkoutModal');
    updateCartUI(); 
    // The renderUserDashboard listener will automatically handle the update here.
  } catch (error) {
    errorEl.textContent = "❌ Order placement failed. Please check your network connection.";
    console.error("ERROR: Order placement failed", error);
  }
});

// ------------------ Contact Form ------------------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const alertDiv = document.getElementById("contactMessageAlert");
    if (!validateForm(contactForm, alertDiv)) return; // Use the alertDiv to show validation errors

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const phone = document.getElementById("contactPhone").value;
    const message = document.getElementById("contactMessage").value;
    
    try {
      const contactData = { name, email, phone, message, timestamp: new Date().toISOString() };
      await push(ref(db, "contacts"), contactData);
      
      console.log(`LOG: Contact message received from ${email}`);
      alertDiv.innerHTML = `<p style="color: green; font-weight: bold;">✅ Thank you for your message! We will get back to you shortly.</p>`;
      contactForm.reset();
    } catch (error) {
      console.error("ERROR: Contact form submission failed", error);
      alertDiv.innerHTML = `<p style="color: red; font-weight: bold;">❌ Failed to send message. Please try again.</p>`;
    }
  });
}


// ------------------ Admin Panel (Kept Simple) ------------------
function renderAdminDashboard() {
  const dynamicContent = document.getElementById("dynamicContent");
  dynamicContent.innerHTML = `
    <h2>Admin Dashboard</h2>
    <h3>Product Management</h3>
    <form id="addProductForm" class="card-form">
      <input type="text" id="pname" placeholder="Product Name" required>
      <input type="number" id="pprice" placeholder="Price (₹)" required>
      <input type="text" id="pimage" placeholder="Image URL (Placeholder)" required>
      <textarea id="pdesc" placeholder="Description"></textarea>
      <button type="submit">Add Product</button>
    </form>
    <div id="productList" class="menu-grid"></div>
    <h3>Order Management</h3>
    <div id="orderList"></div>
  `;

  document.getElementById("addProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("pname").value;
    const price = Number(document.getElementById("pprice").value);
    const imageURL = document.getElementById("pimage").value;
    const description = document.getElementById("pdesc").value;
    
    try {
        await uploadProduct({ name, price, imageURL, description }); 
        showAlert("✅ Product added!");
        e.target.reset();
    } catch (error) {
        showAlert("❌ Failed to add product: " + error.message);
        console.error("ERROR: Failed to add product", error);
    }
  });

  onValue(ref(db, "products"), (snap) => {
    const list = document.getElementById("productList");
    list.innerHTML = "";
    if (!snap.exists()) return (list.innerHTML = "<p>No products yet.</p>");
    snap.forEach((child) => {
      const p = child.val();
      const id = child.key;
      list.innerHTML += `
        <div class="product">
            <img src="${p.imageURL || "https://via.placeholder.com/150"}" alt="${p.name}">
            <strong>${p.name}</strong> 
            <p>₹${p.price}</p>
            <button onclick="editProduct('${id}','${p.name}',${p.price},'${p.description || ''}','${p.imageURL || ''}')">Edit</button>
            <button onclick="deleteProduct('${id}')">Delete</button>
        </div>`;
    });
  });

  // Admin Order List (Real-time update is also important here)
  onValue(ref(db, "orders"), (snap) => {
    const list = document.getElementById("orderList");
    list.innerHTML = "";
    if (!snap.exists()) return (list.innerHTML = "<p>No orders yet.</p>");
    snap.forEach((child) => {
      const o = child.val();
      const id = child.key;
      const itemsHtml = o.items.map(i => `<li>${i.name} x${i.quantity} (₹${i.price})</li>`).join("");

      list.innerHTML += `
        <div class="order-item admin-item" style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 15px;">
          <p><b>Order ID:</b> ${id.substring(0, 8)}... | <b>Status:</b> ${o.status}</p>
          <p><b>Customer:</b> ${o.name} (${o.userEmail}) | <b>Phone:</b> ${o.phone}</p>
          <p><b>Event:</b> ${o.eventType} on ${o.eventDate} for ${o.guests} guests at ${o.address}</p>
          <ul style="list-style: none; padding-left: 0;">${itemsHtml}</ul>
          <button onclick="updateOrder('${id}','Confirmed')">Confirm</button>
          <button onclick="updateOrder('${id}','Completed')">Complete</button>
          <button onclick="deleteOrder('${id}')" style="background: red;">Delete</button>
        </div>`;
    });
  });
}

// Global Admin functions (defined globally for onclick in HTML)
window.editProduct = async (id, currentName, currentPrice, currentDesc, currentImg) => {
    const newName = prompt(`New name (Current: ${currentName}):`, currentName);
    const newPrice = prompt(`New price (Current: ${currentPrice}):`, currentPrice);
    const newDesc = prompt(`New description (Current: ${currentDesc}):`, currentDesc);
    const newImageURL = prompt(`New Image URL (Current: ${currentImg}):`, currentImg);

    if (newName && newPrice) {
        try {
            await updateProduct(id, { name: newName, price: Number(newPrice), description: newDesc, imageURL: newImageURL }); 
        } catch (error) {
            console.error("ERROR: Failed to update product", error);
        }
    }
};
window.deleteProduct = async (id) => {
    if (confirm("Delete this product?")) await deleteProduct(id);
};
window.updateOrder = async (id, status) => {
    await updateOrderStatus(id, status); 
};
window.deleteOrder = async (id) => {
    if (confirm("Delete this order?")) await deleteOrder(id);
};
window.filterProducts = () => {
    const searchValue = document.getElementById("searchBar").value.toLowerCase();
    const products = document.querySelectorAll("#menuPreview .product");

    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
        product.style.display = name.includes(searchValue) ? 'block' : 'none';
    });
};