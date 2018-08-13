
//  连接客户端
function wSConnect( name, path , targetEvent , childEvent ) {

    var target  = require('./ws')( path ,targetEvent );

    target.on('close', function(){

        console.log('与通讯模块断开端连接');
        setTimeout(function(){
            target = wSConnect( name , path , targetEvent);
        },1000);
    });

    return target;

}; 

module.exports = exports = wSConnect;
