// 词汇数据存储
let vocabularyList = JSON.parse(localStorage.getItem('vocabularyList')) || [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查当前页面
  const currentPage = window.location.pathname.split('/').pop();
  
  // 根据页面执行不同的初始化函数
  if (currentPage === 'index.html' || currentPage === '') {
    initHomePage();
  } else if (currentPage === 'vocabulary.html') {
    initVocabularyPage();
  } else if (currentPage === 'add.html') {
    initAddPage();
  } else if (currentPage === 'review.html') {
    initReviewPage();
  }
  
  // 初始化搜索功能
  initSearch();
});

// 初始化首页
function initHomePage() {
  // 显示最近添加的词汇
  const recentVocabulary = vocabularyList.slice(-2);
  const vocabularyListElement = document.querySelector('.vocabulary-list');
  
  if (vocabularyListElement) {
    vocabularyListElement.innerHTML = '';
    
    if (recentVocabulary.length === 0) {
      vocabularyListElement.innerHTML = '<p>还没有添加任何词汇。<a href="add.html">立即添加</a></p>';
    } else {
      recentVocabulary.forEach(vocab => {
        vocabularyListElement.appendChild(createVocabularyCard(vocab));
      });
    }
  }
  
  // 更新学习进度
  updateLearningProgress();
}

// 初始化词汇页面
function initVocabularyPage() {
  const vocabularyListElement = document.querySelector('.vocabulary-list');
  
  if (vocabularyListElement) {
    vocabularyListElement.innerHTML = '';
    
    if (vocabularyList.length === 0) {
      vocabularyListElement.innerHTML = '<p>还没有添加任何词汇。<a href="add.html">立即添加</a></p>';
    } else {
      vocabularyList.forEach(vocab => {
        vocabularyListElement.appendChild(createVocabularyCard(vocab));
      });
    }
  }
}

// 初始化添加页面
function initAddPage() {
  const addForm = document.getElementById('add-vocabulary-form');
  
  if (addForm) {
    addForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // 获取表单数据
      const word = document.getElementById('word').value.trim();
      const phonetic = document.getElementById('phonetic').value.trim();
      const definition = document.getElementById('definition').value.trim();
      const example = document.getElementById('example').value.trim();
      
      // 获取选中的标签
      const tags = [];
      document.querySelectorAll('input[name="tag"]:checked').forEach(tag => {
        tags.push(tag.value);
      });
      
      // 创建新词汇对象
      const newVocabulary = {
        id: Date.now(),
        word,
        phonetic,
        definition,
        example,
        tags,
        dateAdded: new Date().toISOString(),
        reviewCount: 0,
        lastReviewed: null,
        mastered: false
      };
      
      // 添加到词汇列表
      vocabularyList.push(newVocabulary);
      
      // 保存到本地存储
      saveVocabularyList();
      
      // 显示成功消息
      showAlert('词汇添加成功！', 'success');
      
      // 重置表单
      addForm.reset();
    });
  }
}

// 初始化复习页面
function initReviewPage() {
  const reviewContainer = document.querySelector('.review-container');
  
  if (reviewContainer) {
    // 获取需要复习的词汇
    const vocabularyToReview = vocabularyList.filter(vocab => !vocab.mastered);
    
    if (vocabularyToReview.length === 0) {
      reviewContainer.innerHTML = '<p>没有需要复习的词汇。<a href="add.html">添加新词汇</a></p>';
    } else {
      // 随机选择一个词汇进行复习
      const randomIndex = Math.floor(Math.random() * vocabularyToReview.length);
      const currentVocab = vocabularyToReview[randomIndex];
      
      // 创建复习卡片
      const reviewCard = document.createElement('div');
      reviewCard.className = 'card review-card';
      reviewCard.innerHTML = `
        <div class="vocabulary-word">${currentVocab.word}</div>
        <div class="vocabulary-phonetic">${currentVocab.phonetic || ''}</div>
        <div class="definition-container" style="display: none;">
          <div class="vocabulary-definition">${currentVocab.definition}</div>
          ${currentVocab.example ? `<div class="vocabulary-example">${currentVocab.example}</div>` : ''}
        </div>
        <button class="btn btn-primary show-definition-btn">显示定义</button>
        <div class="review-buttons" style="display: none;">
          <button class="btn btn-outline review-btn" data-result="again">再次复习</button>
          <button class="btn btn-accent review-btn" data-result="mastered">已掌握</button>
        </div>
      `;
      
      reviewContainer.innerHTML = '';
      reviewContainer.appendChild(reviewCard);
      
      // 显示定义按钮点击事件
      const showDefinitionBtn = reviewCard.querySelector('.show-definition-btn');
      showDefinitionBtn.addEventListener('click', function() {
        reviewCard.querySelector('.definition-container').style.display = 'block';
        showDefinitionBtn.style.display = 'none';
        reviewCard.querySelector('.review-buttons').style.display = 'flex';
      });
      
      // 复习结果按钮点击事件
      const reviewButtons = reviewCard.querySelectorAll('.review-btn');
      reviewButtons.forEach(button => {
        button.addEventListener('click', function() {
          const result = this.getAttribute('data-result');
          
          // 更新词汇复习状态
          const vocabIndex = vocabularyList.findIndex(v => v.id === currentVocab.id);
          if (vocabIndex !== -1) {
            vocabularyList[vocabIndex].reviewCount++;
            vocabularyList[vocabIndex].lastReviewed = new Date().toISOString();
            
            if (result === 'mastered') {
              vocabularyList[vocabIndex].mastered = true;
            }
            
            // 保存到本地存储
            saveVocabularyList();
            
            // 显示下一个词汇
            initReviewPage();
          }
        });
      });
    }
  }
}

