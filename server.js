var express = require('express');
var session = require('express-session');
var path = require('path');
var fs = require('fs');
var app = express();
var articles = [];
app.set('view engine', 'ejs');

// Logger
function log(req) {
    var date = new Date().toLocaleString();
	var url = req.protocol + '://' + req.get('host') + req.originalUrl;
	var ip = req.connection.remoteAddress;
	var line = date + " | " +  ip + " | " +  url;
	fs.appendFile('log.txt', line + '\n', function (err) {
		if (err) throw err;
	});
    console.log(line);
}

// Set up articles to memory
var folders = fs.readdirSync("views").filter(function(file) {
	return fs.statSync(path.join("views", file)).isDirectory();
});
folders.forEach(function(folder) {
	var json = JSON.parse(fs.readFileSync("views/" + folder + '/meta.json', 'utf8'));
	json.route = folder;
	articles.push(json);
});
articles = articles.sort(function(json1, json2) { return json2.dateInt - json1.dateInt });
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
articles = articles.filter(function(x) {
	return !config.excluded.contains(x.route);
});

// Get index
app.get('/', function(req, res) {
	log(req);
	res.render("index.ejs", {lastPub: articles[0].date, articles: articles});
});

// Get article
app.get('/article/*', function(req, res) {
	log(req);
	try {
		var meta = require('./views/' + req.params[0] + '/meta.json');
		var index = articles.indexOf(articles.filter(function(article) {
			return article.title == meta.title;
		})[0]);
		var previousIndex = (index + 1) % articles.length;
		var previous = articles[previousIndex];
		var nextIndex = index - 1;
		if (nextIndex < 0) nextIndex += articles.length;
		nextIndex = nextIndex % articles.length;
		var next = articles[nextIndex];
		res.render('article.ejs', {lastPub: articles[0].date, previous: previous, next: next, date: meta.date, title: meta.title, fileName: req.params[0] + "/view.ejs"});
	} catch (e) { // Not found
		console.log(e);
	 	res.render("404.ejs", {lastPub: articles[0].date});
	}
});

// Serve static files
app.use('/static', express.static(__dirname + '/static'));

// Start the server
app.listen(4991, function() {
	console.log('Index listening on port 4991.');
});
