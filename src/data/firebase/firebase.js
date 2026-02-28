// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDlO2dlKb9fmtJhO5S_LP_97KJEqEp0ErM",
    authDomain: "creaciones-lisart.firebaseapp.com",
    projectId: "creaciones-lisart",
    storageBucket: "creaciones-lisart.firebasestorage.app",
    messagingSenderId: "43388390011",
    appId: "1:43388390011:web:12d2fca7db3495347770de",
    measurementId: "G-QRQS5C4634"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);