/* Blossom Bloom - main.js */
/* Handles shared interactive elements for the website */

$(document).ready(function () {

    /* 1. Shop Category Tabs (shop.html) */
    $('.category-nav a').on('click', function(e) {
        e.preventDefault();
        
        /* Remove active class from all tabs */
        $('.category-nav a').removeClass('active');
        $(this).addClass('active');
        
        var targetId = $(this).attr('href');
        
        /* Hide all categories, then fade in the selected one */
        $('.product-category').hide();
        $(targetId).fadeIn(300);
    });

    /* 2. FAQ Accordion (about.html) */
    $('.faq-question').on('click', function() {
        var $answer = $(this).next('.faq-answer');
        var isOpen = $answer.is(':visible');
        
        /* Close all other answers */
        $('.faq-answer').slideUp(300);
        $('.faq-question').removeClass('open');
        
        /* Toggle current answer */
        if (!isOpen) {
            $answer.slideDown(300);
            $(this).addClass('open');
        }
    });

    /* 3. Lightbox Gallery */
    var lightboxHtml = '<div id="lightbox-overlay" style="display:none;"><div id="lightbox-content"><span id="lightbox-close">&times;</span><img id="lightbox-img" src="" alt=""></div></div>';
    $('body').append(lightboxHtml);

    $('.lightbox-trigger').on('click', function(e) {
        e.preventDefault();
        var src = $(this).attr('src') || $(this).data('src');
        $('#lightbox-img').attr('src', src);
        $('#lightbox-overlay').fadeIn(300);
    });

    $('#lightbox-close, #lightbox-overlay').on('click', function(e) {
        if (e.target !== $('#lightbox-img')[0]) {
            $('#lightbox-overlay').fadeOut(300);
        }
    });

    /* 4. Live Search Filter (shop.html) */
    $('#product-search').on('input', function() {
        var query = $(this).val().toLowerCase().trim();
        $('.product-card').each(function() {
            var text = $(this).text().toLowerCase();
            if (text.indexOf(query) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    /* 5. Interactive Leaflet Map (contact.html) */
    if ($('#contact-map').length) {
        /* Coordinates for Dainfern */
        var map = L.map('contact-map').setView([-25.9928, 28.0163], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        L.marker([-25.9928, 28.0163]).addTo(map)
            .bindPopup('<b>Blossom Bloom</b><br>Delivering fresh to Dainfern and surrounds.')
            .openPopup();
    }

    /* 6. Scroll Animations */
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(function(el) {
            observer.observe(el);
        });
    }

});
