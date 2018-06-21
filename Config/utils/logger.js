const request = require('request')
const settings = require('../settings/main')
const helpers = require('./helpers')
const fs = require('fs');

let hostname = null;
fs.readFile('/proc/sys/kernel/hostname', (err, data) => {
    if(err){console.log(err); return;}
    hostname = data.toString().replace('\n', '');
});

exports.log = (severity, service, message) => {
    if(settings.severity <= severity){
        if(severity === settings.important) severity = 'IMPORTANT'
        else if(severity === settings.normal) severity = 'NORMAL'
        else if (severity === settings.debug)  severity = 'DEBUG'
        const time = helpers.getLogTime();
        const options = {
            url: settings.logger + "/log",
            form:{
                severity,
                hostname,
                service,
                message, 
                time
            }
        }
        request.post(options) 
    }

}