// 创建词汇卡片
function createVocabularyCard(vocab) {
  const card = document.createElement('div');
  card.className = 'card vocabulary-card';
  card.innerHTML = `
    <div class="vocabulary-word">${vocab.word}</div>
    <div class="vocabulary-phonetic">${vocab.phonetic || ''}</div>
    <div class="vocabulary-definition">${vocab.definition}</div>
    ${vocab.example ? `<div class="vocabulary-example">${vocab.example}</div>` : ''}
    <div class="vocabulary-tags">
      ${vocab.tags.map(tag => `<span class="vocabulary-tag">${tag}</span>`).join('')}
    </div>
    <div class="card-actions">
      <button class="btn btn-outline edit-btn" data-id="${vocab.id}">编辑</button>
      <button class="btn btn-outline delete-btn" data-id="${vocab.id}">删除</button>
    </div>
  `;
  
  // 添加编辑和删除事件
  const editBtn = card.querySelector('.edit-btn');
  const deleteBtn = card.querySelector('.delete-btn');
  
  editBtn.addEventListener('click', function() {
    const vocabId = parseInt(this.getAttribute('data-id'));
    editVocabulary(vocabId);
  });
  
  deleteBtn.addEventListener('click', function() {
    const vocabId = parseInt(this.getAttribute('data-id'));
    deleteVocabulary(vocabId);
  });
  
  return card;
}

// 编辑词汇
function editVocabulary(id) {
  const vocab = vocabularyList.find(v => v.id === id);
  
  if (vocab) {
    // 跳转到添加页面并填充数据
    localStorage.setItem('editVocabulary', JSON.stringify(vocab));
    window.location.href = 'add.html?edit=' + id;
  }
}

// 删除词汇
function deleteVocabulary(id) {
  if (confirm('确定要删除这个词汇吗？')) {
    vocabularyList = vocabularyList.filter(v => v.id !== id);
    saveVocabularyList();
    
    // 刷新当前页面
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'vocabulary.html') {
      initVocabularyPage();
    } else if (currentPage === 'index.html' || currentPage === '') {
      initHomePage();
    }
  }
}

// 更新学习进度
function updateLearningProgress() {
  const progressElement = document.querySelector('.card-content');
  
  if (progressElement) {
    const totalVocabulary = vocabularyList.length;
    const masteredVocabulary = vocabularyList.filter(v => v.mastered).length;
    const toReviewVocabulary = totalVocabulary - masteredVocabulary;
    
    progressElement.innerHTML = `
      <p>已学习词汇: <strong>${totalVocabulary}</strong></p>
      <p>待复习词汇: <strong>${toReviewVocabulary}</strong></p>
      <p>掌握词汇: <strong>${masteredVocabulary}</strong></p>
    `;
  }
}

// 初始化搜索功能
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', function() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm) {
        // 保存搜索词
        localStorage.setItem('searchTerm', searchTerm);
        // 跳转到词汇页面
        window.location.href = 'vocabulary.html?search=' + encodeURIComponent(searchTerm);
      }
    });
    
    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
}

// 保存词汇列表到本地存储
function saveVocabularyList() {
  localStorage.setItem('vocabularyList', JSON.stringify(vocabularyList));
}

// 显示提示消息
function showAlert(message, type) {
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  
  // 添加到页面
  const container = document.querySelector('.container');
  container.insertBefore(alertElement, container.firstChild);
  
  // 3秒后自动消失
  setTimeout(() => {
    alertElement.remove();
  }, 3000);
}