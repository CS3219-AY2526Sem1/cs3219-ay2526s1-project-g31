### DB Containers

### Setup
Install Docker on your machine.

Run the following command:

```
docker compose up
```

### Redis
To run the redis-cli to connect to the Redis server, run the following command in a separate terminal:

```
docker exec -it redis redis-cli -a <REDIS_PASSWORD>
```

Replace `<REDIS_PASSWORD>` with the password set in the `.env` file.

### MongoDB
To run the mongo shell to connect to the MongoDB server, run the following command in a separate terminal:

```
docker exec -it mongo mongosh
```

To set an admin user in mongosh, run the following command:

```
db.User.updateOne( { email: "<USER_EMAIL>" }, { $set: { role: "ADMIN" } })
```