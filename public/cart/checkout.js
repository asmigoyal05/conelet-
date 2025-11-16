document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout.js v4 (Full Nav & Submit) Loaded');

    

    const itemsContainer = document.querySelector('#order-items-container');
    if (itemsContainer) {
        itemsContainer.addEventListener('click', async (event) => {
            const target = event.target;
            // Handle quantity buttons
            if (target.classList.contains('btn-quantity')) {
                const itemId = target.dataset.id;
                const action = target.dataset.action;
                try {
                 
                    const response = await fetch(`/api/cart/update/${itemId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: action })
                    });
                    const result = await response.json();
                    if (result.success) {
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Error updating quantity:', err);
                }
            }
            // Handle remove buttons
            if (target.classList.contains('btn-remove')) {
                const itemId = target.dataset.id;
                if (!confirm('Remove this item from your cart?')) {
                    return;
                }
                try {
                   
                    const response = await fetch(`/api/cart/remove/${itemId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (result.success) {
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Error removing item:', err);
                }
            }
        });
    }

 

    const applyButton = document.getElementById('btn-apply-discount');
    const discountInput = document.getElementById('discount-code');

    if (applyButton && discountInput) {
        applyButton.addEventListener('click', async () => {
            const code = discountInput.value;
            if (!code) {
                alert('Please enter a discount code.');
                return;
            }
            try {
               
                const response = await fetch('/api/cart/apply-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(result.message || 'Invalid discount code');
                }
            } catch (error) {
                console.error('Error applying discount:', error);
                alert('An error occurred applying the discount.');
            }
        });
    }


    const steps = {
        shipping: document.getElementById('step-1'),
        payment: document.getElementById('step-2')
    };

    const forms = {
        shipping: document.getElementById('shipping-form'),
        payment: document.getElementById('payment-form')
    };

    const buttons = {
        toPayment: document.getElementById('btn-to-payment'),
        pay: document.getElementById('btn-pay')
    };

    const backLinks = {
        toShipping: document.getElementById('link-back-to-shipping')
    };


    function showStep(stepName) {
   
        if (!forms.shipping || !forms.payment || !buttons.toPayment || !buttons.pay || !steps.shipping || !steps.payment) {
            console.error('Form navigation elements are missing from the page.');
            return;
        }

      
        forms.shipping.style.display = 'none';
        forms.payment.style.display = 'none';
        buttons.toPayment.style.display = 'none';
        buttons.pay.style.display = 'none';

    
        steps.shipping.classList.remove('active', 'completed');
        steps.payment.classList.remove('active', 'completed');

  
        if (stepName === 'shipping') {
            forms.shipping.style.display = 'block';
            buttons.toPayment.style.display = 'inline-block';
            steps.shipping.classList.add('active');
        } else if (stepName === 'payment') {
            forms.payment.style.display = 'block';
            buttons.pay.style.display = 'inline-block';
            steps.payment.classList.add('active');
            steps.shipping.classList.add('completed'); 
        }
    }

   
    if (buttons.toPayment) {
        buttons.toPayment.addEventListener('click', () => showStep('payment'));
    }

    if (backLinks.toShipping) {
        backLinks.toShipping.addEventListener('click', (e) => {
            e.preventDefault(); 
            showStep('shipping');
        });
    }

 

    if (buttons.pay) {
        buttons.pay.addEventListener('click', async () => {
           
            const shippingDetails = {
                name: document.getElementById('name').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value
            };

            const paymentDetails = {
                cardNumber: document.getElementById('card-number').value,
                expiry: document.getElementById('card-expiry').value,
                cvc: document.getElementById('card-cvc').value
            };

  
            if (!shippingDetails.name || !shippingDetails.address || !paymentDetails.cardNumber) {
                alert('Please fill out all shipping and payment fields.');
                return;
            }

            console.log('Submitting order...');

            try {
                
                const response = await fetch('/api/order/place', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shipping: shippingDetails,
                        payment: paymentDetails
                    })
                });

                const result = await response.json();

                if (result.success) {
                   
                    alert('Order placed successfully!');
                  
                    window.location.href = `/order/success/${result.orderId}`;
                } else {
                    alert(result.message || 'There was a problem placing your order.');
                }

            } catch (err) {
                console.error('Error placing order:', err);
                alert('A critical error occurred. Please try again.');
            }
        });
    }

 
    showStep('shipping');

});

