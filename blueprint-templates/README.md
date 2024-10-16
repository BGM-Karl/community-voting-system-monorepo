# 模板替換步驟

1. 檔名使用 __kebabCase_name__
2. 檔案路徑與 API Path 使用 {{kebabCase name}} 替換（/web-data 取代為 /{{kebabCase name}}）
3. 內文大駝峰使用 {{pascalCase name}} 替換
4. 內文小駝峰使用 {{camelCase name}} 替換
5. 完成