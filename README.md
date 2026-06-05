# AI 教学助手

这是一个可启动的静态站点版本。

## 本地启动

```bash
npm start
```

启动后访问：

```text
http://localhost:4173
```

如需换端口：

```bash
PORT=3000 npm start
```

如需在服务器或容器中对外监听：

```bash
HOST=0.0.0.0 PORT=3000 npm start
```

## 部署

把本目录作为静态站点发布即可，入口文件是 `index.html`。如果部署平台支持 Node.js，也可以使用：

```bash
npm start
```

当前页面通过公共 CDN 加载 React、ReactDOM 和 Babel，因此访问环境需要能够连接这些 CDN。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个仓库。
2. 把本项目推送到仓库的 `main` 分支。
3. 打开仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 里选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/ (root)`。
6. 保存后等待 GitHub Pages 发布完成。

发布后，站点地址通常是：

```text
https://你的用户名.github.io/仓库名/
```
