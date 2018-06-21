exports.isEmptyObject = (obj) => {
    return !Object.keys(obj).length;
}

exports.getUnixTime = () => {
    return Math.floor((new Date()).getTime()/1000)
}

exports.getLogTime = () => {
    return new Date().toLocaleString("en-US", {timeZone: "UTC"});
}

exports.generateActivationKey = (keyLength) => {
    let key = "";
    for(let i = 0; i < keyLength; i++){
        let char = Math.floor(Math.random() * 36);
        key = (char < 10) ? key + char : key + String.fromCharCode(char + 55)
    }
    return key;
}

exports.formatItem = (item) => {
    if(Array.isArray(item)){
        const formattedItems = [];
        item.forEach(i => {
            formattedItems.push({
                property: i.property, 
                childType: i.childType, 
                retweeted: i.retweeted,
                id: i._id, 
                timestamp: i.timestamp,
                username: i.username, 
                content: i.content
            });
        });
        return formattedItems;
    }else{    
        item.id = item._id;
        delete item._id;
        return item;
    }
}
