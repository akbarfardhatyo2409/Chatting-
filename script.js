import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, update, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
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

// DOM
const authContainer = document.getElementById('auth-container');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const authError = document.getElementById('auth-error');

const chatContainer = document.getElementById('chat-container');
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
const newChatBtn = document.getElementById('new-chat-btn');

let currentUser = null;
let currentChatUser = 'all';

// Auth actions
registerBtn.onclick = () => createUserWithEmailAndPassword(auth, emailEl.value, passEl.value).catch(e => authError.textContent = e.message);
loginBtn.onclick = () => signInWithEmailAndPassword(auth, emailEl.value, passEl.value).catch(e => authError.textContent = e.message);
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

// Presence
function setupPresence() {
  const presRef = ref(db, `presence/${currentUser.uid}`);
  set(presRef, { name: displayNameEl.textContent });
  onDisconnect(presRef).remove();
}

// Load users into sidebar
function loadUsers() {
  onValue(ref(db, 'presence'), snap => {
    userListEl.innerHTML = '<li data-uid="all">Public</li>';
    snap.forEach(child => {
      const uid = child.key;
      const { name } = child.val();
      const li = document.createElement('li');
      li.textContent = name;
      li.dataset.uid = uid;
      userListEl.appendChild(li);
    });
  });
  userListEl.onclick = e => {
    if (e.target.dataset.uid) {
      currentChatUser = e.target.dataset.uid;
      document.querySelectorAll('#user-list li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');
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
  const keys = [];
  snap.forEach(s => s.val() && keys.push(s.key));
  const others = keys.filter(k => k!==currentUser.uid);
  typingEl.textContent = others.length ? `${others.length>1?'Multiple users are':'User is'} typing...` : '';
});

// Settings modal
settingsBtn.onclick = () => { settingsModal.classList.remove('hidden'); nicknameInput.value = displayNameEl.textContent; };
closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
saveSettingsBtn.onclick = () => {
  const nick = nicknameInput.value.trim(); if (nick) updateProfile(currentUser, { displayName: nick }).then(() => displayNameEl.textContent = nick);
  settingsModal.classList.add('hidden');
};

// New chat placeholder
newChatBtn.onclick = () => alert('Feature coming soon!');