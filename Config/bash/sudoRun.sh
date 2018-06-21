runCommand(){
    userInput=""
    commandsToRun=""
    echo "Each command entered will execute sequentially and will not execute if the command preceding them fails."
    echo "Enter 'end' when finished inputting commands!" && echo 
    while :
    do  
        read -p "Enter command to run: " userInput
        if [ "$userInput" == "end" ]; then
            break
        fi

        if [ "$commandsToRun" == "" ]; then
            commandsToRun="$userInput"
        else 
            commandsToRun="$commandsToRun && $userInput"
        fi
    done
    hosts="kiwi apple peach mango cranberry banana raspberry strawberry pineapple watermelon"
    for host in $hosts
    do
        ssh $host "$commandsToRun"
        echo ==Finished with $host== && echo
    done
}