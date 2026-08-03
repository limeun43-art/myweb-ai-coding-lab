/**
 * 말랑 얌얌 & 수분 일기 - Tracker Logic
 * Data Persistence: LocalStorage by Date key ('tracker_YYYY-MM-DD')
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentDate = getTodayStr(); // YYYY-MM-DD
  let currentData = {
    waterCount: 0,
    foodList: [],
    memo: '',
    hasCelebrated: false // track if popup opened for today
  };

  // DOM Elements
  const datePicker = document.getElementById('date-picker-input');
  const dateTextDisplay = document.getElementById('date-text-display');
  const prevDateBtn = document.getElementById('prev-date-btn');
  const nextDateBtn = document.getElementById('next-date-btn');
  const todayBtn = document.getElementById('today-btn');

  // Water DOM
  const waterCountNum = document.getElementById('water-count-num');
  const waterDescText = document.getElementById('water-desc-text');
  const waterProgressFill = document.getElementById('water-progress-fill');
  const glassesGrid = document.getElementById('glasses-visual-grid');
  const waterPlusBtn = document.getElementById('water-plus-btn');
  const waterMinusBtn = document.getElementById('water-minus-btn');
  const waterGoalBanner = document.getElementById('water-goal-banner');
  const triggerConfettiBtn = document.getElementById('trigger-confetti-btn');

  // Food DOM
  const foodForm = document.getElementById('food-form');
  const foodNameInput = document.getElementById('food-name-input');
  const foodCalorieInput = document.getElementById('food-calorie-input');
  const foodListUl = document.getElementById('food-list');
  const foodEmptyState = document.getElementById('food-empty-state');
  const foodItemCount = document.getElementById('food-item-count');
  const totalCalorieNum = document.getElementById('total-calorie-num');
  const clearAllFoodBtn = document.getElementById('clear-all-food-btn');

  // Memo DOM
  const dailyMemoInput = document.getElementById('daily-memo-input');
  const memoSaveStatus = document.getElementById('memo-save-status');

  // Modal & Canvas DOM
  const celebrationModal = document.getElementById('celebration-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Initial Setup
  initDatePicker();
  loadDateData(currentDate);

  // ----------------------------------------------------
  // Date Handling Functions
  // ----------------------------------------------------
  function getTodayStr() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatKoreanDate(dateStr) {
    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[dateObj.getDay()];
    return `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일 (${dayOfWeek})`;
  }

  function initDatePicker() {
    datePicker.value = currentDate;
    updateDateDisplay();

    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        updateDateDisplay();
        loadDateData(currentDate);
      }
    });

    prevDateBtn.addEventListener('click', () => {
      shiftDate(-1);
    });

    nextDateBtn.addEventListener('click', () => {
      shiftDate(1);
    });

    todayBtn.addEventListener('click', () => {
      currentDate = getTodayStr();
      datePicker.value = currentDate;
      updateDateDisplay();
      loadDateData(currentDate);
    });
  }

  function shiftDate(offsetDays) {
    const parts = currentDate.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    currentDate = `${y}-${m}-${day}`;
    datePicker.value = currentDate;
    updateDateDisplay();
    loadDateData(currentDate);
  }

  function updateDateDisplay() {
    dateTextDisplay.textContent = formatKoreanDate(currentDate);
  }

  // ----------------------------------------------------
  // Data Persistence (LocalStorage)
  // ----------------------------------------------------
  function getStorageKey(dateStr) {
    return `malang_tracker_${dateStr}`;
  }

  function loadDateData(dateStr) {
    const stored = localStorage.getItem(getStorageKey(dateStr));
    if (stored) {
      try {
        currentData = JSON.parse(stored);
      } catch (err) {
        currentData = getDefaultData();
      }
    } else {
      currentData = getDefaultData();
    }

    renderWaterUI();
    renderFoodUI();
    renderMemoUI();
  }

  function saveData() {
    localStorage.setItem(getStorageKey(currentDate), JSON.stringify(currentData));
  }

  function getDefaultData() {
    return {
      waterCount: 0,
      foodList: [],
      memo: '',
      hasCelebrated: false
    };
  }

  // ----------------------------------------------------
  // Water Tracker Logic
  // ----------------------------------------------------
  waterPlusBtn.addEventListener('click', () => {
    updateWaterCount(currentData.waterCount + 1);
  });

  waterMinusBtn.addEventListener('click', () => {
    if (currentData.waterCount > 0) {
      updateWaterCount(currentData.waterCount - 1);
    }
  });

  triggerConfettiBtn.addEventListener('click', () => {
    startConfetti();
    celebrationModal.classList.remove('hidden');
  });

  function updateWaterCount(newCount) {
    const prevCount = currentData.waterCount;
    currentData.waterCount = Math.max(0, newCount);

    // Check if user hit 8 glasses target
    if (currentData.waterCount >= 8 && prevCount < 8) {
      currentData.hasCelebrated = true;
      startConfetti();
      celebrationModal.classList.remove('hidden');
    }

    saveData();
    renderWaterUI();
  }

  function renderWaterUI() {
    const count = currentData.waterCount;
    waterCountNum.textContent = count;

    // Progress bar width (max 100%)
    const pct = Math.min(100, Math.round((count / 8) * 100));
    waterProgressFill.style.width = `${pct}%`;

    // Status description
    if (count === 0) {
      waterDescText.textContent = '아직 물을 안 마셨어요. 시원한 물 한 잔 어때요? 🧊';
    } else if (count < 4) {
      waterDescText.textContent = `좋은 출발이에요! 목표까지 ${8 - count}잔 남았어요 🌱`;
    } else if (count < 8) {
      waterDescText.textContent = `절반 완성! 조금만 더 힘내면 8잔 달성이에요! 💙`;
    } else {
      waterDescText.textContent = `축하해요! 오늘의 물 섭취 목표(8잔)를 완벽히 채웠어요! 🎉✨`;
    }

    // 8 Glasses Visual Grid
    glassesGrid.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= count;
      const glassEl = document.createElement('div');
      glassEl.className = `glass-item ${isFilled ? 'filled' : ''}`;
      glassEl.setAttribute('aria-label', `${i}번째 물 잔`);
      glassEl.innerHTML = `
        <span class="glass-icon">${isFilled ? '🥛' : '💧'}</span>
        <span class="glass-label">${i}잔</span>
      `;

      // Clicking an individual glass toggles or sets to that amount
      glassEl.addEventListener('click', () => {
        if (count === i) {
          updateWaterCount(i - 1);
        } else {
          updateWaterCount(i);
        }
      });

      glassesGrid.appendChild(glassEl);
    }

    // Banner Visibility
    if (count >= 8) {
      waterGoalBanner.classList.remove('hidden');
    } else {
      waterGoalBanner.classList.add('hidden');
    }
  }

  // ----------------------------------------------------
  // Food & Calorie Tracker Logic
  // ----------------------------------------------------
  foodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const foodName = foodNameInput.value.trim();
    if (!foodName) return;

    const calValue = foodCalorieInput.value.trim();
    const calories = calValue ? parseInt(calValue, 10) : 0;
    const selectedMeal = document.querySelector('input[name="mealType"]:checked')?.value || '아침';

    addFoodItem(selectedMeal, foodName, calories);

    // Reset inputs
    foodNameInput.value = '';
    foodCalorieInput.value = '';
    foodNameInput.focus();
  });

  // Preset Chips Listener
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const cal = parseInt(btn.getAttribute('data-cal'), 10);
      const meal = btn.getAttribute('data-meal') || '간식';
      addFoodItem(meal, name, cal);
    });
  });

  clearAllFoodBtn.addEventListener('click', () => {
    if (currentData.foodList.length === 0) return;
    if (confirm('오늘 기록한 음식을 모두 삭제하시겠습니까?')) {
      currentData.foodList = [];
      saveData();
      renderFoodUI();
    }
  });

  function addFoodItem(meal, name, cal) {
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      meal,
      name,
      cal
    };
    currentData.foodList.push(newItem);
    saveData();
    renderFoodUI();
  }

  function deleteFoodItem(id) {
    currentData.foodList = currentData.foodList.filter(item => item.id !== id);
    saveData();
    renderFoodUI();
  }

  function renderFoodUI() {
    const foodList = currentData.foodList;
    foodItemCount.textContent = foodList.length;

    // Total calories calculation
    const totalCal = foodList.reduce((sum, item) => sum + (item.cal || 0), 0);
    totalCalorieNum.textContent = totalCal.toLocaleString();

    if (foodList.length === 0) {
      foodEmptyState.style.display = 'flex';
      foodListUl.innerHTML = '';
      return;
    }

    foodEmptyState.style.display = 'none';
    foodListUl.innerHTML = '';

    foodList.forEach(item => {
      const li = document.createElement('li');
      li.className = 'food-item';
      li.innerHTML = `
        <div class="food-info">
          <span class="meal-tag ${item.meal}">${getMealEmoji(item.meal)} ${item.meal}</span>
          <span class="food-name">${escapeHtml(item.name)}</span>
        </div>
        <div class="food-meta">
          <span class="food-cal-badge">${item.cal > 0 ? item.cal + ' kcal' : '칼로리 미입력'}</span>
          <button class="btn-delete-food" title="삭제" aria-label="${item.name} 삭제">
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
      `;

      li.querySelector('.btn-delete-food').addEventListener('click', () => {
        deleteFoodItem(item.id);
      });

      foodListUl.appendChild(li);
    });
  }

  function getMealEmoji(meal) {
    switch (meal) {
      case '아침': return '🍳';
      case '점심': return '🥗';
      case '저녁': return '🍕';
      case '간식': return '🍰';
      default: return '🍴';
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  // ----------------------------------------------------
  // Daily Memo Logic
  // ----------------------------------------------------
  let memoTimeout = null;
  dailyMemoInput.addEventListener('input', () => {
    currentData.memo = dailyMemoInput.value;
    memoSaveStatus.classList.remove('visible');

    if (memoTimeout) clearTimeout(memoTimeout);
    memoTimeout = setTimeout(() => {
      saveData();
      memoSaveStatus.classList.add('visible');
    }, 600);
  });

  function renderMemoUI() {
    dailyMemoInput.value = currentData.memo || '';
    memoSaveStatus.classList.remove('visible');
  }

  // ----------------------------------------------------
  // Modal Handlers
  // ----------------------------------------------------
  closeModalBtn.addEventListener('click', () => {
    celebrationModal.classList.add('hidden');
    stopConfetti();
  });

  celebrationModal.addEventListener('click', (e) => {
    if (e.target === celebrationModal) {
      celebrationModal.classList.add('hidden');
      stopConfetti();
    }
  });

  // ----------------------------------------------------
  // Pure Vanilla Canvas Confetti Effect
  // ----------------------------------------------------
  let particles = [];
  let confettiAnimId = null;

  function startConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const ctx = confettiCanvas.getContext('2d');

    const colors = ['#FF6B8B', '#4A90E2', '#FFD166', '#06D6A0', '#9C27B0', '#FF8E9E', '#64B5F6'];
    particles = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 8 + 4,
        d: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti(ctx);

    // Auto stop after 4.5 seconds
    setTimeout(() => {
      stopConfetti();
    }, 4500);
  }

  function animateConfetti(ctx) {
    confettiAnimId = requestAnimationFrame(() => animateConfetti(ctx));
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();

      if (p.y > confettiCanvas.height) {
        particles[i] = {
          x: Math.random() * confettiCanvas.width,
          y: -20,
          r: p.r,
          d: p.d,
          color: p.color,
          tilt: p.tilt,
          tiltAngleIncremental: p.tiltAngleIncremental,
          tiltAngle: p.tiltAngle
        };
      }
    }
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    if (confettiCanvas) {
      const ctx = confettiCanvas.getContext('2d');
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  window.addEventListener('resize', () => {
    if (confettiCanvas && confettiAnimId) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });
});
