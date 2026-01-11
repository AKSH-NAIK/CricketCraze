/**
 * CricketCraze - Client-side Authentication & Theme Module
 * Handles user session management, login, signup, Google Sign-In, and theme toggle
 */

/* ---- Theme Management ---- */
let isDarkMode = false;

function initTheme() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('cc_theme');
    if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
    } else {
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
}

function applyTheme() {
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateThemeButton();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('cc_theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = isDarkMode
            ? '<span class="toggle-icon">☀️</span><span class="toggle-text">Light</span>'
            : '<span class="toggle-icon">🌙</span><span class="toggle-text">Dark</span>';
    }
}

/* ---- Session Management ---- */
function setSession(user) {
    try {
        localStorage.setItem('cc_session', JSON.stringify(user));
    } catch (_) { }
}

function clearSession() {
    try { localStorage.removeItem('cc_session'); } catch (_) { }
}

function getSession() {
    try { return JSON.parse(localStorage.getItem('cc_session')); } catch (_) { return null; }
}

/* ---- UI State Management ---- */
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

/* ---- Form Handlers ---- */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function onLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) { alert('Enter email and password'); return; }
    if (!isValidEmail(email)) { alert('Please enter a valid email address'); return; }

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
    if (!isValidEmail(email)) { alert('Please enter a valid email address'); return; }
    if (password !== confirm) { alert('Passwords do not match'); return; }

    // Mock signup: create session
    const user = { name, email };
    setSession(user);
    showMainForUser(user);
}

/* ---- Google Identity Services ---- */
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

/* ---- Auth Initialization ---- */
function initAuth() {
    // Initialize theme first
    initTheme();

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
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);
