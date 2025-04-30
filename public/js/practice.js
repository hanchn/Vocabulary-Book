// 从本地存储获取词汇列表
let vocabularyList = JSON.parse(localStorage.getItem('vocabularyList')) || [];
let currentWord = null;
let speechSynthesis = window.speechSynthesis;

// DOM 元素
const maskedWordElement = document.getElementById('masked-word');
const definitionElement = document.getElementById('definition');
const exampleElement = document.getElementById('example');
const phoneticElement = document.getElementById('phonetic');
const wordInputElement = document.getElementById('word-input');
const checkButton = document.getElementById('check-btn');
const resultContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const nextButton = document.getElementById('next-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  if (vocabularyList.length === 0) {
    maskedWordElement.textContent = '没有可用的单词';
    definitionElement.textContent = '请先添加一些单词';
    document.getElementById('word-input').disabled = true;
    document.getElementById('check-btn').disabled = true;
  } else {
    loadNewWord();
  }
  
  // 绑定事件
  checkButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', loadNewWord);
  
  // 支持按回车键提交
  wordInputElement.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
});

// 加载新单词
function loadNewWord() {
  // 随机选择一个单词
  const randomIndex = Math.floor(Math.random() * vocabularyList.length);
  currentWord = vocabularyList[randomIndex];
  
  // 显示单词信息
  definitionElement.textContent = currentWord.definition;
  exampleElement.textContent = currentWord.example || '无例句';
  phoneticElement.textContent = currentWord.phonetic || '';
  
  // 创建带缺省字母的单词显示
  const maskedWord = createMaskedWord(currentWord.word);
  maskedWordElement.textContent = maskedWord;
  
  // 重置输入和结果
  wordInputElement.value = '';
  wordInputElement.disabled = false;
  checkButton.disabled = false;
  resultContainer.style.display = 'none';
  
  // 朗读单词三次
  speakWordThreeTimes(currentWord.word);
  
  // 聚焦到输入框
  wordInputElement.focus();
}

// 创建带缺省字母的单词
function createMaskedWord(word) {
  let maskedWord = '';
  const letters = word.split('');
  
  // 确定要隐藏的字母数量（约40%-60%的字母）
  const hideCount = Math.floor(word.length * (Math.random() * 0.2 + 0.4));
  
  // 随机选择要隐藏的位置
  const hidePositions = [];
  while (hidePositions.length < hideCount) {
    const pos = Math.floor(Math.random() * word.length);
    if (!hidePositions.includes(pos)) {
      hidePositions.push(pos);
    }
  }
  
  // 创建带下划线的单词
  for (let i = 0; i < letters.length; i++) {
    if (hidePositions.includes(i)) {
      maskedWord += '_';
    } else {
      maskedWord += letters[i];
    }
  }
  
  return maskedWord;
}

// 朗读单词三次，每次间隔一秒
function speakWordThreeTimes(word) {
  // 检查浏览器是否支持语音合成
  if (!speechSynthesis) {
    console.error('浏览器不支持语音合成');
    return;
  }
  
  // 创建语音对象
  const speak = (index) => {
    if (index >= 3) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    
    // 朗读结束后，安排下一次朗读
    utterance.onend = () => {
      if (index < 2) {
        setTimeout(() => speak(index + 1), 1000);
      }
    };
    
    speechSynthesis.speak(utterance);
  };
  
  // 开始第一次朗读
  speak(0);
}

// 检查答案
function checkAnswer() {
  const userAnswer = wordInputElement.value.trim().toLowerCase();
  const correctAnswer = currentWord.word.toLowerCase();
  
  resultContainer.style.display = 'block';
  
  if (userAnswer === correctAnswer) {
    resultMessage.innerHTML = `<div class="alert alert-success">正确！👏</div>`;
    wordInputElement.disabled = true;
    checkButton.disabled = true;
    
    // 更新单词状态
    updateWordStatus(true);
  } else {
    resultMessage.innerHTML = `<div class="alert alert-danger">错误！正确答案是: ${currentWord.word}</div>`;
    
    // 更新单词状态
    updateWordStatus(false);
  }
}

// 更新单词状态
function updateWordStatus(isCorrect) {
  // 找到当前单词在列表中的索引
  const index = vocabularyList.findIndex(item => item.id === currentWord.id);
  
  if (index !== -1) {
    // 更新复习次数
    vocabularyList[index].reviewCount = (vocabularyList[index].reviewCount || 0) + 1;
    vocabularyList[index].lastReviewed = new Date().toISOString();
    
    // 如果答错，添加到错词本
    if (!isCorrect && !vocabularyList[index].isWrong) {
      vocabularyList[index].isWrong = true;
    }
    
    // 如果答对，可以考虑更新掌握状态
    if (isCorrect && vocabularyList[index].reviewCount > 3) {
      vocabularyList[index].mastered = true;
    }
    
    // 保存到本地存储
    saveVocabularyList();
  }
}

// 保存词汇列表到本地存储
function saveVocabularyList() {
  localStorage.setItem('vocabularyList', JSON.stringify(vocabularyList));
}