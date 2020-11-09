'use strict'
$(document).ready(function() {
    $('select').niceSelect();

    AOS.init();
    window.addEventListener('load', AOS.refresh);

    $('.testimonial-slider').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 2,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });
    $('.testimonial-slider-l5').slick({
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        responsive: [{
            breakpoint: 575,
            settings: {
                arrows: false,
            }
        }]
    });
    $('.testimonial-slider-l6').slick({
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        responsive: [{
            breakpoint: 575,
            settings: {
                arrows: false,
            }
        }]
    });

    $('#l5-pricing-btn .toggle-btn').on("click", function(e) {
        console.log($(e.target).parent().parent().hasClass("monthly-active"))
        $(e.target).toggleClass("clicked");
        if ($(e.target).parent().parent().hasClass("monthly-active")) {
            $(e.target).parent().parent().removeClass("monthly-active").addClass("yearly-active");
        } else {
            $(e.target).parent().parent().removeClass("yearly-active").addClass("monthly-active");
        }
    })

    $("#pricing-deck-trigger").on("click", function(e) {
        var getActive = $(e.target).attr("data-active");
        $(e.target).addClass("active");
        $(e.target).siblings().removeClass("active");
        if (getActive == "yearly-active" && !$("#pricing-card-deck").hasClass(getActive)) {
            $("#pricing-card-deck").addClass(getActive);
            $("#pricing-card-deck").removeClass("monthly-active");
        }
        if (getActive == "monthly-active" && !$("#pricing-card-deck").hasClass(getActive)) {
            $("#pricing-card-deck").addClass(getActive);
            $("#pricing-card-deck").removeClass("yearly-active");
        }
    })



    $('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
            $('.dropdown-submenu .show').removeClass("show");
        });

        return false;
    });


    $('.count-btn').on('click', function() {
        var $button = $(this);
        var oldValue = $button.parent('.count-input-btns').parent().find('input').val();
        if ($button.hasClass('inc-ammount')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent('.count-input-btns').parent().find('input').val(newVal);
    });


    window.onscroll = function() {
        scrollFunction()
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            $(".sticky-header").addClass("scrolling");
        } else {
            $(".sticky-header").removeClass("scrolling");
        }
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            $(".sticky-header.scrolling").addClass("reveal-header");
        } else {
            $(".sticky-header.scrolling").removeClass("reveal-header");
        }
    }
})




$(window).load(function() {
    setTimeout(function() {
        $('#loading').fadeOut(500);
    }, 1000);
    setTimeout(function() {
        $('#loading').remove();
    }, 2000);
})




$(document).ready(function() {
    // Add smooth scrolling to all links
    $(".goto").on('click', function(event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();
            // Store hash
            var hash = this.hash;
            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 2000, function() {
                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });
});