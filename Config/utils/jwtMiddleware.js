const cookie = require('cookie');
const jwt = require('jsonwebtoken')
const logger = require('./logger')
const settings = require('../settings/main')

const extractFromCookie = function(req) {
    //logger.log(settings.important, "jwtMiddleware-extract", req)   
    if(!req.headers.cookie) return null;
    const cookies = cookie.parse(req.headers.cookie);
    //logger.log(settings.important, "jwtMiddleware-extract", req.headers)    
    logger.log(settings.verbose, "jwtMiddleware-extract", cookies)    
    let jwtCookie = cookies.jwt;
    logger.log(settings.verbose, "jwtMiddleware-extract", "COOKIE ADDED")
    logger.log(settings.verbose, "jwtMiddleware-extract", jwtCookie)    
    if(jwtCookie){
        //Remove prepended 'JWT '
        jwtCookie = jwtCookie.slice(4)
    }else {
        jwtCookie = null;
    }
    return jwtCookie;
};

exports.apply = (req, res, next) => {
    let cookie = extractFromCookie(req); 
    cookie = jwt.decode(cookie)
    if(!cookie) return res.json({status: "error"})
    logger.log(settings.verbose, "jwtMiddleware-apply", cookie)        
    req.user = cookie
    next()
}