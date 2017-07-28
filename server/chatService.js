const
  config = require('config'),
  request = require('request');

var requestion = require('request-promise');

// Get the config const

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

var userService = require('../server/userService');

function addUserName(senderID, res) {
  var senderName = null;
  requestion(
    'https://graph.facebook.com/v2.6/' + senderID +
    '?fields=first_name&access_token='
    + PAGE_ACCESS_TOKEN
  ).then(function(result) {
    senderName = JSON.parse(result).first_name;
    userService.addUser(senderID, senderName);
    res(senderName);
  }).catch(function(err) {
    console.error("Facebook API error: ", err);
  });
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
  var userName = "";
  if (!userService.isUserKnown(recipientId)) {
    sendTyping(recipientId);
    addUserName(recipientId, function(res) {
      userName = res;
    });
  }
  else {
    userName = userService.getUser(recipientId);
  }
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

function getLinkYahoo(cityName) {
  return "https://fr.search.yahoo.com/search?p=\"" + cityName + "\"+m%C3%A9t%C3%A9o";
}

function getPhotoLocalisation(res) {
  console.log("asking googlemaps");
  request({
    uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    qs: {
      location: res,
      key: GOOGLE_API_TOKEN
    },
    method: 'GET'
  }).then(function(result) {
    JSON.parse(result).photos.photo_reference(result)});
}

function sendWebMessage(recipientId, cityName) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
        text: "https://fr.search.yahoo.com/search?p=\"" + cityName + "\"+m%C3%A9t%C3%A9o"
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

function sendTyping(recipientId)
{
  var messageData = {
  recipient: {
  id: recipientId
  },
  sender_action: "typing_on" };

  callSendAPI(messageData);
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

function sendButtonReply(recipientId, textMessage, ButtonTitle, ButtonLink)
{
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type:"template",
        payload: {
          template_type:"button",
          text:textMessage,
          buttons:[
            {
              type:"web_url",
              url:ButtonLink,
              title: ButtonTitle
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendCarouselReply(recipientId, textMessage, ButtonTitle, ButtonLink, photo_reference) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements:[
           {
            title:textMessage,
            image_url:"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=photo_reference&key=GOOGLE_API_TOKEN"
            },
            buttons:[
              {
                type:"web_url",
                url:ButtonLink,
                title:ButtonTitle,
                messenger_extensions: true,
                webview_height_ratio: "tall"
              }
            ]
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
  sendWebMessage: sendWebMessage,
  sendButtonReply: sendButtonReply,
  getLinkYahoo: getLinkYahoo,
  sendGreetingMessage : sendGreetingMessage,
  sendTyping: sendTyping,
  sendQuickReply: sendQuickReply,
  sendCarouselReply: sendCarouselReply,
  getPhotoLocalisation: getPhotoLocalisation,
  sendGenericMessage: sendGenericMessage
}
