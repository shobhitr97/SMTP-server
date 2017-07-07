var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true

var http=require('http');
var url=require('url');
var fs=require('fs');

exports.register=function(){
	this.register_hook('data_post', 'decrypt_mail');
}

exports.decrypt_mail=function(next, connection){
	var plugin=this;
	var txn=connection.transaction;

	var opt, decrypted;
	var privkey;

	var email=txn.rcpt_to[0].original.toString();
	var username=txn.rcpt_to[0].user.toString();

	var callBack=function(err){
		if(err)	return next(DENYSOFT, err);
		connection.loginfo("Data Successfully Decrypted");
		return next();
	}

	var file_name="/home/shobhit/haraka_test1/keys/"+username+".json";
	connection.loginfo(file_name);

	fs.readFile(file_name, 'utf8', (err, data)=>{
		if(err)	callBack(err);
		// connection.loginfo(data);
		privkey=data;
		// privkey=privkey.replace(/\n/g, "PP");
		// connection.loginfo(privkey);
		var privKeyObj=openpgp.key.readArmored(privkey).keys[0];
		fs.readFile('/home/shobhit/haraka_test1/details/'+username+'.json', 'utf8', (err, data)=>{
			if(err)	callBack(err);
			opt=JSON.parse(data);
			// connection.loginfo(opt.passphrase);

			privKeyObj.decrypt(opt.passphrase);
			var str1=txn.message_stream._queue.toString();
			// str1=str1.replace(/\n/g,"PP");
			connection.loginfo(str1);
			fs.readFile('/home/shobhit/test_record.json', 'utf8', (err, data)=>{
				if(err)	throw err;
				// connection.loginfo(JSON.parse(data)[0].key);
				var options={
					message:openpgp.message.readArmored(str1),
					publicKeys:openpgp.key.readArmored(JSON.parse(data)[0].key.toString()),
					privateKey:privKeyObj,
				};
				// connection.loginfo(typeof options);
				// connection.loginfo(options);
				openpgp.decrypt(options).then(function(plaintext){
					connection.loginfo(plaintext.data);
					callBack();
				});
			});
		});
	});
};