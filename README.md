# 作品集网站 Portfolio

个人作品集展示网站，纯静态实现，支持 GitHub Pages 部署。

## 功能特性

- ✅ 个人信息展示（姓名、头衔、简介、联系方式）
- ✅ 支持上传：图片、视频、WebP 动图、网站链接
- ✅ 自定义分类（可随意添加/删除分类并命名）
- ✅ 规整网格布局，点击弹窗查看大图/视频
- ✅ 作品描述文字
- ✅ 管理员密码保护
- ✅ 数据本地持久化（localStorage）
- ✅ 无需服务器，部署零成本

## 本地预览

直接用浏览器打开 `index.html` 即可，无需安装任何依赖。

## 部署到 GitHub Pages

### 方法一：通过 GitHub Actions（推荐）

1. 在 GitHub 新建仓库
2. 将本项目推送到 `main` 分支：

```bash
cd portfolio
git init
git add .
git commit -m "init: portfolio website"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

3. 在 GitHub 仓库 → **Settings** → **Pages** → Source 选择 **GitHub Actions**
4. 等待 Actions 运行完毕，访问 `https://你的用户名.github.io/仓库名/`

### 方法二：直接用 gh-pages 分支

Settings → Pages → Source 选择 `main` 分支 → 根目录 `/`

## 管理密码

默认密码：**portfolio2024**

如需修改，编辑 `assets/js/app.js` 第 5 行：

```js
const ADMIN_PASSWORD = 'portfolio2024'; // 改成你的密码
```

## 使用说明

1. 打开网站后，点击右下角 **+** 按钮进入管理
2. 输入管理密码（默认 `portfolio2024`）
3. **添加作品**：选择类型 → 上传文件/填写链接 → 填写标题和描述 → 提交
4. **分类管理**：添加或删除自定义分类
5. **个人资料**：修改姓名、头衔、简介、联系方式和头像

## 注意事项

- 所有数据和文件存储在浏览器的 **localStorage**，同一台电脑同一浏览器访问才能看到数据
- 如果需要在不同设备都能看到相同内容，建议将文件手动存放在 `assets/works/` 目录，修改 `assets/js/app.js` 中的默认数据
- 大文件（>5MB 的视频）可能加载较慢，建议压缩后上传
