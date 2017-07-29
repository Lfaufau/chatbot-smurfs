var chatService     = require('../server/chatService');
var userService     = require('../server/userService');
var nluService      = require('../server/nluService');
var authenticate    = chatService.authenticate;
var sendTextMessage = chatService.sendTextMessage;

var sendGreeting        = chatService.sendGreetingMessage;
var weatherService      = require('../server/weatherService.js');
var getGeolocalisation  = weatherService.getGeolocalisation;
var getWeatherForecast  = weatherService.getWeatherForecast;
var express             = require('express');
var router              = express.Router();

/* GET hello world page. */
router.get('/', function(req, res, next) {
  if (authenticate(req)) {
    res.status(200).send(req.query['hub.challenge']);
    } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
    }
});

router.post('/', function (req, res) {
  var data = req.body;

  if (data.object === 'page') {

    data.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        var senderId = event.sender.id;
        if (event.message) {
          console.log("1. recevied post");
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageText = message.text;
  var messageAttachments = message.attachments;
  chatService.sendTyping(senderID);

  if (!userService.isUserKnown(senderID)) {
    chatService.addUserName(senderID);
  }

  console.log("2. let's ask wit");
  nluService.ask_Wit(messageText, senderID);
}

module.exports = router;
