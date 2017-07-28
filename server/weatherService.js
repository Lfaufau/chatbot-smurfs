const
  config = require('config'),
  request = require('request-promise');

var chatService = require('../server/chatService');
var sendTextMessage = chatService.sendTextMessage;
var sendButtonReply = chatService.sendButtonReply;
var getLinkYahoo = chatService.getLinkYahoo;
var sendCarouselReply = chatService.sendCarouselReply;
var getPhotoLocalisation = chatService.getPhotoLocalisation;

// Get the config const
const GOOGLE_API_TOKEN = (process.env.GOOGLE_API_TOKEN) ?
  (process.env.GOOGLE_API_TOKEN) :
  config.get('googleApiToken');

const WEATHER_API_TOKEN = (process.env.WEATHER_API_TOKEN) ?
  (process.env.WEATHER_API_TOKEN) :
  config.get('weatherApiToken');

function getGeolocalisation(cityName, res) {
  console.log("asking googlemaps");
  request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: GOOGLE_API_TOKEN,
      address: cityName
    },
    method: 'GET'
  }).then(function(result) {
    res(result);
    getPhotoLocalisation(result)});
}

function getWeatherForecast(address, recipientID) {
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
    //sendButtonReply(recipientID, "Il fait " + result.list[0].temp.day + "°C à "+ result.city.name + " aujourd'hui ", "Yahoo météo", getLinkYahoo(result.city.name));
    sendCarouselReply(recipientID, null, "Il fait " + result.list[0].temp.day + "°C à" + result.city.name + " aujourd'hui ", "Yahoo météo", getLinkYahoo(result.city.name), address);
  });

}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  getImage          : getImage
}
