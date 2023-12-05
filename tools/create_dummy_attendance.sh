# Send a post request to the postgresql database to create dummy data

URL1="http://45.87.28.51:5000/attendance?id=1&Location=cantor&present=true"
URL2="http://45.87.28.51:5000/attendance?id=2&Location=owen&present=true"
URL3="http://45.87.28.51:5000/attendance?id=3&Location=cantor&present=false"
URL4="http://45.87.28.51:5000/attendance?id=4&Location=owen&present=true"
URL5="http://45.87.28.51:5000/attendance?id=5&Location=owen&present=false"
URL6="http://45.87.28.51:5000/attendance?id=6&Location=owen&present=true"
URL7="http://45.87.28.51:5000/attendance?id=7&Location=owen&present=false"



curl -X POST $URL1
curl -X POST $URL2
curl -X POST $URL3
curl -X POST $URL4
curl -X POST $URL5
curl -X POST $URL6
curl -X POST $URL7
