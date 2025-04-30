// public/app.js

const $ = (selector) => document.querySelector(selector);

const api = {
  async getLibraries() {
    const res = await fetch('/api/libraries');
    return res.json();
  },

  async getDailyTask() {
    const res = await fetch('/api/daily-task');
    return res.json();
  },

  async getAchievements() {
    const res = await fetch('/api/achievements');
    return res.json();
  },

  async checkIn() {
    const res = await fetch('/api/achievements/check-in', {
      method: 'POST'
    });
    return res.json();
  },

  async updateDailyGoal(goal) {
    const config = {
      defaultLibrary: $('#librarySelect').value,
      dailyGoal: parseInt(goal, 10)
    };
    await fetch('/config.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  },

  async getWordsInLibrary(lib) {
    const res = await fetch(`/api/library/${lib}`);
    return res.json();
  }
};

// 初始化词库选择
async function initLibrarySelect() {
  const list = await api.getLibraries();
  const select = $('#librarySelect');
  list.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

// 显示任务单词
function renderWordList(words) {
  const ul = $('#wordList');
  ul.innerHTML = '';
  words.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    ul.appendChild(li);
  });
}

// 显示成就
function renderAchievements(data) {
  $('#achievementBlock').textContent = JSON.stringify(data, null, 2);
}

// 事件绑定
$('#loadTaskBtn').addEventListener('click', async () => {
  const task = await api.getDailyTask();
  renderWordList(task);
});

$('#checkInBtn').addEventListener('click', async () => {
  const result = await api.checkIn();
  alert('✅ 打卡成功！');
  renderAchievements(result);
});

$('#saveGoalBtn').addEventListener('click', async () => {
  const goal = $('#goalInput').value;
  await api.updateDailyGoal(goal);
  alert('✅ 每日目标已保存');
});

// 初始化
(async function init() {
  await initLibrarySelect();
  const achievements = await api.getAchievements();
  renderAchievements(achievements);
})();

// Sample vocabulary data
const vocabularyData = [
  {
    word: "Ephemeral",
    phonetic: "/ɪˈfɛm(ə)rəl/",
    definition: "Lasting for a very short time.",
    example: "The ephemeral nature of fashion trends makes it hard to keep up.",
    tags: ["adjective", "formal"]
  },
  {
    word: "Serendipity",
    phonetic: "/ˌsɛr(ə)nˈdɪpɪti/",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    example: "The discovery of penicillin was a serendipity.",
    tags: ["noun", "positive"]
  },
  {
    word: "Ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/",
    definition: "Present, appearing, or found everywhere.",
    example: "Mobile phones have become ubiquitous in modern society.",
    tags: ["adjective", "formal"]
  }
];

// DOM Elements
const vocabularyList = document.getElementById('vocabulary-list');
const searchInput = document.querySelector('.search-input');

// Render vocabulary cards
function renderVocabularyCards(data) {
  vocabularyList.innerHTML = '';
  
  if (data.length === 0) {
    vocabularyList.innerHTML = '<p>No words found. Try a different search term.</p>';
    return;
  }
  
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card vocabulary-card';
    
    const tagsHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    card.innerHTML = `
      <div class="word">${item.word}</div>
      <div class="phonetic">${item.phonetic}</div>
      <div class="definition">${item.definition}</div>
      <div class="example">${item.example}</div>
      <div class="tags">${tagsHTML}</div>
    `;
    
    vocabularyList.appendChild(card);
  });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredData = vocabularyData.filter(item => 
    item.word.toLowerCase().includes(searchTerm) || 
    item.definition.toLowerCase().includes(searchTerm)
  );
  renderVocabularyCards(filteredData);
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderVocabularyCards(vocabularyData);
});

// Add new word functionality (to be implemented)
function addNewWord(wordData) {
  vocabularyData.push(wordData);
  renderVocabularyCards(vocabularyData);
  // Here you would also save to localStorage or a backend
}

// Example of adding a new word (for testing)
// Uncomment to test
/*
setTimeout(() => {
  addNewWord({
    word: "Eloquent",
    phonetic: "/ˈɛləkwənt/",
    definition: "Fluent or persuasive in speaking or writing.",
    example: "She gave an eloquent speech that moved the audience.",
    tags: ["adjective", "positive"]
  });
}, 3000);
*/
