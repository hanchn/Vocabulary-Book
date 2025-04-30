// scripts/init.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const cwd = process.cwd(); // 👈 当前目录作为根目录
const structureFile = path.join(cwd, 'SourceTree.json');
const gitignoreFile = path.join(cwd, '.gitignore');

const log = (msg, icon = '📄') => console.log(`${icon} ${msg}`);

// ---------------------
// 🔍 解析 .gitignore
// ---------------------
let ignoreList = [];

if (fs.existsSync(gitignoreFile)) {
  const raw = fs.readFileSync(gitignoreFile, 'utf-8');
  ignoreList = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

const isIgnored = (relPath) =>
  ignoreList.some(rule =>
    relPath === rule ||
    relPath.startsWith(rule + '/') ||
    (rule.endsWith('/') && relPath.startsWith(rule))
  );

// ---------------------
// 📂 创建结构
// ---------------------
function createStructure(basePath, tree) {
  for (const name in tree) {
    const value = tree[name];
    const absPath = path.join(basePath, name);
    const relPath = path.relative(cwd, absPath);

    if (isIgnored(relPath)) {
      log(`忽略 .gitignore 文件: ${relPath}`, '🚫');
      continue;
    }

    if (value === null) {
      if (!fs.existsSync(absPath)) {
        fs.writeFileSync(absPath, '');
        log(`创建文件: ${relPath}`, '📄');
      } else {
        log(`已存在文件: ${relPath}`, '⏭️');
      }
    } else if (Array.isArray(value)) {
      if (!fs.existsSync(absPath)) fs.mkdirSync(absPath, { recursive: true });
      for (const file of value) {
        const filePath = path.join(absPath, file);
        const fileRel = path.relative(cwd, filePath);
        if (isIgnored(fileRel)) {
          log(`忽略 .gitignore 文件: ${fileRel}`, '🚫');
          continue;
        }
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '');
          log(`创建文件: ${fileRel}`, '📄');
        } else {
          log(`已存在文件: ${fileRel}`, '⏭️');
        }
      }
    } else if (typeof value === 'object') {
      if (!fs.existsSync(absPath)) {
        fs.mkdirSync(absPath, { recursive: true });
        log(`创建目录: ${relPath}`, '📁');
      }
      createStructure(absPath, value); // 递归处理子结构
    }
  }
}

// ---------------------
// 🔍 反向扫描结构
// ---------------------
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath);
  const structure = {};

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const relPath = path.relative(cwd, fullPath);
    if (isIgnored(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const children = scanDirectory(fullPath);
      structure[entry] = children;
    } else {
      structure[entry] = null;
    }
  }

  return structure;
}

// ---------------------
// 🚀 执行主逻辑
// ---------------------
function run() {
  // 1. 构建结构
  if (fs.existsSync(structureFile)) {
    const structure = JSON.parse(fs.readFileSync(structureFile, 'utf-8'));
    console.log('📦 构建目录结构...');
    createStructure(cwd, structure);
  } else {
    console.log('⚠️ 未找到 SourceTree.json，跳过构建结构');
  }

  // 2. 扫描结构
  console.log('\n🧠 扫描当前文件夹生成最新结构...');
  const structure = scanDirectory(cwd);
  fs.writeFileSync(structureFile, JSON.stringify(structure, null, 2), 'utf-8');
  console.log('✅ 已更新 SourceTree.json');
}

run();
