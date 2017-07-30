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
    console.log(results.feed.movie[0]);
    var movie = results.feed.movie[0];
    chatService.sendTextMessage(recipientID, "Resultats de la recherche : " + search + " reçues!");
    chatService.sendTextMessage(recipientID, "Nom du film : " + movie.originalTitle
    + '\n' + "produit en : " + movie.productionYear + " et sorti le " + movie.release.releaseDate);
    chatService.sendTextMessage(recipientID, "Note des specateurs de : " + movie.statistics.userRating
    + '\n' + " et de la presse : " + movie.statistics.pressRating );

    var carousel = [
           {
            title: movie.originalTitle,
            image_url: movie.poster.href,
            subtitle:"Avec " + movie.castingShort.actors,
            buttons:[
              {
                type:"web_url",
                url:movie.link[0].href,
                title:"voir sur allocine"
              }
            ]}];
    chatService.sendCarouselReply(recipientID, carousel);
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
