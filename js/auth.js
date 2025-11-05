import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

export async function register(name, email, phone, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;
  await set(ref(db, `users/${uid}`), { uid, name, email, phone, role: 'user' });
  return userCred.user;
}

export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function logout() {
  await signOut(auth);
  localStorage.clear();
  location.reload();
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function getUserRole(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val().role : null;
}
