var Slackhook = require('slackhook');
var slack = new Slackhook({
    domain: 'amcconsumerappadmin',
    token: '8niAg96MHDMHaNOQJTOwvnVz'
});

var express = require('express');
// this example uses express web framework so we know what longer build times
// do and how Dockerfile layer ordering matters. If you mess up Dockerfile ordering
// you'll see long build times on every code change + build. If done correctly,
// code changes should be only a few seconds to build locally due to build cache.

var morgan = require('morgan');
// morgan provides easy logging for express, and by default it logs to stdout
// which is a best practice in Docker. Friends don't let friends code their apps to
// do app logging to files in containers.

// Appi
var app = express();

app.use(morgan('common'));

app.get('/', function (req, res) {
	var defaultResp = {
		message: 'Hello Docker World'
	}
  res.send(JSON.stringify(defaultResp));
});

app.get('/healthz', function (req, res) {
	// do app logic here to determine if app is truly healthy
	// you should return 200 if healthy, and anything else will fail
	// if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
	var defaultResp = {
		message: 'I am happy and healthy'
	}
  res.send(JSON.stringify(defaultResp));
});

app.post('/chatops', function(req, res){
	var hook = slack.respond(req.body);
	res.json({text: 'Hi ' + hook.user_name, username: 'Dr. Nick'});
});


module.exports = app;