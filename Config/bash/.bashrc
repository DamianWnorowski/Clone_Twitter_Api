kill-mongo(){
        sudo kill $(pgrep mongo)
}

nginx-follow-access(){
	tail /var/log/nginx/access.log -n 10000 -f
}

nginx-follow-error(){
	tail /var/log/nginx/error.log -n 10000 -f
}

twitter-restart(){
        twitter-stop
        twitter-start
}

twitter-stop(){
	for services in User TweetProducer TweetConsumer Queue Media
	do
		LOWER="${services,}"
		pm2 stop ~/CloudProject/$services/$LOWER-server.js
		pm2 delete $LOWER-server
	done
}

twitter-kill(){
	sudo kill -9 $(lsof -t -i:8080)
	sudo kill -9 $(lsof -t -i:8081)
	sudo kill -9 $(lsof -t -i:8082)
	sudo kill -9 $(lsof -t -i:8083)
	sudo kill -9 $(lsof -t -i:8084)
}


twitter-start(){
	for services in User TweetProducer TweetConsumer Queue Media
	do
		LOWER="${services,}"		
		pm2 start -f ~/CloudProject/$services/$LOWER-server.js	
	done
}

edit-nginx-config(){
    sudo vi /etc/nginx/nginx.conf
}

edit-nginx-default(){
	sudo vi /etc/nginx/sites-available/default
}

twitter-install(){
        for repo in User TweetProducer TweetConsumer Queue Config Media
        do
                cd ~/CloudProject/$repo/
                npm install
        done
}
twitter-pull(){
	for repo in User TweetProducer TweetConsumer Queue Config Media
	do
		cd ~/CloudProject/$repo/
		git pull
	done
}

twitter-log(){
	tail ~/CloudProject/Logger/twitter.log -n 1000 -f
}

kill-mongo(){
	sudo kill $(pgrep mongo)
	sudo rm -rf /data/config/*
}
mongo-config(){
	sudo mongod --configsvr -dbpath /data/config --bind_ip 0.0.0.0 --port 27018 &
}

mongo-master(){
	sudo mongos --configdb 130.245.168.83:27018 --bind_ip 0.0.0.0 &
}

weed="/home/ubuntu/bin/weed"

weed-kill(){
        kill $(pgrep weed)
}

weed-restart(){
        weedIp="130.245.168.83"
        weedDir="/tmp/data1"
        weedMaster="130.245.168.83:9333"
        weedSlavePort="9080"
        echo "=======~Rebooting weed...~======="

        if cd $weedDir && sudo rm ./* ; then
                echo Removed all files from "$weedDir".
        else
                echo "$weedDir" is already empty.
        fi

        $weed volume -ip="$weedIp" -dir="$weedDir" -max=3  -mserver="$weedMaster" -port="$weedSlavePort" >> "/home/ubuntu/info.txt" 2>&1 &
        echo "=======~Weed slave is now running~========"
}

weed-restart-master(){
	echo "=======~Starting weed master...~========"
	$weed master -ip="130.245.168.233" >> "/home/ubuntu/info.txt" 2>&1 &
	echo "=======~Weed master is now running~======="
}


# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
#case $- in
#    *i*) ;;
#      *) return;;
#esac

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
#shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# colored GCC warnings and errors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
