// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Load all products
async function loadProducts() {
  const response = await fetch("http://localhost:5000/products");
  const products = await response.json();

  const productContainer = document.getElementById("products");
  productContainer.innerHTML = "";

  products.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3><a href="product.html?id=${product._id}">${product.name}</a></h3>
      <p>$${product.price}</p>
      <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">Add To Cart</button>
    `;

    productContainer.appendChild(productDiv);
  });
}

// Add item to cart (with image)
function addToCart(name, price, image) {
  cart.push({ name, price, image });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart`);
  console.log(cart);
}

// Register user
async function registerUser(username, password) {
  const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  alert(data.message);
}

// Login user
async function loginUser(username, password) {
  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login Successful");
  } else {
    alert("Login Failed");
  }
}

// Show user profile
async function showProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/profile", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();

  document.getElementById("profile").innerHTML = `
    <p>Username: ${data.user.username}</p>
  `;
}

// Place order
async function placeOrder() {
  const token = localStorage.getItem("token");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const response = await fetch("http://localhost:5000/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ cart })
  });

  const data = await response.json();
  alert(data.message);
}

// Get user orders
async function getOrders() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/orders", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await response.json();

  console.log("User Orders:", data.orders);

  const ordersContainer = document.getElementById("orders");
  ordersContainer.innerHTML = "";

  data.orders.forEach(order => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order");

    orderDiv.innerHTML = `
      <h3>Order by ${order.username}</h3>
      <p>Status: ${order.status}</p>
      <ul>
        ${order.cart.map(item => `
          <li style="display:flex; align-items:center; gap:8px;">
            <img src="${item.image}" alt="${item.name}" 
                 style="width:40px; height:auto; border-radius:4px;">
            ${item.name} - $${item.price}
          </li>`).join("")}
      </ul>
    `;

    ordersContainer.appendChild(orderDiv);
  });
}

// Admin: Get all orders
async function getAllOrders() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/admin/orders", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await response.json();
  console.log("All Orders:", data.orders);
}

// Admin: Add product
async function addProduct() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/admin/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ name: "New Item", price: 50, image: "new.jpg" })
  });
  const data = await response.json();
  alert(data.message);
}

// Search products
async function searchProducts() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const products = await fetch("http://localhost:5000/products").then(res => res.json());
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));

  const productContainer = document.getElementById("products");
  productContainer.innerHTML = "";

  filtered.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3><a href="product.html?id=${product._id}">${product.name}</a></h3>
      <p>$${product.price}</p>
      <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">Add To Cart</button>
    `;

    productContainer.appendChild(productDiv);
  });
}

// Product details page
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const response = await fetch(`http://localhost:5000/products/${productId}`);
  const product = await response.json();

  const container = document.getElementById("productDetails");
  container.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p>Price: $${product.price}</p>
    <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
  `;
}

// Auto-load products on homepage
if (window.location.pathname.endsWith("product.html")) {
  loadProductDetails();
} else {
  window.onload = loadProducts;
}
