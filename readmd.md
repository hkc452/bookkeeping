## 如何运行
1. mongo 数据库导入
   `mongorestore -h 127.0.0.1 -d bookkeeping ./bookkeepingstore` 或者运行 `import.sh`
2. 后端服务
   `cd bookkeeping-server && npm i && npm start`
3. 前端服务
   `cd bookkeeping-frontend && npm i && npm run build && npm start`
4. 浏览器访问 `localhost:3000`