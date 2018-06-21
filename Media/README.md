//--Strawberry
weed volume -ip="130.245.168.233" -dir="/tmp/data1" -max=3  -mserver="130.245.168.83:9333" -port=9080 &
//--Raspberry
weed volume -ip="130.245.168.83" -dir="/tmp/data1" -max=3  -mserver="130.245.168.83:9333" -port=9081 &
//--Apple
weed volume -ip="130.245.169.90" -dir="/tmp/data1" -max=3  -mserver="130.245.168.83:9333" -port=9082 &

//--MASTER-Raspberry
weed master -ip="130.245.168.83" &
