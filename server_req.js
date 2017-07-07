var express =require('express');
var obj=express();
var fs=require('fs');
const { URL }=require('url');
var querystring=require('querystring');

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
			var newObj="{\"id\":"+JSON.stringify(fileObj.id)+",\"key\":" +JSON.stringify(pubKey)+"}";
			recordObj.push(JSON.parse(newObj));
			console.log(recordObj);
			fs.writeFile('/home/shobhit/test_record.json', JSON.stringify(recordObj), function(req, res){
				if(err)	throw err;
				console.log("New public key has been added to the record.");
			});
			res.send('Data Received');
		});
	});
})


var server = obj.listen(8998, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("My server is listening at http://%s:%s", host, port);
})