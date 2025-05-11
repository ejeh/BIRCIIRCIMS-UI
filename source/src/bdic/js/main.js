 (function ($) {
     "use strict";

     var $constrom_window = $(window);
     var THE = {};
     var plugin_track = 'static/plugin/';

     // ************************
     // :: Preloader Active Code
     // ************************

     $constrom_window.on('load', function () {
         $('#preloader').fadeOut('1000', function () {
             $(this).remove();
         });
     });

     // ****************************
     // :: TOP Menu Active Code
     // ****************************

     if ($.fn.classyNav) {
         $('#onitaNav').classyNav({
             stickyNav: true,
         });
     }

     $(document).ready(function () {
         // *******************************
         // :: Animated Headline Active Code
         // ********************************
         if ($.fn.animatedHeadline) {
             $('.anima-headline').animatedHeadline({
                 animationType: "scale",
                 animationDelay: 2000,
                 barAnimationDelay: 3000,
                 barWaiting: 800,
                 lettersDelay: 50,
                 typeLettersDelay: 150,
                 selectionDuration: 500,
                 typeAnimationDelay: 1000,
                 revealDuration: 600,
                 revealAnimationDelay: 1500
             });
         }

         // ***********************
         // :: Scrollup Active Code
         // ***********************

         if ($.fn.scrollUp) {
             $constrom_window.scrollUp({
                 scrollSpeed: 800,
                 scrollText: '<i class="fa fa-long-arrow-up" aria-hidden="true"></i>'
             });
         }

         // *****************************
         // :: Welcome Slides Active Code
         // *****************************

         if ($.fn.owlCarousel) {
             var welcomeSlider = $('.hero-slider');
             welcomeSlider.owlCarousel({
                 items: 1,
                 loop: true,
                 autoplay: true,
                 smartSpeed: 1000,
                 autoplayTimeout: 5000,
                 navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                 nav: true,
                 dots: true
             })

             welcomeSlider.on('translate.owl.carousel', function () {
                 var layer = $("[data-animation]");
                 layer.each(function () {
                     var anim_name = $(this).data('animation');
                     $(this).removeClass('animated ' + anim_name).css('opacity', '0');
                 });
             });

             $("[data-delay]").each(function () {
                 var anim_del = $(this).data('delay');
                 $(this).css('animation-delay', anim_del);
             });

             $("[data-duration]").each(function () {
                 var anim_dur = $(this).data('duration');
                 $(this).css('animation-duration', anim_dur);
             });

             welcomeSlider.on('translated.owl.carousel', function () {
                 var layer = welcomeSlider.find('.owl-item.active').find("[data-animation]");
                 layer.each(function () {
                     var anim_name = $(this).data('animation');
                     $(this).addClass('animated ' + anim_name).css('opacity', '1');
                 });
             });
         }

         // ************************************
         // :: CLient Slides Active Code
         // ************************************

         if ($.fn.owlCarousel) {
             var clientArea = $('.client-silder');
             clientArea.owlCarousel({
                 items: 2,
                 loop: true,
                 autoplay: false,
                 smartSpeed: 1500,
                 margin: 0,
                 nav: true,
                 navText: ["<i class='ti-angle-left'</i>", "<i class='ti-angle-right'</i>"],
                 dots: false,
                 responsive: {
                     0: {
                         items: 1
                     },
                     768: {
                         items: 2
                     }
                 }
             });
         }

         // ****************************
         // :: Brand Slider Active Code
         // ***************************

         if ($.fn.owlCarousel) {
             var brandActive = $('.brand-active');
             brandActive.owlCarousel({
                 items: 5,
                 loop: true,
                 autoplay: true,
                 smartSpeed: 700,
                 margin: 20,
                 autoplayTimeout: 400,
                 responsive: {
                     0: {
                         items: 2
                     },
                     480: {
                         items: 3
                     },
                     768: {
                         items: 5
                     }
                 }
             });
         }

         // ******************************
         // :: App shot slider Active Code
         // ******************************

         $('.app-shot').slick({
             slidesToShow: 4,
             slidesToScroll: 1,
             autoplay: true,
             speed: 2000,
             autoplaySpeed: 1500,

             responsive: [
                 {
                     breakpoint: 600,
                     settings: {
                         slidesToShow: 2,
                         slidesToScroll: 2
                     }
                        },
                 {
                     breakpoint: 480,
                     settings: {
                         slidesToShow: 1,
                         slidesToScroll: 1
                     }
    },

  ]
         });


         // ****************************
         // :: Init Isotope Active Code
         // ****************************

         var $grid = $('.grid').isotope({
             itemSelector: '.grid-item',
             percentPosition: true,
             masonry: {
                 columnWidth: 1
             }
         });

         // Filter items on button click
         $('.portfolio-menu').on('click', 'button', function () {
             var filterValue = $(this).attr('data-filter');
             $grid.isotope({
                 filter: filterValue
             });
         });

         // For menu active class
         $('.portfolio-menu button').on('click', function (event) {
             $(this).siblings('.active').removeClass('active');
             $(this).addClass('active');
             event.preventDefault();
         });

         // ***************************************
         // :: 11.0 Masonary Gallery Active Code
         // ****************************************

         if ($.fn.imagesLoaded) {
             $('.reen-portfolio').imagesLoaded(function () {
                 // filter items on button click
                 $('.portfolio-menu').on('click', 'button', function () {
                     var filterValue = $(this).attr('data-filter');
                     $grid.isotope({
                         filter: filterValue
                     });
                 });
                 // init Isotope
                 var $grid = $('.reen-portfolio').isotope({
                     itemSelector: '.single_gallery_item',
                     percentPosition: true,
                     masonry: {
                         columnWidth: '.single_gallery_item'
                     }
                 });
             });
         }

         // :: allery Menu Style Active Code
         $('.portfolio-menu button.btn').on('click', function () {
             $('.portfolio-menu button.btn').removeClass('active');
             $(this).addClass('active');
         })

         // **********************
         // :: Wow js Active Code
         // **********************

         if ($constrom_window.width() > 767) {
             new WOW().init();
         }

         // *************************
         // :: Counter Up Active Code
         // *************************

         if ($.fn.counterUp) {
             $('.counter').counterUp({
                 delay: 10,
                 time: 1500
             });
         }

         // *************************************
         // :: MagnificPopup img view Active Code
         // *************************************

         if ($.fn.magnificPopup) {
             $('.popup-image').magnificPopup({
                 type: 'image',
                 gallery: {
                     enabled: true
                 }
             });
         }

         // *************************************
         // :: magnificPopup img view Active Code
         // *************************************

         if ($.fn.magnificPopup) {
             $('.img-pop-up').magnificPopup({
                 type: 'image',
                 gallery: {
                     enabled: true
                 }
             });
         }

         // ***************************************
         // :: 10.0 Magnific-popup Video Active Code
         // ****************************************

         if ($.fn.magnificPopup) {
             $('#videobtn').magnificPopup({
                 type: 'iframe'
             });
             $('.gallery_img').magnificPopup({
                 type: 'image',
                 gallery: {
                     enabled: true
                 },
                 removalDelay: 300,
                 mainClass: 'mfp-fade',
                 preloader: true
             });
         }

         if ($.fn.magnificPopup) {
             $('#videobtn2').magnificPopup({
                 type: 'iframe'
             });
         }
         // ****************************
         // :: Brand Slider Active Code
         // ***************************

         $('.brand-active').owlCarousel({
             loop: true,
             margin: 30,
             items: 1,
             autoplay: true,
             nav: false,
             dots: false,
             autoplayHoverPause: true,
             autoplaySpeed: 500,
             responsive: {
                 0: {
                     items: 1,
                     nav: false

                 },
                 576: {
                     items: 3
                 },
                 768: {
                     items: 4
                 },
                 992: {
                     items: 6
                 }
             }
         });

         // ******************************
         // :: Project  Slider Active Code
         // ******************************

         $('.project-active').owlCarousel({
             loop: true,
             autoplay: true,
             margin: 30,
             items: 1,
             autoplay: true,
             navText: ['<i class="Flaticon flaticon-left-arrow"></i>', '<i class="Flaticon flaticon-right-arrow"></i>'],
             nav: true,
             dots: false,
             responsive: {
                 0: {
                     items: 1,
                     nav: false

                 },
                 767: {
                     items: 1,
                     nav: false
                 },
                 992: {
                     items: 2,
                     nav: false
                 }
             }
         });

         // ******************************
         // :: Avout Pro Slider Active Code
         // ******************************

         $('.about-pro-active').owlCarousel({
             loop: true,
             margin: 30,
             items: 1,
             autoplay: true,
             navText: ['<i class="Flaticon flaticon-left-arrow"></i>', '<i class="Flaticon flaticon-right-arrow"></i>'],
             nav: true,
             dots: false,
             responsive: {
                 0: {
                     items: 1,
                     nav: false

                 },
                 767: {
                     items: 1,
                     nav: false
                 },
                 992: {
                     items: 1,
                     nav: false
                 },
                 1200: {
                     items: 1,
                 }
             }
         });

     });

     // **************************
     // :: Search Box Active Code
     // **************************

     $('.search-btn').on('click', function () {
         $('.search-form').toggleClass('search-form-active');
     })
     
      // ****************************
    // :: Countdown Active Code
    // ****************************
    if ($.fn.countdown) {
        $("#clock").countdown("2021/06/10", function (event) {
            $(this).html(event.strftime("<div>%D <span>Day</span></div> <div>%H <span>Hours</span></div> <div>%M <span>Mins</span></div> <div>%S <span>Secs</span></div>"));
        });
    }

     // **************************
     // :: Nice Delect Active Code
     // **************************

     if (document.getElementById('default-select')) {
         $('select').niceSelect();
     }

     // *********************************
     // :: Prevent Default 'a' Click
     // *********************************
     $('a[href="#"]').on('click', function ($) {
         $.preventDefault();
     });


 })(jQuery);