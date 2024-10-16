# 選擇基礎映像檔
FROM node:20 AS builder

# 設定工作目錄
WORKDIR /app

# 複製 跟目錄下的全部檔案到工作目錄
COPY ./ ./

# 安裝 pnpm (假設 Rush.js 專案使用 pnpm)
RUN npm install -g pnpm

# 安裝 Rush.js
RUN npm install -g @microsoft/rush

# 安裝專案依賴
RUN rush update

# 打包專案 (根據需求執行打包命令，假設是 rush build)
RUN rush build

