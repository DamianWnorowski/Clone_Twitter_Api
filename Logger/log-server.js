const express = require('express')
const app = express()
const settings = require('../Config/settings/main')
const bodyParser = require('body-parser');
const logController = require('./log-controller')

const debug = true;
const port = settings.loggerPort;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/log', logController.log)

server = app.listen(port)
console.log("Server listening on localhost:" + port)