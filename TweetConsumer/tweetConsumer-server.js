const express = require('express')
const mongoose = require('mongoose')
const app = module.exports = express()
const settings = require('../Config/settings/main')
const bodyParser = require('body-parser');
const consumerController = require('./consumer-controller');
const jwt = require('../Config/utils/jwtMiddleware')

mongoose.connect(settings.database, (err, db) => {
    const collection = db.collection('tweets');
    collection.createIndex({username: 1});
    collection.createIndex( {timestamp: -1});
    collection.createIndex({content: "text"});
    collection.createIndex({likes: -1});
    collection.createIndex({id: 1});

    const collectionUsers = db.collection('users');
    collectionUsers.createIndex({username: 1});
    collectionUsers.createIndex({email: 1});
    const collectionFollows = db.collection('follows');
    collectionFollows.createIndex({username: 1});
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/search', jwt.apply, consumerController.search)
app.get('/item/:id', consumerController.getItem)
app.delete('/item/:id', jwt.apply, consumerController.deleteItem)
app.post('/item/:id/like', jwt.apply, consumerController.like)

app.listen(settings.tweetConsumerPort)
console.log("Server listening on localhost:" + settings.tweetConsumerPort)


