const firebaseConfig = {
  apiKey: "AIzaSyAZM1snoXPyIu-pXMSJT_lmk9tU_jwKNyY",
  authDomain: "samecommerce-21182.firebaseapp.com",
  projectId: "samecommerce-21182",
  storageBucket: "samecommerce-21182.firebasestorage.app",
  messagingSenderId: "700905259897",
  appId: "1:700905259897:web:17d003724512472c8825a8",
  measurementId: "G-TC7T8GRLXX"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentOrder = null;
let slides = [];
let currentSlide = 0;
let selectedCartItems = new Set(); // To track selected cart items

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  if (sectionId === 'products') loadProducts();
  if (sectionId === 'cart') loadCart();
  if (sectionId === 'history') loadHistory();
  if (sectionId === 'home') loadHomePage();
}

document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const userData = {
    name: document.getElementById('regName').value,
    age: parseInt(document.getElementById('regAge').value),
    dateOfBirth: document.getElementById('regDob').value,
    email: email,
    credit: 0,
    cart: [],
    orderHistory: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      currentUser = cred.user;
      document.getElementById('regMessage').innerText = "Registration successful!";
      return db.collection('users').doc(currentUser.uid).set(userData);
    })
    .then(() => showSection('home'))
    .catch(err => document.getElementById('regMessage').innerText = err.message);
});

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      currentUser = cred.user;
      document.getElementById('loginMessage').innerText = "Login successful!";
      showSection('home');
    })
    .catch(err => document.getElementById('loginMessage').innerText = err.message);
});

function loadAccountDetails() {
  if (!currentUser) {
    document.getElementById('accountDetails').innerHTML = '<p style="color: red;">Please login to view your account details.</p>';
    return;
  }
  const accountDetails = document.getElementById('accountDetails');
  accountDetails.innerHTML = '<p>Loading...</p>';
  db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        accountDetails.innerHTML = `
          <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
          <p><strong>Age:</strong> ${userData.age || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> ${userData.dateOfBirth || 'N/A'}</p>
          <p><strong>Credits:</strong> ${userData.credit || 0}</p>
        `;
      } else {
        accountDetails.innerHTML = '<p>No account details found.</p>';
      }
    })
    .catch(err => {
      console.error("Error loading user details:", err);
      accountDetails.innerHTML = `<p style="color: red;">Error loading details: ${err.message}</p>`;
    });
}

function loadHomePage() {
  loadSlider();
  loadCategoryProducts();
}

function loadSlider() {
  const sliderContent = document.getElementById('sliderContent');
  sliderContent.innerHTML = "Loading featured products...";
  db.collection('products').where('isActive', '==', true).limit(5).get()
    .then(snapshot => {
      slides = snapshot.docs.map(doc => {
        const prod = doc.data();
        const productId = doc.id;
        const imageUrl = prod.imageURLs?.[0] || 'assets/images/nothing.png';
        return `
          <div class="slide">
            <img src="${imageUrl}" alt="${prod.name}" width="300" onerror="this.src='assets/images/nothing.png'">
            <br><strong>${prod.name}</strong> (ID: ${productId})
            <br>Category: ${prod.category}
            <br>Price: $${prod.price || 'N/A'}
            <br><button onclick="addToCart('${productId}', '${prod.name}')">Add to Cart</button>
          </div>
        `;
      });
      if (slides.length === 0) {
        sliderContent.innerHTML = "No featured products available.";
        return;
      }
      currentSlide = 0;
      updateSlider();
    })
    .catch(err => {
      console.error("Error loading slider:", err);
      sliderContent.innerHTML = "Error loading slider.";
    });
}

