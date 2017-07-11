var chatservices = require('~/server/chatservice');
var authenticate = chatservices.authenticate;
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

module.exports = router;

