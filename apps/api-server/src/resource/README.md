# resource

集中各類業務資源。

建議使用 blueprint，安裝完外掛後，在指定目錄下按下右鍵，點選「New File from Template」並依照指示操作

collection-data、single-data 已經包含 CRUD 基本功能，運行 npm run blueprint
命令會自動產生以這兩個資料夾為基礎的 blueprint，可以依自己的需求（不同的邏輯、ORM、ODM）進行調整。

# 啟動 Local MongoDB Server
```bash
mongod --dbpath ../db
```
# 停止 Local MongoDB Server
```bash
mongod --shutdown
```
