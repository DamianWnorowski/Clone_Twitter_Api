const express = require('express')
const app = express()
const settings = require('../Config/settings/main')
const logger = require('../Config/utils/logger')
const service = 'media-server'
const debug = settings.debug;
const request = require('request');
const formidable = require('formidable')

const weedMaster = "http://130.245.168.233:" + settings.weedMasterPort;
let counter = 0;

app.post("/addmedia", (req, res) => { 
    //RACE CONDITION! VROOM VROOM!    
    let callsCompleted = 0;
    let fid;
    let url;
    let file;
    let sent = false;
    let sendOnBytePercentage = 0.2
    request.get(weedMaster + "/dir/assign", {}, (err, data) => {
        if(err) { console.log(err) };
        data.body = JSON.parse(data.body)
        fid = data.body.fid;
        url = "http://" + data.body.publicUrl;
        callsCompleted++;
        if(callsCompleted == 2){
            if(!sent) res.send({status: "OK", id:fid})            
            sendToWeed(fid, url, file)
        }
    })
    let data = []
    let count = 0;
    const form = new formidable.IncomingForm();
    form.onPart = (part) => {
        part.addListener('data', (chunk) => {
            data.push(chunk)
        });
    }

    form.on('progress', (bytesReceived, bytesExpected) => {
        if(bytesReceived/bytesExpected >= sendOnBytePercentage){
            if(fid && !sent) { res.send({status:"OK", id:fid}); sent = true; }
        }
    });

    form.on('end', () => {
        file = Buffer.concat(data)
        callsCompleted++;
        if(callsCompleted == 2){
            if(!sent) res.send({status: "OK", id:fid})
            sendToWeed(fid, url, file)
        }
    });
    form.parse(req);
});

const sendToWeed = (fid, url, file) => {
    let req = request.post(url + "/" + fid, (err, resp, body) => {
            counter++;
            logger.log(settings.debug, service, "Successfully uploaded media: " + counter);
    });
    const form = req.form();
    form.append('file', file, {} );
}

server = app.listen(settings.mediaPort)
console.log("Server listening on localhost:" + settings.mediaPort)
