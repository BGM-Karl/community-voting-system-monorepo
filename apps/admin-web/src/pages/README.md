# unplugin-vue-router

此範例使用 unplugin-vue-router，同 Nuxt Page Route 一樣，可以自動生成 Vue Router 的路由設定。

詳細說明請看[文件](https://uvr.esm.is/introduction.html)

## 注意事項

目前設計元件名稱如果為 _ 開頭，會被忽略，不會生成路由設定，用於頁面的私有元件。

例如目前的範例檔案 `src\pages\page\_page-card.vue` 就不會產生 `/page/_page-card` 路由。
