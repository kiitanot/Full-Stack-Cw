Vue.createApp({
    // el: "#app",
    data() {
        return {
            sitename: "Online lessons",
            showProduct: true,
            products: [], // Initially empty; fetched from the backend
            cart: [],
            selectedSort: "titleAsc",
            searchProducts: "",
            debounceTimer: null,
            order: {
                name: "",
                phone: "",
            },
        }
    },

    methods: {
        
        // Debounced search to reduce the number of backend requests
        debounceSearch() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.searchProductsFromBackend(); // Call backend search
            }, 300); // Adjust delay as needed (300ms is standard)
        },

        // Fetch products based on search input from the backend
        searchProductsFromBackend() {
            const searchTerm = this.searchProducts.trim();
            
            if (!searchTerm) {
                this.fetchProducts(); // Reload all products if search is empty
                return;
            }

            fetch(`https://full-stack-back-end-ws6p.onrender.com/search?searchTerm=${encodeURIComponent(searchTerm)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        this.products = data; // Update displayed products
                    } else {
                        console.warn("No products found for the search term:", searchTerm);
                        this.products = []; // Clear displayed products if no match
                    }
                })
                .catch(error => {
                    console.error("Search error:", error);
                    alert("Error searching for products. Please try again later.");
                });
        },
        
   

        // Fetch products from the backend
        fetchProducts() {
            fetch('https://full-stack-back-end-ws6p.onrender.com/products')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.products = data;
                })
                .catch(error => {
                    console.error("Failed to fetch products:", error);
                    alert("Error fetching products. Please try again later.");
                });
        },

       
    

        // Submit checkout order to the backend
        submitCheckOutForm() {
            if (this.validateForm()) {
                const orderData = {
                    customerName: this.order.name,
                    phoneNumber: this.order.phone,
                    productIds: this.cart,
                };
        
                fetch('https://full-stack-back-end-ws6p.onrender.com/orders', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData),
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert(`Congratulations, order submitted! Order ID: ${data.orderId}`);
                    
                    // Batch inventory update
                    const inventoryUpdates = this.cart.reduce((acc, productId) => {
                        acc[productId] = (acc[productId] || 0) + 1; // Count occurrences
                        return acc;
                    }, {});
        
                    // Send batch inventory update
                    fetch('https://full-stack-back-end-ws6p.onrender.com/products/batch-update', {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(inventoryUpdates),
                    }).catch(error => {
                        console.error("Failed to update inventory:", error);
                    });
        
                    // Reset fields and cart
                    this.order.name = "";
                    this.order.phone = "";
                    this.cart = [];
                })
                .catch(error => {
                    console.error("Failed to submit order:", error.message);
                    alert("Error submitting order: " + error.message);
                });
            } else {
                alert("Please ensure all fields are filled correctly.");
            }
        },
        




        // Other methods remain unchanged
        showCheckout() {
            if (!this.isCartEmpty) {
                this.showProduct = !this.showProduct;
            } else {
                alert("Your cart is empty. Please add products to proceed.");
            }
        },



        addItemToTheCart(product) {
            this.cart.push(product.id);
        },

        removeItemFromCart(id) {
            const index = this.cart.indexOf(id);
            if (index > -1) {
                this.cart.splice(index, 1);
            }

            // If the cart becomes empty, show the product page
            if (this.cart.length === 0) {
                this.showProduct = true;
            }
        },


        validateForm() {

            const phoneRegex = /^[0-9]{11}$/;


            const nameRegex = /^[A-Za-z]+$/;

            return nameRegex.test(this.order.name) && phoneRegex.test(this.order.phone);
        },



        canAddToTheCart(product) {
            return product.availableInventory > this.cartCount(product.id);
        },

        cartCount(id) {
            return this.cart.filter(cartId => cartId === id).length;
        },

        getProductById(id) {
            return this.products.find(product => product.id === id);
        },

        itemsLeft(product) {
            return product.availableInventory - this.cartCount(product.id);
        },
    },

    computed: {
        itemsInTheCart() {
            return this.cart.length || "";
        },

        isCartEmpty() {
            return this.cart.length === 0;
        },

        sortedProducts() {
            let sorted = [...this.products];
            switch (this.selectedSort) {
                case "titleAsc":
                    return sorted.sort((a, b) => a.title.localeCompare(b.title));
                case "titleDesc":
                    return sorted.sort((a, b) => b.title.localeCompare(a.title));
                case "priceAsc":
                    return sorted.sort((a, b) => a.price - b.price);
                case "priceDesc":
                    return sorted.sort((a, b) => b.price - a.price);
                case "availabilityAsc":
                    return sorted.sort((a, b) => a.availableInventory - b.availableInventory);
                case "availabilityDesc":
                    return sorted.sort((a, b) => b.availableInventory - a.availableInventory);
                case "locationAsc":
                    return sorted.sort((a, b) => a.location.localeCompare(b.location));
                case "locationDesc":
                    return sorted.sort((a, b) => b.location.localeCompare(a.location));
                default:
                    return this.products;
            }
        },
    },

    watch: {
        cart(newCart) {
            //shows product page when cart is empty
            if (newCart.length === 0) {
                this.showProduct = true;
            }
        },
    },


    mounted() {
        this.fetchProducts(); // Automatically fetch products on load
    },
}).mount('#app');