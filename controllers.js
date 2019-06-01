var fs=require('fs');

function addMapping(router,mapping){
    for(var url in mapping){
        if(url.startsWith('GET')){
            //如果url类似'GET xxx'
            var path=url.substring(3);
            router.get(path,mapping[url]);
            console.log(`从mapping获取的GET路径: GET ${path}`);
        }else if(url.startsWith('POST')){
            var path=url.substring(4);
            router.post(path,mapping[url]);
            console.log(`从mapping获取的POST路径: POST ${path}`);
        }else{
            console.log(`invalid URL: ${url}`);
        }
    }
};

function addControllers(router,dir){
    var files=fs.readdirSync(__dirname+'/'+dir);
    //过滤出js文件
    var js_files=files.filter((f)=>{
        return f.endsWith('.js');
    });
    for(var f of js_files){
        console.log('Process controllers:'+f);
        //导入js文件
        let mapping=require(__dirname+'/controllers/'+f);
        addMapping(router,mapping);
    }
};
module.exports=function(dir){
    let controllers_dir=dir||'controllers',
        router=require('koa-router')();
    addControllers(router,controllers_dir);
    return router.routes();
};