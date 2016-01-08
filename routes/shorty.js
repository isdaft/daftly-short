// these hold the mappings between short codes and longUrls
var longToShort = [];
var shortToLong = [];
var longUrls = null;
var shortCode = null;
var docFound = false;
var urlObj = {
longUrls: longUrls,
shortCode: shortCode
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

        var shortCode = createShortCode(urlToShorten);
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.render('short', { shortUrl: baseUrl + shortCode });
    }
};

/*
 * GET retrieves long url from short url
 */
exports.getLong = function (req, res) {

    // grab the path and strip the leading slash
    var shortCode = req.path.substring(1);
	
    console.log("Fetching URL indexed by " + shortCode);
    var theLongUrl = shortToLong[shortCode];

    console.log('Short code ' + shortCode + " refers to " + theLongUrl);

    console.log("redirecting to " + theLongUrl);
    res.writeHead(302, {'Location': theLongUrl});
    res.end();
};


function createShortCode(longUrl) {
    console.log("finding URL in DB if exists, or pulling " + longUrl);
    //MongoDB - check if LONG URL is in database
   
    var retDoc = null;;
    var url = "mongodb://localhost:27017/shortenURL";
    urlObj.longUrls = longUrl;
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
		console.log(" URL Match Hit: " + doc.longUrls);
		console.log(docFound);
		}
	}
	})
	console.log('after connection: ' + docFound)
	if (docFound === false){
            mongoInsert(db, 'URLs', urlObj, function(user_res) { 
            console.log(user_res);
            db.close();
		})
	}
	
       	
	
    	})

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
    });
}

    var shortUrlCode = randomString(5);
    var shortUrl = shortUrlCode;	
   
    //	
    // Check if there is already a shortcode for the longUrl
    shortUrlCode = longToShort[longUrl];

    if (shortUrlCode == undefined) {
        console.log(longUrl + " has not already been shortened, so shortening it now.");
        shortUrlCode = randomString(5);
        console.log("Shortened " + longUrl + " to a shortcode of " + shortUrlCode);
	
        longToShort[longUrl] = shortUrlCode;
        shortToLong[shortUrlCode] = longUrl;
    }

    return shortUrlCode;
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

