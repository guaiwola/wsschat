/**
 * 根据窗口宽度判断是否是移动端
 */
var mobile = false;
var sendBox;
if (window.innerWidth <= 750) {
    mobile = true;
}

/**
 * 使用原生JS实现jQuery的addClass, removeClass, hasClass函数功能
 */
function addClass(obj, cls) {
    var obj_class = obj.className,//获取 class 内容.
        blank = (obj_class != '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
    added = obj_class + blank + cls;//组合原来的 class 和需要添加的 class.
    obj.className = added;//替换原来的 class.
}

function removeClass(obj, cls) {
    var obj_class = ' ' + obj.className + ' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
    obj_class = obj_class.replace(/(\s+)/gi, ' '),//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
        removed = obj_class.replace(' ' + cls + ' ', ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
    removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
    obj.className = removed;//替换原来的 class.
}

function hasClass(obj, cls) {
    var obj_class = obj.className,//获取 class 内容.
        obj_class_lst = obj_class.split(/\s+/);//通过split空字符将cls转换成数组.
    x = 0;
    for (x in obj_class_lst) {
        if (obj_class_lst[x] == cls) {//循环数组, 判断是否包含cls
            return true;
        }
    }
    return false;
}

/**
 * 封装xhr方法
 */
var Ajax = {
    get: function (url, fn) {
        // XMLHttpRequest对象用于在后台与服务器交换数据   
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            // readyState == 4说明请求已完成
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                // 从服务器获得数据 
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send();
    },
    // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
    post: function (url, data, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // 添加http头，发送信息至服务器时内容编码类型
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send(data);
    }
};

function AjaxFormData(element, interface, fn) {
    var xhr;
    function createXMLHttpRequest() {
        if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        else if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
    }
    function UpladFile() {
        var fileObj = element.files;
        var FileController = interface;
        var form = new FormData();
        var len = fileObj.length;
        for (var i = 0; i < len; i++) {
            form.append("image", fileObj[i]);
        }
        // form.append("image", fileObj[0]);
        createXMLHttpRequest();
        xhr.onreadystatechange = handleStateChange;
        xhr.upload.onprogress=function (ev){
            //如果ev.lengthComputable为true就可以开始计算上传进度
            //上传进度 = 100* ev.loaded/ev.total
            if(ev.lengthComputable){
                sendBox.isuploadFile=true;
                var precent=100 * ev.loaded/ev.total;
                console.log(precent);
                //更改进度条，及百分比
                sendBox.processBarWidth=precent+'%';
                sendBox.processText=Math.floor(precent)+'%';
                if(precent==100){
                    sendBox.isuploadFile=false;
                    sendBox.processBarWidth=0;
                    sendBox.processText="";
                }
            }else{
                console.log("无法计算上传进度");
            }
        }
        xhr.open("post", FileController, true);
        xhr.send(form);
    }
    function handleStateChange() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 0) {
                fn.call(this, xhr.responseText);
            }
        }
    }
    UpladFile();
}

/**
 * 封装cookie方法
 */
//设置cookie
function setCookie(objName, objValue, objHours) {
    var str = objName + "=" + encodeURIComponent(objValue);
    var date = new Date();
    if (objHours > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失
        var ms = objHours * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toGMTString();
    } else if (objHours < 0) {
        date.setTime(date.getTime() - 1000);
        str += "; expires=" + date.toGMTString();
    }
    document.cookie = str;
}
//读Cookie
function getCookie(objName) {//获取指定名称的cookie的值
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName) return decodeURIComponent(temp[1]);
    }
    return "";
}

/**
 * 封装获取元素样式的函数
 */
function getStyle(element, attr) {
    if (element.currentStyle) {
        return element.currentStyle[attr];
    } else {
        return window.getComputedStyle(element, null)[attr];
    }
}

/**
 * 浏览器消息通知
 */
function showNotice() {
    if (window.Notification) {
        Notification.requestPermission(function (perm) {
            if (perm == "granted") {
                var notification = new Notification("您有一条新消息:", {
                    icon: "https://static.cnblogs.com/images/adminlogo.gif",
                    body: "通知content"
                });
            }
        });
    } else {
        alert("您的浏览器不支持Notification！");
    }

}

