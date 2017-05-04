var express = require('express');
var session = require('express-session');
var path = require('path');
var fs = require('fs');
var app = express();
var jsons = [];
app.set('view engine', 'ejs');

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}
var folders = getDirectories("views");
folders.forEach(function(folder) {
	var json = JSON.parse(fs.readFileSync("views/" + folder + '/meta.json', 'utf8'));
	json.route = folder;
	jsons.push(json);
});
jsons = jsons.sort(function(json1, json2) { return json2.dateInt - json1.dateInt });
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
jsons = jsons.filter(function(x) {
	return config.released.contains(x.route);
});

var request = require('request');
var cheerio = require('cheerio');

// GET requests
app.get('/', function(req, res) {
	console.log("Request from " + req.ip)
	res.render("index.ejs", {lastPub: jsons[0].date, articles: jsons});
});

app.get('/post/*', function(req, res) {
	try {
		var meta = require('./views/' + req.params[0] + '/meta.json');
		var index = jsons.indexOf(jsons.filter(function(article) {
			return article.title == meta.title;
		})[0]);
		var previousIndex = (index + 1) % jsons.length;
		var previous = jsons[previousIndex];
		var nextIndex = index - 1;
		if (nextIndex < 0) nextIndex += jsons.length;
		nextIndex = nextIndex % jsons.length;
		var next = jsons[nextIndex];
		res.render('paper.ejs', {lastPub: jsons[0].date, previous: previous, next: next, date: meta.date, title: meta.title, fileName: req.params[0] + "/view.ejs"});
	} catch (e) { // Not found
		console.log(e);
	 	res.render("404.ejs", {lastPub: jsons[0].date});
	}
});

// Files
app.use('/static', express.static(__dirname + '/static'));

// Start the server
app.listen(4991, function() {
	console.log('Index listening on port 4991.');
});
