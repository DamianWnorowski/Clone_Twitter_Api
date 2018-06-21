const settings = {
  key: 'cherry pies are delicious',
  shardedDB: 'mongodb://130.245.168.83:27017/twitter',
  productionDB: 'mongodb://130.245.169.90:27017/twitter',
  productionDB2: 'mongodb://130.245.171.47:27017/twitter',
  localDB: 'mongodb://localhost:27017/twitter',
  logger: 'http://130.245.171.47',
  weedMasterIp: "http://130.245.168.233:",
  emailKeyLength: 5,
  mailerServer:         "http://130.245.169.90",
  emailLogin: 'admin@draketobinary.com',
  emailPass: 'drake123',
  passwordSaltRounds: 5,
  shardCount: 4,
  tweetConsumerPort:  8080,
  tweetProducerPort:  8081,
  userPort:           8082,
  mailerPort:         8083,
  queuePort:          8084,   
  loggerPort:         8085, 
  mediaPort:          8086,
  weedMasterPort:     9333,
  tweetProducerQueue: "tweetProducer",
  morenone:6,
  none: 5,
  important: 4,
  normal: 3,
  debug: 2,
  verbose: 1,  
};

//Choose logging severity there
settings.severity = settings.none;

//Choose current working database here
settings.database = settings.shardedDB;
module.exports = settings;