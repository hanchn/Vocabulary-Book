// public/review.js

const $ = (sel) => document.querySelector(sel);

let wordList = [];       // 今日任务：['abandon', 'adapt', ...]
let wordDataMap = {};    // { abandon: {...}, adapt: {...} }
let currentIndex = 0;

async function fetchTodayWords() {
  const res = await fetch('/api/daily-task');
  return res.json(); // ['abandon', 'adapt', ...]
}

async function fetchLibraryWords(libraryName = 'cet4') {
  const res = await fetch(`/api/library/${libraryName}`);
  const list = await res.json();
  const map = {};
  for (const item of list) {
    if (item.word) map[item.word] = item;
  }
  return map;
}

function showWord(index) {
  const word = wordList[index];
  const data = wordDataMap[word];

  $('#definition').textContent = data?.definition ?? '无';
  $('#example').textContent = data?.example ?? '无';
  $('#phonetic').textContent = data?.phonetic ?? '无';

  $('#answerInput').value = '';
  $('#feedback').textContent = '';
  $('#nextBtn').style.display = 'none';
}

function handleCheck() {
  const input = $('#answerInput').value.trim().toLowerCase();
  const currentWord = wordList[currentIndex].toLowerCase();

  if (input === currentWord) {
    $('#feedback').textContent = '✅ 正确！';
    $('#feedback').style.color = 'green';
    $('#nextBtn').style.display = 'inline-block';
  } else {
    $('#feedback').textContent = '❌ 错误，请再试一次';
    $('#feedback').style.color = 'red';

    // 添加到错词本
    fetch('/api/wrong-words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: currentWord,
        fromLibrary: 'cet4',
        note: `拼错为 ${input}`
      })
    });
  }
}

function nextWord() {
  currentIndex += 1;
  if (currentIndex >= wordList.length) {
    alert('🎉 今日练习完成！');
    window.location.href = '/';
    return;
  }
  showWord(currentIndex);
}

// 绑定事件
$('#submitBtn').addEventListener('click', handleCheck);
$('#nextBtn').addEventListener('click', nextWord);

// 初始化流程
(async function init() {
  wordList = await fetchTodayWords();
  wordDataMap = await fetchLibraryWords();
  currentIndex = 0;
  showWord(currentIndex);
})();
