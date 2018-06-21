pull-all(){
    REPOS="Config Logger TweetProducer TweetConsumer User Mailer Media"
    for REPO in ${REPOS} ; do
        echo Pulling $REPO...
        cd ~/Desktop/CloudProject/$REPO
        git pull
        echo Pulled $REPO!
        echo
    done
}

stat-all(){
    REPOS="Config Logger TweetProducer TweetConsumer User Mailer Media"
    for REPO in ${REPOS} ; do
        echo ===Status of $REPO...===
        cd ~/Desktop/CloudProject/$REPO
        git status
        echo "===Status completed for $REPO!==="
        echo
    done
}