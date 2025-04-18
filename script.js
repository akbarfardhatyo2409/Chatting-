import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCviB9a3VYpk1ty7EM1bf_q8CGd3lI5EEk",
  authDomain: "chatapp-fce88.firebaseapp.com",
  projectId: "chatapp-fce88",
  storageBucket: "chatapp-fce88.appspot.com",
  messagingSenderId: "126667936626",
  appId: "1:126667936626:web:97ce3ba6524ce9787883eb",
  measurementId: "G-99V6NX9C4V",
  databaseURL: "https://chatapp-fce88-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('auth-container');
  const chatContainer = document.getElementById('chat-container');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const authError = document.getElementById('auth-error');
  const userListEl = document.getElementById('user-list');
  const messageContainer = document.getElementById('message-container');
  const typingEl = document.getElementById('typing-indicator');
  const msgInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-button');
  const settingsBtn = document.getElementById('settings-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const displayNameEl = document.getElementById('display-name');
  const statusText = document.getElementById('status-text');
  const settingsModal = document.getElementById('settings-modal');
  const nicknameInput = document.getElementById('nickname-input');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const menuBtn = document.getElementById('menu-btn');

  let currentUser = null;
  let currentChatUser = 'all';

  // Auth actions
  registerBtn.onclick = () => createUserWithEmailAndPassword(auth, emailEl.value, passEl.value)
    .catch(e => authError.textContent = e.message);
  loginBtn.onclick = () => signInWithEmailAndPassword(auth, emailEl.value, passEl.value)
    .catch(e => authError.textContent = e.message);
  logoutBtn.onclick = () => signOut(auth);

  onAuthStateChanged(auth, user => {
    if (user) {
      currentUser = user;
      authContainer.classList.add('hidden');
      chatContainer.classList.remove('hidden');
      displayNameEl.textContent = user.displayName || user.email.split('@')[0];
      setupPresence();
      loadUsers();
      loadMessages();
    } else {
      authContainer.classList.remove('hidden');
      chatContainer.classList.add('hidden');
    }
  });

  // Sidebar toggle for mobile
  menuBtn.onclick = () => document.getElementById('chat-container').classList.toggle('show-sidebar');

  // Presence
  function setupPresence() {
    const presRef = ref(db, `presence/${currentUser.uid}`);
    set(presRef, { name: displayNameEl.textContent });
    onDisconnect(presRef).remove();
  }

  // Load users
  function loadUsers() {
    onValue(ref(db, 'presence'), snap => {
      userListEl.innerHTML = '';
      const publicLi = document.createElement('li'); publicLi.textContent = 'Public Chat'; publicLi.dataset.uid = 'all'; publicLi.classList.add('active');
      userListEl.appendChild(publicLi);
      snap.forEach(child => {
        const li = document.createElement('li');
        li.textContent = child.val().name;
        li.dataset.uid = child.key;
        userListEl.appendChild(li);
      });
    });
    userListEl.onclick = e => {
      if (e.target.dataset.uid) {
        currentChatUser = e.target.dataset.uid;
        Array.from(userListEl.children).forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');
        displayNameEl.textContent = e.target.textContent;
      }
    };
  }

  // Send & receive messages
  sendBtn.onclick = () => {
    const text = msgInput.value.trim(); if (!text) return;
    push(ref(db, 'messages'), { from: currentUser.uid, to: currentChatUser, text, ts: Date.now() });
    msgInput.value = '';
    set(ref(db, `typing/${currentUser.uid}`), null);
  };

  onChildAdded(ref(db, 'messages'), snap => {
    const { from, to, text } = snap.val();
    if (to === 'all' || to === currentUser.uid || from === currentUser.uid) {
      const div = document.createElement('div');
      div.className = `message ${from===currentUser.uid?'you':'other'}`;
      div.textContent = text;
      if (from === currentUser.uid) {
        const btn = document.createElement('button'); btn.textContent = '🗑️'; btn.className = 'delete-btn';
        btn.onclick = () => remove(ref(db, `messages/${snap.key}`));
        div.append(btn);
      }
      messageContainer.appendChild(div);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });

  // Typing indicator
  msgInput.addEventListener('input', () => {
    set(ref(db, `typing/${currentUser.uid}`), true);
    setTimeout(() => set(ref(db, `typing/${currentUser.uid}`), null), 1500);
  });
  onValue(ref(db, 'typing'), snap => {
    const typers = [];
    snap.forEach(s => s.val() && typers.push(s.key));
    const others = typers.filter(k => k !== currentUser.uid);
    typingEl.textContent = others.length ? `${others.length>1?'Multiple users are':'User is'} typing...` : '';
  });

  // Settings modal
  settingsBtn.onclick = () => settingsModal.classList.remove('hidden');
  closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
  saveSettingsBtn.onclick = () => {
    const nick = nicknameInput.value.trim(); if (nick) updateProfile(currentUser, { displayName: nick }).then(() => displayNameEl.textContent = nick);
    settingsModal.classList.add('hidden');
  };
});