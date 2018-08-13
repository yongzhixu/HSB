
var WSclient     = require('./ws');

var obj = {
	yourName : function  (data, fn) {
		fn(0,'ok',{name:'test2'});
		xxx.emit('wifi/reset', {}, function(dt){
			console.log(dt)
		});
	},
	wifiStatus : function(data, fn){
		fn(0, 'wifiStatuSuccess', {});
	},
    wifiPassword: function(dt,fn){
        fn(0,'passwordSuccess',{});
    },
    resetStatus: function(dt,fn){
        fn(0,'resetStatus',{});
    },
	wifiPassAu:function(dt,fn){
        fn(0,'wifiPassAu',{});
    },

};
// 参数，url ,监听事件
var xxx = WSclient( 'ws://127.0.0.1:9999' , obj );

xxx.on('open',function(){ console.log('ws连接成功'); });
xxx.on('close',function(){ console.log('ws连接关闭'); });
xxx.on('message',function(dt){
	//接收到重置之后的wifi密码
	console.log(dt.code);
    if(dt.code===0){
        console.log('wstitle' , dt.title,'wifipassword',dt.password );
    }
    else if (dt.code===1){
        console.log('resetStatus' , dt.resetStatus );
	}
	else{

	}
});
