var express = require('express');
var router = express.Router();
var path = require('path');
var mcache = require('mcache');
var fs = require('fs');

var cache = new mcache(6, 10, function(key, callback) {
	var error = null;
	var config = fs.readFileSync(path.resolve(__dirname, "../config.json"));
	var screens = JSON.parse(config).screens;
	var currentScreens = [];
	screens.forEach((val) => {
		var times = val.interval.split("-");
		var start = parseTime(times[0]);
		var end = parseTime(times[1]);
		var d = Date.now();
		if(start <= d && d <= end) {
			currentScreens.push(
				{
					"path": path.resolve("templates/" + val.path),
					"ttl": val.ttl
				}
			);
		}
	});
	var value = path.resolve('templates/dj01.html');
	callback(error, currentScreens);
});

var targetTime = Date.now();
var index = 0;

router.get('/', function(req, res, next) {
	  cache.get("path", (err, data) => {
			var currentScreen = data[index % data.length];
			var template = fs.readFileSync(currentScreen.path, "utf8");
			res.send(template.replace("SERVER_IP", "localhost:3000"));
			//res.sendFile(currentScreen.path);
			if(targetTime < Date.now()){
				targetTime = new Date();
				targetTime.setSeconds(targetTime.getSeconds() + currentScreen.ttl)
				index++;
			}
		});
});

function parseTime (t){
	var d = new Date();
	var splitted = t.split(":");
	d.setHours(splitted[0]);
	d.setMinutes(splitted[1]);
	return d;
}

module.exports = router;
