var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true

var http=require('http');
var url=require('url');
var fs=require('fs');

var plugin=this;
fs.readFile('/home/shobhit/.thunderbird/dq6cdk22.default/Mail/Local\ Folders/Decrypted', 'utf8', (err, data)=>{
	if(err)	throw err;
	var mail_body=data.toString().replace(/\r/g, "");
	// console.log(JSON.stringify(mail_body));
	fs.readFile('/home/shobhit/extra_head', 'utf8', (err, data)=>{
		if(err)	throw err;
		// var mail=data.toString().replace(/\r/,"");
		var str_mail=JSON.stringify(JSON.parse(data).overhead+mail_body);
		// str_mail=str_mail.replace(/-([^-]*)/,"AAAAAAAAA");
		var arr = (JSON.parse(data).overhead+mail_body).split("\n");
		var len=arr.length;
		var p1=arr.slice(0,len-4).join("\n");
		var p2=arr.slice(-4).join("\r\n");
		// console.log(p1);
		// console.log(" ");
		// console.log(p2);
		var pp=[];
		pp.push(p1);
		pp.push(p2);
		var str_mail=pp.join("\n");
		console.log(str_mail);
		// console.log(str_mail);
		console.log(JSON.stringify(str_mail));
		var opt, decrypted;
		var privkey;

		var email='shobhitr@iitk.ac.in';
		var username='shobhitr';

		var file_name="/home/shobhit/haraka_test1/keys/shobhitr.json";
		// console.log(file_name);

		fs.exists(file_name, (exists)=>{
			if(exists){
				fs.readFile(file_name, 'utf8', (err, data)=>{
					if(err)	throw err;
					// console.log(JSON.stringify(data));
					privkey=data;
					// privkey=privkey.replace(/\n/g, "PP");
					var privKeyObj=openpgp.key.readArmored(privkey).keys[0];
					fs.readFile('/home/shobhit/haraka_test1/details/shobhitr.json', 'utf8', (err, data)=>{
						if(err)	throw err;
						opt=JSON.parse(data);

						privKeyObj.decrypt(opt.passphrase);
						// console.log(privKeyObj);
						var str=String(str_mail);
						// arr=str_mail.split("\"");
						// console.log(arr);
						// str_mail=arr[0].toString();
						// console.log(str_mail);
						str_mail="-----BEGIN PGP MESSAGE-----\r\nVersion: OpenPGP.js v2.2.1\r\nComment: http://openpgpjs.org\r\n\r\nwcBMA2p9hJhfPwROAQf+ORUYqOjVapxVzQJgfZMy+e6CTnNlbT/H+Ui5hQPw\nKBoR18YMHSs8p8EeP2xeuOQjHdB06f9RVcO9+G2blkoJG1SAXDv8t66UXynf\nNinRQ0DUVGDbry5zc/6Ijvap5/+Vggsnn8VZ/tawTAOSILBAwfDaXRcW+X7j\ncqGFbCHRD1jMdacPoGUQHTpOU9vOdp3nhKesE95+/Y0JcnLP5vxjrSWvegvH\nxb/Io1HqdxBV1MNrOd34afvx0YVyhHCRb+MiWz8NhaLu/2XvbCSCdpNXqWNz\nbEV7Xg52nQujbkddtnkwPY0AUX82oz4uvUMCw+WAiE89pXZFpByQdirrjSiH\ntNTASwEIOVVhWrkgwZsbKl8CUH4yAykfnzpOmrRXjiCVbS06PZ0qD6JJMjvJ\nQ5qFFQ8OnZV+l/E3vst+xYDIwqn1VadPHk5T1mfmrYfsu4hpMTAyddz2EPaU\nOk7p1bo0hJEFQ/O/33Z1bGDqq7mu7rmaSbSehLItCnH4cQmEpnZGZZ3YzEa8\nD93tMFc8g3griVVeDLbM/0BV1P71CXaHIWd+xGluqvCHuwu8JagIiv6fXKZ4\nQrFOP4i0skgNiKUd8FKrgZM/iNO7ddDfNmzWCQ1s34Y5InTmtvjRzWjUNS0/\nsJttw+VqTUQeSRlTSyfZ4WHaXmHyY5uSRmSS6R82DD55zUdEpmYkYUly0CsD\n2w==\r\n=h68b\r\n-----END PGP MESSAGE-----\r\n"
						console.log(str_mail);
						var options={
							message:openpgp.message.readArmored(str_mail.toString()),
							privateKey:privKeyObj
						};

						// console.log(options.privateKey.primaryKey.isDecrypted);
						openpgp.decrypt(options).then(function(plaintext){
							console.log("Decrypted mail:");
							console.log(plaintext.data);
						});
					});
				});
			}
			else	console.log("Private key does not exist");
		});
	});
});