var title=document.title;
var titleText=[title,"[ 消息提醒 ]"];
var step=1000;
var index=0;
var titleTimer;
// 新消息选项卡闪烁
function tishi(){
    // 防止重复注册定时器
    if(titleTimer){
        clearTimeout(titleTimer);
    }
    document.title=titleText[index];
    index++;
    if(index>=titleText.length){
        index=0;
    }
    titleTimer=setTimeout(tishi, step);
}
// 点击页面停止闪烁
function clearTishi(){
    clearTimeout(titleTimer);
    document.title=title;
}
document.onclick=clearTishi;
// var inputBoxIframe=document.getElementById("inputBoxIframe");
// inputBoxIframe.onload=function(){
//     inputBoxIframe.contentWindow.document.getElementById("inputBox").onfocus=function(){
//         clearTishi();
//         console.log(111);
//     };
// }




/**
 * 判断浏览器是否最小化
 */
function isMinStatus() {
    var isMin = false;
    if (window.outerWidth != undefined) {
        isMin = window.outerWidth <= 160 && window.outerHeight <= 27;
    }
    else {
        isMin = window.screenTop < -30000 && window.screenLeft < -30000;
    }
    return isMin;
}

/**
 * 自定义滚动过渡动画
 * element=需要滚动的元素
 * curScrollTop=滚动前的滚动高度
 * toScrollTop=滚动至该滚动高度
 * duration=滚动持续时间
 * smooth=控制动画平滑程度，值大于0，数值越小越平滑，性能开销越大
 */
function scrollAnimate(element, curScrollTop, toScrollTop, duration, smooth) {
    //元素内容高度大于其本身高度即时运行动画
    if (element.clientHeight < element.scrollHeight) {
        //滚动距离
        var distance = toScrollTop - curScrollTop,
            step = Math.floor(distance / duration * smooth);//计算每smooth毫秒滚动的距离，向下取整
        var s = curScrollTop;
        //定时器
        var timer;
        //缓动函数
        var loop = function () {
            //滚动超过目标位置停止滚动（循环）
            if ((distance > 0 && s >= toScrollTop) || (distance < 0 && s <= toScrollTop)) {
                // console.log(2);
                clearTimeout(timer);
                // console.log(3);
                return;
            }
            s += step;
            // console.log(s);
            //滚动
            element.scrollTop = s;
            //使用setTimeout调用自己实现循环
            timer = setTimeout(loop, smooth);
        }
        loop();
    }
}

/**
 *计算字符串长度
 */

var sizeof = function (str, charset) {

    var total = 0,

        charCode,

        i,

        len;

    charset = charset ? charset.toLowerCase() : '';

    if (charset === 'utf-16'
        || charset === 'utf16') {

        for (i = 0, len = str.length; i < len; i++) {

            charCode = str.charCodeAt(i);

            if (charCode <= 0xffff) {

                total += 2;

            } else {

                total += 4;

            }

        }

    } else {

        for (i = 0, len = str.length; i < len; i++) {

            charCode = str.charCodeAt(i);

            if (charCode <= 0x007f) {

                total += 1;

            } else
                if (charCode <= 0x07ff) {

                    total += 2;

                } else
                    if (charCode <= 0xffff) {

                        total += 3;

                    } else {

                        total += 4;

                    }

        }

    }

    return total;

}
/**
 * 移动端浮层滚动穿透解决方案
 */
var body = document.querySelector('body');
function bodyNoScroll() {
    addClass(body, "noscroll");
}
bodyNoScroll();
function bodyScroll() {
    removeClass(body, "noscroll");
}


/**
 * 设置导航栏头像
 */
function setNavHead(obj) {
    if (getCookie("userData")) {
        var cookie = JSON.parse(getCookie("userData"));
        obj.headImg = cookie.headImg;
        obj.userName = cookie.userName;
    }
}

/**
 * 消息发送接收
 * */
