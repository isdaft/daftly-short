
// these hold the mappings between short codes and longUrls
var longToShort = [];
var shortToLong = [];
var longUrls = null;
var goToUrl = null;
var shortCode = null;
var shortUrlCode;
var docFound = false;
var valid;

var urlObj = {
longUrls: longUrls,
shortCode: shortCode
}

function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ';
    var result = '';

    console.log("Generating random alphanumeric string of length " + length);
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function addhttp(url) {
    console.log("Adding http:// prefix to " + url + " if it doesnt already have it.");

    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "http://" + url;
    }
    return url;
}

function mongoInsert(db, collection_name, data,cb) {
        var collection = db.collection(collection_name);
        collection.insert(data, function(err, res) {
        if(err) {
            console.log(err);
        }
        else {
            console.log('Inserted into the ' + collection_name + ' collection');
            console.log('inserted ' + data.longUrls );
            cb(res);
        }
        }); //insert end
    } //mongoInsert func end

function mongoFind(db, collection_name, data, cb) {
    var collection = db.collection(collection_name);
    collection.findOne({
     	        longUrls: data
    	    }, function (err, doc) {
        if (err){
            console.log(err)
        }
        else {
            if(doc !== null){
		        if(doc.longUrls !== null){
		            docFound = true;
		            shortUrlCode = doc.shortCode;
		            console.log(" longUrl found in MongoDB, shortCode pulled: " + doc.longUrls + "+ " + doc.shortCode);
		            db.close();
		            
		            return shortUrlCode;
                    
                    
		        }
	        }
	        //console.log("no doc found");
	        
	    
        }
    })
    
}


exports.getHttp = function (req, res){
    
    var path = req.path.substring(1);
    var http = "http://www.";
    var https = "https://www.";
    
    var check = path.indexOf(http);
    var checks = path.indexOf(https);
    var baseUrl = 'http://' + req.app.get('hostname') + '/';
    
    //api format
    if (check >= 0 || checks >= 0){ // http or https
        //res.send(path + " + " + check);
        valid = true;
    } else if (check === -1 || checks === -1){ // http or https
        res.send("error: link does not contain http://www. or https://www.");
        valid = false;
    }
    if (valid){
        //check if url path already in DB and return shortcode
        var url = "mongodb://localhost:27017/shortenURL";
        var mongo = require('mongodb').MongoClient
        var mongoFound = "";
        mongo.connect(url, function(err,db) {
            if (err) throw err
            var URLs = db.collection('URLs');
	        URLs.findOne({
     	        longUrls: path
    	    }, function(err, doc) {
    	    if (err) throw err
	            if(doc !== null){
		            if(doc.longUrls !== null){
		                docFound = true;
		                shortUrlCode = doc.shortCode;
		                console.log(" longUrl found in MongoDB, shortCode pulled: " + doc.longUrls + "+ " + doc.shortCode);
		                db.close();
		                res.send(baseUrl + shortUrlCode);
		                

		            }
	            }
	        })
	        setTimeout(docNotFound, 300); //allow url to be found, and line 72 to complete
	        function docNotFound(){
	            console.log('docFound = ' + docFound)
	            if (docFound === false){
	                urlObj.shortCode = randomString(5);
	                urlObj.longUrls = path;
                    mongoInsert(db, 'URLs', urlObj, function(user_res) { 
                    console.log(user_res);
                    db.close();
                    res.send(baseUrl + urlObj.shortCode);
                    
		            })
	            }
	        }
        
            
        }); //end mongoconnect
        
        
    }//end valid
    
    
} //end getHttp export

exports.mongoHttp = function(req, res){
    //insert or check if exists 
    //if exists
        //search db and extract shortCode
    //if does not exist
        //insert intodb and generate shortcode
    var baseUrl = 'http://' + req.app.get('hostname') + '/';
    valid = true;
    if(valid){
        //res.send(valid);
        var urlToShorten = req.path.substring(1); 
       
        var url = "mongodb://localhost:27017/shortenURL";
        var mongo = require('mongodb').MongoClient
        mongo.connect(url, function(err,db) {
	        if (err) throw err
	        var URLs = db.collection('URLs');
	        URLs.findOne({
     	        longUrls: urlToShorten
    	    }, function(err, doc) {
    	    if (err) throw err
	        if(doc !== null){
		        if(doc.longUrls !== null){
		        docFound = true;
		        shortUrlCode = doc.shortCode;
		        console.log(" longUrl found in MongoDB, shortCode pulled: " + doc.longUrls + "+ " + doc.shortCode);
		        db.close();

		        }
	        }
	    })
	setTimeout(docNotFound, 300); //allow url to be found, and line 72 to complete
	function docNotFound(){
	    console.log('after connection: ' + docFound)
	    if (docFound === false){
	        urlObj.shortCode = randomString(5);
	        urlObj.longUrls = urlToShorten;
            mongoInsert(db, 'URLs', urlObj, function(user_res) { 
            console.log(user_res);
            db.close();
            var test = baseUrl + urlObj.shortCode;
		    })
	    }
	}
	
       	
	
    	}) //mongo.connect end
    	
    
    
       
    }
    
}

