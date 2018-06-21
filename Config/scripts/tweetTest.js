const cookie = require('cookie')
const settings = require('../settings/main')
const helpers = require('../utils/helpers')
const request = require('request')
const serverIp = 'http://localhost'
const sleep = require('system-sleep');
const uniqid = require('uniqid')

//const URL = "http://localhost"
const URL = "http://130.245.169.123/"
const USER_COUNT = 10;
const TWEETS_COUNT = 5000;
const TWEET_CONTENT = ["i love apples", 'people hate oranges', 'limes are sour']
const TWEET_CONTENT2 = ["hippos scare me", 'fake news', 'cloud computing rulez', "beware the full moon"]
let userJwt = [];
let  amt = 0;

const tweet = function() {
    for(let i = 0; i < TWEETS_COUNT; i++){
        for(j = 0; j < USER_COUNT; j++){
            const options = {
                url: 'http://localhost:8084/' + 'additem',
                headers: {
                    'cookie' : userJwt[j]
                },
                form:{
                    content: uniqid()//TWEET_CONTENT[i % TWEET_CONTENT.length]
                }
            }
            request.post(options, (err) => {
                if(err)console.log('tweeterrortest',err)
            }) 
        }
    
        if((i % 10) ==0){
            console.log(i*USER_COUNT,"tweets")
            //if queue-server crashes increase sleep (run into limit of open connections???)
            sleep(50)
        }
    }
};


for(let i = 0; i < USER_COUNT; i++){
    request.post(URL + 'login',{form: {username: 'user'+i, password:'pass'}}, (err, res) => {
        console.log(res.headers)
        let cookie = res.headers['set-cookie'][0]
        userJwt.push(cookie)
        if(userJwt.length == 10){
            tweet()
        }
    })
}



