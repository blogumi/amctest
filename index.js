var moment = require('moment');
const axios = require('axios');
var express = require('express');
const bodyParser = require('body-parser');
var morgan = require('morgan');
const leanKitUrl = "https://amctheatres.leankit.com/kanban/api/board/351820956/AddCard/lane/693496503/position/0"
const slackWebhookURL = "https://hooks.slack.com/services/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"
var app = express();
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(morgan('common'));

app.get('/healthz', function (req, res) {
	var defaultResp = {
		message: 'I am happy and healthy'
	}
  res.send(JSON.stringify(defaultResp));
});

app.post('/', urlencodedParser, function (req, res) {
	var parse = JSON.parse(req.body.payload)
	if(parse.actions[0].value==='acknowledge'){
		var respme = craftack(parse.original_message.attachments[0].text)
	}else{
		var respme = craftdone(parse.original_message.attachments[0].text)
	}
  	res.send(respme);
});

app.post('/chatops', urlencodedParser, function(req, res){
	var responseUrl = req.body.response_url
	var requestUser = req.body.user_name
	var requestText = req.body.text
	requestText = requestText.toLowerCase();

	if(requestText === "help" || requestText === ""){
		res.json({text: 'HELP: /request deployment [stage|prod] <appName> <release> <details>', username: requestUser});
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
            axios.post(leanKitUrl, leanKitCard, {auth: { username: 'ABlogumas@amctheatres.com', password: 'Splunker01!' }}).then(resp=>console.log("it worked card created" + resp.status)).catch(error=>console.log(error))
			var tellOps = craftreq(requestText)
			axios.post(slackWebhookURL, tellOps).then(resp=>console.log("it worked " + resp.status)).catch(error=>console.log(error))
			res.json({text: 'Request Logged. Thanks for using AMCs ChatOps Chatbot!', username: requestUser});
		}else{
			res.json({text: 'Invalid Command. HELP: /request deployment [stage|prod] <appName> <release> <details>', username: requestUser});
		}
	}
	
	
});

function craftreq(reqtext){
	var body = {
		"text": "New request has been assigned to your team",
		"attachments": [
			{
				"fallback": "Deployment Request",
				"color": "#FF9C33",
				"author_name": "Owner: Consumer App Admins",
				"title": "Deployment Request",
				"text": reqtext,
				"callback_id": "test",
				"actions": [
					{
						"name": "action",
						"type": "button",
						"text": "Acknowledge",
						"style": "primary",
						"value": "acknowledge"
					},
					{
						"name": "action",
						"type": "button",
						"text": "Mark Complete",
						"style": "primary",
						"value": "complete"
					}
				]
			}
		]
	}
	return body
}

function craftack(reqtext){
	var body = {
		"text": "New request has been assigned to your team",
		"attachments": [
			{
				"fallback": "Deployment Request",
				"color": "#FFFF00",
				"author_name": "Owner: Consumer App Admins",
				"title": "Deployment Request",
				"text": reqtext,
				"callback_id": "test",
				"actions": [
					{
						"name": "action",
						"type": "button",
						"text": "Mark Complete",
						"style": "primary",
						"value": "complete"
					}
				]
			}
		]
	}
	return body
}

function craftdone(reqtext){
	var body = {
		"text": "Request Complete",
		"attachments": [
			{
				"fallback": "Deployment Request",
				"color": "#008000",
				"author_name": "Owner: Consumer App Admins",
				"title": "Deployment Request",
				"text": reqtext,
				"callback_id": "test",
				"actions": [
				]
			}
		]
	}
	return body
}

module.exports = app;