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

4. run docker-compose
```bash
# if you are not in the root directory
# cd ../../
cd apps/docker && docker-compose up --build
```


### docker swarm
1. 前往 `apps/docker` 
```bash
cd apps/docker
```
2. 初始化 swarm
```bash
docker swarm init
```
2. 執行 `docker swarm` 
```bash
docker stack deploy -c docker-compose.yml cvs_stack
```
3. 檢查 Stack 狀態
```bash
# 部署完成後，你可以使用以下命令檢查 Stack 的狀態：
docker stack ls
```
4. 刪除 Stack
```bash
docker stack rm cvs_stack
```
5. 刪除 network
```bash
docker network prune
```
6. worker 加入 swarm
```bash
# 在 manager node 上執行以下命令，取得 worker 加入 swarm 的指令：
docker swarm join-token worker
# 在 worker node 上執行上面的指令，即可加入 swarm。
# 要在 manager node 上開放 port 2377 和 7946，以及 4789/udp (或是全開)
# 防火牆或安全組規則中開放以下端口：
# TCP 2377: 用於集群管理的通訊。這是 Swarm 管理節點和其他節點之間的主要通訊端口。
# TCP 和 UDP 7946: 用於節點之間的網路通訊。
# UDP 4789: 用於 Overlay 網路的數據傳輸（即容器之間跨節點的網路通訊）。
```
7. mannager 加入 swarm
```bash
# 在 manager node 上執行以下命令，取得 manager 加入 swarm 的指令：
docker swarm join-token manager
# 在 manager node 上執行上面的指令，即可加入 swarm。
```