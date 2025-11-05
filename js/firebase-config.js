// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVdOaDGATCsBx0aFYaq2Hzo0v_-Y9Z4bo",
  authDomain: "catering-reservation-sys-40a8d.firebaseapp.com",
  databaseURL: "https://catering-reservation-sys-40a8d-default-rtdb.firebaseio.com/",
  projectId: "catering-reservation-sys-40a8d",
  storageBucket: "catering-reservation-sys-40a8d.appspot.com",
  messagingSenderId: "733551873605",
  appId: "1:733551873605:web:acdfd4cd91ecb628299d2c",
  measurementId: "G-EL9R5FHSFK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
