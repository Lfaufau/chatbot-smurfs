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

    var min = results.feed.count < 3 ? results.feed.count : 3;
    var carousel = [];
    for (var i = 0; i < min; ++i) {
      var movie = results.feed.movie[i];
      console.log(movie);
      if (!movie) {
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
         }]
       }
      carousel.push(elt);
    }
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
