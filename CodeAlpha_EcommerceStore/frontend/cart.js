// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Display cart items
function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-items");

    itemDiv.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; flex:1;">
        <img src="${item.image}" alt="${item.name}" 
             style="width:60px; height:auto; border-radius:6px;">
        <p style="margin:0; font-weight:500;">${item.name} - $${item.price}</p>
      </div>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;

    cartContainer.appendChild(itemDiv);
  });

  document.getElementById("total").innerText = "Total: $" + total;
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  placeOrder(); // actually saves the order in DB
}


// Initialize cart display
window.onload = displayCart;
