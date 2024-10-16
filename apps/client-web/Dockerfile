# 第一階段: 構建 client-web 應用
FROM node:20 AS builder

# 設定工作目錄
WORKDIR /app

# git clone 專案
RUN git clone https://github.com/BGM-Karl/community-voting-system-monorepo.git

# 安裝 pnpm (假設 Rush.js 專案使用 pnpm)
RUN npm install -g pnpm

# 安裝 Rush.js
RUN npm install -g @microsoft/rush

# 設定工作目錄
WORKDIR /app/community-voting-system-monorepo

# 安裝專案依賴
RUN rush update

# 打包 shared 模組
WORKDIR /app/community-voting-system-monorepo/packages/shared
RUN rushx build

# 打包 client-web 應用
WORKDIR /app/community-voting-system-monorepo/apps/client-web
RUN rushx build

# 第二階段: 設置 NGINX 並運行服務
FROM nginx:alpine AS runner

# 複製打包好的 client-web 文件到 NGINX 的靜態服務目錄
COPY --from=builder /app/community-voting-system-monorepo/apps/client-web/dist /usr/share/nginx/html

# 複製自定義的 NGINX 配置文件（可選）
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 NGINX 的 80 端口
EXPOSE 80

# 啟動 NGINX
CMD ["nginx", "-g", "daemon off;"]


# $ docker build -f ./Dockerfile -t client-web .  --no-cache
