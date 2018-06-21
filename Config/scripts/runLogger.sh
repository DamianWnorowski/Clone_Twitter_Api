LOG_SERVER=""
ssh name "cd ~/CloudProject/Config && git pull && cd ~/CloudProject/Logger && git pull && pm2 restart all"