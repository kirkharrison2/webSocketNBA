var moment = require('moment');
const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();
app.set('port', (process.env.PORT || 8080));
// allows static hosting
app.use(express.static('public'));
// .use injects middleware into express app
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cors({credentials: true, origin: 'https://vue-budget-app.herokuapp.com'}));



let date = moment().format("YYYY-MM-DD");
console.log("DATE", date);


////////////////////////////
//RETRIEVES GAME DATA FROM API
///////////////////////////
let fetchURL = "https://www.balldontlie.io/api/v1/games?start_date=" + date +"&" + "end_date=" + date;

let scoreData = {};
function getScores(){
    fetch(fetchURL).then(response =>{
        response.json().then(data => {
            scoreData = data;
           // console.log(scoreData);
            scoreData.data.forEach(game =>{
                console.log("GAME", game.home_team, game.visitor_team);
            })
        });
    });
}
getScores();
// Gets scores every 60 seconds
setInterval(function() {  
    let grabScores = getScores();    
}, 60000);


app.listen(app.get('port'), function(){
    console.log("Server is listening...")
});