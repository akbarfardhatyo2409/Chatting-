// script.js

// Konfigurasi Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBw0qq1Gz9JxHTq2mpByLRm_MLIcZ2IokQ",
  authDomain: "chatting-4b996.firebaseapp.com",
  projectId: "chatting-4b996",
  storageBucket: "chatting-4b996.firebaseapp.com",
  messagingSenderId: "273560897576",
  appId: "1:273560897576:web:8b05fb2c004fa930564d1d",
  measurementId: "G-JPFJ448DD0"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username');
const typingIndicator = document.getElementById('typing-indicator');

// Referensi database
const messagesRef = ref(db, 'messages');
const typingRef = ref(db, 'typing');

// Kirim pesan
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  const username = usernameInput.value.trim() || "Anonymous";

  if (message) {
    push(messagesRef, {
      username,
      message,
      timestamp: Date.now()
    });
    messageInput.value = '';
    set(typingRef, null); // Reset typing status
  }
});

// Tampilkan pesan
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  appendMessage(`${data.username}: ${data.message}`);
});

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Indikator sedang mengetik
messageInput.addEventListener('input', () => {
  set(typingRef, usernameInput.value.trim() || "Anonymous");
});

onValue(typingRef, (snapshot) => {
  const typingUser = snapshot.val();
  if (typingUser) {
    typingIndicator.textContent = `${typingUser} is typing...`;
  } else {
    typingIndicator.textContent = '';
  }
});