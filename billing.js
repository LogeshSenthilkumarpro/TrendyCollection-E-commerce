// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('printInvoice').addEventListener('click', printInvoice);
    document.getElementById('saveAsPdf').addEventListener('click', saveAsPdf);
    document.getElementById('backToOrders').addEventListener('click', goBackToOrders);
    
    // Load invoice data from URL parameters
    loadInvoiceData();
});

// Function to load invoice data from URL parameters
// Function to load invoice data from URL parameters
function loadInvoiceData() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        showError("No order ID provided. Please go back and select an order.");
        return;
    }
    
    // Check authentication status
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, proceed to fetch data
            console.log("User authenticated, fetching order data");
            getOrderDataFromFirebase(orderId);
        } else {
            // No user is signed in
            console.error("User not authenticated");
            showError("Please log in to view this invoice");
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html?redirect=billing.html?orderId=' + orderId;
            }, 2000);
        }
    });
}

// Function to display error messages
function showError(message) {
    const elements = [
        'invoiceNumber', 'orderDate', 'paymentMethod', 
        'customerName', 'customerEmail', 'orderId', 
        'orderStatus', 'subtotal', 'tax', 
        'creditsUsed', 'creditsEarned', 'totalAmount'
    ];
    
    // Update all fields with error message
    elements.forEach(id => {
        document.getElementById(id).textContent = "Error";
    });
    
    // Update order items with error message
    document.getElementById('orderItems').innerHTML = `
        <tr>
            <td colspan="5" class="error-message">${message}</td>
        </tr>
    `;
    
    console.error(message);
}
// Function to get order data from Firebase
function getOrderDataFromFirebase(orderId) {
    console.log("Fetching order data for ID:", orderId);
    
    // Check if user is authenticated
    if (!firebase.auth().currentUser) {
        console.error("User not authenticated");
        showError("Authentication required. Please log in to view this invoice.");
        return;
    }
    
    // Get order data
    db.collection('orders').doc(orderId).get()
        .then(doc => {
            if (doc.exists) {
                const orderData = doc.data();
                console.log("Order data retrieved:", orderData);
                
                // Verify current user owns this order or is admin
                if (orderData.userId !== firebase.auth().currentUser.uid && 
                    firebase.auth().currentUser.email !== "adminlogesh@example.com") {
                    throw new Error("You don't have permission to view this order");
                }
                
                // Get payment details with more robust error handling
                return db.collection('payments')
                    .where('orderId', '==', orderId)
                    .limit(1)
                    .get()
                    .then(paymentSnapshot => {
                        let paymentData = {};
                        
                        if (!paymentSnapshot.empty) {
                            paymentData = paymentSnapshot.docs[0].data();
                            console.log("Payment data retrieved:", paymentData);
                        } else {
                            console.warn("No payment found for this order, using defaults");
                            paymentData = {
                                paymentMethod: "N/A", 
                                creditsUsed: 0
                            };
                        }
                        
                        // Get user details
                        return db.collection('users').doc(orderData.userId).get()
                            .then(userDoc => {
                                let userData = {};
                                
                                if (userDoc.exists) {
                                    userData = userDoc.data();
                                    console.log("User data retrieved");
                                } else {
                                    console.warn("User not found, using defaults");
                                    userData = { name: "Unknown", email: "unknown@example.com" };
                                }
                                
                                // Format the order date
                                let formattedDate = "N/A";
                                if (orderData.orderDate) {
                                    // Handle Firestore timestamp
                                    const date = orderData.orderDate.toDate ? 
                                        orderData.orderDate.toDate() : 
                                        new Date(orderData.orderDate);
                                    
                                    formattedDate = date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                }
                                
                                // Calculate financial details
                                const subtotal = orderData.totalAmount || 0;
                                const taxRate = 0.10; // 10% tax
                                const tax = subtotal * taxRate;
                                const creditsUsed = paymentData.creditsUsed || 0;
                                const creditsEarned = Math.floor(subtotal / 50); // 1 credit per $50
                                const totalAmount = subtotal + tax - creditsUsed;
                                
                                // Combine all the data
                                const fullOrderData = {
                                    invoiceNumber: `INV-${orderId.substring(0, 8)}`,
                                    orderDate: formattedDate,
                                    paymentMethod: paymentData.paymentMethod || "N/A",
                                    customerName: userData.name || "N/A",
                                    customerEmail: userData.email || "N/A",
                                    orderId: orderId,
                                    orderStatus: orderData.status || "Processing",
                                    items: orderData.items || [],
                                    subtotal: subtotal,
                                    tax: tax,
                                    creditsUsed: creditsUsed,
                                    creditsEarned: creditsEarned,
                                    totalAmount: totalAmount
                                };
                                
                                // Update the invoice with the data
                                updateInvoiceWithData(fullOrderData);
                            })
                            .catch(err => {
                                console.error("Error getting user data:", err);
                                showError(`Error loading user data: ${err.message}`);
                            });
                    })
                    .catch(err => {
                        console.error("Error getting payment data:", err);
                        showError(`Error loading payment data: ${err.message}`);
                    });
            } else {
                throw new Error("Order not found");
            }
        })
        .catch(err => {
            console.error("Error getting order data:", err);
            showError(`Error loading invoice: ${err.message}`);
        });
}
// Update the invoice DOM with the provided data
function updateInvoiceWithData(data) {
    // Update invoice details
    document.getElementById('invoiceNumber').textContent = data.invoiceNumber;
    document.getElementById('orderDate').textContent = data.orderDate;
    document.getElementById('paymentMethod').textContent = data.paymentMethod;
    
    // Update customer details
    document.getElementById('customerName').textContent = data.customerName;
    document.getElementById('customerEmail').textContent = data.customerEmail;
    
    // Update order details
    document.getElementById('orderId').textContent = data.orderId;
    document.getElementById('orderStatus').textContent = data.orderStatus;
    
    // Update order items
    const itemsContainer = document.getElementById('orderItems');
    itemsContainer.innerHTML = ''; // Clear existing items
    
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            const row = document.createElement('tr');
            
            // Ensure all item properties exist
            const itemName = item.name || "Unnamed Item";
            const itemId = item.id || "N/A";
            const category = item.category || "N/A";
            const details = item.details || "No details available";
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const itemTotal = price * quantity;
            
            row.innerHTML = `
                <td class="item-info">
                    <div class="item-name">${itemName}</div>
                    <div class="item-id">ID: ${itemId}</div>
                </td>
                <td class="item-details">
                    <div>Category: ${category}</div>
                    <div>${details}</div>
                </td>
                <td class="item-price">$${price.toFixed(2)}</td>
                <td class="item-qty">${quantity}</td>
                <td class="item-total">$${itemTotal.toFixed(2)}</td>
            `;
            itemsContainer.appendChild(row);
        });
    } else {
        // No items found
        itemsContainer.innerHTML = `
            <tr>
                <td colspan="5" class="no-items">No items found in this order</td>
            </tr>
        `;
    }
    
    // Update totals with proper formatting
    document.getElementById('subtotal').textContent = `$${data.subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${data.tax.toFixed(2)}`;
    document.getElementById('creditsUsed').textContent = `$${data.creditsUsed.toFixed(2)}`;
    document.getElementById('creditsEarned').textContent = `$${data.creditsEarned.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${data.totalAmount.toFixed(2)}`;
}

// Function to print the invoice
function printInvoice() {
    window.print();
}

// Function to save the invoice as PDF
function saveAsPdf() {
    // Hide print controls during PDF generation
    const headerControls = document.getElementById('headerControls');
    headerControls.style.display = 'none';
    
    // Use the window's print functionality to save as PDF
    window.print();
    
    // Restore the header controls
    setTimeout(() => {
        headerControls.style.display = 'flex';
    }, 1000);
    
    // Alert user about how to save as PDF
    alert('To save as PDF, select "Save as PDF" in the printer destination dropdown in the print dialog.');
}

// Function to go back to the orders page
function goBackToOrders() {
    // Navigate back to orders page
    window.location.href = 'index.html#history';
}