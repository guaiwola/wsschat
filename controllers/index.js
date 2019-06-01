var fs=require('fs');
var path=require('path');
var UUID=require('node-uuid');
var async=require('async');
var root=process.cwd().split("\\")[1];

//判断对象是否为数组的函数
function isArrayFn(value){
    if (typeof Array.isArray === "function") {
    return Array.isArray(value);
    }else{
    return Object.prototype.toString.call(value) === "[object Array]";
    }
    }
//处理首页 GET/
var fn_index=async(ctx,next)=>{
    // ctx.response.type = 'html';
    ctx.render('chat.html',{});
};

//加载聊天室
var fn_chat=(ctx,next)=>{
    // ctx.render('chat.html',{});
    var rs=fs.readFileSync(path.resolve(__dirname,'../views/chat.html'),'utf-8');
    ctx.body=rs;
};


//登入聊天室
var fn_login=async(ctx,next)=>{
    console.log("登入聊天室");
    var userName=ctx.request.body.userName||'',
        headImg=ctx.request.body.headImg||'';
    var userData={
        "id":UUID.v1(),
        "userName":userName,
        "headImg":headImg
    }
    //返回响应
    ctx.body=JSON.stringify(userData);
    //设置cookie
    // var cookieVal=Buffer.from(JSON.stringify(userData)).toString('base64');
    var cookieVal=encodeURIComponent(JSON.stringify(userData));
    ctx.cookies.set('userData',cookieVal,{path:"/",expires:new Date('2020-02-08'), httpOnly:false});
    //读取json文件，写入用户信息
    // fs.readFile(path.resolve(__dirname,'../userData.json'),(err,data) => {
    //     if(!err){
    //         console.log("读取文件成功");
    //         var userDataJson=JSON.parse(data.toString());
    //         userDataJson.data.push(userData);
    //         userDataJson.total=userDataJson.data.length;
    //         fs.writeFile(path.resolve(__dirname,'../userData.json'),JSON.stringify(userDataJson),(err) => {
    //             if(err){
    //                 console.log("写入文件错误："+err);
    //             }else{
    //                 console.log("写入文件成功");
    //             }
    //         });
            
    //     }else{
    //         console.log("读取文件失败："+err);
    //     }
        
    // });
    
    
    
};

//处理登录请求 signin
var fn_signin=async(ctx,next)=>{
    var name=ctx.request.body.name||'',
        password=ctx.request.body.passWord||'';
    console.log(ctx.request.body); 
    if(name==='123'&&password==='123'){
        //登录成功
        ctx.render('signin-ok.html',{
            title:'Sign In Ok',
            name:name,
            signinState:'登录成功！'
        });
    }else{
        //登录失败
        ctx.render('signin-failed.html',{
            title:'失败，知道你为啥失败吗，真让我替你感到悲哀！',
            signinState:'登录失败！'
        });
    }
};


//处理上传图片数据
var fn_uploadImg=async(ctx,next)=>{
    var ctx=ctx;
    saveAndResponseFile(ctx,"image");
}


//处理上传的其他文件
var fn_uploadFile=async(ctx,next)=>{
    var ctx=ctx;
    saveAndResponseFile(ctx,"file");
}

//封装图片、文件存储返回响应函数
function saveAndResponseFile(ctx,fileType){
    var host=ctx.request.host;
    // console.log(host);
    
    //处理多文件
    var files=ctx.request.files.image;
    // console.log(files);

    let res={
        type:fileType,
        oldName:[],
        size:[],
        url:[]
    }
    //存储文件
    function saveFile(file){
        const reader=fs.createReadStream(file.path);
        var ext=file.name.split(".");
        var extName="."+ext[ext.length-1];
        var oldName=null;
        if(ext.length>2){
            //删除数组最后一个元素
            ext.pop();
            oldName=ext.join(".");
        }else{
            oldName=ext[0];
        }
        var fileSize=file.size;
        // console.log("oldName:"+oldName);
        //原文件名写入oldNames数组
        res.oldName.push(oldName);
        res.size.push(fileSize);
        //存储用的唯一文件名
        var fileName=UUID.v1();
        //创建存储路径
        var imageDirName=path.resolve(__dirname, '../static/upload/image/');
        //判断文件夹是否存在，不存在则创建
        try{
            fs.accessSync(imageDirName,fs.constants.R_OK | fs.constants.W_OK);
        }catch(err){
            fs.mkdirSync(imageDirName);
        }
        //返回给前台的文件保存路径
        let filePath = imageDirName + `/${fileName}${extName}`;
        // console.log(filePath);
        //创建写入流
        const writer=fs.createWriteStream(filePath);
        //async模块将异步pipe转为同步无关联pipe
        async.series(
            [
                function(){
                    //同步存储文件
                    reader.pipe(writer);
                }
            ]
        )
        //转义反斜杠，否则地址错误
        var realFilePath=filePath.replace(/\\/g,"/");
        var remoteUrl="http://"+host+realFilePath.split(root)[1];
        // console.log(remoteUrl);
        res.url.push(remoteUrl);
    }
    //如果文件数据是数组，用for of迭代,反之直接存储
    if(isArrayFn(files)){
        for(let file of files){
            saveFile(file);
        }
    }else{
        saveFile(files);
    }
    //返回文件远程地址
    ctx.body=JSON.stringify(res);
}

module.exports={
    'GET/':fn_index,
    'POST/upload':fn_signin,
    'GET/chat':fn_chat,
    'POST/login':fn_login,
    'POST/uploadImg':fn_uploadImg,
    'POST/uploadFile':fn_uploadFile
};
