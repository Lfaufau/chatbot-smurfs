const
  config = require('config'),
  request = require('request');

var requestion = require('request-promise');

var chatService         = require('../server/chatService');
var weatherService      = require('../server/weatherService.js');
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
    var entities = JSON.parse(result).entities;

    if (entities.intent_meteo) {
      if (entities.location) {
        if (entities.number)
         {
           getWeatherForecast(entities.location[0].value,
             entities.number[0].value + 1, senderID);
         }
         else if (entities.demain) {
           getWeatherForecast(entities.location[0].value,
             find_future(entities.demain[0].value), senderID);
         }
         else
         {
           getWeatherForecast(entities.location[0].value, 0, senderID);
         }
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
