/* Blossom Bloom - form-validation.js */
/* Client-side form validation for contact and order forms */

$(document).ready(function () {

    /* Validate email format */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /* Validate phone format (10 digits starting with 0) */
    function isValidPhone(phone) {
        var cleaned = phone.replace(/[\s\-]/g, '');
        return /^0\d{9}$/.test(cleaned);
    }

    /* Helper to show error message */
    function showError(fieldId, message) {
        var $field = $('#' + fieldId);
        $field.addClass('input-error').removeClass('input-success');
        
        /* Create error span if it doesn't exist */
        if (!$field.next('.error-msg').length) {
            $field.after('<span class="error-msg"></span>');
        }
        $field.next('.error-msg').text(message).show();
    }

    /* Helper to clear error message */
    function clearError(fieldId) {
        var $field = $('#' + fieldId);
        $field.removeClass('input-error').addClass('input-success');
        if ($field.next('.error-msg').length) {
            $field.next('.error-msg').hide();
        }
    }

    /* Contact Form Validation */
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        var isValid = true;
        
        var name = $('#contact-name').val().trim();
        if (name.length < 2) {
            showError('contact-name', 'Please enter a valid name.');
            isValid = false;
        } else {
            clearError('contact-name');
        }
        
        var email = $('#contact-email').val().trim();
        if (!isValidEmail(email)) {
            showError('contact-email', 'Please enter a valid email address.');
            isValid = false;
        } else {
            clearError('contact-email');
        }
        
        var message = $('#contact-message').val().trim();
        if (message.length < 10) {
            showError('contact-message', 'Message must be at least 10 characters long.');
            isValid = false;
        } else {
            clearError('contact-message');
        }
        
        if (isValid) {
            var subject = encodeURIComponent('Enquiry from Blossom Bloom Website');
            var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
            window.location.href = 'mailto:hello@blossombloom.co.za?subject=' + subject + '&body=' + body;
            
            alert('Your message is ready to send via your email client.');
            $('#contact-form')[0].reset();
            $('.input-success').removeClass('input-success');
        }
    });

    /* Order Form Validation */
    $('#order-form').on('submit', function(e) {
        e.preventDefault();
        var isValid = true;
        
        var fullName = $('#recipient-name').val().trim();
        if (fullName.length < 2) {
            showError('recipient-name', 'Please enter a valid full name.');
            isValid = false;
        } else {
            clearError('recipient-name');
        }
        
        var phone = $('#recipient-phone').val().trim();
        if (!isValidPhone(phone)) {
            showError('recipient-phone', 'Please enter a valid 10-digit phone number (e.g. 0736249185).');
            isValid = false;
        } else {
            clearError('recipient-phone');
        }

        var address = $('#delivery-address').val().trim();
        if (address.length < 5) {
            showError('delivery-address', 'Please enter a valid delivery address.');
            isValid = false;
        } else {
            clearError('delivery-address');
        }
        
        if (isValid) {
            /* AJAX Form Submission to simulate asynchronous processing */
            var orderData = {
                name: fullName,
                phone: phone,
                address: address,
                cart: JSON.parse(localStorage.getItem('blossomCart')) || []
            };

            /* Change button text to show loading state */
            var $submitBtn = $('#order-form button[type="submit"]');
            var originalText = $submitBtn.text();
            $submitBtn.text('Processing Order...').prop('disabled', true);

            $.ajax({
                url: 'https://jsonplaceholder.typicode.com/posts', /* Mock API endpoint for demonstration */
                type: 'POST',
                data: JSON.stringify(orderData),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    /* Simulate server response presentation */
                    alert('Success! Thank you, ' + fullName + '. Your order has been placed. We will contact you at ' + phone + ' regarding delivery to ' + address + '.');
                    $('#order-form')[0].reset();
                    $('.input-success').removeClass('input-success');
                    
                    /* Clear the cart after successful order */
                    localStorage.removeItem('blossomCart');
                    if(typeof renderCart === "function") {
                        renderCart(); /* If on same page */
                    } else {
                        window.location.reload();
                    }
                },
                error: function(xhr, status, error) {
                    alert('There was an error processing your order. Please try again later.');
                },
                complete: function() {
                    $submitBtn.text(originalText).prop('disabled', false);
                }
            });
        }
    });

});
