import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../config.json');

// 默认配置
const DEFAULT_CONFIG = {
  dailyGoal: 20,
  defaultLibrary: 'cet4',
  availableLibraries: ['kindergarten', 'elementary', 'cet4', 'cet6', 'cet8'],
  reviewSettings: {
    easyInterval: 7,
    mediumInterval: 3,
    hardInterval: 1
  },
  serverPort: 3000,
  audioEnabled: true,
  achievementEnabled: true
};

/**
 * 获取配置
 * @returns {Object} 配置对象
 */
export function getConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
      return DEFAULT_CONFIG;
    }
    
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('读取配置失败:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 更新配置
 * @param {Object} newConfig - 新配置
 * @returns {Object} 更新后的配置
 */
export function updateConfig(newConfig) {
  try {
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf8');
    return updatedConfig;
  } catch (error) {
    console.error('更新配置失败:', error);
    throw new Error(`更新配置失败: ${error.message}`);
  }
}