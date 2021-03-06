const
  config = require('config'),
  request = require('request');

var requestion = require('request-promise');

var chatService         = require('../server/chatService');
var weatherService      = require('../server/weatherService');
var movieService        = require('../server/movieService');
var sendTextMessage     = chatService.sendTextMessage;
var sendGreeting        = chatService.sendGreetingMessage;

// Get the config const
const WIT = (process.env.WIT_TOKEN) ?
  (process.env.WIT_TOKEN) : config.get('wit-token');


function ask_Wit(req, senderID)
{
  requestion('https://api.wit.ai/message?v=27/07/2017&q=' + encodeURIComponent(req), {
    'auth' : {
      'bearer' : WIT}
  }).then(function(result) {
    console.log("3. received answer from wit");
    console.log(JSON.stringify(result));
    var understand = false;
    var entities = JSON.parse(result).entities;
    if (entities.intent_meteo) {
      understand = true;
      meteo(entities, senderID);
    }
    if (entities.intent_movie) {
      understand = true;
      if (entities.movie) {
        movieService.search(entities.movie[0].value,senderID);
      }
      else {
        sendTextMessage(senderID, "De quel film parlez-vous? N'oubliez pas de le mettre entre guillemets :)");
      }
    }
    if (entities.intent_greeting) {
      understand = true;
      console.log("7. Got greeting intent");
      sendGreeting(senderID);
    }
    if (entities.Thanks) {
      understand = true;
      chatService.sendThanksMessage(senderID);
    }
    if (!understand) {
      console.log("7. Got something else");
      sendTextMessage(senderID, "Je n'ai pas compris...");
    }
  }).catch(function(err) {
    console.error("WIT API error: ", err);
  });
}

function meteo(entities, senderID)
{
  var number = 0;
  console.log("4. computing the number of days");
  if (entities.number) {
     number = entities.number[0].value;
  }
  else if (entities.demain) {
     number = find_future(entities.demain[0].value);
  }
  console.log("5. result : " + number + " Let's compute location value");
  var location = "";
  if (entities.location) {
    location = entities.location[0].value;
  }
  else {
    console.log("7. missing the city name");
    sendTextMessage(senderID, "Veuillez préciser une ville s'il vous plait");
  }
  console.log("6. result :"+ location + "now intent");

  var meteo = entities.intent_meteo[0].value;
  if (meteo.indexOf("temperature") > -1 || meteo.indexOf("meteo") > -1)
  {
    console.log("7. Got meteo or temperature intent");
    weatherService.getWeatherForecast(location, number, senderID);
  }
  else if (meteo.indexOf("précipitation") > -1)
  {
    console.log("7. Got rain intent");
    weatherService.getWeatherPrecipitation(location, number, senderID);
  }
  else if (meteo.indexOf("Vent") > -1)
  {
    console.log("7. Got wind intent");
    weatherService.getWeatherVent(location, number, senderID);
  }
  else {
    console.log("7. WTF?");
    sendTextMessage(senderID, "Je n'ai pas compris...");
  }
}

function find_future(str)
{
  if (str.indexOf("après-demain") > -1)
  {
    return 2;
  }
  else if (str.indexOf("demain") > -1)
  {
    return 1;
  }
  else if (str.indexOf("la semaine prochaine") > -1)
  {
    return 7;
  }
}

module.exports = {
  ask_Wit : ask_Wit
}
