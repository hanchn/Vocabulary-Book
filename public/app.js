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
