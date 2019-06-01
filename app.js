//导入koa
const url=require('url');
const Koa=require('koa');
const bodyParser=require('koa-bodyparser');
const koaBody = require('koa-body');
const controllers=require('./controllers');
const templating=require('./templating');
const WebSocket=require('ws');
const Cookie=require('cookies');
const clearFiles=require('./clearFiles');
var path=require('path');
//创建一个koa对象表示webapp本身
const app=new Koa();

//解析cookie，获取用户名
// app.use(async (ctx, next) => {
//     ctx.state.user = parseUser(ctx.cookies.get('userData') || '');
//     await next();
// });

// 记录URL以及页面执行时间
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

//处理静态文件
//判断是否是生产环境，cmd set NODE_ENV可查询当前NODE_ENV环境变量
const isProduction = process.env.NODE_ENV === 'production';

let staticFiles = require('./staticFiles');
app.use(staticFiles('/static/', __dirname + '/static'));

app.use(koaBody({
    multipart:true,
    strict  : false,
    formidable:{
        maxFileSize:100*1024*1024*1024,
        multipart:true
    }
}));
app.use(bodyParser());



//负责给ctx加上render()来使用Nunjucks
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

//处理URL路由
app.use(controllers());


let server=app.listen(3000);
let WebSocketServer=WebSocket.Server;


//处理cookie
function parseUser(obj) {
    if (!obj) {
        return;
    }
    console.log('try parse: ' + obj);
    let s = '';
    if (typeof obj === 'string') {
        s = obj;
    } else if (obj.headers) {
        let cookies = new Cookie(obj, null);
        s = cookies.get('userData');
    }
    if (s) {
        try {
            let user = JSON.parse(decodeURIComponent(s));
            console.log(`cookie解析：User: ${user.userName}, ID: ${user.id}`);
            return user;
        } catch (e) {
            // ignore
        }
    }
};

function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    let wss = new WebSocketServer({
        server: server
    });
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function(client) {
            client.send(data);
        });
    };
    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, message) {
        console.log(`[WebSocket] closed: ${code} - ${message}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };
    wss.on('connection', function (ws,req) {
        let location = url.parse(req.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        if (location.pathname !== '/chat') {
            // close ws:
            ws.close(4000, 'Invalid URL');
        }
        // check user:
        let user = parseUser(req);
        if (!user) {
            ws.close(4001, 'Invalid user');
        }
        ws.user = user;
        ws.wss = wss;
        onConnection.apply(ws);
    });
    console.log('WebSocketServer 已连接');
    return wss;
}

var messageIndex = 0;

function createMessage(type, user, data) {
    messageIndex ++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnect() {
    let user = this.user;
    let msg = createMessage('join', user, `${user.userName} 加入聊天队列...`);
    this.wss.broadcast(msg);
    console.log(`${user.userName} 已连接服务...`);
    // build user list:
    let users = Array.from(this.wss.clients).map(function (client) {
        return client.user;
    });
    this.wss.broadcast(createMessage('list',user, users));
}

function onMessage(message) {
    let user = this.user;
    console.log(`${user.userName} ：${message}...`);
    if (message && message.trim()) {
        let userMessage=JSON.parse(message);
        if(userMessage.type=="text"){
            let msg = createMessage('chat', user, userMessage.data);
            this.wss.broadcast(msg);
        }else if(userMessage.type=="image"){
            let imageList=userMessage.data;
            let len=imageList.length;
            for(let i=0;i<len;i++){
                var imageUrl=createMessage(userMessage.type,user,imageList[i]);
                this.wss.broadcast(imageUrl);
            }
        }else if(userMessage.type=="file"){
            let fileData={
                "oldName":userMessage.oldName[0],
                "fileData":userMessage.data[0],
                "size":userMessage.size[0]
            };
            let fileUrl=createMessage(userMessage.type,user,fileData);
            this.wss.broadcast(fileUrl);
        }
        
    }
}

function onClose() {
    let user = this.user;
    let msg = createMessage('left',user, `${user.userName} 离开聊天队列...`);
    this.wss.broadcast(msg);
    console.log(`${user.userName} 断开连接...`);
    // build user list:
    let users = Array.from(this.wss.clients).map(function (client) {
        return client.user;
    });
    this.wss.broadcast(createMessage('list',user, users));
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);

//定时删除图片文件夹下的过期（24小时）文件（24小时运行一次）
clearFiles("./static/upload/image/");
console.log("运行清理程序");
setInterval(() => {
    clearFiles("./static/upload/image/");
},86400000);

console.log('app started at port 3000...');

