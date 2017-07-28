const
  config = require('config'),
  request = require('request-promise');

var chatService = require('../server/chatService');
var sendTextMessage = chatService.sendTextMessage;
var sendButtonReply = chatService.sendButtonReply;
var getLinkYahoo = chatService.getLinkYahoo;

// Get the config const
const GOOGLE_API_TOKEN = (process.env.GOOGLE_API_TOKEN) ?
  (process.env.GOOGLE_API_TOKEN) :
  config.get('googleApiToken');

const WEATHER_API_TOKEN = (process.env.WEATHER_API_TOKEN) ?
  (process.env.WEATHER_API_TOKEN) :
  config.get('weatherApiToken');

function getGeolocalisation(cityName, res) {
  request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: GOOGLE_API_TOKEN,
      address: cityName
    },
    method: 'GET'
  }).then(function(result) {res(result)});
}

function sendButtonText(senderID, prefix, text, buttonText, link, future)
{
  var day = " aujourd'hui ";
  var finalText = prefix + " est de " + text;

  if (future > 0) {
    finalText = prefix + " sera de " + text;

    if (future == 1){
      day = " demain ";
    }
    else if (future == 2){
      day = " après-demain ";
    }
    else if (future == 7){
      day = " la semaine prochaine"
    }
    else {
      day = "dans " + future + " jours"
    }
  }
  finalText = finalText + day;
  sendButtonReply(senderID, finalText, "Yahoo météo", getLinkYahoo(result.city.name));
}

function getWeatherForecast(address, future, recipientID) {
  console.log("8. Entering weatherforecast with address : " + address +"Let's ask openweather");
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: future + 1,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {
    console.log("9. Got a result:");
    result = JSON.parse(res);
    sendButtonText(recipientID, "La température",
      result.list[future].temp.day + "°C à "+ result.city.name,
      "Yahoo météo", getLinkYahoo(result.city.name), future);
  });
}

function getWeatherPrecipitation(address, future, recipientID) {
  console.log(" 8. Entering precipitation with address : " + address);
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: future + 1,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {
    result = JSON.parse(res);
    sendButtonText(recipientID, "La probabilité qu'il pleuve",
      result.list[future].humidity + "% à " + result.city.name,
      "Yahoo météo", getLinkYahoo(result.city.name), future);
  });
}

function getWeatherVent(address, future, recipientID) {
  console.log("8. Entering wind with address : " + address);
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: future + 1,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {
    result = JSON.parse(res);
    sendButtonText(recipientID, "La force du vent ",
      result.list[future].speed + "km/h à " + result.city.name,
      "Yahoo météo", getLinkYahoo(result.city.name), future);
  });
}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  getWeatherPrecipitation: getWeatherPrecipitation,
  getWeatherVent : getWeatherVent
}
