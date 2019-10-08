# remove existing
docker rm -f data-api

# run live (-d for detatched)
docker run --name data-api -p 3003:3003 easylancer/data-api:latest
