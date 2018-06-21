runMailer(){
    MAIL_SERVER="banana"
    CMD="echo Starting script... &&
    echo ==Pulling Config== &&
    cd ~/CloudProject/Config &&
    git pull &&
    echo ==Pulling Mailer== &&
    cd ~/CloudProject/Mailer &&
    git pull &&
    pm2 restart all"
    ssh $MAIL_SERVER $CMD
}