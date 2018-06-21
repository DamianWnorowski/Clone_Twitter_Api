for repo in Mailer User TweetConsumer TweetProducer Queue Config Logger Media
    do
        cd $repo
        git pull
        npm install
        cd ..
    done