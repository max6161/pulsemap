import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWBrJC7Yxd3us_eBOm2M3IIlbb_t_6fj8",
  authDomain: "pulsemap-f6930.firebaseapp.com",
  projectId: "pulsemap-f6930",
  storageBucket: "pulsemap-f6930.appspot.com",
  messagingSenderId: "1015121809814",
  appId: "1:1015121809814:web:6266ddf6aa6bc5f3568db7",
  measurementId: "G-H5PWB46FS9"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {
  auth,
  provider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  db
};