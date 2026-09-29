# 美食菜谱食谱大全 - GitHub Pages 部署文档

## 项目简介
纯原生 HTML + CSS + JavaScript 实现的 **美食菜谱食谱大全** 站。
站内预置 8 条高质量内容，支持分类筛选、关键词搜索、主题切换、移动端流式卡片布局、详情弹窗展示。
GitHub Actions 每日定时（北京时间 1:02 左右）刷新排序、更新阅读热度/评分时间戳，保持内容新鲜感。

## 功能特性
- ✅ 原生 HTML/CSS/JS，零前端框架，无 CDN 依赖
- ✅ 暗色/浅色主题切换（跟随系统 + localStorage 记忆偏好）
- ✅ 分类筛选：全部 / 家常菜 / 烘焙甜点 / 川菜湘菜 / 西餐 / 减脂餐 / 汤羹
- ✅ 关键词全站搜索（标题+所有字段合并模糊匹配）
- ✅ 卡片流式布局（>1024px 多列，<720px 单列，自适应）
- ✅ 卡片点击弹窗详情（字段自动分 KV 表 + 大段落 + 代码高亮容器 + 优/缺点列表）
- ✅ 评分/分数项目大号渐变色展示
- ✅ GitHub Actions 每日定时刷新（打乱顺序、views/评分扰动），保持首页动态变化
- ✅ 所有资源读取本地 `data/data.json`，彻底规避浏览器跨域问题

## 目录结构
```
web16/
├── index.html
├── css/style.css           # 主题色：#ef4444 + #f97316
├── js/app.js
├── data/data.json          # 预置 8 条 美食菜谱食谱大全 内容
└── .github/workflows/deploy.yml
```

## 部署步骤

### 方案 A：独立仓库部署（推荐）
1. GitHub 新建 **Public 仓库**，命名自定，例 `web16-site`。
2. 把 **web16/ 目录下的全部文件（含隐藏的 `.github/`）** 原样拷贝到仓库根目录。
3. 仓库 Settings → **Pages** → Build and deployment：
   - **Source 务必选 `GitHub Actions`**（不要选 gh-pages 分支）。
4. **Actions** → `Daily web16 Content Refresh and Deploy` → 右侧 **Run workflow** → 选 main 分支 → Run。
5. 2~5 分钟后访问：`https://<用户名>.github.io/<仓库名>/`。

### 方案 B：整库（monorepo）一起推
把 yuanmadaquan 这个整库推到 GitHub 时，工作流中的 `folder: web16` 会自动只把 web16/ 目录打包发布为 Pages。
仓库 Settings → Pages → Source 依然选 `GitHub Actions`。

## 防止静态资源 404（已内置，无需修改）
1. **全站相对路径**：`./css/style.css`、`./js/app.js`、`./data/data.json`，无论是子路径 `/repo/` 还是根域名部署都能正确解析。
2. **fetch 自动拼接 `<base>`**：app.js 自动带 base，防止部署到 `https://user.github.io/repo/` 子路径下 data.json 去请求根路径 `/data/data.json` 404。
3. **Actions 方式发布**：不需要 gh-pages 分支，不需要手写 `.nojekyll`（Actions 上传时自动处理）。
如果你改用 **Deploy from branch** 方式发布，请务必在发布根目录放一个空 `.nojekyll` 文件，防止 Jekyll 忽略 `_` 开头的路径。

## 每日自动更新说明
- 工作流触发时间：UTC 17:02（约北京时间 1:02 左右）。
- 刷新逻辑：
  - 每条的 `views`（阅读量）/`rating`（评分）/`score`（评分） 做小幅随机扰动，模拟真实数据每天动态变化。
  - 列表随机洗牌，首页内容不再一成不变。
  - `lastUpdate` 时间戳更新。
- 如要扩充新内容，直接在本地编辑 `data/data.json` 的 `items` 数组 push 即可，下一次工作流会纳入循环。

## 本地预览
```bash
# 任选其一
python3 -m http.server 8080 -d web16
npx serve web16
```
然后访问 http://localhost:8080/。

## 常见问题

**Q: 页面空白 / 资源 404？**
A: ① Settings → Pages → Source **必须是 GitHub Actions**；② 查看 Actions 工作流日志，确保绿色通过；③ 确认你没有把 index.html 中相对路径改成绝对路径（如 `/css/style.css`）。

**Q: 打开详情弹窗滚动条消失？**
A: 这是预期的「锁滚动」行为，点弹窗右上角 ✕ 或按 ESC 或点遮罩关闭即可解锁。

**Q: 搜索搜不到？**
A: 搜索范围是条目所有字段的合并文本（包括分类、作者、正文中的字）。搜索中文关键词不区分简繁体，但需要是完全包含的子串。

**Q: GitHub Actions 工作流红色失败？**
A: 常见原因：① 仓库是 Private，Pages/Artifact 额度用完；② Python setup 步骤网络超时。重跑一次（Actions → 对应 Run → Re-run all jobs）通常可解。
