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

function getWeatherForecast(address, future, recipientID) {
  console.log(" Entering weatherforecast with address : " + address);
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: 10,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {

    result = JSON.parse(res);
    var day = "";
    var text = "Il fait " + result.list[future].temp.day + "°C à "+ result.city.name + " aujourd'hui ";

    if (future > 0) {
      text = "Il fera " + result.list[future].temp.day + "°C à "+ result.city.name;

      if (future == 1){
        day = " demain ";
      }
      else if (future == 2){
        day = " après-demain ";
      }
      else if (future == 7){
        day = " la semaine prochaine"
      }
    }
    sendButtonReply(recipientID, text, "Yahoo météo", getLinkYahoo(result.city.name));
  });

}

function getWeatherPrecipitation(address, recipientID) {
  console.log(" Entering weatherforecast with address : " + address);
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: 10,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {
    result = JSON.parse(res);
    sendButtonReply(recipientID, "La précipitation est de " + result.list[0].temp.humidity + "%" + result.city.name + " aujourd'hui ", "Yahoo météo", getLinkYahoo(result.city.name));
  });
}

function getWeatherVent(address, recipientID) {
  console.log(" Entering weatherforecast with address : " + address);
  request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      q : address,
      cnt: 10,
      units : "metric"
    },
    method: 'GET'
  }).then(function(res) {
    result = JSON.parse(res);
    sendButtonReply(recipientID, "La vitesse des vents est de " + result.list[0].wind.speed + "km/h" + result.city.name + " aujourd'hui ", "Yahoo météo", getLinkYahoo(result.city.name));
  });
}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  getWeatherPrecipitation: getWeatherPrecipitation
}
