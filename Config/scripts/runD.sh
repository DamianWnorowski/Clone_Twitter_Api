#!/bin/bash

HOSTS="kiwi mango peach apple cranberry"
for HOSTNAME in ${HOSTS} ; do
    plink ubuntu@${HOSTNAME} -m test.sh
    echo ==Finished with ${HOSTNAME}== && echo
done
