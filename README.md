1. build client-web docker image
```bash
cd apps/client-web && docker build -f ./Dockerfile -t client-web .  --no-cache
```

2. build admin-web docker image
```bash
# if you are not in the root directory
# cd ../../ 
 cd apps/admin-web && docker build -f ./Dockerfile -t admin-web .  --no-cache 
```
3. build api-server docker image
```bash 
cd apps/api-server && docker build -f ./Dockerfile -t api-server .  --no-cache
```

4. run docker-compose (If using Swarm, please refer to the Docker Swarm section below and skip this step)
```bash
# if you are not in the root directory
# cd ../../
cd apps/docker && docker-compose up --build
```


### Docker Swarm
1. Navigate to `apps/docker`
```bash
cd apps/docker
```
2. Initialize Swarm
```bash
docker swarm init
```
2. Execute `docker swarm`
```bash
docker stack deploy -c docker-compose.yml cvs_stack
```
3. Check Stack status
```bash
# After deployment, you can check the status of the Stack with the following command:
docker stack ls
```
4. Remove Stack
```bash
docker stack rm cvs_stack
```
5. Remove network
```bash
docker network prune
```
6. worker join swarm
```bash
# Execute the following command on the manager node to get the command for a worker to join the swarm:
docker swarm join-token worker
# Execute the above command on the worker node to join the swarm.
# Open ports 2377 and 7946, as well as 4789/udp (or open all) on the manager node.
# In firewall or security group rules, open the following ports:
# TCP 2377: Used for cluster management communication. This is the main communication port between Swarm manager nodes and other nodes.
# TCP and UDP 7946: Used for network communication between nodes.
# UDP 4789: Used for data transmission in the Overlay network (i.e., network communication between containers across nodes).
```
7. Add a manager to the swarm
```bash
# Execute the following command on the manager node to get the command for a manager to join the swarm:
docker swarm join-token manager
# Execute the above command on the manager node to join the swarm.
```