import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, update, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config (user-provided)
const firebaseConfig = {
  apiKey: "AIzaSyBw0qq1Gz9JxHTq2mpByLRm_MLIcZ2IokQ",
  authDomain: "chatting-4b996.firebaseapp.com",
  projectId: "chatting-4b996",
  storageBucket: "chatting-4b996.appspot.com",
  messagingSenderId: "273560897576",
  appId: "1:273560897576:web:8b05fb2c004fa930564d1d",
  measurementId: "G-JPFJ448DD0",
  databaseURL: "https://chatting-4b996-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('auth-container');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const authError = document.getElementById('auth-error');

  const chatContainer = document.getElementById('chat-container');
  const displayNameEl = document.getElementById('display-name');
  const logoutBtn = document.getElementById('logout-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const nicknameInput = document.getElementById('nickname-input');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

  const userListEl = document.querySelector('#user-list ul');
  const msgCont = document.getElementById('message-container');
  const typingEl = document.getElementById('typing-indicator');