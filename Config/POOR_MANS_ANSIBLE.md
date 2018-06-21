------------
Installation
------------
Install MongoDB
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 &&
    echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list &&
    sudo apt-get update &&
    sudo apt-get install -y mongodb-org &&
----
Install Nginx
    sudo apt-get update &&
    sudo apt-get install nginx &&
    sudo systemctl enable nginx
---
Install RabbitMQ
    wget https://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
    sudo dpkg -i erlang-solutions_1.0_all.deb
    sudo apt-get update
    sudo apt-get install erlang erlang-nox
    echo 'deb http://www.rabbitmq.com/debian/ testing main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list
    wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install rabbitmq-server
    sudo systemctl enable rabbitmq-server
    sudo systemctl start rabbitmq-server
---
Install NodeJS
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
    nvm install node
    nvm use node
    
    DO NOT FORGET TO RUN NPM INSTALL (or twitter-install) ON ALL REPOS!

-------------
Configuration
----
Setting up Nginx on Load Balancer
    In /etc/nginx/sites-available/default:
        server {
            listen 81;
            listen [::]:81;
            location /{
                location ~ ^/(adduser|login|logout|verify|user|follow){
                            proxy_pass http://localhost:8082;
                }
                location ~ ^/(send/verify|additem){
                                proxy_pass http://localhost:8084;
                }
                location ~ ^/(search|item){
                                proxy_pass http://localhost:8080;
                }
                location /addmedia{
                    proxy_pass http://localhost:8086;
                }
                location /media/{
                    proxy_pass http://130.245.168.83:9333/;
                }
            }	 
        }
        server {
            listen 80;
            listen [::]:80;
            
            location /{
                        proxy_pass http://twitter/;
            }
        }

    In /etc/nginx/nginx.conf:
        user www-data;
        worker_processes auto;
        pid /run/nginx.pid;
        worker_rlimit_nofile 30000;

        events {
            worker_connections 2048;
            multi_accept on;
        }

        http {
            upstream twitter {
                server localhost:81 weight=3;
                server 130.245.168.65 weight=3;
                server 130.245.169.121 weight=3;
                server 130.245.170.33 weight=3;
                server 130.245.171.125 weight=3;
                server 130.245.169.90 weight=3;
                }

            #
            # Basic Settings
            #

            sendfile on;
            tcp_nopush on;
            tcp_nodelay on;
            keepalive_timeout 65;
            types_hash_max_size 2048;
            # server_tokens off;

            # server_names_hash_bucket_size 64;
            # server_name_in_redirect off;

            include /etc/nginx/mime.types;
            default_type application/octet-stream;

            ##
            # SSL Settings
            ##

            ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
            ssl_prefer_server_ciphers on;

            ##
            # Logging Settings
            ##
            log_format timed_combined '$remote_addr - $remote_user [$time_local] ' '"$request" $status $body_bytes_sent ' '"$http_referer" "$http_user_agent" ' '$request_time $upstream_response_time $pipe';
            access_log /var/log/nginx/access.log timed_combined;
            error_log /var/log/nginx/error.log;

            ##
            # Gzip Settings
            ##
            gzip    on;
            gzip_http_version       1.1; 
            gzip_comp_level         5; 
            gzip_min_length 0; 
            gzip_disable "MSIE [1-6].(?!.*SV1)";
            gzip_vary on;
            ##
            # Virtual Host Configs
            ##
            include /etc/nginx/conf.d/*.conf;
            include /etc/nginx/sites-enabled/*;
        }
---
Postfix Setup:
    sudo apt-get update
    sudo apt install mailutils
    If it shows a subdomain like subdomain.example.com, change it to just example.com

    sudo vi /etc/postfix/main.cf
    Edit to match:
        inet_interfaces = loopback-only
    
    sudo systemctl restart postfix
-------------
Sharding MongoDB
    Create the necessary data directories:
        sudo mkdir /data &&  sudo mkdir /data/config && sudo mkdir /data/shard
    
    Spawn one config server. The config port is arbitrarily chosen as 27018:
        sudo mongod --configsvr -dbpath /data/config --bind_ip 0.0.0.0 --port 27018 &

    Spawn any amount of shards by running this command on any amount of machines. The shard port is arbitrarily chosen as 27019: 
        sudo mongod --shardsvr --dbpath /data/shard --bind_ip 0.0.0.0 -port 27019 &
    
    Now spawn mongos, the master node:
        mongos --configdb <CONFIG_IP:CONFIG_PORT> --bind_ip 0.0.0.0 &
    For example, with config ip and port equal to 130.245.168.83:27018:
        mongos --configdb 130.245.168.83:27018 --bind_ip 0.0.0.0 &

    Now configure sharding in mongos. Connect to the mongo shell:
        mongo 
    Then add shards to the master node, enable sharding on the db, and shard relevant collections:
        sh.addShard("130.245.169.121:27019")
        sh.addShard("130.245.170.33:27019")
        sh.addShard("130.245.171.125:27019")
        
        sh.enableSharding("twitter")

        sh.shardCollection("twitter.users", { username: "hashed" } )
        sh.shardCollection("twitter.tweets", { id: "hashed" } )
        sh.shardCollection("twitter.follows", { username: "hashed" } )
----
Weed Setup:
    //--Watermelon
    weed volume -ip="130.245.170.40" -dir="/tmp/data1" -max=3  -mserver="130.245.168.233:9333" -port=9080 &
    //--Pineapple
    weed volume -ip="130.245.171.47" -dir="/tmp/data1" -max=3  -mserver="130.245.168.233:9333" -port=9081 &
    //--Banana
    weed volume -ip="130.245.169.90" -dir="/tmp/data1" -max=3  -mserver="130.245.168.233:9333" -port=9082 &
    //--Strawberry
    weed volume -ip="130.245.168.233" -dir="/tmp/data1" -max=3  -mserver="130.245.168.233:9333" -port=9082 &

    //--MASTER-Strawberry
    weed master -ip="130.245.168.233" &

---------------
SERVER CONFIGURATION:

NAME        IP                  WEIGHT      Weight Justification
----------------------------------------------------------------
kiwi        130.245.169.123         1       Load balancer
apple       130.245.170.33          2
peach       130.245.169.121         2       
mango       130.245.168.65          2
cranberry   130.245.169.125         2
strawberry  130.245.168.233         1       Weed master
raspberry   130.245.168.83          1       Mongo master
banana      130.245.169.90          2
pineapple   130.245.171.47          2
watermelon  130.245.170.40          2

Load Balancer:
    kiwi        ✓

Weed Master:
    strawberry  ✓

Mongo Config & Master: 
    raspberry   ✓

Mongo Shards:
    apple       ✓
    peach       ✓
    cranberry   ✓

Mailers:
    banana      ✓

Weed Nodes:
    watermelon  ✓
    pineapple   ✓
    banana      ✓
    strawberry  ✓

Logger:
    pineapple


  

 