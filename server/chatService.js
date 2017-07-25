const
  config = require('config'),
  request = require('request');

// Get the config const

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

var userService = require('../server/userService');
/*
function getUserName(senderID) {
  var senderName = null;
  console.log("Asking fb for the clients name");
  request(
    'https://graph.facebook.com/v2.6/' + senderID +
    '?fields=first_name&access_token='
    + PAGE_ACCESS_TOKEN
  ).then(function(result) {
    console.log("Oooh, just got a result!");
    senderName = JSON.parse(result).first_name;
    //userService.addUser(senderId, { name: senderName });
  }).catch(function(err) {
              console.error("Facebook API error: ", err);
            });
  console.log("Inside getUserName, clients name is : " + senderName);
  return senderName;
}*/

function getUserName(senderID) {
  var senderName = null;
  console.log("let's ask facebook!");
  request({
    uri: 'https://graph.facebook.com/v2.6/' + senderID,
    qs: {
      fields : 'first_name',
      access_token: PAGE_ACCESS_TOKEN },
    method: 'GET'
  }, function (error, response, body) {
    if (!error) {
      senderName = body.first_name;
      console.log("Inside getUserName, clients name is : " + senderName);
    }});
    console.log("Inside getUserName, clients name is : " + senderName);
    return senderName;
}

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

  if (messageText) {
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
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

function sendGreetingMessage(recipientId) {
  console.log("let's process this greeting");
  var userName = /*userService.getUser(recipientId);
  if (!userName)
  {
      userName =*/ getUserName(recipientId);
  //}
  console.log("client's name : " + userName);
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Bonjour " + userName
    }
  };

  callSendAPI(messageData);
}

function authenticate(req) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    return true;
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    return false;
  }
}

function sendQuickReply(recipientId, message,  quick_replies) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: message,
      quick_replies: quick_replies
    }
  };

  callSendAPI(messageData);
}

function sendCarouselReply(recipientId, carousel) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: carousel
        }
      }
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
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
}


module.exports = {
  authenticate: authenticate,
  receivedMessage: receivedMessage,
  sendTextMessage: sendTextMessage,
  sendGreetingMessage : sendGreetingMessage,
  sendQuickReply: sendQuickReply,
  sendCarouselReply: sendCarouselReply,
  sendGenericMessage: sendGenericMessage
}
