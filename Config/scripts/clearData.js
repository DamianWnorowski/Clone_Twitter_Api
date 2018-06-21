const express = require('express')
const mongoose = require('mongoose')
const settings = require('../settings/main')

mongoose.connect(settings.database, (err, db) => {
    const collection = db.collection('tweets');
    collection.remove({});
    const collectionUsers = db.collection('users');
    collectionUsers.remove({});
    const collectionFollows = db.collection('follows');
    collectionFollows.remove({});
    console.log("Database cleared");
});





