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

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  if (email === 'adminlogesh@example.com' && password === 'Admin123!') {
    auth.signInWithEmailAndPassword(email, password)
      .then(cred => {
        currentUser = cred.user;
        document.getElementById('loginMessage').innerText = "Login successful!";
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('adminPanel').classList.add('active');
        loadAllProducts();
        loadUsers(); // Load users when admin logs in
      })
      .catch(err => document.getElementById('loginMessage').innerText = err.message);
  } else {
    document.getElementById('loginMessage').innerText = "Invalid admin credentials. Use adminlogesh@example.com and Admin123!";
  }
});

function showCategory(category) {
  document.querySelectorAll('.category-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(category).style.display = 'block';
}

// Perfume CRUD
document.getElementById('perfumeForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const productId = document.getElementById('perfumeProductId').value.trim();
  const credit = parseInt(document.getElementById('perfumeCredit').value) || 0; // New credit field
  // Add credit validation
  if (credit > 1000) {
    document.getElementById('perfumeMessage').innerText = "Credit cannot exceed 1000!";
    return;
  }
  const productData = {
    category: 'perfume',
    name: document.getElementById('perfumeName').value,
    description: document.getElementById('perfumeDescription').value,
    brand: document.getElementById('perfumeBrand').value,
    imageURLs: document.getElementById('perfumeImageURLs').value.split(','),
    specifications: {
      scent: document.getElementById('perfumeScent').value,
      volume: parseInt(document.getElementById('perfumeVolume').value)
    },
    price: parseInt(document.getElementById('perfumePrice').value),
    stock: parseInt(document.getElementById('perfumeStock').value),
    availability: parseInt(document.getElementById('perfumeAvailability').value),
    isActive: document.getElementById('perfumeIsActive').value === 'true',
    creditEligible: document.getElementById('perfumeCreditEligible').value === 'true',
    credit: credit, // Add credit to product data
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  db.collection('products').doc(productId).set(productData)
    .then(() => {
      document.getElementById('perfumeMessage').innerText = `Perfume ${productId} added/updated successfully!`;
      document.getElementById('perfumeForm').reset();
      loadProducts('perfume');
    })
    .catch(err => document.getElementById('perfumeMessage').innerText = `Error: ${err.message}`);
});

// Watch CRUD
document.getElementById('watchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const productId = document.getElementById('watchProductId').value.trim();
  const credit = parseInt(document.getElementById('watchCredit').value) || 0; // New credit field
  // Add credit validation
  if (credit > 1000) {
    document.getElementById('watchMessage').innerText = "Credit cannot exceed 1000!";
    return;
  }
  const productData = {
    category: 'watch',
    name: document.getElementById('watchName').value,
    description: document.getElementById('watchDescription').value,
    brand: document.getElementById('watchBrand').value,
    imageURLs: document.getElementById('watchImageURLs').value.split(','),
    specifications: {
      type: document.getElementById('watchType').value,
      material: document.getElementById('watchMaterial').value
    },
    price: parseInt(document.getElementById('watchPrice').value),
    stock: parseInt(document.getElementById('watchStock').value),
    availability: parseInt(document.getElementById('watchAvailability').value),
    isActive: document.getElementById('watchIsActive').value === 'true',
    creditEligible: document.getElementById('watchCreditEligible').value === 'true',
    credit: credit, // Add credit to product data
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  db.collection('products').doc(productId).set(productData)
    .then(() => {
      document.getElementById('watchMessage').innerText = `Watch ${productId} added/updated successfully!`;
      document.getElementById('watchForm').reset();
      loadProducts('watch');
    })
    .catch(err => document.getElementById('watchMessage').innerText = `Error: ${err.message}`);
});

// Dresses CRUD
document.getElementById('dressesForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const productId = document.getElementById('dressesProductId').value.trim();
  const credit = parseInt(document.getElementById('dressesCredit').value) || 0; // New credit field
  // Add credit validation
  if (credit > 1000) {
    document.getElementById('dressesMessage').innerText = "Credit cannot exceed 1000!";
    return;
  }
  const productData = {
    category: 'dresses',
    name: document.getElementById('dressesName').value,
    description: document.getElementById('dressesDescription').value,
    brand: document.getElementById('dressesBrand').value,
    imageURLs: document.getElementById('dressesImageURLs').value.split(','),
    specifications: {
      size: document.getElementById('dressesSize').value,
      color: document.getElementById('dressesColor').value,
      material: document.getElementById('dressesMaterial').value
    },
    price: parseInt(document.getElementById('dressesPrice').value),
    stock: parseInt(document.getElementById('dressesStock').value),
    availability: parseInt(document.getElementById('dressesAvailability').value),
    isActive: document.getElementById('dressesIsActive').value === 'true',
    creditEligible: document.getElementById('dressesCreditEligible').value === 'true',
    credit: credit, // Add credit to product data
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  db.collection('products').doc(productId).set(productData)
    .then(() => {
      document.getElementById('dressesMessage').innerText = `Dresses ${productId} added/updated successfully!`;
      document.getElementById('dressesForm').reset();
      loadProducts('dresses');
    })
    .catch(err => document.getElementById('dressesMessage').innerText = `Error: ${err.message}`);
});

// Shoes CRUD
document.getElementById('shoesForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const productId = document.getElementById('shoesProductId').value.trim();
  const credit = parseInt(document.getElementById('shoesCredit').value) || 0; // New credit field
  // Add credit validation
  if (credit > 1000) {
    document.getElementById('shoesMessage').innerText = "Credit cannot exceed 1000!";
    return;
  }
  const productData = {
    category: 'shoes',
    name: document.getElementById('shoesName').value,
    description: document.getElementById('shoesDescription').value,
    brand: document.getElementById('shoesBrand').value,
    imageURLs: document.getElementById('shoesImageURLs').value.split(','),
    specifications: {
      size: document.getElementById('shoesSize').value,
      color: document.getElementById('shoesColor').value,
      material: document.getElementById('shoesMaterial').value
    },
    price: parseInt(document.getElementById('shoesPrice').value),
    stock: parseInt(document.getElementById('shoesStock').value),
    availability: parseInt(document.getElementById('shoesAvailability').value),
    isActive: document.getElementById('shoesIsActive').value === 'true',
    creditEligible: document.getElementById('shoesCreditEligible').value === 'true',
    credit: credit, // Add credit to product data
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  db.collection('products').doc(productId).set(productData)
    .then(() => {
      document.getElementById('shoesMessage').innerText = `Shoes ${productId} added/updated successfully!`;
      document.getElementById('shoesForm').reset();
      loadProducts('shoes');
    })
    .catch(err => document.getElementById('shoesMessage').innerText = `Error: ${err.message}`);
});

// Load Products for Each Category with Pagination
let lastVisible = {}; // Store the last document for each category

function loadProducts(category, page = 1) {
  const productListDiv = document.getElementById(`${category}ProductList`);
  productListDiv.innerHTML = "Loading products...";
  const pageSize = 5;
  
  let query = db.collection('products').where('category', '==', category);
  if (currentUser && currentUser.email !== 'adminlogesh@example.com') {
    query = query.where('isActive', '==', true);
  }
  
  query = query.orderBy('name').limit(pageSize);
  
  if (lastVisible[category] && page > 1) {
    query = query.startAfter(lastVisible[category]);
  } else if (page === 1) {
    // Reset pagination when going back to page 1
    lastVisible[category] = null;
  }
  
  query.get()
    .then(snapshot => {
      productListDiv.innerHTML = "";
      if (snapshot.empty && page === 1) {
        productListDiv.innerHTML = "No products available.";
        return;
      } else if (snapshot.empty) {
        productListDiv.innerHTML = "No more products available.";
        return;
      }
      
      // Save the last document for pagination
      if (snapshot.docs.length > 0) {
        lastVisible[category] = snapshot.docs[snapshot.docs.length - 1];
      }
      
      const table = document.createElement('div');
      table.classList.add('product-table');
      table.innerHTML = `
        <div class="product-row product-header">
          <div class="product-cell">Image</div>
          <div class="product-cell">Product Name</div>
          <div class="product-cell">Stock</div>
          <div class="product-cell">Availability</div>
          <div class="product-cell">Credit Eligible</div>
          <div class="product-cell">Actions</div>
        </div>
      `;
      
      snapshot.forEach(doc => {
        const prod = doc.data();
        const productId = doc.id;
        const imageUrl = prod.imageURLs && Array.isArray(prod.imageURLs) && prod.imageURLs.length > 0 
          ? prod.imageURLs[0] 
          : '/assets/images/nothing.png';
        
        const row = document.createElement('div');
        row.classList.add('product-row');
        row.innerHTML = `
          <div class="product-cell">
            <img src="${imageUrl}" alt="${prod.name}" width="50" onerror="this.src='/assets/images/nothing.png'; console.log('Image load failed for ${productId}');">
          </div>
          <div class="product-cell">${prod.name} (ID: ${productId})</div>
          <div class="product-cell">${prod.stock || 0}</div>
          <div class="product-cell">${prod.availability || 0}</div>
          <div class="product-cell">${prod.creditEligible ? 'Yes' : 'No'}</div>
          <div class="product-cell">
            <button onclick="openUpdateForm('${productId}', '${category}')">Update</button>
            <button onclick="deleteProduct('${productId}', '${category}')">Delete</button>
          </div>
        `;
        table.appendChild(row);
      });
      
      productListDiv.appendChild(table);

      // Add pagination controls
      const paginationDiv = document.createElement('div');
      paginationDiv.classList.add('pagination');
      paginationDiv.innerHTML = `
        <button onclick="loadProducts('${category}', ${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page}</span>
        <button onclick="loadProducts('${category}', ${page + 1})">Next</button>
      `;
      productListDiv.appendChild(paginationDiv);
    })
    .catch(err => {
      console.error(`Error loading ${category} products:`, err);
      productListDiv.innerHTML = `Error loading products: ${err.message}`;
    });
}

// Load All Products Initially
function loadAllProducts() {
  const categories = ['perfume', 'watch', 'dresses', 'shoes'];
  categories.forEach(category => loadProducts(category));
}

// User Management
function loadUsers() {
  const usersListDiv = document.getElementById('usersList');
  usersListDiv.innerHTML = "Loading users...";
  
  db.collection('users').get()
    .then(snapshot => {
      usersListDiv.innerHTML = "";
      if (snapshot.empty) {
        usersListDiv.innerHTML = "No users available.";
        return;
      }
      
      const table = document.createElement('div');
      table.classList.add('product-table');
      table.innerHTML = `
        <div class="product-row product-header">
          <div class="product-cell">Name</div>
          <div class="product-cell">Email</div>
          <div class="product-cell">Credit Limit</div>
          <div class="product-cell">Role</div>
          <div class="product-cell">Actions</div>
        </div>
      `;
      
      snapshot.forEach(doc => {
        const user = doc.data();
        const userId = doc.id;
        const isAdmin = user.email === 'adminlogesh@example.com';
        
        const row = document.createElement('div');
        row.classList.add('product-row');
        row.innerHTML = `
          <div class="product-cell">${user.name || 'N/A'}</div>
          <div class="product-cell">${user.email || 'N/A'}</div>
          <div class="product-cell">${user.creditLimit || 0}</div>
          <div class="product-cell">${isAdmin ? 'Admin' : 'Customer'}</div>
          <div class="product-cell">
            ${!isAdmin ? `<button onclick="updateUserCreditLimit('${userId}', '${user.name}', ${user.creditLimit || 0})">Update Credit</button>` : ''}
          </div>
        `;
        table.appendChild(row);
      });
      
      usersListDiv.appendChild(table);
    })
    .catch(err => {
      console.error("Error loading users:", err);
      usersListDiv.innerHTML = `Error loading users: ${err.message}`;
    });
}

// Update User Credit Limit
function updateUserCreditLimit(userId, userName, currentLimit) {
  const newLimit = prompt(`Enter new credit limit for ${userName}:`, currentLimit);
  if (newLimit !== null) {
    db.collection('users').doc(userId).update({
      creditLimit: parseInt(newLimit)
    })
    .then(() => {
      showPopup(`Credit limit updated for ${userName}`);
      loadUsers(); // Refresh the user list
    })
    .catch(err => {
      console.error("Error updating credit limit:", err);
      showPopup(`Error: ${err.message}`);
    });
  }
}

// Update Product Form
function openUpdateForm(productId, category) {
  db.collection('products').doc(productId).get()
    .then(doc => {
      if (doc.exists) {
        const prod = doc.data();
        const newName = prompt(`Update name for ${prod.name}:`, prod.name);
        const newStock = prompt(`Update stock for ${prod.name}:`, prod.stock);
        const newAvailability = prompt(`Update availability for ${prod.name}:`, prod.availability);
        const newImageURL = prompt(`Update image URL for ${prod.name}:`, prod.imageURLs ? prod.imageURLs[0] : '');
        const newCreditEligible = prompt(`Is product credit eligible? (true/false):`, prod.creditEligible || false);
        
        if (newName && newStock && newAvailability) {
          updateProduct(productId, {
            name: newName,
            stock: parseInt(newStock),
            availability: parseInt(newAvailability),
            imageURLs: newImageURL ? [newImageURL] : prod.imageURLs,
            creditEligible: newCreditEligible === 'true' // Convert to boolean
          }, category);
        }
      }
    })
    .catch(err => console.error(`Error fetching product ${productId}:`, err));
}

function updateProduct(productId, updates, category) {
  db.collection('products').doc(productId).update(updates)
    .then(() => {
      console.log(`Product ${productId} updated successfully`);
      loadProducts(category, 1); // Refresh the list from page 1
    })
    .catch(err => console.error(`Error updating product ${productId}:`, err));
}

function deleteProduct(productId, category) {
  if (confirm(`Are you sure you want to delete product ${productId}?`)) {
    db.collection('products').doc(productId).delete()
      .then(() => {
        console.log(`Product ${productId} deleted successfully`);
        loadProducts(category, 1); // Refresh the list from page 1
      })
      .catch(err => console.error(`Error deleting product ${productId}:`, err));
  }
}

// Report Generation
function generateReport() {
  const reportType = document.getElementById('reportType').value;
  const fromDate = document.getElementById('reportFromDate').value;
  const toDate = document.getElementById('reportToDate').value;
  const reportOutput = document.getElementById('reportOutput');
  
  reportOutput.innerHTML = "Generating report...";
  
  // Convert dates to timestamps if provided
  let fromTimestamp = null;
  let toTimestamp = null;
  
  if (fromDate) {
    fromTimestamp = new Date(fromDate);
    fromTimestamp.setHours(0, 0, 0, 0);
    fromTimestamp = firebase.firestore.Timestamp.fromDate(fromTimestamp);
  }
  
  if (toDate) {
    toTimestamp = new Date(toDate);
    toTimestamp.setHours(23, 59, 59, 999);
    toTimestamp = firebase.firestore.Timestamp.fromDate(toTimestamp);
  }
  
  switch (reportType) {
    case 'customerAll':
      generateCustomerAllReport(reportOutput);
      break;
    case 'customerTop10':
      generateCustomerTop10Report(reportOutput, fromTimestamp, toTimestamp);
      break;
    case 'cashPurchase':
      generateCashPurchaseReport(reportOutput, fromTimestamp, toTimestamp);
      break;
    case 'creditPurchase':
      generateCreditPurchaseReport(reportOutput, fromTimestamp, toTimestamp);
      break;
    case 'inventoryAll':
      generateInventoryAllReport(reportOutput);
      break;
    case 'inventoryCategory':
      generateInventoryCategoryReport(reportOutput);
      break;
    case 'inventoryHighLow':
      generateInventoryHighLowReport(reportOutput);
      break;
    case 'salesAll':
      generateSalesAllReport(reportOutput, fromTimestamp, toTimestamp);
      break;
    case 'salesTop10':
      generateSalesTopBottomReport(reportOutput, fromTimestamp, toTimestamp, true);
      break;
    case 'salesBottom10':
      generateSalesTopBottomReport(reportOutput, fromTimestamp, toTimestamp, false);
      break;
  }
}

// Customer Reports
function generateCustomerAllReport(reportOutput) {
  db.collection('users').get()
    .then(snapshot => {
      let html = '<h3>All Customers</h3><table class="report-table"><tr><th>Name</th><th>Email</th><th>Credit Limit</th><th>Role</th></tr>';
      
      snapshot.forEach(doc => {
        const user = doc.data();
        const isAdmin = user.email === 'adminlogesh@example.com';
        
        html += `<tr>
          <td>${user.name || 'N/A'}</td>
          <td>${user.email || 'N/A'}</td>
          <td>${user.creditLimit || 0}</td>
          <td>${isAdmin ? 'Admin' : 'Customer'}</td>
        </tr>`;
      });
      
      html += '</table>';
      reportOutput.innerHTML = html;
      addPrintButton(reportOutput, 'Customer All Report');
    })
    .catch(err => reportOutput.innerHTML = `Error: ${err.message}`);
}

function generateCustomerTop10Report(reportOutput, fromTimestamp, toTimestamp) {
  // For demo purposes - in real implementation, this would query orders collection
  reportOutput.innerHTML = "Top 10 Customers report would require order history data. This is a placeholder for demonstration.";
  addPrintButton(reportOutput, 'Top 10 Customers Report');
}

function generateCashPurchaseReport(reportOutput, fromTimestamp, toTimestamp) {
  // For demo purposes - in real implementation, this would query orders collection with payment method filter
  reportOutput.innerHTML = "Cash Purchase report would require order history data. This is a placeholder for demonstration.";
  addPrintButton(reportOutput, 'Cash Purchase Report');
}

function generateCreditPurchaseReport(reportOutput, fromTimestamp, toTimestamp) {
  // For demo purposes - in real implementation, this would query orders collection with payment method filter
  reportOutput.innerHTML = "Credit Purchase report would require order history data. This is a placeholder for demonstration.";
  addPrintButton(reportOutput, 'Credit Purchase Report');
}

// Inventory Reports
function generateInventoryAllReport(reportOutput) {
  db.collection('products').get()
    .then(snapshot => {
      let html = '<h3>Current Stock - All Products</h3><table class="report-table"><tr><th>Product Name</th><th>Category</th><th>Stock</th><th>Availability</th><th>Credit Eligible</th></tr>';
      
      snapshot.forEach(doc => {
        const prod = doc.data();
        
        html += `<tr>
          <td>${prod.name}</td>
          <td>${prod.category}</td>
          <td>${prod.stock || 0}</td>
          <td>${prod.availability || 0}</td>
          <td>${prod.creditEligible ? 'Yes' : 'No'}</td>
        </tr>`;
      });
      
      html += '</table>';
      reportOutput.innerHTML = html;
      addPrintButton(reportOutput, 'Inventory All Report');
    })
    .catch(err => reportOutput.innerHTML = `Error: ${err.message}`);
}function generateInventoryCategoryReport(reportOutput) {  // Opening function brace
  db.collection('products').get()
    .then(snapshot => {  // Opening then brace
      const byCategory = {};
      let totalStock = 0;
      
      snapshot.forEach(doc => {  // Opening forEach brace
        const prod = doc.data();
        const category = prod.category;
        
        if (!byCategory[category]) {  // Opening if brace
          byCategory[category] = {
            count: 0,
            stock: 0,
            products: []
          };  // Closing object brace
        }  // Closing if brace
        
        byCategory[category].count++;
        byCategory[category].stock += (prod.stock || 0);
        totalStock += (prod.stock || 0);
        byCategory[category].products.push({
          name: prod.name,
          stock: prod.stock || 0
        });  // Closing push object brace
      });  // Closing forEach brace
      
      let html = '<h3>Inventory by Category</h3><table class="report-table"><tr><th>Category</th><th>Total Products</th><th>Total Stock</th><th>Percentage</th></tr>';
      
      for (const category in byCategory) {  // Opening for-in brace
        const data = byCategory[category];
        const percentage = ((data.stock / totalStock) * 100).toFixed(2);
        
        html += `<tr>
          <td>${category}</td>
          <td>${data.count}</td>
          <td>${data.stock}</td>
          <td>${percentage}%</td>
        </tr>`;
      }  // Closing for-in brace
      
      html += '</table>';
      
      // Add detailed breakdown per category
      for (const category in byCategory) {  // Opening second for-in brace
        html += `<h4>${category} Products</h4><table class="report-table"><tr><th>Product</th><th>Stock</th></tr>`;
        
        byCategory[category].products.forEach(product => {  // Opening inner forEach brace
          html += `<tr><td>${product.name}</td><td>${product.stock}</td></tr>`;
        });  // Closing inner forEach brace
        
        html += '</table>';
      }  // Closing second for-in brace
      
      reportOutput.innerHTML = html;
      addPrintButton(reportOutput, 'Inventory Category Report');
    })  // Closing then brace and parenthesis
    .catch(err => reportOutput.innerHTML = `Error: ${err.message}`);  // Closing catch brace and parenthesis
}  // Closing function brace
function generateInventoryHighLowReport(reportOutput) {
  db.collection('products').get()
    .then(snapshot => {
      let highStock = [];
      let lowStock = [];
      
      snapshot.forEach(doc => {
        const prod = doc.data();
        const stock = prod.stock || 0;
        
        if (stock > 100) {
          highStock.push({
            name: prod.name,
            category: prod.category,
            stock: stock
          });
        } else if (stock < 15) {
          lowStock.push({
            name: prod.name,
            category: prod.category,
            stock: stock
          });
        }
      });
      
      // Sort by stock level
      highStock.sort((a, b) => b.stock - a.stock);
      lowStock.sort((a, b) => a.stock - b.stock);
      
      let html = '<h3>High Stock Products (>100 units)</h3>';
      
      if (highStock.length === 0) {
        html += '<p>No products with stock greater than 100 units.</p>';
      } else {
        html += '<table class="report-table"><tr><th>Product</th><th>Category</th><th>Stock</th></tr>';
        
        highStock.forEach(product => {
          html += `<tr><td>${product.name}</td><td>${product.category}</td><td>${product.stock}</td></tr>`;
        });
        
        html += '</table>';
      }
      
      html += '<h3>Low Stock Products (<15 units)</h3>';
      
      if (lowStock.length === 0) {
        html += '<p>No products with stock less than 15 units.</p>';
      } else {
        html += '<table class="report-table"><tr><th>Product</th><th>Category</th><th>Stock</th></tr>';
        
        lowStock.forEach(product => {
          html += `<tr><td>${product.name}</td><td>${product.category}</td><td>${product.stock}</td></tr>`;
        });
        
        html += '</table>';
      }
      
      reportOutput.innerHTML = html;
      addPrintButton(reportOutput, 'High Low Stock Report');
    })
    .catch(err => reportOutput.innerHTML = `Error: ${err.message}`);
}

// Sales Reports
function generateSalesAllReport(reportOutput, fromTimestamp, toTimestamp) {
  // For demo purposes - in real implementation, this would query orders collection
  reportOutput.innerHTML = "Sales Report would require order history data. This is a placeholder for demonstration.";
  addPrintButton(reportOutput, 'Sales Report');
}

function generateSalesTopBottomReport(reportOutput, fromTimestamp, toTimestamp, isTop) {
  // For demo purposes - in real implementation, this would query orders collection
  const reportTitle = isTop ? 'Top 10 Selling Items' : 'Bottom 10 Selling Items';
  reportOutput.innerHTML = `${reportTitle} would require sales data. This is a placeholder for demonstration.`;
  addPrintButton(reportOutput, reportTitle);
}

// Print Report
function addPrintButton(reportOutput, title) {
  const printButtonContainer = document.createElement('div');
  printButtonContainer.classList.add('print-button-container');
  
  const printButton = document.createElement('button');
  printButton.innerText = 'Print/Download PDF';
  printButton.classList.add('print-button');
  printButton.onclick = () => downloadPDF(reportOutput.innerHTML, title);
  
  printButtonContainer.appendChild(printButton);
  reportOutput.appendChild(printButtonContainer);
}

function downloadPDF(htmlContent, title) {
  // In a production environment, we would use jsPDF or html2pdf.js
  // For now, we'll use the browser's print functionality
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h3, h4 { margin-top: 20px; }
          .print-button-container { display: none; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        ${htmlContent}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Authentication state change
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    if (user.email === 'adminlogesh@example.com') {
      document.getElementById('loginSection').classList.remove('active');
      document.getElementById('adminPanel').classList.add('active');
      loadAllProducts();
      loadUsers();
    }
  } else {
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
  }
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
// Logout function
function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    showPopup("Logged out successfully.");
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
    window.location.href = 'index.html';
  });
}

document.querySelectorAll('.category-section').forEach(sec => sec.style.display = 'none');