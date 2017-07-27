const
  config = require('config'),
  request = require('request-promise');

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

function getWeatherForecast(address) {
  console.log(" Entering weatherforecast");
  console.log(lat + ' ' + lng);
  return request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      address : address,
      cnt: 10
    },
    method: 'GET'
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
