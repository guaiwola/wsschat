(function(){
//防抖函数
var debounce=function(action,delay){
return function(){
clearTimeout(timer);
var timer=setTimeout(function(){
action.call(this, arguments);
},delay);
}
}
//设备像素比
var dpr=window.devicePixelRatio;
var scale=1/dpr;
//设置meta标签
document.querySelector("meta[name=viewport]").setAttribute("content","width=device-width, initial-scale="+scale+",user-scalable=no,maximum-scale="+scale+",minimum-scale="+scale+"");
//设置html字体大小，以750px设计稿为标准
var resize=function(){
var deviceWidth=document.documentElement.clientWidth>1200 ? 1200 : document.documentElement.clientWidth;
document.documentElement.style.fontSize=(deviceWidth/7.5)+"px";
};
resize();
//窗口大小改变时修改html字体大小
window.onresize=debounce(resize,50);
})()