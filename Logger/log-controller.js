const fs = require('fs');
const readline = require('readline');

sendLog = (msg) => {
    fs.appendFile('twitter.log', msg, function (err) {
        if (err) throw err;
      });
}

exports.log = (req, res) => {
    const severity = req.body.severity;    
    const service = req.body.service;
    const message = req.body.message;
    const hostname = req.body.hostname;
    const time = req.body.time;
    const msg =  '===[' + time + '] $$' + hostname + '$$ ' + severity + ' ' + service + ': ' + message + '===\n'; 
    sendLog(msg);
    res.send();
}
