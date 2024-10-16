# 選擇基礎映像檔
FROM node:20 AS builder

# 設定工作目錄
WORKDIR /app

# # 複製 跟目錄下的全部檔案到工作目錄
# COPY ./ ./

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


# 打包專案 (根據需求執行打包命令，假設是 rush build)
# RUN rush build

WORKDIR /app/community-voting-system-monorepo/packages/shared
RUN rushx build



# 針對 api-server 專案進行打包
WORKDIR /app/community-voting-system-monorepo/apps/api-server
RUN rushx build
RUN rushx build:isolate
WORKDIR /app/community-voting-system-monorepo/apps/api-server/isolate
RUN pnpm install --prod


# 第二階段: 運行應用 (Runner)
FROM node:20-alpine AS runner

# 設定工作目錄
WORKDIR /app

# 從 builder 階段中複製打包好的檔案到 runner
COPY --from=builder /app/community-voting-system-monorepo/apps/api-server/isolate ./api-server

# 暴露服務運行端口
EXPOSE 8080

# 啟動應用，使用 npm 指令來執行
CMD ["npm", "run", "start", "--prefix", "./api-server"]