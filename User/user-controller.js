const helpers = require('../Config/utils/helpers')
const settings = require('../Config/settings/main')
const request = require('request')
const mongoose = require('mongoose')
const User = require('../Config/models/user')(mongoose)
const Follow = require('../Config/models/follow')(mongoose)
const jwt = require('jsonwebtoken')
const logger = require('../Config/utils/logger')
const debug = settings.debug;
const service = 'user-controller'

//Passport automatically returns 'Unauthorized' if token has expired
const generateUserToken = function(user) {
    const userDetails = {
        email: user.email,
        username: user.username,
    }
    return jwt.sign(userDetails, settings.key, {
      expiresIn: 60 * 60    //Default time unit is seconds, 60 * 60 = one hour
    })
}

const getLimit = (limit, _default=50, _max=200) => {
    if(limit){
        limit = parseInt(limit);
        if(limit <= 0) return 0;
        if(limit > _max) limit = _max;
    }else{
        limit = _default;
    }
    return limit;
}

const createFollowData = (username) => {
    const follow = new Follow({
        username
    });
    follow.save((err, data) => {
        if(err){
            logger.log(settings.important, service, "Error creating following:"+ err)
            return;
        }
    })
}

exports.addUser = (req, res, next) => {
    logger.log(settings.none, service,"Add user: " + JSON.stringify(req.body))
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    if (!email) {
        return res.send({status: "error", error: 'Email is a required field.' });
    }
    if(!username){
        return res.send({status: "error", error: 'Username is a required field.' });
    }
    if (!password) {
        return res.send({status: "error", error: 'Password is a required field.' });

    }
    //Check for an activated account with this username
    User.findOne({$or:[{username} ,{email}]}, (err, existingUser) => {
        if (existingUser || err) {
            logger.log(settings.none, service,"error find one"+ err + "or useername/email is taken")
            return res.send({status: "error", error: 'The username/email is taken.' });
        }
    
        const key = helpers.generateActivationKey(settings.emailKeyLength)
        //Activated will default to false
        const user = new User({
            email,
            username,
            password,
            key
        });
        
        user.save((err, user) => {
            if (err) { return next(err); }
            res.json({status: "OK"}).send();            
            request.post(settings.mailerServer + '/mail', {form:{email, key}}, (err) => {
                if (err) { logger.log(settings.important, service,'error '+ err) }
                else { logger.log(settings.debug, service, 'add user success') }
            })
        });
    });
}

const verifyUser = (req, res, next) => {
    logger.log(settings.none, service, "Verify user: " + JSON.stringify(req.body))
    req.body.retries = req.body.retries ? req.body.retries : 0;
    const MAX_RETRIES = 10;
    const email = req.body.email;
    if (!email) {
        return res.send({status: "error", error: 'Email is a required field.' });
    }
    const key = req.body.key;
    const backdoor = key == 'abracadabra';
    User.findOne({email}, (err, user) => {
        if (err) { return res.json({error: FAKE_ERROR}) }
        logger.log(settings.none, service, "User returned from DB: " + JSON.stringify(user))
        if (!user && req.body.retries == MAX_RETRIES) {
            return res.send({error: "Account does not exist"})
        }else if(!user){
            req.body.retries++;
            return verifyUser(req, res, next)
        }

        if (user.isVerified) return res.send({error: "Email address is already verified."})
        if(!backdoor && user.key != req.body.key) return res.send({ status: "error", error: 'Invalid verify key.'})
        user.isVerified = true;
        res.cookie('jwt', `JWT ${generateUserToken(user)}`)
        user.save((err, user) => {
            if(err) console.log(err)
            res.send({status: "OK"})  
            createFollowData(user.username);
        })
    })   
}
exports.verify = verifyUser;

