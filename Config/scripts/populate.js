const mongoose = require('mongoose')
const User = require('../models/user')(mongoose)
const Tweet = require('../models/tweet')(mongoose)
const Follow = require('../models/follow')(mongoose)
const settings = require('../settings/main')
const helpers = require('../utils/helpers')
const uniqid = require('uniqid');

mongoose.connect(settings.database);
// mongoose.connection.dropDatabase();   
const USER_COUNT = 10;
const FOLLOWERS_PER_USER = 2;
const TWEET_CONTENT = ["i love apples", 'people hate oranges', 'limes are sour']
const TWEET_CONTENT2 = ["hippos scare me", 'fake news', 'cloud computing rulez', "beware the full moon"]

const getUser = (i) => { return "user" + i;}
const getEmail = (i) => { return "user" + i + "@gmail.com";}

for(let i = 0; i < USER_COUNT; i++){
    const user = new User({
        username: getUser(i),
        email: getEmail(i),
        password: "pass",
        isVerified: true
    })
    user.save((err, user) => { 
        if(err) {console.log("ERROR:", err);}
        console.log("Added user:", user.username)
        let content = i % 4 === 3 ? "I am " + user.username : TWEET_CONTENT[i % 4]
        let tweet = new Tweet({
            content,
            username: user.username,
            id: uniqid(),
            timestamp: helpers.getUnixTime()
        })
        tweet.save((err) => {
            if(err) {console.log("ERROR:", err); }
            console.log("User", user.username, "tweeted", content)
        })

        //Tweet two
        content = TWEET_CONTENT2[Math.floor(Math.random() * 4)];
        tweet = new Tweet({
            content,
            username: user.username,
            id: uniqid(),
            timestamp: helpers.getUnixTime()
        })
        tweet.save((err) => {
            if(err) {console.log("ERROR:", err); }
            console.log("User", user.username, "tweeted", content)
        })
    })
}

const followersData = new Array(USER_COUNT)
for(let i = 0; i < USER_COUNT; i++){
    followersData[i] = []
    for(let j = 0; j < FOLLOWERS_PER_USER; j++){
        let rand = Math.floor(Math.random() * USER_COUNT)        
        while(rand == i || followersData[i].indexOf(getUser(rand)) !== -1){
            rand = Math.floor(Math.random() * USER_COUNT)            
        }
        let randomUser = getUser(rand)
        followersData[i].push(randomUser)
    }
}

console.log(followersData)

const parseUserForId = (user) => {
    return parseInt(user.substr(4), 10)
}

const followingData = new Array(USER_COUNT)
for(let i = 0; i < followersData.length; i++){
    for(let j = 0; j < followersData[i].length; j++){
        const userIndex = parseUserForId(followersData[i][j])        
        if(!Array.isArray(followingData[userIndex])) followingData[userIndex] = [];
        followingData[userIndex].push(getUser(i));
    }
    if(!Array.isArray(followingData[i])) followingData[i] = [];
}

for(let i=0; i < USER_COUNT; i++){
    const follow = new Follow({
        username: getUser(i),
        following: followingData[i],
        followers: followersData[i],
        followerCount: followersData[i].length,
        followingCount: followingData[i].length
    })
    follow.save((err, follow) => {
        if(err) { console.log(err); }
        console.log("Added follow data for user", getUser(i));
    })
}