function updateSlider() {
  document.getElementById('sliderContent').innerHTML = slides[currentSlide];
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

function loadCategoryProducts() {
  const categories = ['perfume', 'watch', 'dresses', 'shoes'];
  categories.forEach(category => {
    const productDiv = document.getElementById(`${category}Products`);
    productDiv.innerHTML = "Loading...";
    db.collection('products')
      .where('category', '==', category)
      .where('isActive', '==', true)
      .limit(3) // Limit to 3 products per category
      .get()
      .then(snapshot => {
        productDiv.innerHTML = "";
        if (snapshot.empty) {
          productDiv.innerHTML = "No products available.";
          return;
        }
        // Add a class for row layout specifically for shoes
        if (category === 'shoes') {
          productDiv.classList.add('shoes-row');
        }
        snapshot.forEach(doc => {
          const prod = doc.data();
          const productId = doc.id;
          const imageUrl = prod.imageURLs?.[0] || 'assets/images/nothing.png';
          
          const prodDiv = document.createElement('div');
          prodDiv.classList.add('product-preview');
          prodDiv.innerHTML = `
            <div class="product-image-container">
              <img src="${imageUrl}" alt="${prod.name}" class="product-image" 
                   onclick="showProductDetails('${productId}')" 
                   onerror="this.src='assets/images/nothing.png'">
            </div>
            <div class="product-name">${prod.name}</div>
          `;
          productDiv.appendChild(prodDiv);
        });
      })
      .catch(err => {
        console.error(`Error loading ${category} products:`, err);
        productDiv.innerHTML = "Error loading products.";
      });
  });
}
function loadProducts() {
  const productsListDiv = document.getElementById('productsList');
  productsListDiv.innerHTML = "Loading products...";
  
  db.collection('products').where('isActive', '==', true).get()
    .then(snapshot => {
      productsListDiv.innerHTML = "";
      if (snapshot.empty) {
        productsListDiv.innerHTML = "No products available.";
        return;
      }
      snapshot.forEach(doc => {
        const prod = doc.data();
        const productId = doc.id;
        const imageUrl = prod.imageURLs?.[0] || 'assets/images/nothing.png';
        const prodDiv = document.createElement('div');
        prodDiv.classList.add('product');
        
        let specsHTML = '';
        if (prod.category === 'perfume') {
          specsHTML = `<br>Scent: ${prod.specifications.scent || 'N/A'}<br>Volume: ${prod.specifications.volume || 'N/A'} ml`;
        } else if (prod.category === 'watch') {
          specsHTML = `<br>Type: ${prod.specifications.type || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
        } else if (prod.category === 'dresses') {
          specsHTML = `<br>Size: ${prod.specifications.size || 'N/A'}<br>Color: ${prod.specifications.color || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
        } else if (prod.category === 'shoes') {
          specsHTML = `<br>Size: ${prod.specifications.size || 'N/A'}<br>Color: ${prod.specifications.color || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
        }
        
        prodDiv.innerHTML = `
          <img src="${imageUrl}" alt="${prod.name}" width="200" onerror="this.src='assets/images/nothing.png'" style="cursor: pointer;" onclick="showProductDetails('${productId}')">
          <br><strong>${prod.name}</strong>
          <br>Category: ${prod.category}
          <br><small>${prod.description || 'No description available'}</small>
          ${specsHTML}
          <br>Availability: ${prod.availability || 'N/A'}
          <br>Price: $${prod.price || 'N/A'}
          <div class="product-actions">
            <button class="product-btn" onclick="addToCart('${productId}', '${prod.name}')">Add to Cart</button>
            <button class="product-btn direct-payment-btn" onclick="showProductDetailsBeforePayment('${productId}')">Payment</button>
          </div>
        `;
        
        productsListDiv.appendChild(prodDiv);
      });
    })
    .catch(err => {
      console.error("Error loading products:", err);
      productsListDiv.innerHTML = "Error loading products.";
    });
}
function addToCart(productId, name) {
  if (!currentUser) {
    showPopup("Please login first!");
    return;
  }
  db.collection('products').doc(productId).get()
    .then(doc => {
      if (!doc.exists) {
        showPopup("Product not found!");
        return;
      }
      const prod = doc.data();
      const price = prod.price || 0;
      const imageUrl = prod.imageURLs?.[0] || 'assets/images/nothing.png';
      const cartRef = db.collection('users').doc(currentUser.uid).collection('cart');
      cartRef.where('productId', '==', productId).get()
        .then(snapshot => {
          if (snapshot.empty) {
            cartRef.add({
              productId: productId,
              name: name,
              price: price,
              quantity: 1,
              imageUrl: imageUrl,
              addedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
              showPopup(`${name} added to cart.`);
              loadCart();
            });
          } else {
            const doc = snapshot.docs[0];
            cartRef.doc(doc.id).update({
              quantity: doc.data().quantity + 1
            }).then(() => {
              showPopup(`${name} quantity updated in cart.`);
              loadCart();
            });
          }
        });
    });
}

// 1. Fix the loadCart function to prevent duplicate UI elements
function loadCart() {
  if (!currentUser) {
    showPopup("Please login first!");
    return;
  }
  
  // Reset selected items
  selectedCartItems.clear();
  
  const cartSection = document.getElementById('cart');
  const cartListDiv = document.getElementById('cartList');
  
  // Clear any existing cart UI elements first
  cartListDiv.innerHTML = "";
  
  // Remove any existing cart-actions-container to avoid duplication
  const existingActionsContainer = cartSection.querySelector('.cart-actions-container');
  if (existingActionsContainer) {
    existingActionsContainer.remove();
  }
  
  // Add cart actions before the list
  const cartActionsHTML = `
    <div class="cart-actions">
      <div class="cart-selection">
        <input type="checkbox" id="selectAllItems" onchange="toggleSelectAllCartItems()">
        <label for="selectAllItems">Select All</label>
      </div>
      <div class="cart-buttons">
        <button id="deleteSelectedBtn" class="action-btn delete-btn" onclick="deleteSelectedCartItems()" disabled>
          <i class="fas fa-trash"></i> Delete Selected
        </button>
        <button id="checkoutSelectedBtn" class="action-btn checkout-btn" onclick="checkoutSelectedItems()" disabled>
          <i class="fas fa-shopping-bag"></i> Checkout Selected
        </button>
      </div>
    </div>
    <div class="cart-summary">
      <p>Selected: <span id="selectedItemsCount">0</span> items</p>
      <p>Total: $<span id="selectedItemsTotal">0.00</span></p>
    </div>
  `;
  
  // Add cart actions HTML before loading the cart items
  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add('cart-actions-container');
  actionsContainer.innerHTML = cartActionsHTML;
  
  // Add actions container before the cart list
  cartSection.insertBefore(actionsContainer, cartListDiv);
  
  db.collection('users').doc(currentUser.uid).collection('cart').get()
    .then(snapshot => {
      if (snapshot.empty) {
        cartListDiv.innerHTML = "<div class='empty-cart'><i class='fas fa-shopping-cart'></i><p>Your cart is empty.</p></div>";
        return;
      }
      
      // Create container for cart items
      const cartItemsContainer = document.createElement('div');
      cartItemsContainer.classList.add('cart-items-container');
      
      snapshot.forEach(doc => {
        const item = doc.data();
        const itemId = doc.id;
        const totalPrice = item.price * item.quantity;
        
        // Create cart item element
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
          <div class="cart-item-select">
            <input type="checkbox" id="select-${itemId}" class="cart-item-checkbox" 
                   onchange="toggleCartItemSelection('${itemId}', ${totalPrice})">
          </div>
          <div class="cart-item-image">
            <img src="${item.imageUrl || 'assets/images/nothing.png'}" alt="${item.name}" 
                 onerror="this.src='assets/images/nothing.png'">
          </div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p class="item-id">Product ID: ${item.productId}</p>
            <p class="item-price">$${item.price} each</p>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateCartQuantity('${itemId}', ${item.quantity - 1})">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateCartQuantity('${itemId}', ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-total">
            <p>$${totalPrice.toFixed(2)}</p>
          </div>
          <div class="cart-item-actions">
            <button class="remove-btn" onclick="removeFromCart('${itemId}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        cartItemsContainer.appendChild(itemDiv);
      });
      
      cartListDiv.appendChild(cartItemsContainer);
    })
    .catch(err => {
      console.error("Error loading cart:", err);
      cartListDiv.innerHTML = "<p class='error-message'>Error loading your cart. Please try again.</p>";
    });
}
function toggleCartItemSelection(itemId, price) {
  const checkbox = document.getElementById(`select-${itemId}`);
  const deleteBtn = document.getElementById('deleteSelectedBtn');
  const checkoutBtn = document.getElementById('checkoutSelectedBtn');
  
  // Create an item object
  const cartItem = {id: itemId, price: price};
  
  // Check if we should add or remove the item
  if (checkbox.checked) {
    // Add the item
    selectedCartItems.add(cartItem);
  } else {
    // Remove the item - need to find it in the Set
    selectedCartItems.forEach(item => {
      if (item.id === itemId) {
        selectedCartItems.delete(item);
      }
    });
    
    // Uncheck "Select All" if any item is unchecked
    document.getElementById('selectAllItems').checked = false;
  }
  
  // Update selected count and total
  updateCartSelection();
  
  // Enable/disable action buttons based on selection
  deleteBtn.disabled = selectedCartItems.size === 0;
  checkoutBtn.disabled = selectedCartItems.size === 0;
}

function toggleSelectAllCartItems() {
  const selectAllCheckbox = document.getElementById('selectAllItems');
  const itemCheckboxes = document.querySelectorAll('.cart-item-checkbox');
  
  // Clear selected items
  selectedCartItems.clear();
  
  // Check or uncheck all items
  itemCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    
    if (selectAllCheckbox.checked) {
      const itemId = checkbox.id.replace('select-', '');
      const priceElement = checkbox.closest('.cart-item').querySelector('.cart-item-total p');
      const price = parseFloat(priceElement.textContent.replace('$', ''));
      selectedCartItems.add({id: itemId, price: price});
    }
  });
  
  // Update selected count and total
  updateCartSelection();
  
  // Enable/disable action buttons based on selection
  document.getElementById('deleteSelectedBtn').disabled = selectedCartItems.size === 0;
  document.getElementById('checkoutSelectedBtn').disabled = selectedCartItems.size === 0;
}

function updateCartSelection() {
  const countElement = document.getElementById('selectedItemsCount');
  const totalElement = document.getElementById('selectedItemsTotal');
  
  countElement.textContent = selectedCartItems.size;
  
  let total = 0;
  selectedCartItems.forEach(item => {
    total += item.price;
  });
  
  totalElement.textContent = total.toFixed(2);
}

function removeFromCart(itemId) {
  if (!currentUser) return;
  
  if (confirm('Are you sure you want to remove this item from your cart?')) {
    db.collection('users').doc(currentUser.uid).collection('cart').doc(itemId).delete()
      .then(() => {
        loadCart();
      })
      .catch(err => {
        console.error("Error removing item from cart:", err);
        showPopup("Error removing item. Please try again.");
      });
  }
}

function deleteSelectedCartItems() {
  if (selectedCartItems.size === 0) return;
  
  if (confirm(`Are you sure you want to remove ${selectedCartItems.size} selected item(s) from your cart?`)) {
    const batch = db.batch();
    
    // Add all delete operations to batch
    selectedCartItems.forEach(item => {
      const docRef = db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id);
      batch.delete(docRef);
    });
    
    // Execute the batch
    batch.commit()
      .then(() => {
        showPopup('Selected items removed from cart.');
        loadCart();
      })
      .catch(err => {
        console.error("Error removing selected items:", err);
        showPopup("Error removing items. Please try again.");
      });
  }
}

function checkoutSelectedItems() {
  if (selectedCartItems.size === 0) return;

  const ids = Array.from(selectedCartItems).map(item => item.id);
  const totalAmount = Array.from(selectedCartItems).reduce((sum, item) => sum + item.price, 0);

  // Fetch selected items from cart
  const promises = ids.map(id => 
    db.collection('users').doc(currentUser.uid).collection('cart').doc(id).get()
  );

  Promise.all(promises)
    .then(docs => {
      let variants = [];
      docs.forEach(doc => {
        if (doc.exists) {
          const item = doc.data();
          variants.push({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            imageUrl: item.imageUrl
          });
        }
      });

      // Fetch user's credit balance
      db.collection('users').doc(currentUser.uid).get()
        .then(userDoc => {
          const userCredit = userDoc.data().credit || 0;
          if (userCredit > 0) {
            const useCredits = confirm(`You have ${userCredit} credits available. Would you like to use them for this purchase (Total: $${totalAmount.toFixed(2)})?`);
            // Create order with selected items only
            db.collection('orders').add({
              userId: currentUser.uid,
              items: variants,
              totalAmount: totalAmount,
              status: 'pending',
              paymentStatus: 'pending',
              orderDate: firebase.firestore.FieldValue.serverTimestamp()
            }).then(orderRef => {
              currentOrder = { id: orderRef.id, totalAmount, cartItems: ids };
              document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
              document.getElementById('paymentModal').style.display = 'flex';
              // Call processPayment with credit usage decision
              document.querySelector('#paymentModal button[onclick="processPayment()"]').onclick = () => processPayment(useCredits);
            });
          } else {
            // No credits available, proceed normally
            db.collection('orders').add({
              userId: currentUser.uid,
              items: variants,
              totalAmount: totalAmount,
              status: 'pending',
              paymentStatus: 'pending',
              orderDate: firebase.firestore.FieldValue.serverTimestamp()
            }).then(orderRef => {
              currentOrder = { id: orderRef.id, totalAmount, cartItems: ids };
              document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
              document.getElementById('paymentModal').style.display = 'flex';
            });
          }
        });
    })
    .catch(err => {
      console.error("Error preparing checkout:", err);
      showPopup("Error processing checkout. Please try again.");
    });
}

function updateCartQuantity(docId, newQuantity) {
  const cartRef = db.collection('users').doc(currentUser.uid).collection('cart').doc(docId);
  if (newQuantity <= 0) {
    cartRef.delete().then(() => loadCart());
  } else {
    cartRef.update({ quantity: newQuantity }).then(() => loadCart());
  }
}

function placeOrder() {
  if (!currentUser) {
    showPopup("Please login first!");
    return;
  }
  const userCartRef = db.collection('users').doc(currentUser.uid).collection('cart');
  userCartRef.get().then(snapshot => {
    if (snapshot.empty) {
      showPopupt("Your cart is empty!");
      return;
    }
    let cartItems = [];
    snapshot.forEach(doc => cartItems.push({ id: doc.id, ...doc.data() }));
    const variants = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      imageUrl: item.imageUrl
    }));
    const totalAmount = variants.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Fetch user's credit balance
    db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
        const userCredit = userDoc.data().credit || 0;
        if (userCredit > 0) {
          const useCredits = confirm(`You have ${userCredit} credits available. Would you like to use them for this purchase (Total: $${totalAmount.toFixed(2)})?`);
          db.collection('orders').add({
            userId: currentUser.uid,
            items: variants,
            totalAmount: totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            orderDate: firebase.firestore.FieldValue.serverTimestamp()
          }).then(orderRef => {
            currentOrder = { id: orderRef.id, totalAmount, cartItems: snapshot };
            document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
            document.getElementById('paymentModal').style.display = 'flex';
            // Call processPayment with credit usage decision
            document.querySelector('#paymentModal button[onclick="processPayment()"]').onclick = () => processPayment(useCredits);
          });
        } else {
          // No credits available, proceed normally
          db.collection('orders').add({
            userId: currentUser.uid,
            items: variants,
            totalAmount: totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            orderDate: firebase.firestore.FieldValue.serverTimestamp()
          }).then(orderRef => {
            currentOrder = { id: orderRef.id, totalAmount, cartItems: snapshot };
            document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
            document.getElementById('paymentModal').style.display = 'flex';
          });
        }
      });
  });
}
function processPayment(useCredits = false) {
  if (!currentOrder) {
     showPopup("No order to process");
      return;
  }
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
     showPopup("You need to be logged in to complete payment");
      return;
  }
  
  const paymentMethod = document.getElementById('paymentMethod').value;
  const transactionId = `TXN${Date.now()}`;

  // Show loading indicator
  const payButton = document.getElementById('payButton');
  if (payButton) {
      payButton.disabled = true;
      payButton.textContent = "Processing...";
  }

  // Fetch user's current credit balance
  db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
          if (!userDoc.exists) {
              throw new Error("User profile not found");
          }
          
          const userData = userDoc.data();
          let userCredit = userData.credit || 0;
          let amountToPay = currentOrder.totalAmount;
          let creditsUsed = 0;
          
          // Calculate new credits earned - moved up here before it's used
          const creditsEarned = Math.floor(currentOrder.totalAmount / 50);

          if (useCredits && userCredit > 0) {
              creditsUsed = Math.min(userCredit, amountToPay);
              amountToPay -= creditsUsed;
          }

          // Create the payment document first
          return db.collection('payments').add({
              userId: currentUser.uid,
              orderId: currentOrder.id,
              amount: amountToPay,
              paymentMethod: paymentMethod,
              transactionId: transactionId,
              status: 'completed',
              creditsUsed: creditsUsed,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(paymentRef => {
              console.log("Payment recorded:", paymentRef.id);
              
              // Now update the order status
              return db.collection('orders').doc(currentOrder.id).update({
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  paymentId: paymentRef.id
              });
          }).then(() => {
              console.log("Order status updated");
              
              // Handle cart items deletion
              let cartPromise;
              if (Array.isArray(currentOrder.cartItems)) {
                  const batch = db.batch();
                  currentOrder.cartItems.forEach(id => {
                      const docRef = db.collection('users').doc(currentUser.uid).collection('cart').doc(id);
                      batch.delete(docRef);
                  });
                  cartPromise = batch.commit();
              } else if (currentOrder.cartItems && typeof currentOrder.cartItems.forEach === 'function') {
                  const batch = db.batch();
                  currentOrder.cartItems.forEach(doc => {
                      batch.delete(doc.ref);
                  });
                  cartPromise = batch.commit();
              } else {
                  console.warn("No cart items to delete or invalid format");
                  cartPromise = Promise.resolve();
              }
              
              return cartPromise;
          }).then(() => {
              console.log("Cart items deleted");
              
              // Update user's credit balance
              return db.collection('users').doc(currentUser.uid).update({
                  orderHistory: firebase.firestore.FieldValue.arrayUnion(currentOrder.id),
                  credit: firebase.firestore.FieldValue.increment(creditsEarned - creditsUsed)
              });
          }).then(() => {
              console.log("User credits updated");
              
              showPopup(`Payment successful! Order confirmed.\nCredits earned: ${creditsEarned}\nCredits used: ${creditsUsed}\nNew credit balance: ${userCredit + creditsEarned - creditsUsed}`);
              
              // Reset UI
              if (payButton) {
                  payButton.disabled = false;
                  payButton.textContent = "Pay Now";
              }
              
              // Close any modal
              if (typeof closePaymentModal === 'function') {
                  closePaymentModal();
              }
              
              // Refresh cart if needed
              if (typeof loadCart === 'function') {
                  loadCart();
              }
              
              // Redirect to billing page with order ID
              window.location.href = `billing.html?orderId=${currentOrder.id}`;
              
              currentOrder = null;
          });
      })
      .catch(err => {
          console.error("Payment processing error:", err);
          showPopup("Payment failed: " + err.message);
          
          // Reset UI
          if (payButton) {
              payButton.disabled = false;
              payButton.textContent = "Pay Now";
          }
      });
}
function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}
// 2. Implement paginated order history

// Add this variable to store the last visible document from each page
function initiateDirectPayment(productId, price, name, imageUrl) {
  if (!currentUser) {
     showPopup("You need to be logged in to complete payment");
      return;
  }

  const variant = [{
      productId: productId,
      quantity: 1,
      price: price,
      name: name,
      imageUrl: imageUrl
  }];
  const totalAmount = price;

  db.collection('orders').add({
      userId: currentUser.uid,
      items: variant,
      totalAmount: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: firebase.firestore.FieldValue.serverTimestamp()
  }).then(orderRef => {
      currentOrder = { 
          id: orderRef.id, 
          totalAmount: totalAmount,
          cartItems: [] // Empty array for direct payment
      };
      
      // Show payment modal immediately
      document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
      document.getElementById('paymentModal').style.display = 'flex';
      
      // Check for credits and process payment
      db.collection('users').doc(currentUser.uid).get()
          .then(userDoc => {
              const userCredit = userDoc.data().credit || 0;
              const useCredits = userCredit > 0 && confirm(`You have ${userCredit} credits available. Would you like to use them for this purchase (Total: $${totalAmount.toFixed(2)})?`);
              processPayment(useCredits);
          });
  }).catch(err => {
     showPopup("Error initiating direct payment: " + err.message);
  });
}
function loadHistory() {
  if (!currentUser) {
    showPopup("Please login first!");
    return;
  }
  const historyListDiv = document.getElementById('historyList');
  historyListDiv.innerHTML = '<p>Loading...</p>';
  db.collection('orders').where("userId", "==", currentUser.uid).get()
    .then(snapshot => {
      if (snapshot.empty) {
        historyListDiv.innerHTML = "No orders yet.";
        return;
      }
      const orderPromises = snapshot.docs.map(doc => {
        const order = doc.data();
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order-item');
        const orderDate = order.orderDate.toDate().toLocaleString();
        orderDiv.innerHTML = `<strong>Order on ${orderDate}:</strong><br>Total: $${order.totalAmount}<br>Status: ${order.paymentStatus}<br>`;
        const itemPromises = order.items.map(item =>
          db.collection('products').doc(item.productId).get()
            .then(prodDoc => {
              if (!prodDoc.exists) {
                return `<p>Product ${item.productId} not found</p>`;
              }
              const prod = prodDoc.data();
              let specsHTML = '';
              if (prod.category === 'perfume') {
                specsHTML = `Scent: ${prod.specifications.scent || 'N/A'}, Volume: ${prod.specifications.volume || 'N/A'} ml`;
              } else if (prod.category === 'watch') {
                specsHTML = `Type: ${prod.specifications.type || 'N/A'}, Material: ${prod.specifications.material || 'N/A'}`;
              } else if (prod.category === 'dresses') {
                specsHTML = `Size: ${prod.specifications.size || 'N/A'}, Color: ${prod.specifications.color || 'N/A'}, Material: ${prod.specifications.material || 'N/A'}`;
              } else if (prod.category === 'shoes') {
                specsHTML = `Size: ${prod.specifications.size || 'N/A'}, Color: ${prod.specifications.color || 'N/A'}, Material: ${prod.specifications.material || 'N/A'}`;
              }
              return `
                <img src="${item.imageUrl || 'assets/images/nothing.png'}" alt="${item.name}" width="100" onerror="this.src='assets/images/nothing.png'">
                <br>${item.name} x${item.quantity} (ID: ${item.productId}) - $${item.price * item.quantity}
                <br><small>Category: ${prod.category}, ${specsHTML}</small><br>
              `;
            })
            .catch(err => {
              console.error(`Error fetching product ${item.productId}:`, err);
              return `<p>Error loading product ${item.productId}</p>`;
            })
        );
        return Promise.all(itemPromises).then(itemsHTML => {
          orderDiv.innerHTML += itemsHTML.join('');
          return orderDiv;
        });
      });
      return Promise.all(orderPromises).then(orderDivs => {
        historyListDiv.innerHTML = "";
        orderDivs.forEach(orderDiv => historyListDiv.appendChild(orderDiv));
      });
    })
    .catch(err => {
      console.error("Error loading order history:", err);
      historyListDiv.innerHTML = `<p style="color: red;">Error loading history: ${err.message}</p>`;
    });
}
function initiateDirectPayment(productId, price, name, imageUrl) {
  if (!currentUser) {
    showPopup("You need to be logged in to complete payment");
    return;
  }

  const variant = [{
    productId: productId,
    quantity: 1,
    price: price,
    name: name,
    imageUrl: imageUrl
  }];
  const totalAmount = price;

  db.collection('orders').add({
    userId: currentUser.uid,
    items: variant,
    totalAmount: totalAmount,
    status: 'pending',
    paymentStatus: 'pending',
    orderDate: firebase.firestore.FieldValue.serverTimestamp()
  }).then(orderRef => {
    currentOrder = { 
      id: orderRef.id, 
      totalAmount: totalAmount,
      cartItems: [] // Empty array for direct payment
    };
    
    // Show payment modal immediately
    document.getElementById('paymentAmount').innerText = totalAmount.toFixed(2);
    document.getElementById('paymentModal').style.display = 'flex';
    
    // Check for credits and process payment
    db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
        const userCredit = userDoc.data().credit || 0;
        const useCredits = userCredit > 0 && confirm(`You have ${userCredit} credits available. Would you like to use them for this purchase (Total: $${totalAmount.toFixed(2)})?`);
        document.querySelector('#paymentModal button[onclick="processPayment()"]').onclick = () => processPayment(useCredits);
      });
  }).catch(err => {
    showPopup("Error initiating direct payment: " + err.message);
  });
}
function showProductDetails(productId) {
  showSection('products');
  const productsListDiv = document.getElementById('productsList');
  
  // Clear previous content immediately to prevent glitches
  productsListDiv.innerHTML = "";
  productsListDiv.innerHTML = "Loading product details...";
  
  // Fetch the selected product
  db.collection('products').doc(productId).get()
    .then(doc => {
      if (!doc.exists) {
        productsListDiv.innerHTML = "Product not found.";
        return;
      }
      
      const prod = doc.data();
      const imageUrls = prod.imageURLs || ['assets/images/nothing.png'];
      const currentImageUrl = imageUrls[0]; // Use only the first image
      
      let specsHTML = '';
      if (prod.category === 'perfume') {
        specsHTML = `<p>Scent: ${prod.specifications.scent || 'N/A'}</p><p>Volume: ${prod.specifications.volume || 'N/A'} ml</p>`;
      } else if (prod.category === 'watch') {
        specsHTML = `<p>Type: ${prod.specifications.type || 'N/A'}</p><p>Material: ${prod.specifications.material || 'N/A'}</p>`;
      } else if (prod.category === 'dresses') {
        specsHTML = `<p>Size: ${prod.specifications.size || 'N/A'}</p><p>Color: ${prod.specifications.color || 'N/A'}</p><p>Material: ${prod.specifications.material || 'N/A'}</p>`;
      } else if (prod.category === 'shoes') {
        specsHTML = `<p>Size: ${prod.specifications.size || 'N/A'}</p><p>Color: ${prod.specifications.color || 'N/A'}</p><p>Material: ${prod.specifications.material || 'N/A'}</p>`;
      }
      
      // Fetch suggested products (unchanged)
      db.collection('products')
        .where('category', '==', prod.category)
        .where('isActive', '==', true)
        .limit(10)
        .get()
        .then(snapshot => {
          const suggestedProducts = snapshot.docs
            .filter(doc => doc.id !== productId)
            .map(doc => {
              const suggestedProd = doc.data();
              const suggestedProductId = doc.id;
              const suggestedImageUrl = suggestedProd.imageURLs?.[0] || 'assets/images/nothing.png';
              return `
                <div class="suggested-product-item" onclick="showProductDetails('${suggestedProductId}')">
                  <img src="${suggestedImageUrl}" alt="${suggestedProd.name}" onerror="this.src='assets/images/nothing.png'">
                </div>
              `;
            });
          
          const productHTML = `
            <div class="product-details-container">
              <div class="product-image-section">
                <img src="${currentImageUrl}" alt="${prod.name}" class="product-detail-image" onerror="this.src='assets/images/nothing.png'">
              </div>
              <div class="product-info-section">
                <h3>${prod.name}</h3>
                <p>Category: ${prod.category}</p>
                <p>${prod.description || 'No description available'}</p>
                ${specsHTML}
                <p>Availability: ${prod.availability || 'N/A'}</p>
                <p>Price: $${prod.price || 'N/A'}</p>
                <div class="product-actions">
                  <button class="product-btn" onclick="addToCart('${productId}', '${prod.name}')">Add to Cart</button>
                  <button class="product-btn direct-payment-btn" onclick="initiateDirectPayment('${productId}', ${prod.price || 0}, '${prod.name}', '${currentImageUrl}')">Payment</button>
                </div>
                <div class="suggested-products">
                  <h3>Suggested Products</h3>
                  <div class="suggested-products-scroll">
                    ${suggestedProducts.length > 0 ? suggestedProducts.join('') : '<p>No suggested products available.</p>'}
                  </div>
                </div>
              </div>
            </div>
          `;
          
          productsListDiv.innerHTML = productHTML;
        })
        .catch(err => {
          console.error("Error loading suggested products:", err);
          productsListDiv.innerHTML = productHTML; // Fallback to display with error
        });
    })
    .catch(err => {
      console.error("Error loading product details:", err);
      productsListDiv.innerHTML = "Error loading product details.";
    });
}
// Function to change image
function changeImage(productId, delta) {
  const indices = window.currentImageIndices || {};
  let currentIndex = indices[productId] || 0;
  const productImages = document.querySelectorAll(`#productsList .image-slider img`);
  const totalImages = productImages.length;
  
  currentIndex = (currentIndex + delta + totalImages) % totalImages;
  indices[productId] = currentIndex;
  window.currentImageIndices = indices;
  
  productImages.forEach((img, idx) => {
    img.style.display = idx === currentIndex ? 'block' : 'none';
  });
}
function showProductDetailsBeforePayment(productId) {
  showProductDetails(productId);
}
// Add a global array to store products
let allProducts = [];

// Function to fetch products (called only once on page load)
function fetchProducts() {
  const productsListDiv = document.getElementById('productsList');
  productsListDiv.innerHTML = "Loading products...";
  
  db.collection('products').where('isActive', '==', true).get()
    .then(snapshot => {
      productsListDiv.innerHTML = "";
      if (snapshot.empty) {
        productsListDiv.innerHTML = "No products available.";
        return;
      }

      // Store products in the global array
      allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));

      // Apply filters and display products initially
      filterProducts();
    })
    .catch(err => {
      console.error("Error loading products:", err);
      productsListDiv.innerHTML = "Error loading products.";
    });
}

// Function to apply filters
function applyFilters(products) {
  const categoryFilter = document.getElementById('categoryFilter').value;
  const priceFilter = document.getElementById('priceFilter').value;

  let filteredProducts = [...products]; // Create a copy to avoid mutating the original array

  // Filter by category
  if (categoryFilter !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.data.category === categoryFilter);
  }

  // Filter by price
  if (priceFilter !== 'all') {
    if (priceFilter === 'below100') {
      filteredProducts = filteredProducts.filter(product => product.data.price < 100);
    } else if (priceFilter === 'above100') {
      filteredProducts = filteredProducts.filter(product => product.data.price > 100);
    }
  }

  return filteredProducts;
}

// Function to display products
function displayProducts(products) {
  const productsListDiv = document.getElementById('productsList');
  productsListDiv.innerHTML = "";

  if (products.length === 0) {
    productsListDiv.innerHTML = "No products match your filters.";
    return;
  }

  products.forEach(product => {
    const prod = product.data;
    const productId = product.id;
    const imageUrl = prod.imageURLs?.[0] || 'assets/images/nothing.png';
    const prodDiv = document.createElement('div');
    prodDiv.classList.add('product');
    
    let specsHTML = '';
    if (prod.category === 'perfume') {
      specsHTML = `<br>Scent: ${prod.specifications.scent || 'N/A'}<br>Volume: ${prod.specifications.volume || 'N/A'} ml`;
    } else if (prod.category === 'watch') {
      specsHTML = `<br>Type: ${prod.specifications.type || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
    } else if (prod.category === 'dresses') {
      specsHTML = `<br>Size: ${prod.specifications.size || 'N/A'}<br>Color: ${prod.specifications.color || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
    } else if (prod.category === 'shoes') {
      specsHTML = `<br>Size: ${prod.specifications.size || 'N/A'}<br>Color: ${prod.specifications.color || 'N/A'}<br>Material: ${prod.specifications.material || 'N/A'}`;
    }
    
    prodDiv.innerHTML = `
      <img src="${imageUrl}" alt="${prod.name}" width="200" onerror="this.src='assets/images/nothing.png'" style="cursor: pointer;" onclick="showProductDetails('${productId}')">
      <br><strong>${prod.name}</strong>
      <br>Category: ${prod.category}
      <br><small>${prod.description || 'No description available'}</small>
      ${specsHTML}
      <br>Availability: ${prod.availability || 'N/A'}
      <br>Price: $${prod.price || 'N/A'}
      <div class="product-actions">
        <button class="product-btn" onclick="addToCart('${productId}', '${prod.name}')">Add to Cart</button>
        <button class="product-btn direct-payment-btn" onclick="showProductDetailsBeforePayment('${productId}')">Payment</button>
      </div>
    `;
    
    productsListDiv.appendChild(prodDiv);
  });
}

// Function to handle filter changes and display filtered products
function filterProducts() {
  if (allProducts.length === 0) {
    // If products haven't been fetched yet, fetch them first
    fetchProducts();
  } else {
    // Apply filters and display products
    const filteredProducts = applyFilters(allProducts);
    displayProducts(filteredProducts);
  }
}

// Updated showSection function to only handle section visibility and filtering
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  if (sectionId === 'products') {
    filterProducts(); // Already correct as per your code
  }
  if (sectionId === 'cart') loadCart(); // Use loadCart instead of fetchAndDisplayCart
  if (sectionId === 'history') loadHistory(); // Use loadHistory instead of fetchAndDisplayHistory
  if (sectionId === 'home') loadHomePage(); // Use loadHomePage instead of fetchAndDisplayHomePage
  if (sectionId === 'myaccount') loadAccountDetails(); // Use loadAccountDetails instead of fetchAndDisplayAccountDetails
}
// Initialize products on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts(); // Fetch products for filtering
  loadHomePage();  // Load the "Home" section content immediately
});
// Popup Message Function
function showPopup(message) {
  const popupModal = document.getElementById('popupModal');
  const popupMessage = document.getElementById('popupMessage');
  popupMessage.textContent = message;
  popupModal.style.display = 'flex';
}

function closePopup() {
  document.getElementById('popupModal').style.display = 'none';
}
function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    showPopup("Logged out successfully.");
    showSection('home');
    window.location.href = 'index.html';
  });
}

auth.onAuthStateChanged(user => {
  currentUser = user;
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
    const sectionId = activeSection.id;
    if (sectionId === 'home') loadHomePage();
    if (sectionId === 'cart') loadCart();
    if (sectionId === 'history') loadHistory();
    if (sectionId === 'myaccount') loadAccountDetails();
    if (sectionId === 'products') filterProducts();
  }
});

