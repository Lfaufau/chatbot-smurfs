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

    var min = results.feed.totalResults < 10 ? results.feed.totalResults : 10;
    var carousel = [];

    for (var i = 0; i < min; ++i) {
      var movie = results.feed.movie[i];
      console.log(movie);
      if (!(movie) || !(movie.poster) || !movie.castingShort || !movie.link) {
        continue;
      }
      console.log("Film " + i + ": " + movie.originalTitle);
      var elt = {
       title: movie.originalTitle,
       image_url: movie.poster.href,
       subtitle:"Avec " + movie.castingShort.actors,
       buttons:[
         {
           type:"web_url",
           url:movie.link[0].href,
           title:"voir sur allocine"
         },
         {
           type : "element_share"
         }]
       }
      carousel.push(elt);
    }
    if (min > 0) {
      chatService.sendCarouselReply(recipientID, carousel);
    }
    else {
      chatService.sendTextMessage(recipientID, "Aucun resultat, désolé :/");
    }
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