exports.doQuery = function (req, res) {
    var path = req.path.substring(1);
    var path2 = req.query;
    //http://www. is in the string
    var http = "http://www.";
   
    var pass = path.indexOf(http);
    //res.send(pass);
    res.send(path2);
    
}
/*
 * POST creates a short url from a long url
 */
exports.createShort = function (req, res) {

    
    
    var urlToShorten = req.body.urlToShorten;
    if (!urlToShorten) {
        console.log('Request did not contain a url to shorten, please provide urlToShorten');
        res.render('short', {message: 'Request did not contain a url to shorten, please provide urlToShorten'});
    } else {

        console.log("Request to shorten " + urlToShorten);

        urlToShorten = addhttp(urlToShorten);
        var baseUrl = 'http://' + req.app.get('hostname') + '/';
        var shortCode2 = "";

        
        
        //shortCode2 = createShortCode(urlToShorten); //taken from page via req.body.url
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.render('short', { shortUrl: baseUrl + shortCode2 });
    }
    
};

/*
 * GET retrieves long url from short url
 */
exports.getLong = function (req, res) {

    // grab the path and strip the leading slash
    
    
    var shortCode3 = req.path.substring(1);
	var theLongUrl = "";
    console.log("Fetching URL indexed by MongoDB" + shortCode3);
    
    var url = "mongodb://localhost:27017/shortenURL";
    var mongo = require('mongodb').MongoClient
    mongo.connect(url, function(err,db) {
	    if (err) throw err
	    var URLs = db.collection('URLs');
	    URLs.findOne({
     	    shortCode: shortCode3
    	}, function(err, doc) {
    	if (err) throw err
	         if(doc !== null){
		        if(doc.longUrls !== null){
		        theLongUrl = doc.longUrls;
		        console.log("longUrl: " + doc.longUrls + " found in MongoDB, shortCode pulled: " + doc.shortCode);
		        db.close();
		        //redirect to found URL from the stored short
		        console.log("redirecting to " + theLongUrl);
                res.writeHead(302, {'Location': theLongUrl});
                res.end();
		        }
	         }
	    }) //findOne end
        
    	}) //mongo.connect end

  
    
    
    


    //console.log('Short code ' + shortCode3 + " refers to " + theLongUrl);
    
};


function createShortCode(longUrl) {
    //
    console.log("finding shortcode if URL in mongoDB exists, or generating and storing");
    //
    var shortUrlCode = "";
    urlObj.longUrls = longUrl; 
    shortUrlCode = randomString(5);
    var url = "mongodb://localhost:27017/shortenURL";
    var mongo = require('mongodb').MongoClient
    mongo.connect(url, function(err,db) {
	    if (err) throw err
	    var URLs = db.collection('URLs');
	    URLs.findOne({
     	    longUrls: longUrl
    	}, function(err, doc) {
    	if (err) throw err
	    if(doc !== null){
		    if(doc.longUrls !== null){
		    docFound = true;
		    shortUrlCode = doc.shortCode;
		    console.log(" longUrl found in MongoDB, shortCode pulled: " + doc.longUrls + "+ " + doc.shortCode);
		    
		}
	}
	})
	setTimeout(docNotFound, 100); //allow url to be found, and line 72 to complete
	function docNotFound(){
	    console.log('after connection: ' + docFound)
	    if (docFound === false){
	        urlObj.shortCode = randomString(5);
	        
            mongoInsert(db, 'URLs', urlObj, function(user_res) { 
            console.log(user_res);
            db.close();
		    })
	    }
	}
	
       	
	
    	}) //mongo.connect end
    
    function mongoInsert(db, collection_name, data,cb) {
        var collection = db.collection(collection_name);
        collection.insert(data, function(err, res) {
        if(err) {
            console.log(err);
        }
        else {
            console.log('Inserted into the ' + collection_name + ' collection');
            console.log('inserted ' + data.longUrls );
            cb(res);
        }
        }); //insert end
    } //mongoInsert func end
    console.log("testing" + shortUrlCode);
    var shortUrlCode2 = shortUrlCode;
    return shortUrlCode2;
}

