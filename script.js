let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 10;
let answered = false;

let loadedQuestionSets = null;
let activeDifficulty = null;

// Sound engine (Web Audio API)
let audioContext = null;
let soundEnabled = true;

function initAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      soundEnabled = false;
    }
  }
}

function playTone(frequency, durationMs, type = 'sine', gainValue = 0.05) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  const now = audioContext.currentTime;
  osc.start(now);
  // quick envelope to avoid clicks
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.stop(now + durationMs / 1000 + 0.02);
}

function playSound(kind) {
  switch (kind) {
    case 'click':
      playTone(440, 60, 'square', 0.04);
      break;
    case 'correct':
      playTone(880, 140, 'sine', 0.06);
      setTimeout(() => playTone(1175, 100, 'sine', 0.05), 120);
      break;
    case 'incorrect':
      playTone(220, 180, 'sawtooth', 0.06);
      break;
    case 'timeout':
      playTone(180, 220, 'triangle', 0.06);
      break;
    case 'result':
      playTone(523.25, 100, 'sine', 0.05);
      setTimeout(() => playTone(659.25, 100, 'sine', 0.05), 110);
      setTimeout(() => playTone(783.99, 140, 'sine', 0.05), 230);
      break;
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  if (btn) btn.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
}

async function loadQuestionSets() {
  if (loadedQuestionSets) return loadedQuestionSets;
  try {
    const response = await fetch('questions.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load questions.json (${response.status})`);
    const data = await response.json();
    // Basic shape validation
    if (typeof data !== 'object' || !data) throw new Error('Invalid questions format');
    ['easy', 'medium', 'hard'].forEach(key => {
      if (!Array.isArray(data[key])) throw new Error(`Missing or invalid '${key}' questions`);
    });
    loadedQuestionSets = data;
    return loadedQuestionSets;
  } catch (err) {
    console.error(err);
    alert('Unable to load questions. Please refresh the page.');
    throw err;
  }
}

async function startQuiz(difficulty) {
  try {
    const data = await loadQuestionSets();
    activeDifficulty = difficulty;
    initAudio();
    playSound('click');
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-box').classList.remove('hidden');
    document.getElementById('result-box').classList.add('hidden');

    const pool = Array.isArray(data[difficulty]) ? data[difficulty] : [];
    if (pool.length === 0) {
      alert('No questions available for the selected difficulty.');
      goToHome();
      return;
    }
    // Shuffle and select up to 10
    const allQuestions = [...pool];
    currentQuestions = shuffle(allQuestions).slice(0, Math.min(10, allQuestions.length));
    currentQuestionIndex = 0;
    score = 0;

    showQuestion();
  } catch (_) {
    // loadQuestionSets already alerted; just ensure home state
    goToHome();
  }
}

function showQuestion() {
  answered = false;
  timeLeft = 10;
  document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}/10`;
  document.getElementById('question').textContent = currentQuestions[currentQuestionIndex].question;
  document.getElementById('timer').textContent = `Time: ${timeLeft}s`;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  currentQuestions[currentQuestionIndex].options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'option-btn';
    btn.onclick = () => selectOption(option, btn);
    optionsDiv.appendChild(btn);
  });

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!answered) {
        playSound('timeout');
        showCorrectAndNext();
      }
    }
  }, 1000);
}

function selectOption(selected, btnClicked) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const questionObj = currentQuestions[currentQuestionIndex];
  const optionsDiv = document.getElementById('options');
  const buttons = optionsDiv.querySelectorAll('button');

  
  buttons.forEach(btn => btn.disabled = true);

  buttons.forEach(btn => {
    if (btn.textContent === questionObj.answer) {
      btn.classList.add('correct');
    }
  });
  if (selected !== questionObj.answer) {
    btnClicked.classList.add('incorrect');
    playSound('incorrect');
  } else {
    score++;
    playSound('correct');
  }

  setTimeout(() => {
    playSound('click');
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showResult(score, currentQuestions.length);
    }
  }, 1000);
}

function showCorrectAndNext() {
  answered = true;
  const questionObj = currentQuestions[currentQuestionIndex];
  const optionsDiv = document.getElementById('options');
  const buttons = optionsDiv.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === questionObj.answer) {
      btn.classList.add('correct');
    }
  });
  setTimeout(() => {
    playSound('click');
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showResult(score, currentQuestions.length);
    }
  }, 3000);
}

function showResult(score, total) {
  // Hide quiz box and show result box
  document.getElementById('quiz-box').classList.add('hidden');
  const resultBox = document.getElementById('result-box');
  resultBox.classList.remove('hidden');
  
  // Update the score display
  document.getElementById('final-score').textContent = `${score} / ${total}`;
  playSound('result');
}

// Add this function to restart the quiz with the same difficulty
function startQuizAgain() {
  // Hide result box and show quiz box
  document.getElementById('result-box').classList.add('hidden');
  document.getElementById('quiz-box').classList.remove('hidden');
  currentQuestionIndex = 0;
  score = 0;
  playSound('click');
  showQuestion();
}

function goToHome() {
  document.getElementById('result-box').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
  // Reset quiz state
  currentQuestionIndex = 0;
  score = 0;
  clearInterval(timerInterval);
}

function quitQuiz() {
  // Hide quiz and result boxes
  document.getElementById('quiz-box').classList.add('hidden');
  document.getElementById('result-box').classList.add('hidden');
  // Show home screen
  document.getElementById('start-screen').classList.remove('hidden');
  // Reset quiz state
  currentQuestionIndex = 0;
  score = 0;
  clearInterval(timerInterval);
  playSound('click');
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