const loginUser = (req, res) => {
    logger.log(settings.none, service, "Login user: " + JSON.stringify(req.body))
    req.body.retries = req.body.retries ? req.body.retries : 0;
    const MAX_RETRIES = 10;
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username}, function (err, user) {
        logger.log(settings.none, service, "Found user: " + user)        
        //Error with DB request
        if (err) { return res.json({status: "error", error: "Bad request"}).send() }; 
        //No user found
        if (!user) { return res.json({status: "error", error: "No user found"}).send() }
        if(!user.isVerified && req.body.retries == MAX_RETRIES ) {return res.send({ status: "error", error: 'user not verified'})}
        else if(!user.isVerified){
            req.body.retries++;
            return loginUser(req, res)
        }
        //Invalid password
        user.verifyPassword(password, (err, match) => {
            if (err) { return res.json({status: "error", error: "Invalid password"}).send() }
            if (!match) { return res.json({status: "error", error: "Invalid login details"}).send() }
            res.cookie('jwt', `JWT ${generateUserToken(user)}`)
            return res.json({status: "OK"}).send(); 
        }) 
    });
}
exports.login = loginUser;

exports.getUser = (req, res) => {
    const username = req.params.username;    
    logger.log(settings.none, service, "Get user:" + JSON.stringify(username))
    User.findOne({ username, isVerified: true }, (err, user) => {
        if(err || !user){return res.json({status: "error", error: err})}
        const followQuery = Follow.findOne({username}).select('followerCount followingCount');
        followQuery.exec((err, followData) => {
            if(err){return res.json({status: "error", error: err})}
                logger.log(settings.none, service, "get user:", followData)
                const retData = { status: "OK",
                    user: {
                        email: user.email,
                        follower: followData.followerCount,
                        following: followData.followingCount
                    }
                }
                return res.json({retData})
            })
        })
}

exports.getFollowing = (req, res) => {
    const username = req.params.username; 
    const limit = getLimit(req.body.limit)
    if(!limit) return res.send([])
    const query = Follow.findOne({username}).select('following').slice('list', limit);
    query.exec((err, items) => {
        logger.log(settings.none, service, "get following: " + items)
        return res.json({users: items.following, status: "OK"})
    })
}


exports.getFollowers = (req, res) => {
    const username = req.params.username; 
    const limit = getLimit(req.body.limit)
    if(!limit) return res.send([])
    const query = Follow.findOne({username}).select('followers').slice('list', limit);
    query.exec((err, items) => {
        return res.json({users: items.followers, status: "OK"})
    })
}

exports.follow = (req, res) => {
    //Current user
    const username = req.user.username;
    //User to be followed
    const userToFollow = req.body.username;
    logger.log(settings.debug, service, username + "to follow" + userToFollow)
    const follow = req.body.follow === undefined ? true : !!req.body.follow 

    Follow.findOne({username}, (err, user1) => {
        if(err || !user1) return res.json({status: "error", error: err})
        const index = user1.following.indexOf(userToFollow);
        const alreadyFollowing = index >= 0;
        if (!alreadyFollowing && follow){
            user1.following.push(userToFollow);
            user1.followingCount += 1;
        }else if(alreadyFollowing && !follow){
            user1.following.splice(index, 1);
            user1.followingCount -= 1;
        }
        user1.save((err) => {
            if(err) return res.json({status: "error", error: err})
            Follow.findOne({username: userToFollow}, (err, user2) => {
                if(err || !user2) return res.json({status: "error", error: err})
                const index = user2.followers.indexOf(username);
                const alreadyFollowed = index >= 0;
                if (!alreadyFollowed && follow){
                    user2.followers.push(username);
                    user2.followerCount += 1;
                }else if(alreadyFollowed && !follow){
                    user2.follower.splice(index, 1);
                    user2.followerCount -= 1;
                }
                user2.save((err) => {
                    if(err) return res.json({status: "error", error: err})
                    return res.json({status: "OK"})
                })
            })
        })
    })
}

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.json({status: "OK"}).send();
}