var ws;//全局websocket
var autoScroll = true;//用户手动滚动消息列表时
var host = location.host;
function creatWebsocket() {
    ws = new WebSocket("ws://" + host + "/chat");
    // 接收服务器返回的消息
    ws.onmessage = function (msg) {
        var ms = JSON.parse(msg.data);
        if (ms.type == "list") {
            var users = ms.data;
            userListBox.userList = users;
        } else {
            var id = ms.user.id;
            var localId = JSON.parse(getCookie("userData")).id;
            // console.log(`id: ${id}, localId: ${localId}`);
            if (id == localId) {
                ms.self = true;
            } else {
                ms.self = false;
                // 提示音
                document.getElementById("newMessageSound").play();
                // 选项卡标题闪烁
                tishi();
            }
            //判断是短字符串消息还是图片链接
            if (ms.type == "chat") {
                // var reg = /(?<!\<.*)[A-Za-z]+[-A-Za-z0-9+/:]+\.{1}[-A-Za-z0-9+&@#/%?=~_|!:]+\.{1}\/{0,2}[-A-Za-z0-9+&@#/%?=~_|!:.]*/g;
                var reg = /[A-Za-z]+[-A-Za-z0-9+/:]+\.{1}\/{0,2}[-A-Za-z0-9+&@#/%?=~_|!:.]*/g;
                var regMathImg = /[\<].*[A-Za-z]+[-A-Za-z0-9+/:]+\.{1}\/{0,2}[-A-Za-z0-9+&@#/%?=~_|!:.]*/g;
                var MsData = ms.data;
                // console.log(MsData);
                var newData = null;
                if (!MsData.match(regMathImg)) {
                    newData = MsData.replace(reg, function (a) {
                        if (a.indexOf("http") == -1 && a.indexOf("ftp") == -1) {
                            return "<a href='http://" + a + "' target='_blank'>" + a + "</a>";
                        } else {
                            return "<a href='" + a + "' target='_blank'>" + a + "</a>";
                        }
                    });
                } else {
                    newData = MsData;
                }
                var regBase64 = /^(data:image)\/[A-Za-z]{2,4};base64/;
                if (newData.match(regBase64)) {
                    newData = "<img src='" + newData + "'/>"
                }
                ms.data = newData;
            } else if (ms.type == "image") {
                //如果是图片地址，将地址放在img标签中
                ms.data = "<img src='" + ms.data + "'/>";
            }else if(ms.type == "file"){
                let fileOldName=ms.data.oldName;//文件名
                let exc="."+ms.data.fileData.split(".").pop();//后缀
                let fileName=fileOldName+exc;
                let fileSize=ms.data.size;
                if(fileSize<1024){
                    fileSize=fileSize+"B";
                }else if(fileSize>=1024&&fileSize<1024*1024){
                    fileSize=Math.round(fileSize/1024)+"KB";
                }else if(fileSize>=1024*1024&&fileSize<1024*1024*1024){
                    fileSize=Math.round(fileSize/(1024*1024))+"MB";
                }else if(fileSize>=1024*1024*1024){
                    fileSize=Math.round(fileSize/(1024*1024*1024))+"GB";
                }

                ms.data ="<a href='"+ms.data.fileData+"' class='downloadFile' download='"+fileOldName+"' title='"+fileName+"'><div class='fileName'>"+fileName+"</div><div class='fileSize'>"+fileSize+"</div></a>";
            }
            chatBox.messageList.push(ms);
            //收到消息自动滚动列表
            if (autoScroll) {
                setTimeout(function () {
                    var chatInnerBox = document.getElementById("chatInnerBox");
                    var computedScrollHeight = chatInnerBox.scrollHeight;
                    // chatInnerBox.scrollTop=computedScrollHeight;
                    scrollAnimate(chatInnerBox, chatInnerBox.scrollTop, computedScrollHeight, 300, 10);
                }, 200);
            };
            // 如果最小化，弹出通知
            if (isMinStatus()) {
                showNotice();
            }
        }
    }
};

/**
 * 登录聊天服务
 */
var logTimer = false;
var login = new Vue({
    el: "#login",
    data: {
        unSubmit: true,
        userName: "",
        headUrl: "../static/img/chat/head/headimg04.jpg",
        headImgDisplay: "headImgDisplay",
        loginWrap: "loginWrap",
        isChoice: false,
        imgUrlList: [
            "../static/img/chat/head/headimg01.jpg",
            "../static/img/chat/head/headimg02.jpg",
            "../static/img/chat/head/headimg03.jpg",
            "../static/img/chat/head/headimg04.jpg",
            "../static/img/chat/head/headimg05.jpg",
            "../static/img/chat/head/headimg06.jpg",
            "../static/img/chat/head/headimg07.jpg",
            "../static/img/chat/head/headimg08.jpg",
            "../static/img/chat/head/headimg09.jpg",
            "../static/img/chat/head/headimg10.jpg",
            "../static/img/chat/head/headimg11.jpg",
            "../static/img/chat/head/headimg12.jpg",
            "../static/img/chat/head/headimg13.jpg",
            "../static/img/chat/head/headimg14.jpg",
            "../static/img/chat/head/headimg15.jpg",
            "../static/img/chat/head/headimg16.jpg",
            "../static/img/chat/head/headimg17.jpg",
            "../static/img/chat/head/headimg18.jpg",
            "../static/img/chat/head/headimg19.jpg",
            "../static/img/chat/head/headimg20.jpg"
        ]
    },
    methods: {
        choiceHeadImg: function () {
            this.isChoice = true;
        },
        headImgIsChoiced: function (event) {
            this.isChoice = false;
            var target = event.target;
            this.headUrl = target.getAttribute("src");
        },
        submitUser: function () {
            if (this.userName == "") {
                alert("请输入昵称");
            } else {
                var data = {
                    "userName": this.userName,
                    "headImg": this.headUrl
                };
                Ajax.post("login", JSON.stringify(data), function (res) {
                    // console.log("发送成功："+res);
                    creatWebsocket();
                    login.unSubmit = false;
                    //移动端下层body恢复滚动
                    bodyScroll();
                    //设置导航栏头像
                    setNavHead(nav);
                });
            }
        },
        checkRepeat: function () {
            clearInterval(logTimer);
            logTimer = setTimeout(function () {
                console.log("wait a minuite")
            }, 300);
        }

    },
    beforeMount: function () {
        //页面加载时检查cookie
        if (getCookie("userData") !== "") {
            creatWebsocket();
            this.unSubmit = false;
            //移动端下层body恢复滚动
            bodyScroll();
        }
    }
})

// 消息窗口
var chatBox = new Vue({
    el: "#chatBox",
    data: {
        messageList: [
            // {"id":15,"type":"chat","user":{"id":"58668720-3ccc-11e9-b2ab-93526726a4ff","userName":"s","headImg":"../static/img/chat/defaultHead/headimg19.jpg"},"data":""}
        ],
        message: "message",
        text: "text",
        emojiShow: false,
        upLoadBoxShow:false,
        desktop: true,
        isCopy: false,
        tipsText: ""
    },
    mounted: function () {
        mobile ? this.desktop = false : this.desktop = true;
        var chatInnerBox = document.getElementById("chatInnerBox");//消息列表，控制滚动
        var scrollTimer = null;
        chatInnerBox.onscroll = function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                var computedScrollHeight = chatInnerBox.scrollHeight;
                var chatInnerBoxHeight = chatInnerBox.clientHeight;
                var userScrollHeight = chatInnerBox.scrollTop + chatInnerBoxHeight;
                // console.log(`"scrollTop:"${chatInnerBox.scrollTop+500}==>"scrollHeight:"${computedScrollHeight}`);
                if (userScrollHeight !== computedScrollHeight) {
                    autoScroll = false;
                } else {
                    autoScroll = true;
                }
                // console.log(autoScroll);
            }, 50);

        };
    },
    methods: {
        copy: function (event) {
            var textNode = event.target.previousElementSibling || event.target.previousSibling;
            var text = textNode.innerText;
            var textarea = document.createElement('textarea');
            textarea.setAttribute('readonly', 'readonly');
            textarea.textContent = text;
            document.body.appendChild(textarea);
            textarea.focus();
            //必须先获得焦点
            textarea.setSelectionRange(0, 999999999);
            if (document.execCommand('copy')) {
                var copyState = document.execCommand('copy');
                if (copyState) {
                    this.tipsText = "复制成功!";
                } else {
                    this.tipsText = "复制失败!";
                }
                this.isCopy = true;
                setTimeout(function () {
                    chatBox.isCopy = false;
                }, 1500);
                // console.log('复制成功');
            }
            document.body.removeChild(textarea);
        },
        reload: function (event) {
            var reload = event.target;
            var image = reload.previousElementSibling.previousElementSibling.children[0];
            var url = image.getAttribute("src");
            var randomUrl = url + "?" + new Date().getTime();
            image.setAttribute("src", randomUrl);
            // console.log(randomUrl);

        }
    }
});
//用户列表
var userListBox = new Vue({
    el: "#userListBox",
    data: {
        userList: [],
        mobileShowUserList: true
    },
    mounted: function () {
        if (mobile) {
            this.mobileShowUserList = false;
        }
    }
})


