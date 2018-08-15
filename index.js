var moment = require('moment');
const axios = require('axios');
var express = require('express');
const bodyParser = require('body-parser');
var morgan = require('morgan');
const leanKitUrl = "https://amctheatres.leankit.com/kanban/api/board/351820956/AddCard/lane/693496503/position/0"
// App
var app = express();
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(morgan('common'));


app.get('/', function (req, res) {
	var defaultResp = {
		message: 'Hello Docker World'
	}
  res.send(JSON.stringify(defaultResp));
});

app.get('/healthz', function (req, res) {
	var defaultResp = {
		message: 'I am happy and healthy'
	}
  res.send(JSON.stringify(defaultResp));
});

app.post('/chatops', urlencodedParser, function(req, res){
	console.log(req.body)
	var responseUrl = req.body.response_url
	var requestUser = req.body.user_name
	var requestText = req.body.text
	requestText = requestText.toLowerCase();

	if(requestText === "help" || requestText === ""){
		res.json({text: 'HELP: /request deployment [stage|prod] <appName> <details>', username: requestUser});
	}else{
		var regex = /deployment.(stage|prod)/
		var result = regex.test(requestText);
		if(result){
			var date = moment()
            date = moment().add(2, 'd');
            var dateMsg = moment(date).format('MM') +'/'+ moment(date).format('DD') +'/'+ moment(date).format('YYYY')
            var leanKitCard = {
                "Title": 'Deployment Request: ' + requestText,
                "Description": requestText + ' . Submitted Via ChatOps.',
                "TypeId": 352181976,
                "Priority": 1,
                "Size": 2,
                "IsBlocked": false,
                "BlockReason": "",
                "DueDate": dateMsg,
                "ExternalSystemName": "Slack",
                "ExternalSystemUrl": responseUrl,
                "Tags": "deployment"
            }
            axios.post(leanKitUrl, leanKitCard, {auth: { username: 'ABlogumas@amctheatres.com', password: 'Splunker01!' }}).then(resp=>console.log(resp)).catch(error=>console.log(error))
			res.json({text: 'Request Logged. Thanks for using AMCs ChatOps Chatbot!', username: requestUser});
		}else{
			res.json({text: 'Invalid Command. HELP: /request deployment [stage|prod] <appName> <details>', username: requestUser});
		}
	}
	
	
});


module.exports = app;