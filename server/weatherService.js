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
  return request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: GOOGLE_API_TOKEN,
      address: cityName
    },
    method: 'GET'
  });
}

function getWeatherForecast(lat, lng) {
  return request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      lat: lat,
      lon: lng,
      cnt: 10
    },
    method: 'GET'
  });
}

function getFullWeather(cityName) {
  res = getGeolocalisation(cityName);
  return getWeatherForecast(res.geometry.location.lat, res.geometry.location.lng);
}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  getFullWeather : getFullWeather
}
