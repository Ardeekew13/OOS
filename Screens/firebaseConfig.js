// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth'
import {getFirestore} from "firebase/firestore";
 import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA22bskWR41xn66OJaQ9S-vZmMqFolkisE",
  authDomain: "onlineorderingsystem-f1062.firebaseapp.com",
  projectId: "onlineorderingsystem-f1062",
  storageBucket: "onlineorderingsystem-f1062.appspot.com",
  messagingSenderId: "607330381985",
  appId: "1:607330381985:web:b35f8e8b151da03bef80e0",
  measurementId: "G-HMGWWK47VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const authentication=getAuth(app);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
export const db = getFirestore(app);
export const storage=getStorage(app);