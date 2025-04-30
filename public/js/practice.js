// 全局变量
let currentLibrary = '';
let wordsList = [];
let currentWord = null;
let speechSynthesis = window.speechSynthesis;

// DOM 元素
const librarySelect = document.getElementById('library-select');
const loadLibraryBtn = document.getElementById('load-library-btn');
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
  // 加载可用词库
  fetchLibraries();
  
  // 绑定事件
  loadLibraryBtn.addEventListener('click', loadSelectedLibrary);
  checkButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', loadNewWord);
  
  // 支持按回车键提交
  wordInputElement.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
});

// 获取可用词库列表
async function fetchLibraries() {
  try {
    const response = await fetch('/api/libraries');
    const data = await response.json();
    
    if (data.libraries && data.libraries.length > 0) {
      // 清空选择框
      librarySelect.innerHTML = '';
      
      // 添加默认选项
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- 请选择词库 --';
      librarySelect.appendChild(defaultOption);
      
      // 添加词库选项
      data.libraries.forEach(library => {
        const option = document.createElement('option');
        option.value = library;
        option.textContent = library;
        librarySelect.appendChild(option);
      });
    } else {
      librarySelect.innerHTML = '<option value="">没有可用的词库</option>';
      loadLibraryBtn.disabled = true;
    }
  } catch (error) {
    console.error('获取词库列表失败:', error);
    librarySelect.innerHTML = '<option value="">加载失败</option>';
  }
}

// 加载选中的词库
async function loadSelectedLibrary() {
  const selectedLibrary = librarySelect.value;
  
  if (!selectedLibrary) {
    alert('请先选择一个词库');
    return;
  }
  
  try {
    // 显示加载状态
    maskedWordElement.textContent = '加载中...';
    definitionElement.textContent = '加载中...';
    exampleElement.textContent = '加载中...';
    phoneticElement.textContent = '加载中...';
    
    console.log('正在请求词库:', selectedLibrary);
    
    // 获取词库单词
    const response = await fetch(`/api/words/${selectedLibrary}`);
    
    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('获取到的词库数据:', data);
    
    if (data.words && data.words.length > 0) {
      console.log(`成功加载 ${data.words.length} 个单词`);
      wordsList = data.words;
      currentLibrary = selectedLibrary;
      
      // 启用输入和按钮
      wordInputElement.disabled = false;
      checkButton.disabled = false;
      
      // 加载第一个单词
      loadNewWord();
    } else {
      console.log('词库中没有单词');
      maskedWordElement.textContent = '该词库没有单词';
      definitionElement.textContent = '-';
      exampleElement.textContent = '-';
      phoneticElement.textContent = '-';
      
      wordInputElement.disabled = true;
      checkButton.disabled = true;
    }
  } catch (error) {
    console.error('加载词库失败:', error);
    maskedWordElement.textContent = '加载词库失败';
    definitionElement.textContent = error.message;
    exampleElement.textContent = '-';
    phoneticElement.textContent = '-';
  }
}

// 加载新单词
function loadNewWord() {
  if (wordsList.length === 0) {
    return;
  }
  
  // 随机选择一个单词
  const randomIndex = Math.floor(Math.random() * wordsList.length);
  currentWord = wordsList[randomIndex];
  
  // 显示单词信息
  definitionElement.textContent = currentWord.definition || '无释义';
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
    
    // 记录成就（如果有API）
    try {
      fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'wordLearned',
          value: 1
        })
      });
    } catch (error) {
      console.error('记录成就失败:', error);
    }
  } else {
    resultMessage.innerHTML = `<div class="alert alert-danger">错误！正确答案是: ${currentWord.word}</div>`;
    
    // 添加到错词本（如果有API）
    try {
      fetch('/api/wrong-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word: currentWord
        })
      });
    } catch (error) {
      console.error('添加错词失败:', error);
    }
  }
}