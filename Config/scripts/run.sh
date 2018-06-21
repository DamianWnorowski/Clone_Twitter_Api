run(){
    SCRIPT='twitter-pull && pm2 flush && pm2 restart all'
    case $1 in
        q|queue)
            echo Pulling and restarting QUEUE
            SCRIPT="cd ~/CloudProject/Queue && git pull && pm2 flush && pm2 restart queue-server"
            ;;
        tp|tweetProducer)
            echo Pulling and restarting TWEETPRODUCER
            SCRIPT="cd ~/CloudProject/TweetProducer && git pull && pm2 flush && pm2 restart tweetProducer-server"
            ;; 
        tc|tweetConsumer)
            echo Pulling and restarting TWEETPRODUCER
            SCRIPT="cd ~/CloudProject/TweetConsumer && git pull && pm2 flush && pm2 restart tweetConsumer-server"
            ;;
        u|user)
            echo Pulling and restarting USER
            SCRIPT="cd ~/CloudProject/User && git pull && pm2 flush && pm2 restart user-server"
            ;;
        c|config)
            echo Pulling and restarting CONFIG
            SCRIPT="cd ~/CloudProject/Config && git pull"
            ;;
        m|media)
            echo Pulling and restarting Media
            SCRIPT="cd ~/CloudProject/Media && git pull && pm2 flush && pm2 restart media-server"
    esac
    USERNAME=ubuntu
    HOSTS="kiwi mango peach apple cranberry strawberry raspberry banana pineapple watermelon"
    for HOSTNAME in ${HOSTS} ; do
        ssh ${HOSTNAME} "${SCRIPT}"
        echo ==Finished with ${HOSTNAME}== && echo
    done
}

list-all(){
    USERNAME=ubuntu
    HOSTS="kiwi mango peach apple cranberry strawberry raspberry banana pineapple watermelon"
    SCRIPT="pm2 list"
    for HOSTNAME in ${HOSTS} ; do
        ssh ${HOSTNAME} "${SCRIPT}"
        echo ==Finished with ${HOSTNAME}== && echo
    done
}

d-run(){
    SCRIPT='twitter-pull && pm2 flush && pm2 restart all'
    case $1 in
        q|queue)
            echo Pulling and restarting QUEUE
            SCRIPT="cd ~/CloudProject/Queue && git pull && pm2 flush && pm2 restart queue-server"
            ;;
        tp|tweetProducer)
            echo Pulling and restarting TWEETPRODUCER
            SCRIPT="cd ~/CloudProject/TweetProducer && git pull && pm2 flush && pm2 restart tweetProducer-server"
            ;; 
        tc|tweetConsumer)
            echo Pulling and restarting TWEETPRODUCER
            SCRIPT="cd ~/CloudProject/TweetConsumer && git pull && pm2 flush && pm2 restart tweetConsumer-server"
            ;;
        u|user)
            echo Pulling and restarting USER
            SCRIPT="cd ~/CloudProject/User && git pull && pm2 flush && pm2 restart user-server"
            ;;
        c|config)
            echo Pulling and restarting CONFIG
            SCRIPT="cd ~/CloudProject/Config && git pull"
            ;;
        m|media)
            echo Pulling and restarting Media
            SCRIPT="cd ~/CloudProject/Media && git pull && pm2 flush && pm2 restart media-server"
    esac
    USERNAME=ubuntu
    HOSTS="kiwi mango peach apple cranberry strawberry rasberry banana pineapple watermelon"
    for HOSTNAME in ${HOSTS} ; do
        plink ${HOSTNAME} "${SCRIPT}"
        echo ==Finished with ${HOSTNAME}== && echo
    done
}