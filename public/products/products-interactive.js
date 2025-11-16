document.addEventListener('DOMContentLoaded', () => {
    console.log('products-interactive.js loaded!'); 


    const productGrid = document.querySelector('.product-grid');
    const searchInput = document.querySelector('.search-bar input');
    const allCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const priceSlider = document.querySelector('#price-slider');
    const priceValue = document.querySelector('#price-value');
    const keywordContainer = document.querySelector('#keyword-container');
    const cartCounter = document.querySelector('#cart-counter');

  
    async function fetchAndRenderProducts() {
        let queryParams = new URLSearchParams();
        const selectedCategories = [];
        allCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const category = checkbox.name;
                if (['cone', 'tub', 'parfait'].includes(category)) {
                    selectedCategories.push(category);
                }
            }
        });
        if (selectedCategories.length > 0) selectedCategories.forEach(cat => queryParams.append('categories', cat));
        queryParams.append('maxPrice', priceSlider.value);
        if (searchInput.value) queryParams.append('search', searchInput.value);
        const activeSortButton = document.querySelector('.sort-btn.active');
        if (activeSortButton && activeSortButton.dataset.sort) queryParams.append('sort', activeSortButton.dataset.sort);
        updateKeywords();
        try {
            const response = await fetch(`/api/products?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p>Error loading products. Please try again.</p>';
        }
    }

 
    function renderProducts(products) {
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products match your filters.</p>';
            return;
        }
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product._id;
            productCard.dataset.name = product.name;
            productCard.dataset.price = product.price;
            productCard.dataset.image = product.image;

            if (product.category === 'parfait') productCard.classList.add('accent-bg-1');
            else if (product.category === 'tub') productCard.classList.add('accent-bg-2');
            else if (product.category === 'cone') productCard.classList.add('accent-bg-3');

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>$${product.price.toFixed(2)}</p>
                <button class="btn-add-to-cart">
                  Add to Cart
                </button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    function updateKeywords() {
        keywordContainer.innerHTML = '';
        allCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const keywordTag = document.createElement('div');
                keywordTag.className = 'keyword-tag';
                const label = checkbox.closest('li').querySelector('label').textContent;
                keywordTag.innerHTML = `
                    <span>${label}</span>
                    <button data-filter="${checkbox.id}">&times;</button>
                `;
                keywordContainer.appendChild(keywordTag);
            }
        });
    }

    async function updateCartCounter() {
        try {
            const response = await fetch('/api/cart/count');
            const result = await response.json();
            if (result.success) {
                cartCounter.textContent = result.count;
              
                if (result.count > 0) {
                    cartCounter.style.display = 'flex';
                } else {
                    cartCounter.style.display = 'none';
                }
            }
        } catch (err) {
            console.error('Error updating cart counter:', err);
        }
    }


    allCheckboxes.forEach(checkbox => checkbox.addEventListener('change', fetchAndRenderProducts));
    priceSlider.addEventListener('input', () => { priceValue.textContent = `$0-${priceSlider.value}`; });
    priceSlider.addEventListener('change', fetchAndRenderProducts);
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(fetchAndRenderProducts, 300);
    });
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchAndRenderProducts();
        });
    });
    keywordContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const filterId = event.target.dataset.filter;
            const checkboxToUncheck = document.querySelector(`#${filterId}`);
            if (checkboxToUncheck) {
                checkboxToUncheck.checked = false;
                fetchAndRenderProducts();
            }
        }
    });

  
    productGrid.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-add-to-cart')) {
            const button = event.target;
            const card = button.closest('.product-card'); 

            const { id, name, price, image } = card.dataset; 

            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: id, name: name, price: parseFloat(price), image: image
                    }),
                });

                const result = await response.json();

                if (response.status === 401) {
                    
                    alert(result.message); 
                    window.location.href = result.redirect; 

                } else if (response.ok) {
             
                    button.textContent = 'Added!';
                    updateCartCounter(); 
                    setTimeout(() => { button.textContent = 'Add to Cart'; }, 2000);

                } else {
                    
                    alert(result.error || 'Could not add item.');
                    button.textContent = 'Error';
                }
            } catch (err) {
                console.error('Error adding to cart:', err);
                button.textContent = 'Error';
            }
        }
    });


    updateKeywords();
    updateCartCounter(); 
    fetchAndRenderProducts(); 
});

