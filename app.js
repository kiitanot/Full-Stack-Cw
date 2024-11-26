Vue.createApp({
    // el: "#app",
    data() {
        return {
            sitename: "Online lessons",
            showProduct: true,
            products: [], // Initially empty; fetched from the backend
            cart: [],
            selectedSort: "titleAsc",
            order: {
                name: "",
                phone: "",
            },
        }
    },

    methods: {
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
                // Prepare the order data
                const orderData = {
                    customerName: this.order.name,
                    productIds: this.cart, // Assuming 'cart' contains product IDs
                };
                

                

                // Fetch call to submit the order
                fetch('https://full-stack-back-end-ws6p.onrender.com/orders', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
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
                        // Reset the form fields and cart
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

        increaseQuantity(item) {
            item.quantity++; // Increase the quantity in the cart
        },
        
        decreaseQuantity(item) {
            if (item.quantity > 1) {
                item.quantity--; // Decrease the quantity in the cart
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
            
            
            const nameRegex = /^[A-Za-z\s]+$/;
            
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