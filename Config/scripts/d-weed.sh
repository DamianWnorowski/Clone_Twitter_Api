declare -a arr=("watermelon" "strawberry" "banana" "pineapple")

for i in "${arr[@]}"
do
    echo -------HANDLING "$i"--------
    script="weed-kill; weed-restart"
    case $i in
        strawberry)
            script="weed-kill; weed-restart-master; weed-restart"
            ;;
    esac
    plink $i "$script"
    echo -------FINISHED "$i"--------
    echo
done
