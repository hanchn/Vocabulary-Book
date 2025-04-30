## 📘 Vocabulary-Book 项目进度总结（2025-04-30）

### ✅ 项目定位

一个基于本地词库（YAML）+ JSON 持久化的**插拔式单词记忆工具**，支持离线使用、错词本、成就系统和每日练习机制。

---

### ✅ 当前目录结构

已完成结构初始化，并保存为：

```
SourceTree.json（已自动生成与更新）
```

目录结构支持 `.gitignore` 排除处理，初始化脚本已完成：

```
scripts/init.mjs + npm run init
```

---

### ✅ 已完成的功能模块

| 模块文件 | 功能 |
|----------|------|
| `server/fileLoader.js` | 加载词库目录，读取 YAML 单词数据 |
| `server/wrongWordsManager.js` | 错词记录管理，支持添加、去重、删除 |
| `server/achievementTracker.js` | 成就系统，支持打卡、累计学习、勋章 |
| `server/taskScheduler.js` | 每日任务生成与缓存 |
| `server/index.js` | Node.js 服务端主入口，整合所有 REST API 接口 |

---

### ✅ 已完成的前端页面

| 页面 | 功能 |
|------|------|
| `public/index.html` + `app.js` | 首页：词库选择、目标设置、获取任务、打卡、成就展示 |
| `public/review.html` + `review.js` | 单词练习页：释义提示、输入拼写、错误记录、自动切词 |

---

### ✅ 已完成的配置与数据

| 文件 | 内容 |
|------|------|
| `config.json` | 每日目标与默认词库配置（可手动编辑） |
| `store/wrong-words.json` | 错词记录数据，自动维护 |
| `store/achievements.json` | 成就与打卡数据，自动维护 |
| `store/daily-task.json` | 今日任务缓存（防止重复抽词） |

---

### ✅ 支持的 API 接口

已在 `server/index.js` 中集成以下接口：

| 接口 | 说明 |
|------|------|
| `GET /api/libraries` | 获取词库目录名列表 |
| `GET /api/library/:name` | 加载词库内容 |
| `GET/POST/DELETE /api/wrong-words` | 错词增删查 |
| `GET /api/achievements` | 查看成就 |
| `POST /api/achievements/check-in` | 打卡 |
| `POST /api/achievements/increment` | 累计学习数量 |
| `GET /api/daily-task` | 获取今日任务单词列表 |

---

### 🔧 开发脚本

```json
"scripts": {
  "init": "node scripts/init.mjs",
  "start": "node server/index.js"
}
```
