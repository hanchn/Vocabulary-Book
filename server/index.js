// server/index.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { listLibraries, loadLibrary } from './fileLoader.js';
import { getTodayTask } from './taskScheduler.js';
import { loadWrongWords, addWrongWord, removeWrongWord } from './wrongWordsManager.js';
import { getAchievements, recordDailyCheckIn, incrementWordsLearned } from './achievementTracker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());

// ------------------- API -------------------

// 获取词库列表
app.get('/api/libraries', (req, res) => {
  res.json(listLibraries());
});

// 获取词库单词
app.get('/api/library/:name', (req, res) => {
  const words = loadLibrary(req.params.name);
  res.json(words);
});

// 获取错词本
app.get('/api/wrong-words', (req, res) => {
  res.json(loadWrongWords());
});

// 添加/更新错词
app.post('/api/wrong-words', (req, res) => {
  const { word, fromLibrary, note } = req.body;
  if (!word || !fromLibrary) return res.status(400).json({ error: 'word and fromLibrary required' });
  addWrongWord({ word, fromLibrary, note });
  res.json({ success: true });
});

// 删除错词
app.delete('/api/wrong-words/:word', (req, res) => {
  removeWrongWord(req.params.word);
  res.json({ success: true });
});

// 获取成就信息
app.get('/api/achievements', (req, res) => {
  res.json(getAchievements());
});

// 打卡
app.post('/api/achievements/check-in', (req, res) => {
  res.json(recordDailyCheckIn());
});

// 累计词数
app.post('/api/achievements/increment', (req, res) => {
  const { count = 1 } = req.body;
  res.json(incrementWordsLearned(count));
});

// 获取今日任务
app.get('/api/daily-task', (req, res) => {
  res.json(getTodayTask());
});

// ------------------- 静态资源 -------------------
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// 默认主页
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ 服务器已启动：http://localhost:${PORT}`);
});
