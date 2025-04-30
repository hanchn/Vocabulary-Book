import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { loadYamlFile } from './utils/yamlParser.js';
import { getWrongWords, addWrongWord, removeWrongWord } from './wrongWordsManager.js';
import { trackAchievement, getAchievements } from './achievementTracker.js';
import { getDailyTask, updateTaskProgress } from './taskScheduler.js';
import { getConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = getConfig().serverPort || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 获取可用词库列表
app.get('/api/libraries', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const libraries = fs.readdirSync(dataDir)
      .filter(item => fs.statSync(path.join(dataDir, item)).isDirectory() && !item.startsWith('.'));
    
    res.json({ libraries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取特定词库的单词
app.get('/api/words/:library', async (req, res) => {
  try {
    const { library } = req.params;
    const dataDir = path.join(__dirname, '../data', library);
    
    console.log('请求词库:', library);
    console.log('词库路径:', dataDir);
    
    if (!fs.existsSync(dataDir)) {
      console.log('词库目录不存在');
      return res.status(404).json({ error: '词库不存在' });
    }
    
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    
    console.log('找到的YAML文件:', files);
    
    let allWords = [];
    for (const file of files) {
      try {
        const words = await loadYamlFile(path.join(dataDir, file));
        console.log(`文件 ${file} 中的单词数量:`, words ? words.length : 0);
        if (words && Array.isArray(words)) {
          allWords = [...allWords, ...words];
        }
      } catch (fileError) {
        console.error(`解析文件 ${file} 出错:`, fileError);
      }
    }
    
    console.log('总单词数量:', allWords.length);
    
    res.json({ words: allWords });
  } catch (error) {
    console.error('获取词库单词出错:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取错词本
app.get('/api/wrong-words', (req, res) => {
  try {
    const wrongWords = getWrongWords();
    res.json({ wrongWords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加错词
app.post('/api/wrong-words', (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: '缺少单词信息' });
    }
    
    addWrongWord(word);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 从错词本移除单词
app.delete('/api/wrong-words/:word', (req, res) => {
  try {
    const { word } = req.params;
    removeWrongWord(word);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取成就
app.get('/api/achievements', (req, res) => {
  try {
    const achievements = getAchievements();
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 记录成就
app.post('/api/achievements', (req, res) => {
  try {
    const { type, value } = req.body;
    if (!type) {
      return res.status(400).json({ error: '缺少成就类型' });
    }
    
    trackAchievement(type, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取每日任务
app.get('/api/daily-task', (req, res) => {
  try {
    const task = getDailyTask();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新任务进度
app.post('/api/daily-task/progress', (req, res) => {
  try {
    const { wordId, status } = req.body;
    if (!wordId || !status) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    updateTaskProgress(wordId, status);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
