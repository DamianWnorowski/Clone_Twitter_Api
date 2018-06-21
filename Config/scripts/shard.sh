restart-shards(){
    USERNAME=ubuntu
    HOSTS="peach apple cranberry"
    SCRIPT="kill-mongo;
    echo 'Killed Mongo';
    sleep 0.25;    
    sudo rm -rf /data/shard/*;
    echo 'Finished removing data'     
    sudo mongod --shardsvr --dbpath /data/shard --bind_ip 0.0.0.0 -port 27019 </dev/null &>/dev/null &"
    for HOSTNAME in ${HOSTS} ; do
        ssh ${HOSTNAME} "${SCRIPT}"
        echo ==Finished with ${HOSTNAME}== && echo
    done
}

restart-shards-master(){
    USERNAME=ubuntu
    HOSTS="raspberry"
    SCRIPT="sudo mkdir /data/TEST"
    ssh ${HOSTNAME} "${SCRIPT}"
    echo ==Finished==
}

d-restart-shards(){
    USERNAME=ubuntu
    HOSTS="peach apple cranberry"
    SCRIPT="kill-mongo;
    echo 'Killed Mongo';
    sleep 0.25;    
    sudo rm -rf /data/shard/*;
    echo 'Finished removing data'     
    sudo mongod --shardsvr --dbpath /data/shard --bind_ip 0.0.0.0 -port 27019 </dev/null &>/dev/null &"
    for HOSTNAME in ${HOSTS} ; do
        plink ${HOSTNAME} "${SCRIPT}"
        echo ==Finished with ${HOSTNAME}== && echo
    done
}
