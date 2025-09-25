### Redis Container
Services can connect to this container to use the redis service.

### Setup
Install Docker on your machine.

Run the following command from the redis folder to start a Redis container:

```
docker compose up
```

This will start a Redis server on the default port 6379.

To run the redis-cli to connect to the Redis server, run the following command in a separate terminal:

```
docker exec -it redis redis-cli -a <REDIS_PASSWORD>
```

Replace `<REDIS_PASSWORD>` with the password set in the `.env` file.