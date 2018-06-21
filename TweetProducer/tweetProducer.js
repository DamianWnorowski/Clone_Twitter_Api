const mongoose = require('mongoose')
const Tweet = require('../Config/models/tweet')(mongoose)
const helpers = require('../Config/utils/helpers')
const amqp = require('amqplib/callback_api');
const settings = require('../Config/settings/main')
const logger = require('../Config/utils/logger')
const debug = settings.debug;
const service = 'tweetProducer';

mongoose.connect(settings.database);
const queue = settings.tweetProducerQueue;
const prefetch = 35;
let itemCount = 0;
let lastTime;
let newTime;
exports.initProducer = () => {
    console.log("Listening for tweets placed on queue...")
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            ch.assertQueue(queue, {durable: false});
            ch.prefetch(prefetch);
            logger.log(settings.debug, service,"Waiting for messages on queue " + queue + "...")
            ch.consume(queue, (msg) => {
                const item = JSON.parse(msg.content.toString());
                logger.log(settings.verbose, service,"[✓] Received" + JSON.stringify(item));
                addItem(item, (success) => {
                    if(success){
                        ch.ack(msg)
                    }
                })
            });
        });
    });
}

const addItem = (item, done) => {     
    logger.log(settings.verbose, service, 'item: '+ JSON.stringify(item))
    const username = item.username;
    const childType = item.childType;
    const content = item.content;
    const id = item.id;
    const media = item.media;
    // const media = ['12,0fc93a0db059', '17,0fcb5edddca7']
    logger.log(settings.verbose, service, 'media: '+ media)
    const tweet = new Tweet({ 
        username,
        childType,
        content,
        media,
        timestamp: helpers.getUnixTime(),
        id
    })
    logger.log(settings.verbose, service, 'tweet'+ tweet)
    tweet.save((err, tweet)=>{
        if (err) { 
            logger.log(settings.debug, service, err)
            done(false);
        }
        logger.log(settings.verbose, service, "Item created:"+ tweet)
        done(true);
    })
}