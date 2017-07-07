var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true

var fs = require('fs');
var http = require('http');
var querystring = require('querystring');

var logger = require('./logger');
var options = {
    userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs
    numBits: 2048,                                            // RSA key size
    passphrase: 'super long and hard to guess secret',         // protects the private key
    keyExpirationTime:9600
};

exports.hook_mail=function(next, connection, params){
	connection.loginfo('Entered key plugin');
	var plugin = this;
	var txn = connection.transaction;

	var file_name = "/home/shobhit/haraka_test1/keys/"+txn.mail_from.user.toString()+".json";

	var callback=function(err){
		if(err){
			return next(DENYSOFT, err);
		}
		connection.loginfo("Key Management Completed");
		return next();
	}

	fs.exists(file_name, (exists)=>{
		if(exists){
			connection.loginfo('Key exists');
			return callback();
		}
		else{
			plugin.key_generate(connection, txn.mail_from.user.toString(), callback);
		}
	});
}

exports.key_generate = function(connection, username, callback){
	var fCall=this;
	fs.readFile('/home/shobhit/haraka_test1/details/'+connection.transaction.mail_from.user.toString()+'.json', 'utf8', (err, data)=>{
		if(err)	callback(err);

		var tmp_obj=JSON.parse(data);
		options.userIds[0]=tmp_obj.userIds[0];
		options.numBits=parseInt(tmp_obj.numBits);
		options.passphrase=tmp_obj.passphrase.toString();
		connection.loginfo(options);

		openpgp.generateKey(options).then(function(key){
			connection.loginfo("Key generated:");
			// connection.loginfo(key);
			var privKey=key.privateKeyArmored;
			var pubKey=key.publicKeyArmored;
			var new_file_address = "/home/shobhit/haraka_test1/keys/"+username.toString()+".json";
			connection.loginfo("About to write");
			fs.writeFile(new_file_address, privKey, 'utf8', (err)=>{
				if(err)	callback(err);
				connection.loginfo('The new generated key has been saved.');
			});
			// send the public key constituent of the pair to the server listening at 8998
			fCall.postMyKey(connection.transaction.mail_from.original.toString(), pubKey.toString(), callback);
		});
	});
}

// Write code for error and the next callback
exports.postMyKey = function(email, key, callback){
	logger.loginfo("entered postMyKey");
	logger.loginfo(key);
	var post_data=JSON.stringify({
		'id':email,
		'key':key
	});

	var post_options={
		host:'127.0.0.1',
		port:8998,
		path:'',
		method:'post',
		headers:{
			'Content-length':Buffer.byteLength(post_data)
		}
	};
	post_options.path='/home/shobhit/test_record.json';
	logger.loginfo(post_data);

	var post_req=http.request(post_options, function(res){
		logger.loginfo("Entered post_req");
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			logger.loginfo('Response:'+chunk);
		});
	}).on('error', function(err){
		return callback(err);
		// throw err;
	});

	post_req.write(post_data);
	post_req.end();
	return callback();
}