   
    let allProducts = [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let currentLang = localStorage.getItem("lang") || "ar";
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const productsContainer = document.getElementById("productsContainer");
    const favoritesList = document.getElementById("favoritesList");
    const searchInput = document.getElementById("searchInput");

    const t = {
        ar: {
            searchPlaceholder: "ابحث عن منتج...",
            noResults: "ما فيش نتائج مطابقة",
            addToCart: "أضف للسلة",
            favoritesEmpty: "لم تضف منتجات للمفضلة بعد",
            cartEmpty: "عربة الشراء فارغة",
            fetchError: "حصل خطأ في جلب المنتجات 😔",
            loginSuccess: "تم تسجيل الدخول بنجاح",
            checkoutSuccess: "تم إتمام الطلب بنجاح! شكراً لشرائك 🎉"
        },
        en: {
            searchPlaceholder: "Search for a product...",
            noResults: "No matching results",
            addToCart: "Add to Cart",
            favoritesEmpty: "No favorites yet",
            cartEmpty: "Your cart is empty",
            fetchError: "Error fetching products 😔",
            loginSuccess: "Logged in successfully",
            checkoutSuccess: "Order placed successfully! Thank you for your purchase 🎉"
        }
    };

   
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem("lang", lang);
        const html = document.getElementById("htmlRoot");
        html.setAttribute("lang", lang === "ar" ? "ar" : "en");
        html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

        document.querySelectorAll(".lang-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.lang === lang);
        });

        document.querySelectorAll("[data-ar][data-en]").forEach(el => {
            el.textContent = el.dataset[lang];
        });

        document.querySelectorAll("[data-ar-placeholder][data-en-placeholder]").forEach(el => {
            el.placeholder = el.dataset[lang + "Placeholder"];
        });

        document.getElementById("loginBtn").textContent = isLoggedIn
            ? (lang === "ar" ? "تسجيل الخروج" : "Logout")
            : (lang === "ar" ? "تسجيل الدخول" : "Login");

        filterAndSearch();
        renderCart();
        renderFavorites();
    }

    const extraProducts = [
        { id: 101, title: "شاشة سامسونج اوليد جيمينج", titleEn: "Samsung OLED Gaming Monitor", category: "electronics", price: 45.99, image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_t.png" },
        { id: 102, title: "اسوار فضي", titleEn: "Silver Bracelet", category: "electronics", price: 129.99, image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png" },
        { id: 103, title: "حقيبة يد أنيقة", titleEn: "Elegant Handbag", category: "jewelery", price: 35.50, image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png" },
        { id: 104, title: "قميص رجالي كلاسيكي", titleEn: "Classic Men's Shirt", category: "men's clothing", price: 55.00, image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png" },
        { id: 105, title: "فستان صيفي نسائي", titleEn: "Summer Women's Dress", category: "women's clothing", price: 68.75, image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png" },
        { id: 106, title: "هارد ديسك متنقل", titleEn: "Portable Hard Drive", category: "electronics", price: 89.99, image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png" },
        { id: 107, title: "هارد ssd", titleEn: "Solid State Drive", category: "electronics", price: 42.00, image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_t.png" },
        { id: 108, title: "خواتم ذهبية", titleEn: "Golden Rings", category: "jewelery", price: 29.99, image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_t.png" },
        { id: 109, title: "هارد ديسك من سانديسك", titleEn: "SanDisk External Hard Drive", category: "electronics", price: 39.99, image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png" },
        { id: 110, title: "معطف شتوي دافئ", titleEn: "Warm Winter Coat", category: "women's clothing", price: 95.00, image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png" }
    ];

    async function fetchProducts() {
        try {
            const res = await fetch("https://fakestoreapi.com/products");
            const apiProducts = await res.json();
            allProducts = [...apiProducts, ...extraProducts];
            filterAndSearch();
            renderFavorites();
            updateCartCount();
        } catch (err) {
            allProducts = extraProducts;
            filterAndSearch();
            renderFavorites();
        }
    }

   
    function renderProducts(productsToShow) {
        productsContainer.innerHTML = "";

        if (productsToShow.length === 0) {
            productsContainer.innerHTML = `<p style='text-align:center;grid-column:1/-1'>${t[currentLang].noResults}</p>`;
            return;
        }

        productsToShow.forEach(product => {
            const isFavorite = favorites.some(fav => fav.id === product.id);
            const displayTitle = (currentLang === "en" && product.titleEn) ? product.titleEn : product.title;

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
            <button class="fav-btn ${isFavorite ? 'favorited' : ''}" data-id="${product.id}">
                ${isFavorite ? '❤️' : '♡'}
            </button>
            <img src="${product.image}" alt="${displayTitle}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${displayTitle}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-cart-btn" data-id="${product.id}">
                    ${t[currentLang].addToCart}
                </button>
            </div>
            `;
            productsContainer.appendChild(card);
        });
    }

    
    function filterAndSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";

    let filtered = allProducts;

   
    if (activeFilter === "under50") {
        filtered = filtered.filter(p => p.price < 50);
    } else if (activeFilter === "above100") {
        filtered = filtered.filter(p => p.price > 100);
    } else if (activeFilter === "electronics") {
        filtered = filtered.filter(p => p.category === "electronics");
    }

   
    if (searchText) {
        filtered = filtered.filter(p => {
            const t1 = (p.title || "").toLowerCase();
            const t2 = (p.titleEn || "").toLowerCase();
            return t1.includes(searchText) || t2.includes(searchText);
        });
    }

    renderProducts(filtered);
    }

   
    function toggleFavorite(id) {
    const product = allProducts.find(p => p.id === Number(id));
    if (!product) return;

    const index = favorites.findIndex(f => f.id === product.id);
    if (index === -1) {
        favorites.push({ id: product.id, title: product.title });
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    filterAndSearch();
    renderFavorites();
    }

    function renderFavorites() {
        favoritesList.innerHTML = "";
        if (favorites.length === 0) {
            favoritesList.innerHTML = `<p style='color:#777'>${t[currentLang].favoritesEmpty}</p>`;
            return;
        }

        favorites.forEach(item => {
            const span = document.createElement("span");
            span.className = "fav-item";
            span.textContent = item.title;
            favoritesList.appendChild(span);
        });
    }

    
    function addToCart(id) {
        const product = allProducts.find(p => p.id === Number(id));
        if (!product) return;

        const existing = cart.find(c => c.id === product.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            const displayTitle = (currentLang === "en" && product.titleEn) ? product.titleEn : product.title;
            cart.push({ id: product.id, title: product.title, titleEn: product.titleEn, price: product.price, image: product.image, qty: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(c => c.id !== Number(id));
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        document.getElementById("cartCount").textContent = count;
    }

    function renderCart() {
        const container = document.getElementById("cartItems");
        const totalEl = document.getElementById("cartTotal");

        if (cart.length === 0) {
            container.innerHTML = `<p class="cart-empty">${t[currentLang].cartEmpty}</p>`;
            totalEl.textContent = "$0.00";
            return;
        }

        let total = 0;
        container.innerHTML = cart.map(item => {
            const subtotal = item.price * (item.qty || 1);
            total += subtotal;
            const itemTitle = (currentLang === "en" && item.titleEn) ? item.titleEn : item.title;
            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${itemTitle}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${itemTitle} ${(item.qty || 1) > 1 ? `×${item.qty}` : ""}</div>
                    <div class="cart-item-price">$${subtotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">×</button>
            </div>`;
        }).join("");

        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    
    function openLoginModal() {
        document.getElementById("loginModal").classList.add("open");
    }

    function closeLoginModal() {
        document.getElementById("loginModal").classList.remove("open");
    }

    function openCart() {
        document.getElementById("cartOverlay").classList.add("open");
        document.getElementById("cartSidebar").classList.add("open");
    }

    function closeCart() {
        document.getElementById("cartOverlay").classList.remove("open");
        document.getElementById("cartSidebar").classList.remove("open");
    }

    
    document.addEventListener("click", e => {
        if (e.target.classList.contains("fav-btn")) {
            toggleFavorite(e.target.dataset.id);
        }
        if (e.target.classList.contains("add-cart-btn")) {
            addToCart(e.target.dataset.id);
        }
        if (e.target.classList.contains("cart-item-remove")) {
            removeFromCart(e.target.dataset.id);
        }
        if (e.target.classList.contains("filter-btn")) {
            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            filterAndSearch();
        }
        if (e.target.classList.contains("lang-btn")) {
            setLanguage(e.target.dataset.lang);
        }
    });

    document.getElementById("loginBtn").addEventListener("click", () => {
        if (isLoggedIn) {
            isLoggedIn = false;
            localStorage.setItem("isLoggedIn", "false");
            setLanguage(currentLang);
        } else {
            openLoginModal();
        }
    });

    document.getElementById("loginClose").addEventListener("click", closeLoginModal);
    document.getElementById("loginModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("loginModal")) closeLoginModal();
    });

    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        isLoggedIn = true;
        localStorage.setItem("isLoggedIn", "true");
        closeLoginModal();
        setLanguage(currentLang);
        alert(t[currentLang].loginSuccess);
    });

    document.getElementById("cartBtn").addEventListener("click", openCart);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    document.getElementById("cartOverlay").addEventListener("click", closeCart);

    document.getElementById("checkoutBtn").addEventListener("click", () => {
        if (cart.length === 0) return;
        alert(t[currentLang].checkoutSuccess);
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
        closeCart();
    });

    searchInput.addEventListener("input", filterAndSearch);

   
    setLanguage(currentLang);
    fetchProducts();