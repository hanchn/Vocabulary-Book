// server/achievementTracker.js
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve('./store/achievements.json');

const defaultData = {
  totalWordsReviewed: 0,
  dailyGoal: 20,
  currentStreak: 0,
  lastActiveDate: null,
  achievements: {
    starter: false,
    daily7: false,
    vocab500: false
  }
};

function readData() {
  if (!fs.existsSync(FILE_PATH)) return { ...defaultData };
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { ...defaultData };
  }
}

function saveData(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 获取当前成就状态
 */
export function getAchievements() {
  return readData();
}

/**
 * 增加打卡记录（在用户完成每日任务时调用）
 */
export function recordDailyCheckIn(today = new Date()) {
  const data = readData();
  const todayStr = today.toISOString().split('T')[0];

  if (data.lastActiveDate === todayStr) return data; // 已打卡

  const last = new Date(data.lastActiveDate);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

  if (isNaN(diff) || diff > 1) {
    data.currentStreak = 1;
  } else {
    data.currentStreak += 1;
  }

  data.lastActiveDate = todayStr;
  data.achievements.starter = true;
  if (data.currentStreak >= 7) data.achievements.daily7 = true;

  saveData(data);
  return data;
}

/**
 * 增加学习词数（每次完成任务后调用）
 */
export function incrementWordsLearned(count = 1) {
  const data = readData();
  data.totalWordsReviewed += count;

  if (data.totalWordsReviewed >= 500) {
    data.achievements.vocab500 = true;
  }

  saveData(data);
  return data;
}
