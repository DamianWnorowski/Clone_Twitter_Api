const cmd=require('node-cmd');

exports.sendConfirmAccountEmail = (destination, key, callback, subject='\"Hello! Hope you have a great day :)\"') => {
    //Hacky, horrible, horrendous
    //Forgive me father for I have sinned
    const mailCmd = 'echo \"validation key: <' + key + '>" | mail -s ' + subject + ' ' + destination;
    cmd.get(
        mailCmd,
        (err, data, stderr) => {
            if(err) { console.log("Error:", err); return callback(false); }
            else callback(true)
        }
    );    
}
