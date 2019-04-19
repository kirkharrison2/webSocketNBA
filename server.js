var moment = require('moment-timezone');
const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

var app = express();
app.set('port', (process.env.PORT || 8080));
// allows static hosting
app.use(express.static('public'));
// .use injects middleware into express app
app.use(bodyParser.urlencoded({extended: false}));

let date = moment.tz("America/Los_Angeles").format("YYYY-MM-DD");
console.log("DATE", date);


////////////////////////////
//RETRIEVES GAME DATA FROM API
///////////////////////////
let fetchURL = "https://www.balldontlie.io/api/v1/games?start_date=" + date +"&" + "end_date=" + date;

let scoreData = {};
let messageList = [];


function getScores(){
    fetch(fetchURL).then(response =>{
        response.json().then(data => {
            scoreData = data;
            sendAllScoresToAllSockets();
        });
    });
}
// Gets scores on server startup
getScores();



// Gets scores every 60 seconds
setInterval(function() {  
    let grabScores = getScores();
    console.log('updated');
}, 30000);

var server = app.listen(app.get('port'), function(){
    console.log("Server is listening...")
});

// WebSocket stuff below

const wss = new WebSocket.Server({ server: server });

//Use for messages and scores
var broadcastToAllSockets = function (data) {
  wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

var sendAllMessagesToAllSockets = function () {
    let data = {
        resource: 'messages',
        action: 'list',
        data: messageList
    };
    broadcastToAllSockets(data);
};
var sendAllScoresToAllSockets = function () {
    let data = {
        resource: 'scores',
        action: 'list',
        data: scoreData
    };
    broadcastToAllSockets(data);
    console.log("Updated Scores")
};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    data = JSON.parse(data);
    console.log("data received from client:", data);
    // REQUEST TO GET SCORES
    if (data.action == "list" && data.resource == "scores") {
          let data = {
              resource: 'scores',
              action: 'list',
              data: scoreData
          };
          ws.send(JSON.stringify(data));
      }
    // REQUEST TO GET MESSAGES
    else if (data.action == "list" && data.resource == "messages") {
        let data = {
            resource: 'messages',
            action: 'list',
            data: messageList
        };
        ws.send(JSON.stringify(data));
    } 
    // ADDS A MESSAGE
    else if (data.action == "add" && data.resource == "messages"){
        console.log('New message received', data);
        messageList.push(data.data);
        sendAllMessagesToAllSockets();
    }
  });
});
