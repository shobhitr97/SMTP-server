var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true
var async=require('async');
var http=require('http');
var url=require('url');
var querystring=require('querystring');
var key_module=require('./rcpt_to.qmail_deliverable.js');

var rawString='';
var opt;

var options={
	method:'get',
	host:'127.0.0.1',
	port:25,
};

exports.hook_data_post=function(next, connection){
	connection.loginfo("Called hook...");
	var plugin = this;
    var txn = connection.transaction;

    connection.loginfo(txn);
    var email = txn.mail_from.original.toString();

    var encode_data=txn.message_stream._queue.toString();
    connection.loginfo(encode_data);

    txn.results.add(plugin, {
        msg: "sock: " + options.host + ':' + options.port
    });
    connection.loginfo("sock: " + options.host + ':' + options.port);

    var cb = function (err) {
        if (err) {
            return next(DENYSOFT, err);
        }
        else{
        	connection.loginfo("Ended hook successfully.");
        	return next();
        }
    };

    var encrypted='';
	var pubkey=rawString;

	connection.notes.quarantine=1;
	connection.transaction.notes.quarantine=1;
	var encrypted = plugin.get_keys(connection, email, cb, encode_data);
	// connection.loginfo(encrypted);
}

exports.get_keys = function(connection, email, cb, encode_data){
    var plugin =this;
    var obj;
    var txn=connection.transaction;
    options.port='8998';
    options.host='127.0.0.1';
    options.path='/home/shobhit/keys?query='+encodeURIComponent(email);
    connection.logdebug(plugin, 'Get key => PATH: ' + options.path);
    connection.logdebug(plugin, 'Get key => PORT: ' + options.port);
    connection.loginfo("Starting http request");
    http.get(options, function(res){
        // connection.loginfo(connection.transaction["body"]);
        connection.loginfo(plugin, 'STATUS:'+res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            rawString+=chunk;
        });
        res.on('end', function(){
            // connection.loginfo(rawString);
	        opt={
	        	data:encode_data,
	        	publicKeys:openpgp.key.readArmored(rawString).keys
	        };
			openpgp.encrypt(opt).then(function(ciphertext){
				// connection.loginfo(encode_data+"->"+ciphertext.data);
				// connection.loginfo(typeof connection.transaction.message_stream._queue[0]);
				// connection.loginfo(ciphertext.data.length);

				var temp_buf=Buffer.from(ciphertext.data);
				connection.transaction.message_stream._queue[0]=Buffer.from(temp_buf);
				
				connection.loginfo(connection.transaction.message_stream._queue[0].toString());
				connection.loginfo("Ending HTTP request.")
				return cb(null);
			});
        });
    }).on('error', function(err){
        connection.loginfo(err);
        return cb(err);
    });
}