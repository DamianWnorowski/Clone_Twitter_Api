const express = require('express')
const mongoose = require('mongoose')
const app = module.exports = express()
const settings = require('../Config/settings/main')
const bodyParser = require('body-parser');
const userController = require('./user-controller');
const jwt = require('../Config/utils/jwtMiddleware')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/adduser', userController.addUser)
app.post('/login', userController.login)
app.post('/logout', userController.logout)
app.post('/verify', userController.verify)
app.get('/user/:username', userController.getUser)
app.get('/user/:username/followers', userController.getFollowers)
app.get('/user/:username/following', userController.getFollowing)
app.post('/follow', jwt.apply, userController.follow)

app.listen(settings.userPort)
console.log("Server listening on localhost:" + settings.userPort)

if(require.main == module){
    mongoose.connect(settings.database);   
}else{
    mongoose.connect(settings.testDB);
}