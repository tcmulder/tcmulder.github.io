var svgAngle = {
    init: function(){

        // set initial properties
        svgAngle.$win = $(window);
        svgAngle.$bod = $('body');
        svgAngle.$doc = $(document);
        svgAngle.$style = $('#js-timeline-style');

        // first run
        svgAngle.rotate();

        // run on resize
        svgAngle.$win.resize(function(){
            if(window.angleTimer){
                window.clearTimeout(angleTimer);
            }
            window.angleTimer = window.setTimeout(svgAngle.rotate, 100);
        });


    },
    rotate: function(){
        var isPortrait = svgAngle.$win.height() > svgAngle.$win.width();
        isPortrait ? svgAngle.$bod.addClass('portrait') : svgAngle.$bod.removeClass('portrait');
        var angle = 90 - (180 * Math.atan2(svgAngle.$doc.width(),svgAngle.$doc.height()));
        angle = angle > 20 ? angle : 20;
        var curStyles = svgAngle.$style.html();
        var newStyles = curStyles.replace(/\([0-9.]*deg\)/i, '('+angle+'deg)');
        svgAngle.$style.html(newStyles);
    }
};



// var svgAngle = function($win, $bod, $doc){
//     var isPortrait = $win.height() > $win.width();
//     isPortrait ? $bod.addClass('portrait') : $bod.removeClass('portrait');
//     var angle = 90 - (180 * Math.atan2($doc.width(),$doc.height()));
//     angle = angle > 20 ? angle : 20;

//     $('#js-timeline-style').html();
//     // var bg = $this.css('background-image');
//     // var bgAngled = bg.replace(/rotate\([0-9.]*deg\)/i, 'rotate('+angle+'deg)');;
//     // $this.css('background-image', bgAngled);
//     console.log('test');
// };
jQuery(function($){
    svgAngle.init();
});




// $('.js-bg-logo').each(function(){
//     var $this = $(this);
//     var isPortrait = $win.height() > $win.width();
//     isPortrait ? $bod.addClass('portrait') : $bod.removeClass('portrait');
//     var angle = 90 - (180 * Math.atan2($doc.width(),$doc.height()));
//     angle = angle > 20 ? angle : 20;
//     var bg = $this.css('background-image');
//     var bgAngled = bg.replace(/rotate\([0-9.]*deg\)/i, 'rotate('+angle+'deg)');;
//     $this.css('background-image', bgAngled);
// });
// console.log('test');