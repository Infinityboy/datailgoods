$(function(){
    var oMove =$('.row-fluid'),
        aImgs =$('.row-fluid img'),
        cls = aImgs.data('id'),
    imgWidth = aImgs[0].offsetWidth;
    oMove.css({width:aImgs.length*imgWidth+'px'});
    $(document).on('touchstart', '.row-fluid', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.targetTouches[0];
        startPos = {startX: touch.pageX, startY: touch.pageY};
    });
    $(document).on('touchmove', '.row-fluid', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.targetTouches[0];
        endPos = {endX: touch.pageX, endY: touch.pageY};
    });
    $(document).on('touchend', '.row-fluid', function (e) {
        e.preventDefault();
        var disX = endPos.endX - startPos.startX;
        var disY = endPos.endY - startPos.startY;
        if (Math.abs(disX) > Math.abs(disY) && disX > 0) {
            var right = 'lr';
            if(cls==aImgs.data('id') && right == 'lr'){
            }else{
                cls--;
                var disR = -imgWidth*cls;
                oMove.css({transition: "-webkit-transform 350ms ease-out",
                    transform: 'translateX('+disR+'px)'});

            }
        } else if (Math.abs(disX) > Math.abs(disY) && disX < 0) {
            var left = 'rl';
            if(cls==aImgs.length-1 && left == 'rl'){
            }else{
                cls++;
                var disL = -imgWidth*cls;
                oMove.css({transition: "-webkit-transform 350ms ease-out",
                    transform: 'translateX('+disL+'px)'});
            }
        }
        $('.goods-tab li').eq(cls).addClass('selected').siblings().removeClass('selected');
    });
    //$(document).on('click','.search-all',function(e){
    //    e.preventDefault();
    //    $(this).siblings().css({display:'block'});
    //});
    //$(document).on('click','.all-num',function(e){
    //    e.preventDefault();
    //    $(this).css({display:'none'});
    //});

});
