// these hold the mappings between short codes and longUrls
var longToShort = [];
var shortToLong = [];
var longUrls = null;
var shortCode = null;
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
    var docFound = false;
    var retDoc = null;;
    var url = "mongodb://localhost:27017/shortenURL";
    urlObj.longUrls = longUrl;
    var mongo = require('mongodb').MongoClient
    mongo.connect(url, function(err,db) {
	if (err) throw err
	var URLs = db.collection('URLs');
	URLs.findOne({
     	 longUrls: longUrl
    	}, function(err, documents) {
    	if (err) throw err
	
        console.log("test: " + documents.longUrls);
        //
	//
	//
	//
	var tester = documents;
        //test pinpoint var within db to extract and use
	//console.log("document[0]s "+documents[0].longUrls);
	console.log("documents.shortCode: " + JSON.stringify(documents));
	console.log("documents[longUrls]; " + tester); 
	//if longUrl (the one inserted) = specific var within db
	if (longUrl === JSON.stringify(documents)){
		docFound = true;
		console.log(docFound);
	} 
	
	db.close();
    	})
})
retDoc = null;
if (retDoc === null){
    //mongoDB insert generated urls into mongodb
    shortUrlCode = randomString(5);
    shortUrl = shortUrlCode;	
    var url = "mongodb://localhost:27017/shortenURL";
    var mongo = require('mongodb').MongoClient
    mongo.connect(url, function(err,db) {
        if (err) throw err
        var URLs = db.collection('URLs');
        URLs.insert({longUrls: urlObj.longUrls, shortCode: urlObj.shortCode}, function(err, data){
	if(err) throw err
	console.log("MongoDB Inserted: " +JSON.stringify(urlObj));
	console.log("data contains: " + JSON.stringify(data));
	db.close();
		
	})

	})
}
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

