import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded,
  onValue, set, update, onDisconnect
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyBw0qq1Gz9JxHTq2mpByLRm_MLIcZ2IokQ",
  authDomain: "chatting-4b996.firebaseapp.com",
  databaseURL: "https://chatting-4b996-default-rtdb.firebaseio.com",
  projectId: "chatting-4b996",
  storageBucket: "chatting-4b996.appspot.com",
  messagingSenderId: "273560897576",
  appId: "1:273560897576:web:8b05fb2c004fa930564d1d"
};
// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const userInput = document.getElementById('username');
const userListEl = document.querySelector('#user-list ul');
const msgCont = document.getElementById('message-container');
const typingEl = document.getElementById('typing-indicator');
const msgInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-button');
const recipientSelect = document.getElementById('recipient');
const themeToggle = document.getElementById('theme-toggle');

let username = '';
let recipient = 'all';

// Presence
function setPresence(name) {
  const userRef = ref(db, `presence/${name}`);
  update(userRef, { online: true, lastActive: Date.now() });
  onDisconnect(userRef).remove();
}

userInput.addEventListener('change', () => {
  username = userInput.value.trim() || 'Anonymous';
  setPresence(username);
});

// Load online users
onValue(ref(db, 'presence'), (snap) => {
  userListEl.innerHTML = '';
  recipientSelect.innerHTML = '<option value="all">Public</option>';
  snap.forEach(child => {
    const name = child.key;
    const li = document.createElement('li');
    li.textContent = name;
    li.onclick = () => recipient = name;
    userListEl.appendChild(li);
    if (name !== username) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      recipientSelect.appendChild(opt);
    }
  });
});

// Send message
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text || !username) return;
  push(ref(db, 'messages'), {
    from: username,
    to: recipient,
    text,
    ts: Date.now()
  });
  msgInput.value = '';
  set(ref(db, `typing/${username}`), null);
};

// Show messages
onChildAdded(ref(db, 'messages'), snap => {
  const { from, to, text } = snap.val();
  if (to === 'all' || to === username || from === username) {
    const div = document.createElement('div');
    div.className = `message ${to==='all'? 'public':'private'}`;
    div.textContent = `${from}${to!=='all'? `→${to}`:''}: ${text}`;
    msgCont.appendChild(div);
    msgCont.scrollTop = msgCont.scrollHeight;
  }
});

// Typing indicator
msgInput.addEventListener('input', () => {
  if (!username) return;
  set(ref(db, `typing/${username}`), true);
  setTimeout(() => set(ref(db, `typing/${username}`), null), 1500);
});
onValue(ref(db, 'typing'), snap => {
  const typers = [];
  snap.forEach(c => c.val() && typers.push(c.key));
  typingEl.textContent = typers.filter(u => u!==username).join(', ') + (typers.length>1? ' are typing...':' is typing...');
});

// Dark/Light toggle
themeToggle.onclick = () => {
  const dt = document.documentElement;
  dt.setAttribute('data-theme', dt.getAttribute('data-theme')==='dark'? '':'dark');
};