var cursorPosition = null;
// 消息输入框




//生成上传服务器的消息
function setMessage(type, data,oldName,size) {
    var message = {
        "type": type,
        "oldName":oldName||"",
        "size":size||"",
        "data": data
    }
    return JSON.stringify(message);
}




/**
 * 导航栏切换用户
 */

var nav = new Vue({
    el: "#nav",
    data: {
        userName: "用户名",
        headImg: "../static/img/chat/defaultHead/headimg19.jpg",
        isHover: false,
        navHeadImg: "navHeadImg",
        inLine: "inLine"
    },
    methods: {
        showUserInfo: function () {
            this.isHover = true;
        },
        hideUserInfo: function () {
            this.isHover = false;
        },
        switchUser: function () {
            setCookie("userData", "", -1);
            window.location.reload();
        },
        showUserList: function () {
            var userListIsShow = userListBox.mobileShowUserList;
            if (!userListIsShow) {
                userListBox.mobileShowUserList = true;
            } else {
                userListBox.mobileShowUserList = false;
            }

        }
    },
    mounted: function () {
        //设置导航栏头像
        setNavHead(this);
    }
})

/**
 * 输入框发宋消息
 * httpHost--http://+domain
 */
var httpHost=window.location.href.split("chat")[0];
var sendBox = new Vue({
    el: "#sendBox",
    data: {
        message: "",
        emojiShow: false,
        upLoadBoxShow:false,
        clearfix: "clearfix",
        showSendBtn: true,
        isFocus:false,
        isuploadFile:false,
        processBarWidth:0,
        processText:"",
        emojiList: [
            {
                "url": httpHost+"static/img/chat/emoji/hbf2019_jinli_thumb.png",
                "title": "锦鲤"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zhongguozan_org.png",
                "title": "中国赞"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_erha_org.png",
                "title": "二哈"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_baobao_thumb.png",
                "title": "抱抱"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_tanshou_org.png",
                "title": "摊手"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_gui_org.png",
                "title": "跪了"
            },
            {
                "url": httpHost+"static/img/chat/emoji/hot_wosuanle_thumb.png",
                "title": "酸"
            },
            {
                "url": httpHost+"static/img/chat/emoji/hot_pigpeiqi_thumb.png",
                "title": "佩奇"
            },
            {
                "url": httpHost+"static/img/chat/emoji/hot_pigqiaozhi_thumb.png",
                "title": "乔治"
            },
            {
                "url": httpHost+"static/img/chat/emoji/fulian_jingqiduixhang_thumb.png",
                "title": "惊奇队长"
            },
            {
                "url": httpHost+"static/img/chat/emoji/pikaqiu_weixiao_thumb.png",
                "title": "大侦探皮卡丘微笑"
            },
            {
                "url": httpHost+"static/img/chat/emoji/film_minilove_thumb.png",
                "title": "米妮爱你"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_miaomiao_thumb.png",
                "title": "喵喵"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_doge02_org.png",
                "title": "doge"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_aini_org.png",
                "title": "爱你"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_kuxiao_org.png",
                "title": "允悲"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_beishang_org.png",
                "title": "悲伤"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_chijing_org.png",
                "title": "吃惊"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_touxiao_org.png",
                "title": "偷笑"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ningwen_org.png",
                "title": "疑问"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_youhengheng_thumb.png",
                "title": "右哼哼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_hufen02_org.png",
                "title": "互粉"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ding_org.png",
                "title": "顶"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_wu_thumb.png",
                "title": "污"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_haixiu_org.png",
                "title": "害羞"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_kelian_org.png",
                "title": "可怜"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_shiwang_thumb.png",
                "title": "失望"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_shengbing_thumb.png",
                "title": "生病"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_chongjing_org.png",
                "title": "憧憬"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_heixian_thumb.png",
                "title": "黑线"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_kouzhao_thumb.png",
                "title": "感冒"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_qinqin_thumb.png",
                "title": "亲亲"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_bingbujiandan_thumb.png",
                "title": "并不简单"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_yun_thumb.png",
                "title": "晕"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_chigua_thumb.png",
                "title": "吃瓜"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_dalian_org.png",
                "title": "打脸"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_keai_org.png",
                "title": "可爱"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_han_org.png",
                "title": "汗"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_xiaoerbuyu_org.png",
                "title": "笑而不语"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_chanzui_org.png",
                "title": "馋嘴"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zhuakuang_org.png",
                "title": "抓狂"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_taikaixin_org.png",
                "title": "太开心"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_huaixiao_org.png",
                "title": "坏笑"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_tu_org.png",
                "title": "吐"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_huaxin_org.png",
                "title": "色"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_weixioa02_org.png",
                "title": "微笑"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_xiaoku_thumb.png",
                "title": "笑cry"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ku_org.png",
                "title": "酷"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_shuai_thumb.png",
                "title": "衰"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_heng_thumb.png",
                "title": "哼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_sikao_org.png",
                "title": "思考"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_nu_thumb.png",
                "title": "怒"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_guzhang_thumb.png",
                "title": "鼓掌"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_qian_thumb.png",
                "title": "钱"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_kun_thumb.png",
                "title": "困"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_tianping_thumb.png",
                "title": "舔屏"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_baibai_thumb.png",
                "title": "拜拜"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_xu_org.png",
                "title": "嘘"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zuohengheng_thumb.png",
                "title": "左哼哼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_yinxian_org.png",
                "title": "阴险"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zhouma_thumb.png",
                "title": "怒骂"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_wenhao_thumb.png",
                "title": "费解"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_jiyan_org.png",
                "title": "挤眼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_bizui_org.png",
                "title": "闭嘴"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_xixi_thumb.png",
                "title": "嘻嘻"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_dahaqian_org.png",
                "title": "哈欠"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_weiqu_thumb.png",
                "title": "委屈"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_leimu_org.png",
                "title": "泪"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_bishi_org.png",
                "title": "鄙视"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_haha_thumb.png",
                "title": "哈哈"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_shayan_org.png",
                "title": "傻眼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_wabi_thumb.png",
                "title": "挖鼻"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_shuijiao_thumb.png",
                "title": "睡"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_landelini_org.png",
                "title": "白眼"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_no_org.png",
                "title": "NO"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zan_org.png",
                "title": "赞"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_zuoyi_org.png",
                "title": "作揖"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_woshou_thumb.png",
                "title": "握手"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ok_org.png",
                "title": "ok"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_good_org.png",
                "title": "good"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ruo_org.png",
                "title": "弱"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_jiayou_org.png",
                "title": "加油"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_guolai_thumb.png",
                "title": "来"
            },
            {
                "url": httpHost+"static/img/chat/emoji/2018new_ye_thumb.png",
                "title": "耶"
            }
        ]
    },
    methods: {
        sendMessage: function () {
            var inputBox = inputIframe.contentWindow.document.getElementById("inputBox");
            var message = inputBox.innerHTML;
            if (message !== "") {
                if (sizeof(message, "utf8") <= 51200) {
                    var textMessage = setMessage("text", message);
                    ws.send(textMessage);
                    inputBox.innerHTML = "";
                    if(!this.emojiShow){
                        inputBox.focus();
                    }
                } else {
                    alert("字符串体积过大(大于50kb),请分段发送！");
                }
            } else {
                // alert("不能为空");
            }
        },
        showUpLoadBox: function () {
            if (!this.upLoadBoxShow) {
                this.upLoadBoxShow=true;
                chatBox.upLoadBoxShow=true;
            } else {
                this.upLoadBoxShow=false;
                chatBox.upLoadBoxShow=false;
            }
            this.emojiShow=false;
            chatBox.emojiShow=false;
        },
        submitImg: function (event) {
            AjaxFormData(event.target, "uploadImg", function (result) {
                var resultJson = JSON.parse(result);
                // console.log(resultJson.url);
                var ImageMessage = setMessage(resultJson.type, resultJson.url);
                ws.send(ImageMessage);
                event.target.value="";
            })
            // this.upLoadBoxShow=false;
            // chatBox.upLoadBoxShow=false;
        },
        submitFile: function (event) {
            AjaxFormData(event.target, "uploadFile", function (result) {
                var resultJson = JSON.parse(result);
                var fileMessage = setMessage(resultJson.type, resultJson.url,resultJson.oldName,resultJson.size);
                ws.send(fileMessage);
            })
            // this.upLoadBoxShow=false;
            // chatBox.upLoadBoxShow=false;
        },
        choiceEmoji: function (event) {
            emojiShowStatus=1;
            var emojiImg = event.currentTarget.cloneNode(true);
            emojiImg.style.width = "20px";
            emojiImg.style.height = "20px";
            emojiImg.style.margin = "0 3px";
            emojiImg.style.verticalAlign = "middle";
            inputIframe.contentWindow.focusBox(emojiImg.outerHTML);
            sendBox.changeSendBtnShow();
            //移动端选择表情时让元素失去焦点从而屏蔽键盘
            if(mobile){
                document.activeElement.blur();//屏蔽默认键盘弹出；
            }
        },
        showEmojiBOX: function () {
            if (!this.emojiShow) {
                this.emojiShow = true;
                chatBox.emojiShow = true;
            } else {
                this.emojiShow = false;
                chatBox.emojiShow = false;
            }
            this.upLoadBoxShow=false;
            chatBox.upLoadBoxShow=false;
        },
        changeSendBtnShow: function () {
            if (mobile) {
                this.showSendBtn = true;
            }
        },
        changeSendBtnHide: function () {
            if (mobile) {
                this.showSendBtn = false;
            }
        },
        checkClick: function () {
            console.log("click");
        }
    }
});
if (window.innerWidth <= 750) {
    mobile = true;
    sendBox.showSendBtn = false;
}

