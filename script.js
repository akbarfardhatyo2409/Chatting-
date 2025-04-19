import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import {
  getDatabase, ref, push, onChildAdded, onValue,
  set, remove, onDisconnect, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import {
  getStorage, ref as sRef, uploadBytes, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCviB9a3VYpk1ty7EM1bf_q8CGd3lI5EEk',
  authDomain: 'chatapp-fce88.firebaseapp.com',
  projectId: 'chatapp-fce88',
  storageBucket: 'chatapp-fce88.appspot.com',
  messagingSenderId: '126667936626',
  appId: '1:126667936626:web:97ce3ba6524ce9787883eb',
  measurementId: 'G-99V6NX9C4V',
  databaseURL: 'https://chatapp-fce88-default-rtdb.firebaseio.com'
};
const app = initializeApp(config);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// DOM
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const emailIn = document.getElementById('email');
const passIn = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const regBtn = document.getElementById('register-btn');
const authErr = document.getElementById('auth-error');
const chatList = document.getElementById('chat-list');
const messagesEl = document.getElementById('messages');
const typingEl = document.getElementById('typing-indicator');