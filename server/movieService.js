const
  config = require('config'),
  request = require('request-promise');

var allocine = require('allocine-api');
var chatService = require('../server/chatService');

function search(search, recipientID) {
  allocine.api('search', {q: search, filter: 'movie'}, function(error, results) {
    if(error) { console.log('Error : '+ error); return; }

    console.log('Voici les données retournées par l\'API Allociné:');
    console.log(results);
    console.log(JSON.parse(results).feed.movie[0]);
    chatService.sendTextMessage(recipientID, "Données du film : " + search + " reçues!")
  });

// Informations sur un film particulier
/*allocine.api('movie', {code: '143067'}, function(error, result) {
    if(error) { console.log('Error : '+ error); return; }

    console.log('Voici les données retournées par l\'API Allociné:');
    console.log(result);
});*/
}
module.exports = {
  search : search
}
