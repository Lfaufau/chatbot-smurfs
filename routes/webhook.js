var chatService = require('../server/chatService');
var authenticate = chatService.authenticate;
var sendTextMessage = chatService.sendTextMessage;
var sendWebMessage = chatService.sendWebMessage;
var express = require('express');
var router = express.Router();

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

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (event.message) {
    if (str.indexOf("Bonjour") > -1) {
        sendGreetingMessage(senderID);
    }
    else {
    sendWebMessage(senderID, event.message.text);
    }
  }
}



/*
  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    sendTextMessage(recipientID, messageText);
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}*/

module.exports = router;
