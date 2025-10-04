[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep) - AY2526S1
## Group: G31

## Set up
Each microservice has its own `README.md` file with instructions on how to set up and run the microservice individually. Please refer to those files for individual microservice setup.

1. `npm install -g yarn`
2. run `yarn install` in shared folder first before setting up the rest of the microservices.

## Running with Docker
Copy `.env.example` to `.env` and modify the environment variables as needed.

Run the following commands to run the dev environment in a docker container:
```
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f ./redis/docker-compose.yml up
docker compose -f docker-compose.dev.yml up
```

## Development
- For testing individual microservices, navigate to the respective microservice folder and follow the instructions in the `README.md` file of that microservice.
- Hot reload is not supported when running with Docker. For hot reload during development, you can run the microservices individually as described in their respective `README.md` files.

### Note: 
- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 
