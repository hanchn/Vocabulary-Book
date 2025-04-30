// scripts/init.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 当前执行目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);
const structureFile = path.join(projectRoot, 'SourceTree.json');
const gitignorePath = path.join(projectRoot, '.gitignore');

// 解析 .gitignore
let gitignorePatterns = [];
if (fs.existsSync(gitignorePath)) {
  const lines = fs.readFileSync(gitignorePath, 'utf-8').split(/\r?\n/);
  gitignorePatterns = lines
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(p => p.replace(/\/+$/, '')); // 去除尾部斜杠
}

/**
 * 判断某个相对路径是否被 gitignore 忽略
 */
const isIgnored = (relativePath) => {
  return gitignorePatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return relativePath.startsWith(pattern.slice(0, -1));
    }
    return relativePath === pattern || relativePath.startsWith(pattern + '/');
  });
};

/**
 * 递归创建结构
 */
const createFromStructure = (base, tree) => {
  for (const name in tree) {
    const value = tree[name];
    const fullPath = path.join(base, name);
    const relPath = path.relative(projectRoot, fullPath);

    if (isIgnored(relPath)) {
      console.log(`🚫 忽略: ${relPath}`);
      continue;
    }

    if (value === null) {
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, '');
        console.log(`📄 创建文件: ${relPath}`);
      } else {
        console.log(`⏭️ 跳过已存在文件: ${relPath}`);
      }
    } else if (Array.isArray(value)) {
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      value.forEach(file => {
        const filePath = path.join(fullPath, file);
        const fileRel = path.relative(projectRoot, filePath);
        if (isIgnored(fileRel)) return console.log(`🚫 忽略: ${fileRel}`);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '');
          console.log(`📄 创建文件: ${fileRel}`);
        } else {
          console.log(`⏭️ 跳过已存在文件: ${fileRel}`);
        }
      });
    } else {
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 确保目录: ${relPath}`);
      createFromStructure(fullPath, value);
    }
  }
};

/**
 * 扫描当前目录结构（排除 gitignore）
 */
const scanDirectory = (dir) => {
  const entries = fs.readdirSync(dir);
  const result = {};

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(projectRoot, fullPath);
    if (isIgnored(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const children = scanDirectory(fullPath);
      result[entry] = children;
    } else {
      result[entry] = null;
    }
  }

  return result;
};

// 主流程
const run = () => {
  // 1. 构建结构
  if (fs.existsSync(structureFile)) {
    console.log('🚀 基于 SourceTree.json 开始构建...');
    const structure = JSON.parse(fs.readFileSync(structureFile, 'utf-8'));
    createFromStructure(projectRoot, structure);
  } else {
    console.log('⚠️ 未找到 SourceTree.json，跳过构建目录。');
  }

  // 2. 生成当前结构 → 更新 SourceTree.json
  console.log('\n🔍 扫描并更新项目结构到 SourceTree.json...');
  const currentStructure = scanDirectory(projectRoot);
  fs.writeFileSync(structureFile, JSON.stringify(currentStructure, null, 2), 'utf-8');
  console.log('✅ 已写入最新结构到 SourceTree.json');
};

run();
