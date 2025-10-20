let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 10;
let answered = false;

function startQuiz(difficulty) {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('quiz-box').classList.remove('hidden');
  document.getElementById('result-box').classList.add('hidden');

  // Shuffle and select 10 questions
  const allQuestions = [...questionSets[difficulty]];
  currentQuestions = shuffle(allQuestions).slice(0, 10);
  currentQuestionIndex = 0;
  score = 0;

  showQuestion();
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
  } else {
    score++;
  }

  setTimeout(() => {
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
}

// Add this function to restart the quiz with the same difficulty
function startQuizAgain() {
  // Hide result box and show quiz box
  document.getElementById('result-box').classList.add('hidden');
  document.getElementById('quiz-box').classList.remove('hidden');
  // Reset result box content to default (optional, for clean state)
  document.getElementById('result-box').innerHTML = '';
  currentQuestionIndex = 0;
  score = 0;
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
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

