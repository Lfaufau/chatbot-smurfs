const
  config = require('config'),
  request = require('request');

var requestion = require('request-promise');

var chatService         = require('../server/chatService');
var weatherService      = require('../server/weatherService.js');
var getWeatherPrecipitation = weatherService.getWeatherPrecipitation;
var getWeatherForecast  = weatherService.getWeatherForecast;
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
    console.log(JSON.stringify(result));
    chatService.sendTyping(senderID);

    var entities = JSON.parse(result).entities;

    var number = 0;
    if (entities.number) {
       number = entities.number[0].value + 1;
    }
    else if (entities.demain) {
       number = find_future(entities.demain[0].value);
    }

    var location = "";
    if (entities.location) {
      location = entities.location[0].value;
    }

    if (entities.intent_meteo) {
      var meteo = entities.intent_meteo[0].value;
      if (location == "") {
        sendTextMessage(senderID, "Veuillez préciser une ville s'il vous plait");
      }
      else if (meteo.indexOf("temperature") > -1 || meteo.indexOf("meteo") > -1)
      {
        weatherService.getWeatherForecast(location, number, senderID);
      }
      else if (meteo.indexOf("précipitation") > -1)
      {
        weatherService.getWeatherPrecipitation(location, number, senderID);
      }
      else if (meteo.indexOf("Vent") > -1)
      {
        weatherService.getWeatherVent(location, number, senderID);
      }
    }
    else if (entities.intent_greeting) {
      sendGreeting(senderID);
    }
    else {
      sendTextMessage(senderID, "Je n'ai pas compris...");
    }
  }).catch(function(err) {
    console.error("WIT API error: ", err);
  });
}

function find_future(str)
{
  if (str.indexOf("demain") > -1)
  {
    return 1;
  }
  else if (str.indexOf("après-demain"))
  {
    return 2;
  }
  else if (str.indexOf("la semaine prochaine"))
  {
    return 7;
  }
}

module.exports = {
  ask_Wit : ask_Wit
}
