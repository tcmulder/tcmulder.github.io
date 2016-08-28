var svgAngle = function(){
    var $win = $(window);
    var $bod = $('body');
    var $doc = $(document);
     $('.page, .page__title').each(function(){
         var $this = $(this);
         var isPortrait = $win.height() > $win.width();
         isPortrait ? $bod.addClass('portrait') : $bod.removeClass('portrait');
         var angle = 90 - (180 * Math.atan2($doc.width(),$doc.height()));
         angle = angle > 20 ? angle : 20;
         var bg = $this.css('background-image');
         var bgAngled = bg.replace(/rotate\([0-9.]*deg\)/i, 'rotate('+angle+'deg)');;
         $this.css('background-image', bgAngled);
     });
};
jQuery(function($){
    svgAngle();
    $(window).resize(svgAngle);
});