$(function(){
    $(".button").on("click",function(){
        $("body").toggleClass("buttonClicked");
    });
    $(".navList li").hover(function(){
        $(this).addClass("hovered").siblings().removeClass("hovered");
    },function(){
        $(this).removeClass("hovered");
    })
})