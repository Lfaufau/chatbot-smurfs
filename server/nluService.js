const
  config = require('config'),
  request = require('request');

var requestion = require('request-promise');

// Get the config const
const WIT = (process.env.WIT_TOKEN) ?
  (process.env.WIT_TOKEN) : config.get('wit-token');

function ask_Wit(req)
{
  
  requestion('https://api.wit.ai/message?v=27/07/2017&q=' + req, {
    'auth' : {
      'bearer' : WIT}
    }).then(function(result) {
    console.log(JSON.stringify(result));
  }).catch(function(err) {
    console.error("WIT API error: ", err);
  });
}

  module.exports = {
    ask_Wit : ask_Wit
  }
