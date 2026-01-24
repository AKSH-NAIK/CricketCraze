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
  const nameWrapper = document.getElementById("account-name-wrapper");

  if (user && acc && nameEl) {
    // Use displayName from user object (set from form), or "Player" as fallback
    // Never extract from email - name must come from form input
    const displayName = user.displayName || "Player";
    nameEl.textContent = displayName;
    acc.classList.remove("hidden");
    if (nameWrapper) {
      nameWrapper.classList.remove("hidden");
    }
  }
}

function showAuthScreen() {
  document.getElementById("start-screen")?.classList.add("hidden");
  document.getElementById("auth-screen")?.classList.remove("hidden");
  document.getElementById("account-area")?.classList.add("hidden");
  document.getElementById("account-name-wrapper")?.classList.add("hidden");
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
    
    // Always show account area when logged in
    const nameEl = document.getElementById("account-name");
    const nameWrapper = document.getElementById("account-name-wrapper");
    const acc = document.getElementById("account-area");
    
    if (name) {
      // Update profile with name from form
      await updateProfile(userCredential.user, { displayName: name });
      // Update UI immediately with the name from form
      if (nameEl) {
        nameEl.textContent = name;
      }
    } else if (userCredential.user.displayName) {
      // Use existing displayName if no new name provided
      if (nameEl) {
        nameEl.textContent = userCredential.user.displayName;
      }
    } else {
      // Fallback to "Player" if no name exists
      if (nameEl) {
        nameEl.textContent = "Player";
      }
    }
    
    if (nameWrapper) nameWrapper.classList.remove("hidden");
    if (acc) acc.classList.remove("hidden");
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
    
    // Always show account area after signup
    const nameEl = document.getElementById("account-name");
    const nameWrapper = document.getElementById("account-name-wrapper");
    const acc = document.getElementById("account-area");
    
    // Always use name from form for signup
    const nameToUse = name || "Player";
    
    if (name) {
      // Update profile with name from form
      await updateProfile(userCredential.user, { displayName: name });
    }
    
    // Update UI immediately with the name from form
    if (nameEl) {
      nameEl.textContent = nameToUse;
    }
    
    if (nameWrapper) nameWrapper.classList.remove("hidden");
    if (acc) acc.classList.remove("hidden");
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

/* ================== Password Visibility Toggles ================== */
const EYE_SVG = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"/>
  </svg>
`;

const EYE_SLASH_SVG = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 12s4-7 11-7c2.13 0 4.11.5 5.86 1.36" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22.5 12.5S18.5 19 11.5 19c-2.08 0-4.01-.47-5.74-1.33" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

function togglePasswordVisibility(targetInputId, btn) {
  const input = document.getElementById(targetInputId);
  if (!input) return;
  const wasPassword = input.type === 'password';
  input.type = wasPassword ? 'text' : 'password';
  // show eye-slash when visible (text), show eye when hidden (password)
  btn.innerHTML = wasPassword ? EYE_SLASH_SVG : EYE_SVG;
  btn.setAttribute('aria-pressed', String(wasPassword));
  btn.setAttribute('aria-label', wasPassword ? 'Hide password' : 'Show password');
}

function initPasswordToggles() {
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    const target = btn.dataset.target;
    if (!target) return;
    // initialize icon based on input type
    const input = document.getElementById(target);
    if (input && input.type === 'password') {
      btn.innerHTML = EYE_SVG;
      btn.setAttribute('aria-label', 'Show password');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      btn.innerHTML = EYE_SLASH_SVG;
      btn.setAttribute('aria-label', 'Hide password');
      btn.setAttribute('aria-pressed', 'true');
    }
    btn.addEventListener('click', () => togglePasswordVisibility(target, btn));
  });
}

/* ================== Init ================== */
function initAuth() {
  initTheme();

  document
    .getElementById("login-form")
    ?.addEventListener("submit", onLoginSubmit);

  document
    .getElementById("signup-form")
    ?.addEventListener("submit", onSignupSubmit);

  // Initialize password visibility toggle buttons
  initPasswordToggles();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      showMainForUser(user);
    } else {
      showAuthScreen();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  
  // Initialize Google sign-in buttons
  const googleProvider = new GoogleAuthProvider();
  
  // Handle Google button in login form
  const googleBtnLogin = document.getElementById("google-login-btn-login");
  if (googleBtnLogin) {
    googleBtnLogin.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle the rest
      } catch (error) {
        console.error("Google login error:", error);
        alert(error.message);
      }
    });
  }
  
  // Handle Google button in signup form
  const googleBtnSignup = document.getElementById("google-login-btn-signup");
  if (googleBtnSignup) {
    googleBtnSignup.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle the rest
      } catch (error) {
        console.error("Google login error:", error);
        alert(error.message);
      }
    });
  }
});
