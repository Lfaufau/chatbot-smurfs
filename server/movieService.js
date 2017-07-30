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
            title:movie.originalTitle,
            image_url:"http://images.allocine.fr/medias/nmedia/18/95/15/80/20495053.jpg",
            subtitle:"Note des specateurs de : " + movie.statistics.userRating + " et de la presse : " + movie.statistics.pressRating,
            buttons:[
              {
                type:"web_url",
                url:"http://www.allocine.fr/film/fichefilm_gen_cfilm=27405.html",
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
