
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPfXrtEuV0L5V-WNiozHjAjRVWDzgJEa4",
  authDomain: "ayn-beauty.firebaseapp.com",
  projectId: "ayn-beauty",
  storageBucket: "ayn-beauty.appspot.com",
  messagingSenderId: "557166650929",
  appId: "1:557166650929:web:55e600cfb963d91edc1710"
};

// Initialize Firebase for client-side usage
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
