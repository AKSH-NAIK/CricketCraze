import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyANHrNpDgTxwCP2wZ86w5VYT_49R0gIvCo",
  authDomain: "cricketcraze-2d9cc.firebaseapp.com",
  projectId: "cricketcraze-2d9cc",
  storageBucket: "cricketcraze-2d9cc.firebasestorage.app",
  messagingSenderId: "979440165198",
  appId: "1:979440165198:web:d48d26af1e3f628e96fe1f"
};

const app = initializeApp(firebaseConfig);

/* Export shared auth instance */
export const auth = getAuth(app);
