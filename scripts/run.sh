# remove existing
docker rm -f data-api

# run detached
docker run -d --name data-api -p 3003:3003 easylancer-data-api
# run live
docker run --name data-api -p 3003:3003 easylancer-data-api
