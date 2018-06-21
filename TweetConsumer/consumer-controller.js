const mongoose = require('mongoose')
const User = require("../Config/models/user")(mongoose)
const Tweet = require('../Config/models/tweet')(mongoose)
const Follow = require('../Config/models/follow')(mongoose)
const helpers = require('../Config/utils/helpers')
const settings = require('../Config/settings/main')
const debug = settings.debug;
const logger = require('../Config/utils/logger')
const service = 'consumer-controller';
const request = require('request')
const weedMaster = settings.weedMasterIp + settings.weedMasterPort;

exports.search = (req, res) => {
    logger.log(settings.normal, service,"##################Search##################")
    const user = req.user.username;
    let followingList = null;
    let searchTimestamp = req.body.timestamp;
    const qExists = !!req.body.q;
    const q = "\""+req.body.q+"\"";
    const username = req.body.username;
    const parent = req.body.parent;
    let rank = req.body.rank; 
    let replies = req.body.replies;
    if(replies == 'false') replies = false
    let hasMedia = req.body.hasMedia;
    if(hasMedia == 'true') hasMedia = true;
    let following = req.body.following;
    if(following == 'false') following = false;
    let tweetQuery = {};
    let query = null;  
    const getFollowers =  Follow.findOne({username: user})
    getFollowers.exec((err, items) => {
        if(err || !items) { console.log(err); return res.json({status: "error", error: "Server get followers error"}).send(); }
        followingList = items.following;
        logger.log(settings.normal, service, "followers: " + followingList)
        if(following == null){
            following = true;
        }
        if(searchTimestamp){
            tweetQuery.timestamp = {$lt: searchTimestamp};
        }
        let limit = req.body.limit;
        if(limit){
            limit = parseInt(limit);
            if(limit <= 0) return res.send([]);
            if(limit > 100) limit = 100;
        }else{
            limit = 25;
        }
        
        if(following){
            logger.log(settings.normal, service,'Follow = True');
            if(username){
                logger.log(settings.normal, service,'in username: ' + username);
                if(followingList.indexOf(username) > -1){
                    tweetQuery.username = username
                }else{
                    logger.log(settings.normal, service,'user not following the username match');
                    res.json({status: "OK"}).send();
                }
            }else{
                logger.log(settings.normal, service,'No username: search only following:' + followingList);
                tweetQuery.username = {$in: followingList}
            }     
        }else{
            logger.log(settings.normal, service,'Following = False')
            if(username){
                logger.log(settings.normal, service,'No username or following: search all tweets:');
                tweetQuery.username = username;
            }
        }
        if(qExists){
            logger.log(settings.normal, service,'Search keyword: ' + q);
            tweetQuery.$text = {$search: q}
        }
        if(hasMedia){
            logger.log(settings.normal, service,'Has Media = True');
            tweetQuery.media = { $exists: true, $not: {$size: 0} }
        }
        if(!replies){
            logger.log(settings.normal, service,'Replies = False');
            if(parent){
                logger.log(settings.normal, service,'Replies is false and is trying to search for replies in PARENT- return empty, parentid: ' + parent);
                res.json({status: "OK"}).send();
            }
            tweetQuery.childType = {$ne: 'reply'}
        }
        if(parent){
            logger.log(settings.normal, service,'Search replies in parent: ' + parent);            
            tweetQuery.parent = parent;
        }
        if(rank){
            logger.log(settings.normal, service,'Sort by Rank Timestamp: ' + rank);     
            query = Tweet.find(tweetQuery).sort({timestamp: -1}).limit(limit)       
        }else{
            logger.log(settings.normal, service,'Sort by Rank Like and Retweets: ');     
            query = Tweet.find(tweetQuery).sort({likes: -1}).limit(limit)
        }

        ;
        if(query){
            logger.log(settings.normal, service,'query: ' + JSON.stringify(tweetQuery))
            query.exec((err, items) => {
                logger.log(settings.verbose, service,'items'+ items)
                if(!!err) { logger.log(settings.important, service,'query error: ' + err); return res.json({status: "error", error: "Server query error"}).send(); }
                res.json({items, status: "OK"}).send();
            })
        }else{
            logger.log(settings.normal, service, 'else query fake search')
            res.json({items: "", status: "OK"}).send();
        }
    })
}

exports.deleteItem = (req, res) => {
    logger.log(settings.debug, service,"Delete item:")
    logger.log(settings.debug, service,req.params)
    const id = req.params.id;
    Tweet.findOne({id}, (err, item) => {
        if(!item || err) return res.status(500).json({status: "error", error: "Server tweet findone error: " + err}).send();
        logger.log(settings.normal, service, 'item: ' + item );
        res.json({status: "OK"}).send();
        const mediaList = [...item.media];
        item.remove((err) => {
            if(err) return res.status(500).json({status: "error", error: "Server item remove error: " + err}).send();
            
        })
        request.post('http://localhost:' + settings.mediaPort + '/deletemedia', mediaList, (err, res) => {
            if(err) {
                logger.log(settings.important, service, 'sending medialist to delete to media server');
                return res.status(500).json({status: "error", error: "Server tweet findone error: " + err}).send();
            }
        })
    })
    

}

exports.like = (req, res) => {
    const id = req.params.id;
    const like = (req.body.like === "false" || req.body.like === false) ? -1: 1;
    logger.log(settings.important, service, "Like:" + JSON.stringify({username: req.user.username, like, tweetId: id }) );
    
    if(like > 0){
        Tweet.updateOne({id, "property.peopleLiked": {"$nin":[req.user.username]}}, {"$inc":{"property.likes": like}, "$addToSet":{"property.peopleLiked": req.user.username}}, (err, item) => {
            console.log('item',item.n)
            if(!item.n || err){ console.log('errr', err); return res.json({status: "error", error: "Server error: error saving item. already liked"}).send();}
            return res.json({status: "OK"}).send();     
        })
    }
    else{
        Tweet.updateOne({id, "property.peopleLiked": {"$in":[req.user.username]}}, {"$inc":{"property.likes": like}, "$pull":{"property.peopleLiked": req.user.username}}, (err, item) => {
            console.log('item',item)
            if(!item.n || err){ console.log('errr', err); return res.json({status: "error", error: "Server error: error saving item., item not liked"}).send();}
            return res.json({status: "OK"}).send();     
        })
    }

    
}

exports.getItem = (req, res) => {
    logger.log(settings.debug, service,"Get item: ")
    logger.log(settings.debug, service,req.params)
    const id = req.params.id;
    Tweet.findOne({id}, (err, item) => {
        if(!item || err) return res.json({status: "error", error: "Server error: item does not exist."}).send();
        return res.json({item, status: "OK"}).send();
    })
}