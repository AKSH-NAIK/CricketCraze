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

/* ---- Simple client-side auth & session (mock) ---- */
function setSession(user) {
  try {
    localStorage.setItem('cc_session', JSON.stringify(user));
  } catch (_) {}
}

function clearSession() {
  try { localStorage.removeItem('cc_session'); } catch (_) {}
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('cc_session')); } catch (_) { return null; }
}

function showMainForUser(user) {
  // Hide auth screen, show start screen and display account
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('start-screen')?.classList.remove('hidden');
  const acc = document.getElementById('account-area');
  const nameEl = document.getElementById('account-name');
  if (user && acc && nameEl) {
    nameEl.textContent = user.name || user.email || 'Player';
    acc.classList.remove('hidden');
  }
}

function logout() {
  clearSession();
  // show auth landing again
  document.getElementById('start-screen')?.classList.add('hidden');
  document.getElementById('auth-screen')?.classList.remove('hidden');
  document.getElementById('account-area')?.classList.add('hidden');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  if (tab === 'signup') {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  } else {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // If a session exists, show main screen
  const session = getSession();
  if (session) {
    showMainForUser(session);
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  if (loginForm) loginForm.addEventListener('submit', onLoginSubmit);
  if (signupForm) signupForm.addEventListener('submit', onSignupSubmit);

  // Initialize Google button when GIS is loaded
  setTimeout(initGoogleSignIn, 700);
});

function onLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { alert('Enter email and password'); return; }
  // Mock login: accept anything and create session
  const user = { email, name: email.split('@')[0] };
  setSession(user);
  showMainForUser(user);
}

function onSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-password-confirm').value;
  if (!name || !email || !password) { alert('Fill all fields'); return; }
  if (password !== confirm) { alert('Passwords do not match'); return; }
  // Mock signup: create session
  const user = { name, email };
  setSession(user);
  showMainForUser(user);
}

/* Google Identity Services placeholder */
function initGoogleSignIn() {
  try {
    if (window.google && google.accounts && google.accounts.id) {
      const clientId = document.getElementById('g_id_onload')?.getAttribute('data-client_id') || 'YOUR_GOOGLE_CLIENT_ID';
      google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredentialResponse });
      google.accounts.id.renderButton(document.getElementById('google-button'), { theme: 'outline', size: 'large' });
    }
  } catch (err) { /* GIS not ready, ignore */ }
}

function handleGoogleCredentialResponse(resp) {
  // resp.credential is the ID token; in production send to backend for verification
  console.log('Google ID token:', resp?.credential);
  // Create a mock session from token (decode not implemented here)
  const user = { name: 'Google User', email: 'google@user' };
  setSession(user);
  showMainForUser(user);
}

