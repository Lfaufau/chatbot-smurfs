const
  config = require('config'),
  request = require('request-promise');


var sendTextMessage = require('../server/chatService').sendTextMessage;

// Get the config const
const GOOGLE_API_TOKEN = (process.env.GOOGLE_API_TOKEN) ?
  (process.env.GOOGLE_API_TOKEN) :
  config.get('googleApiToken');

const WEATHER_API_TOKEN = (process.env.WEATHER_API_TOKEN) ?
  (process.env.WEATHER_API_TOKEN) :
  config.get('weatherApiToken');

function getGeolocalisation(cityName) {
  console.log("asking googlemaps");
  return request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: GOOGLE_API_TOKEN,
      address: cityName
    },
    method: 'GET'
  });
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
    sendTextMessage(recipientID, "Il fait" result.list[0].day + "°C à "+ result.city.name + "aujourd'hui ");
  });

}

function getFullWeather(cityName) {
  res = getGeolocalisation(cityName.text);
  var jsonres = JSON.parse(res);
  return getWeatherForecast(jsonres.geometry.location.lat, jsonres.geometry.location.lng);
}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  getFullWeather : getFullWeather
}
