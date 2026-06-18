/* Blossom Bloom - cart.js */
/* Handles shopping cart logic, localStorage, and dynamic cart rendering */

$(document).ready(function () {
    /* 1. Initialise Cart */
    var cart = JSON.parse(localStorage.getItem('blossomCart')) || [];

    /* Save Cart Helper */
    function saveCart() {
        localStorage.setItem('blossomCart', JSON.stringify(cart));
    }

    /* Extract Price Helper */
    function parsePrice(priceStr) {
        var num = priceStr.replace(/[^0-9]/g, '');
        return num ? parseInt(num, 10) : 0;
    }

    /* 2. Toast Notification setup */
    if ($('body').length) {
        var toastHtml = '<div id="cart-toast" style="display:none; position:fixed; top:20px; right:20px; background:var(--deep-rose); color:white; padding:15px 20px; border-radius:5px; z-index:10000; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-family:\'Poppins\', sans-serif;"></div>';
        $('body').append(toastHtml);
    }

    function showToast(message) {
        $('#cart-toast').text(message).fadeIn(300).delay(3000).fadeOut(300);
    }

    /* Dynamic Size Selector Logic for Shop Page */
    if ($('.product-card').length) {
        $('.product-card').each(function() {
            var $sizeP = $(this).find('p.size');
            if ($sizeP.length) {
                var text = $sizeP.text();
                if (text.includes('Size options:')) {
                    var options = text.replace('Size options:', '').split(',').map(function(s) { return s.trim(); });
                    
                    /* Smaller rectangle, centered block */
                    var $select = $('<select class="size-select" style="margin: 0 auto 0.5rem; display:block; width: 110px; padding:0.2rem; border:1px solid var(--muted); border-radius:4px; font-family:inherit; color:var(--ink); font-size: 0.85rem;"></select>');
                    
                    var $priceEl = $(this).find('.price');
                    var basePriceStr = $priceEl.text().trim();
                    var basePrice = parsePrice(basePriceStr);
                    
                    options.forEach(function(opt) {
                        var multiplier = 1;
                        var optLower = opt.toLowerCase();
                        if (optLower === 'medium') multiplier = 1.3;
                        if (optLower === 'large') multiplier = 1.6;
                        if (optLower === 'grand') multiplier = 1.5;
                        
                        var price = Math.round(basePrice * multiplier);
                        $select.append($('<option>', {
                            value: opt,
                            text: opt,
                            'data-price': price
                        }));
                    });
                    
                    $sizeP.replaceWith($select);
                    
                    /* Tweak price margin so it looks grouped tightly with the select */
                    $priceEl.css({
                        'margin-top': '0',
                        'margin-bottom': '1rem'
                    });
                    
                    $select.on('change', function() {
                        var newPrice = $(this).find('option:selected').data('price');
                        $(this).closest('.product-card').find('.price').text('R' + newPrice.toFixed(2));
                    });
                }
            }
        });
    }

    /* 3. Add to Cart Logic (shop.html) */
    $('.product-card .add-to-cart-btn').on('click', function(e) {
        e.preventDefault();
        var $card = $(this).closest('.product-card');
        var name = $card.find('h3').text().trim();
        var priceStr = $card.find('.price').text().trim();
        var price = parsePrice(priceStr);
        var image = $card.find('img').attr('src');
        var qty = parseInt($card.find('.product-qty-input').val(), 10) || 1;
        var size = $card.find('.size-select').length ? $card.find('.size-select').val() : '-';
        var isCard = (name.toLowerCase() === 'handwritten card');

        if (isCard) {
            /* 4. Custom Handwritten Card Modal */
            if (!$('#card-modal').length) {
                var modalHtml = '<div id="card-modal" class="card-modal-overlay" style="display:flex;">' +
                    '<div class="card-modal">' +
                        '<h3>Handwritten Card Message</h3>' +
                        '<p>Enter your custom message (max 600 characters):</p>' +
                        '<textarea id="card-msg-input" maxlength="600" placeholder="Write your message here..."></textarea>' +
                        '<div class="card-modal-actions">' +
                            '<button type="button" class="btn-secondary" id="card-cancel-btn">Cancel</button>' +
                            '<button type="button" class="btn-primary" id="card-save-btn">Save to Cart</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                $('body').append(modalHtml);
                
                $('#card-cancel-btn').on('click', function() {
                    $('#card-modal').hide();
                });
                
                $('#card-save-btn').on('click', function() {
                    var msg = $('#card-msg-input').val().trim();
                    if (msg.length > 600) {
                        alert('Message is too long. Please keep it under 600 characters.');
                        return;
                    }
                    addToCart(window.currentCardName, window.currentCardPrice, msg, window.currentCardImage, window.currentCardQty, '-');
                    $('#card-modal').hide();
                    $('#card-msg-input').val('');
                });
            } else {
                $('#card-modal').show().css('display', 'flex');
            }
            
            /* Store current card info globally for the modal */
            window.currentCardName = name;
            window.currentCardPrice = price;
            window.currentCardImage = image;
            window.currentCardQty = qty;
            $('#card-msg-input').focus();
            
        } else {
            addToCart(name, price, '', image, qty, size);
        }
    });

    function addToCart(name, price, message, image, addQty, size) {
        /* Check if already in cart */
        var existing = cart.find(function(item) {
            return item.name === name && item.message === message && item.size === size;
        });

        if (existing) {
            existing.qty += addQty;
            if (!existing.image && image) {
                existing.image = image;
            }
        } else {
            cart.push({
                name: name,
                price: price,
                qty: addQty,
                message: message,
                image: image || 'images/addon-card.png',
                size: size || '-'
            });
        }
        
        saveCart();
        var sizeText = (size !== '-') ? ' (' + size + ')' : '';
        showToast(addQty + "x " + name + sizeText + " successfully added to cart");
    }

    /* 5. Render Cart dynamically (order.html) */
    function renderCart() {
        var $tbody = $('.cart-table tbody');
        if (!$tbody.length) return;

        $tbody.empty();
        var subtotal = 0;

        if (cart.length === 0) {
            $tbody.append('<tr><td colspan="4" style="text-align:center; padding:2rem;">Your cart is empty. <a href="shop.html">Go to shop</a></td></tr>');
            $('.cart-table tfoot').html('<tr><th colspan="3" scope="row">Subtotal</th><td>R0.00</td></tr><tr><th colspan="3" scope="row">Delivery</th><td>R0.00</td></tr><tr><th colspan="3" scope="row">Total</th><td><strong>R0.00</strong></td></tr>');
            return;
        }

        cart.forEach(function(item, index) {
            var itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            
            var msgHtml = item.message ? '<br><small><i>Msg: ' + item.message + '</i></small>' : '';
            var fallbackImage = 'images/addon-card.png'; /* Generic fallback for old carts */
            var displayImage = item.image || fallbackImage;
            var imgHtml = '<img src="' + displayImage + '" alt="' + item.name + '" style="width:50px; height:50px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:10px;">';
            var itemSize = item.size || '-';
            
            var tr = '<tr>' +
                '<td>' + imgHtml + item.name + msgHtml + '</td>' +
                '<td>' + itemSize + '</td>' +
                '<td>' +
                    '<button type="button" class="qty-btn minus" data-index="' + index + '">-</button>' +
                    '<span style="margin:0 10px;">' + item.qty + '</span>' +
                    '<button type="button" class="qty-btn plus" data-index="' + index + '">+</button>' +
                '</td>' +
                '<td>' +
                    'R' + itemTotal.toFixed(2) + 
                    '<button type="button" class="remove-btn" data-index="' + index + '" style="margin-left:15px; color:var(--deep-rose); border:none; background:none; cursor:pointer;" title="Remove Item">&times;</button>' +
                '</td>' +
            '</tr>';
            $tbody.append(tr);
        });

        /* Update totals and handle discounts */
        var delivery = subtotal > 0 ? 75 : 0;
        
        var code = (localStorage.getItem('blossomDiscount') || '').toUpperCase();
        var discountMultiplier = 1;
        var discountMessage = '';
        var discountAmount = 0;

        if (code === 'LOVE10') {
            discountMultiplier = 0.9;
            discountMessage = 'LOVE10 (-10%)';
        } else if (code === 'SPRING50') {
            discountMultiplier = 0.5;
            discountMessage = 'SPRING50 (-50%)';
        } else if (code === 'BDAY') {
            discountMessage = 'BDAY (Free Card Added)';
        } else if (code) {
            discountMessage = 'Invalid Code';
        }
        
        if (discountMultiplier < 1) {
            discountAmount = subtotal * (1 - discountMultiplier);
        }
        
        var total = subtotal - discountAmount + delivery;
        
        /* Render table footer dynamically to include discount row if needed */
        var tfootHtml = '<tr><th colspan="3" scope="row">Subtotal</th><td>R' + subtotal.toFixed(2) + '</td></tr>';
        
        if (discountAmount > 0) {
            tfootHtml += '<tr style="color:var(--deep-rose);"><th colspan="3" scope="row">Discount ' + discountMessage + '</th><td>-R' + discountAmount.toFixed(2) + '</td></tr>';
        }
        
        tfootHtml += '<tr><th colspan="3" scope="row">Delivery (Dainfern)</th><td>R' + delivery.toFixed(2) + '</td></tr>' +
                     '<tr><th colspan="3" scope="row">Total</th><td><strong>R' + total.toFixed(2) + '</strong></td></tr>';
                     
        $('.cart-table tfoot').html(tfootHtml);
        
        /* Update messages below input */
        if (code && discountMessage === 'Invalid Code') {
            $('#discount-message').text('Invalid discount code.').css('color', 'red');
        } else if (code) {
            $('#discount-message').text(discountMessage + ' applied successfully!').css('color', 'var(--deep-rose)');
            $('#discount-code-input').val(code);
        } else {
            $('#discount-message').text('');
        }
    }

    /* Initial Render */
    renderCart();

    /* 6. Quantity Controls */
    $(document).on('click', '.qty-btn', function() {
        var index = $(this).data('index');
        var isPlus = $(this).hasClass('plus');
        
        if (isPlus) {
            cart[index].qty += 1;
        } else {
            cart[index].qty -= 1;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
        }
        saveCart();
        renderCart();
    });

    /* 7. Remove Item */
    $(document).on('click', '.remove-btn', function() {
        var index = $(this).data('index');
        cart.splice(index, 1);
        saveCart();
        renderCart();
    });

    /* 8. Discount Code Logic */
    $('#apply-discount-btn').on('click', function() {
        var code = $('#discount-code-input').val().trim().toUpperCase();
        if (!code) {
            localStorage.removeItem('blossomDiscount');
            renderCart();
            return;
        }
        
        localStorage.setItem('blossomDiscount', code);
        
        if (code === 'BDAY') {
            /* Automatically add Handwritten Card */
            var hasCard = cart.some(function(item) {
                return item.name === 'Handwritten Card';
            });
            if (!hasCard) {
                cart.push({
                    name: 'Handwritten Card',
                    price: 35,
                    qty: 1,
                    message: 'Happy Birthday!',
                    image: 'images/addon-card.png'
                });
                saveCart();
                showToast('Handwritten Card automatically added for BDAY!');
            }
        }
        
        renderCart();
    });

});
