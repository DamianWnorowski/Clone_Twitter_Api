
kiwi="kiwi pineapple"
for HOST in ${kiwi} ; do
    cmd="plink ubuntu@$HOST -m test.sh"
    $cmd &
done

