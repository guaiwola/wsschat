const fs=require('fs');
const path=require('path');
const clearFiles=function(dir){
    const filesPath=path.resolve(__dirname,dir);
    try{
        fs.accessSync(filesPath,fs.constants.R_OK | fs.constants.W_OK);
        const files=fs.readdirSync(filesPath);
        for(let file of files){
            let filePath=path.resolve(filesPath,file);
            fs.stat(filePath,function(err,stats){
                if(err){
                    console.log("文件信息读取失败："+err);
                }
                //birthtime即文件创建时间
                var createTime=stats.birthtimeMs;
                var saveTime=Date.now()-createTime;
                //删除24小时之前的图片
                if(saveTime>=86400000){
                    fs.unlinkSync(filePath);
                }
            })
        }
        console.log("运行清理程序中间件");
    }catch(err){
        // fs.mkdirSync(filesPath);
        console.log("需要清理的文件目录不存在！");
    }
}

module.exports=clearFiles;

