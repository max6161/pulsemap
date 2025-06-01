import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBWBrJC7Yxd3us_eBOm2M3IIlbb_t_6fj8",
    authDomain: "pulsemap-f6930.firebaseapp.com",
    projectId: "pulsemap-f6930",
    storageBucket: "pulsemap-f6930.appspot.com", // 🛠️ исправил .app → .app**spot**.com
    messagingSenderId: "1015121809814",
    appId: "1:1015121809814:web:6266ddf6aa6bc5f3568db7",
    measurementId: "G-H5PWB46FS9"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };