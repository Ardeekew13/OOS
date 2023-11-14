import { initializeApp } from 'firebase/app';
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth'
import {getFirestore} from "firebase/firestore";
 import { getStorage, ref, getDownloadURL } from 'firebase/storage';


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBM6ZJmKwgq7ZXJeWHQIa1HXeiiK7mDNEc",
    authDomain: "crimemonitoring-622fe.firebaseapp.com",
    projectId: "crimemonitoring-622fe",
    storageBucket: "crimemonitoring-622fe.appspot.com",
    messagingSenderId: "291536462581",
    appId: "1:291536462581:web:da05e59bd6610004c69bbc",
};

const app = initializeApp(firebaseConfig);
export const authentication=getAuth(app);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
export const db = getFirestore(app);
export const storage=getStorage(app);