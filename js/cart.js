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
        var toastHtml = '<div id="cart-toast" style="display:none; position:fixed; top:20px; right:20px; background:#4CAF50; color:white; padding:15px 20px; border-radius:5px; z-index:10000; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-family:\'Poppins\', sans-serif;"></div>';
        $('body').append(toastHtml);
    }

    function showToast(message) {
        $('#cart-toast').text(message).fadeIn(300).delay(3000).fadeOut(300);
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
                    addToCart(window.currentCardName, window.currentCardPrice, msg, window.currentCardImage, window.currentCardQty);
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
            addToCart(name, price, '', image, qty);
        }
    });

    function addToCart(name, price, message, image, addQty) {
        /* Check if already in cart */
        var existing = cart.find(function(item) {
            return item.name === name && item.message === message;
        });

        if (existing) {
            existing.qty += addQty;
        } else {
            cart.push({
                name: name,
                price: price,
                qty: addQty,
                message: message,
                image: image || 'images/addon-card.png'
            });
        }
        
        saveCart();
        showToast(addQty + "x " + name + " successfully added to cart");
    }

    /* 5. Render Cart dynamically (order.html) */
    function renderCart() {
        var $tbody = $('.cart-table tbody');
        if (!$tbody.length) return;

        $tbody.empty();
        var subtotal = 0;

        if (cart.length === 0) {
            $tbody.append('<tr><td colspan="4" style="text-align:center; padding:2rem;">Your cart is empty. <a href="shop.html">Go to shop</a></td></tr>');
            $('.cart-table tfoot tr:nth-child(1) td').text('R0.00');
            $('.cart-table tfoot tr:nth-child(2) td').text('R0.00');
            $('.cart-table tfoot tr:nth-child(3) td').html('<strong>R0.00</strong>');
            return;
        }

        cart.forEach(function(item, index) {
            var itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            
            var msgHtml = item.message ? '<br><small><i>Msg: ' + item.message + '</i></small>' : '';
            var imgHtml = item.image ? '<img src="' + item.image + '" alt="' + item.name + '" style="width:50px; height:50px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:10px;">' : '';
            
            var tr = '<tr>' +
                '<td>' + imgHtml + item.name + msgHtml + '</td>' +
                '<td>-</td>' + /* Size column left blank for now */
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

        /* Update totals */
        var delivery = subtotal > 0 ? 75 : 0;
        var total = subtotal + delivery;
        
        $('.cart-table tfoot tr:nth-child(1) td').text('R' + subtotal.toFixed(2));
        $('.cart-table tfoot tr:nth-child(2) td').text('R' + delivery.toFixed(2));
        $('.cart-table tfoot tr:nth-child(3) td').html('<strong>R' + total.toFixed(2) + '</strong>');
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

});
