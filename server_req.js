var express =require('express');
var obj=express();
var fs=require('fs');

const { URL }=require('url');
var querystring=require('querystring');

var client = require('twilio')('ACd48d648b0821b35b3e51b0856770c50e', '1bdb70a3ebfe8dea412e5e5e5be9838b');

const readLine=require('readline');

var options={
	method: 'get',
    host: '127.0.0.1',
    port: 25,
};

obj.get('/home/shobhit/deliverable', function(req, res){
	console.log(req.url);
	const mUR = new URL ("http://user:pass@localhost:8998"+req.url);
	// console.log(mUR.searchParams.get('query'));
	res.send("testuser@example.com");
})

obj.get('/home/shobhit/keys', function(req, res){
	console.log(req.url);
	const mUR = new URL("http://user:pass@localhost:8998"+req.url);
	var id=mUR.searchParams.get('query');
	fs.readFile('/home/shobhit/test_record.json', 'utf8', function(err, data){
		if(err)	throw err;
		var fileObj=JSON.parse(data);
		// console.log(typeof fileObj);
		// console.log(fileObj);
		var keyObj;
		for(var i=0;i<fileObj.length;i++){
			if(fileObj[i].id==id){
				keyObj=fileObj[i].key;
				break;
			}
		}
		res.send(keyObj.toString());
	});
})

String.prototype.hexEncode = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }
    return result;
}

obj.post('/home/shobhit/test_record.json', function(req, res){
	console.log("This is the post request:"+req.url);
	req.on('data', function(data){
		// console.log(typeof JSON.parse(data).id);
		var fileObj=JSON.parse(data);
		fs.readFile('/home/shobhit/test_record.json', 'utf8', function(err, data){
			if(err)	throw err;
			var pubKey=fileObj.key;
			// console.log(typeof pubKey);
			var recordObj=JSON.parse(data);
			console.log(fileObj.mobNo);
			var newObj="{\"id\":"+JSON.stringify(fileObj.id)+",\"key\":" +JSON.stringify(pubKey)+", \"mobNo\":\""+fileObj.mobNo+"\"}";

			var rNum=Math.floor(Math.random()*(9999-1000+1)+1000);
			var mes="\'"+rNum.toString()+"\'";
			var num="\'"+fileObj.mobNo.toString()+"\'";
			// console.log(mes);
			console.log(num);
			client.messages.create({
				from: '+13127641385',
				to: num,
			  	body: mes
			}, function(err, message){
				if(err)	throw err;
				console.log(message.sid);

				const readInterface=readLine.createInterface({
					input:process.stdin,
					output:process.stdout
				});

				readInterface.question('Enter OTP: ', (answer)=>{
					if(rNum==parseInt(answer)){
						console.log("Authentication Completed");
					}
					else{
						console.log("Authentication Failed");
						process.exit();
					}
					recordObj.push(JSON.parse(newObj));
					console.log(recordObj);
					fs.writeFile('/home/shobhit/test_record.json', JSON.stringify(recordObj), function(req, res){
						if(err)	throw err;
						console.log("New public key has been added to the record.");
					});
					res.send('Data Received');
					readInterface.close();
				});

			});	

		});
	});
})


var server = obj.listen(8998, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("My server is listening at http://%s:%s", host, port);
})