//输入框iframe
var inputIframe = document.getElementById("inputBoxIframe");
inputIframe.onload=function(){
    //初始化浮动窗口输入框，去掉多余的script标签
    var iframeInputBox=inputIframe.contentWindow.document.getElementById("inputBox");
    iframeInputBox.innerHTML="";
    iframeInputBox.onfocus=function(){
        sendBox.changeSendBtnShow();
        sendBox.isFocus=true;
    };
    iframeInputBox.onkeyup=function(){
        sendBox.changeSendBtnShow();
        clearTishi();
    };
    iframeInputBox.onpaste=function(){
        sendBox.changeSendBtnShow();
    };
    iframeInputBox.onblur=function(){
        if(iframeInputBox.innerHTML==""){
            sendBox.changeSendBtnHide();
        }
        sendBox.isFocus=false;
    }
    iframeInputBox.onclick=function(){
        if(mobile){
            sendBox.emojiShow=false;
            chatBox.emojiShow=false;
        }
        clearTishi();
    }
}

// 设置假网页

function showBossFrame(){
    bossFrame.isShow=true;
}
function hideBossFrame(){
    bossFrame.isShow=false;
}
function switchBossFrame(e){
    var eventKeyCode=e.keyCode||e.which||e.charCode;
    var eventCtrlKey=e.ctrlKey ||e.altKey|| e.metaKey;
    if(eventCtrlKey&&eventKeyCode==81){
        if(!bossFrame.isShow){
            showBossFrame();
        }else{
            hideBossFrame();
        }
    }
}
var bossFrame=new Vue({
    el:"#bossFrame",
    data:{
        frameSrc:"##",
        isShow:false
    },
    methods:{
        
    }
})
// 聊天窗口切换Boss窗口
document.onkeydown=switchBossFrame;

var bossIFrame=document.getElementById("bossFrame");
bossIFrame.onload=function(){
    bossIFrame.onkeydown=switchBossFrame;
}

/**
 * 设置loading图片隐藏
 */
var loading = document.querySelector(".superMask");
addClass(loading, "superMaskAction");