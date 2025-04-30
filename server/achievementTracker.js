import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ACHIEVEMENTS_FILE = path.join(__dirname, '../store/achievements.json');
const ACTIVITY_LOG_FILE = path.join(__dirname, '../store/activity-log.json');

// 成就定义
const ACHIEVEMENTS = {
  starter: { name: '初学者', description: '完成第一天的学习', condition: 'days', threshold: 1 },
  daily7: { name: '坚持一周', description: '连续学习7天', condition: 'streak', threshold: 7 },
  daily30: { name: '月度达人', description: '连续学习30天', condition: 'streak', threshold: 30 },
  vocab100: { name: '词汇入门', description: '学习100个单词', condition: 'words', threshold: 100 },
  vocab500: { name: '词汇专家', description: '学习500个单词', condition: 'words', threshold: 500 },
  vocab1000: { name: '词汇大师', description: '学习1000个单词', condition: 'words', threshold: 1000 },
  wrongClear10: { name: '错题克星', description: '从错题本中移除10个单词', condition: 'wrongCleared', threshold: 10 }
};

/**
 * 获取成就数据
 * @returns {Object} 成就数据
 */
export function getAchievements() {
  try {
    if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
      const initialData = {
        totalWordsReviewed: 0,
        dailyGoal: 20,
        currentStreak: 0,
        lastActiveDate: '',
        achievements: Object.fromEntries(
          Object.keys(ACHIEVEMENTS).map(key => [key, false])
        )
      };
      fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    
    const data = fs.readFileSync(ACHIEVEMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('获取成就数据失败:', error);
    return {
      totalWordsReviewed: 0,
      dailyGoal: 20,
      currentStreak: 0,
      lastActiveDate: '',
      achievements: {}
    };
  }
}

/**
 * 保存成就数据
 * @param {Object} data - 成就数据
 */
function saveAchievements(data) {
  try {
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('保存成就数据失败:', error);
  }
}

/**
 * 记录活动日志
 * @param {string} type - 活动类型
 * @param {*} value - 活动值
 */
function logActivity(type, value) {
  try {
    let logs = [];
    if (fs.existsSync(ACTIVITY_LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, 'utf8'));
    }
    
    logs.push({
      type,
      value,
      timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync(ACTIVITY_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
}

/**
 * 更新连续打卡天数
 */
function updateStreak() {
  const data = getAchievements();
  const today = new Date().toISOString().split('T')[0];
  
  if (!data.lastActiveDate) {
    // 首次使用
    data.currentStreak = 1;
    data.lastActiveDate = today;
  } else if (data.lastActiveDate === today) {
    // 今天已经记录过，不做改变
  } else {
    const lastDate = new Date(data.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // 连续打卡
      data.currentStreak += 1;
    } else if (diffDays > 1) {
      // 中断了，重新开始
      data.currentStreak = 1;
    }
    
    data.lastActiveDate = today;
  }
  
  saveAchievements(data);
  return data.currentStreak;
}

/**
 * 检查并解锁成就
 * @param {Object} data - 成就数据
 */
function checkAchievements(data) {
  let updated = false;
  
  // 检查每个成就的条件
  Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
    if (data.achievements[key] === true) return; // 已解锁
    
    let unlocked = false;
    switch (achievement.condition) {
      case 'days':
        unlocked = true; // 只要有活动就解锁
        break;
      case 'streak':
        unlocked = data.currentStreak >= achievement.threshold;
        break;
      case 'words':
        unlocked = data.totalWordsReviewed >= achievement.threshold;
        break;
      case 'wrongCleared':
        unlocked = data.wrongWordsCleared >= achievement.threshold;
        break;
    }
    
    if (unlocked) {
      data.achievements[key] = true;
      updated = true;
      console.log(`成就解锁: ${achievement.name}`);
    }
  });
  
  if (updated) {
    saveAchievements(data);
  }
  
  return updated;
}

/**
 * 记录成就进度
 * @param {string} type - 活动类型
 * @param {*} value - 活动值
 */
export function trackAchievement(type, value) {
  try {
    // 记录活动
    logActivity(type, value);
    
    // 获取当前成就数据
    const data = getAchievements();
    
    // 更新连续打卡
    updateStreak();
    
    // 根据活动类型更新数据
    switch (type) {
      case 'wordReviewed':
        data.totalWordsReviewed += 1;
        break;
      case 'wrongWordCleared':
        data.wrongWordsCleared = (data.wrongWordsCleared || 0) + 1;
        break;
      case 'dailyGoalCompleted':
        // 已在updateStreak中处理
        break;
    }
    
    // 保存更新
    saveAchievements(data);
    
    // 检查是否解锁新成就
    checkAchievements(data);
    
    return data;
  } catch (error) {
    console.error('记录成就失败:', error);
    throw new Error(`记录成就失败: ${error.message}`);
  }
}
