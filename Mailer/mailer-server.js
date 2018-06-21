const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const settings = require('../Config/settings/main')
const mailer = require('./mailer-controller');
const debug = settings.debug;
const logger = require('../Config/utils/logger')
const service = 'mailer-server'
let count = 0;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/mail", (req, res) => {
    const email = req.body.email;
    const key = req.body.key;
    logger.log(settings.debug, service, "[✓] Received -- email: " + email + ", key: " + key)
    mailer.sendConfirmAccountEmail(email, key, (success) => {
        count++;
        logger.log(settings.debug, service, "<<<SENT EMAIL: " + count + " to " + email + " with key <" + key + ">")
        return res.json({status: "OK"});
    });
});

server = app.listen(settings.mailerPort)
console.log("Server listening on localhost:" + settings.mailerPort)