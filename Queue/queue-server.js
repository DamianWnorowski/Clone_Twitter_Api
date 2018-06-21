const express = require('express')
const amqp = require('amqplib/callback_api');
const app = express()
const bodyParser = require('body-parser');
const settings = require('../Config/settings/main')
const jwt = require('../Config/utils/jwtMiddleware')
const uniqid = require('uniqid');
const logger = require('../Config/utils/logger')
const service = 'queue-server'
const debug = settings.debug;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let connection;
let channel;
let counter = 0;

const connect = () => {
    amqp.connect('amqp://localhost', (err, conn) => {
        connection = conn;
        connection.createChannel(function(err, ch) {     
            channel = ch;
        });
    })
}
connect();

const addItemToQueue = (queueName, item, res) => {
    const stringItem = JSON.stringify(item)
    logger.log(settings.normal, service, 'item to add: ' + stringItem);
    channel.assertQueue(queueName, {durable: false}); 
    channel.sendToQueue(queueName, new Buffer(stringItem))
    res.send({status: "OK", id: item.id})    
}

app.post('/additem', jwt.apply, (req, res) => {
    logger.log(settings.normal, service, 'body to add: ' + JSON.stringify(req.body));
    counter++;
    logger.log(settings.normal, service, "<<<Add Item COUNT: " + counter);
    const queueName = settings.tweetProducerQueue;
    const id = uniqid();
    // const id = Math.floor(Math.random() * settings.shardCount)  + uniqid()
    const item = {
        id,
        content: req.body.content,
        childType: req.body.childType,
        username: req.user.username,
        media: req.body.media,
    }
    addItemToQueue(queueName, item, res);
})

server = app.listen(settings.queuePort)
console.log("Server listening on localhost:" + settings.queuePort)
