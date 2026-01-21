/**
 * CricketCraze - Client-side Authentication & Theme Module
 * Uses Firebase Authentication (Email/Password)
 */

/* ================== Firebase Imports ================== */
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================== Theme Management ================== */
let isDarkMode = false;

function initTheme() {
  const savedTheme = localStorage.getItem("cc_theme");
  if (savedTheme) {
    isDarkMode = savedTheme === "dark";
  } else {
    isDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle("dark-mode", isDarkMode);
  updateThemeButton();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem("cc_theme", isDarkMode ? "dark" : "light");
  applyTheme();
}

// Make toggleTheme globally accessible
window.toggleTheme = toggleTheme;


function updateThemeButton() {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.innerHTML = isDarkMode
      ? "Light"
      : "Dark";
  }
}

/* ================== UI State ================== */
function showMainForUser(user) {
  document.getElementById("auth-screen")?.classList.add("hidden");
  document.getElementById("start-screen")?.classList.remove("hidden");

  const acc = document.getElementById("account-area");
  const nameEl = document.getElementById("account-name");

  if (user && acc && nameEl) {
    nameEl.textContent = user.displayName || user.email || "Player";
    acc.classList.remove("hidden");
  }
}

function showAuthScreen() {
  document.getElementById("start-screen")?.classList.add("hidden");
  document.getElementById("auth-screen")?.classList.remove("hidden");
  document.getElementById("account-area")?.classList.add("hidden");
}

/* ================== Helpers ================== */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ================== Auth Tab Switching ================== */
function switchAuthTab(tab) {
  const loginTab = document.getElementById("tab-login");
  const signupTab = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (tab === "login") {
    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");
    loginForm?.classList.remove("hidden");
    signupForm?.classList.add("hidden");
  } else if (tab === "signup") {
    signupTab?.classList.add("active");
    loginTab?.classList.remove("active");
    signupForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");
  }
}

// Make switchAuthTab globally accessible for onclick handler
window.switchAuthTab = switchAuthTab;

/* ================== Google Sign-In ================== */
/* ================== Google Sign-In ================== */
async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle the rest
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    alert(err.message);
  }
}

// Make signInWithGoogle globally accessible
window.signInWithGoogle = signInWithGoogle;

/* ================== Login ================== */
async function onLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email format");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const name = document.getElementById("login-name").value.trim();
    if (name && !userCredential.user.displayName) {
      await updateProfile(userCredential.user, { displayName: name });
    }
  } catch (err) {
    alert(err.message);
  }
}

/* ================== Signup ================== */
async function onSignupSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-password-confirm").value;

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const name = document.getElementById("signup-name").value.trim();
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
      // Reload user to ensure UI reflects the name immediately or manually trigger UI update
      showMainForUser(userCredential.user);
    }
  } catch (err) {
    alert(err.message);
  }
}

/* ================== Logout ================== */
async function logout() {
  await signOut(auth);
  showAuthScreen();
}

// Make logout globally accessible for onclick handler
window.logout = logout;

/* ================== Init ================== */
function initAuth() {
  initTheme();

  document
    .getElementById("login-form")
    ?.addEventListener("submit", onLoginSubmit);

  document
    .getElementById("signup-form")
    ?.addEventListener("submit", onSignupSubmit);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      showMainForUser(user);
    } else {
      showAuthScreen();
    }
  });
}

document.addEventListener("DOMContentLoaded", initAuth);
