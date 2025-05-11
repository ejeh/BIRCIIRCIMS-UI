/*snap menu*/

    function onePageMenu() {

        // animate a regular anchor navigation with offset -100px
        $('body').localScroll({
            hash: true,
            filter: '.animated',
            onBefore: function(){
                this.offset = -100;
            }
        });

        // highlight menu element on scroll
        calculateScroll();
        $(window).scroll(function(event) {
            calculateScroll();
        });


        /*$("ul#menu").click(function(){
            if( $("ul#menu li").not(".home").css('float') != 'left' ){
                if($("ul#menu").hasClass('showmenu')) {
                    $("ul#menu").removeClass('showmenu');
                    $("ul#menu li").css('display','none');
                } else {
                    $("ul#menu").addClass('showmenu');
                    $("ul#menu li").css('display','block');
                }
            }
        });
        $(window).resize(function() {
            if( $(window).width() >= 992 ){
                if( $("ul#menu li").css('display' ) == 'none' )
                    $("ul#menu li").css('display','block');
            }
            else{
                $("ul#menu li").css('display','none');
            }
            calculateScroll();
        });*/

        /*  Automatically Highlights Navigation Item */
        var rangeTop        = 200; //rangeTop is used for changing the class a little sooner that reaching the top of the page
        var rangeBottom     = 200; //rangeBottom is similar but used for when scrolling bottom to top
        function calculateScroll() {
            var winTop = $(window).scrollTop();
            var contentTop      = [];
            var contentBottom   = [];
            $('.main_menu').find('a.animated').each(function(){
                contentTop.push( $( $(this).attr('href') ).offset().top );
                contentBottom.push( $( $(this).attr('href') ).offset().top + $( $(this).attr('href') ).height() );
            })

            $.each( contentTop, function(i){
                if ( winTop > contentTop[i] - rangeTop && winTop < contentBottom[i] - rangeBottom ){
                    $('.main_menu > li.active').removeClass('current').eq(i).addClass('current');
                }
            })
        }
        /*--------------*/

    }

    onePageMenu();