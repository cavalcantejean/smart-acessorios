// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXVzd3bIG1cNsMZ4nPElKkuu_vE9YS-Ys",
  authDomain: "smart-acessorios.firebaseapp.com",
  projectId: "smart-acessorios",
  storageBucket: "smart-acessorios.firebasestorage.app",
  messagingSenderId: "782394541540",
  appId: "1:782394541540:web:942c2d58693c497e9573f1",
  measurementId: "G-ECBEQKZV53"
};

// Initialize Firebase
let app: FirebaseApp;

// Prevent Firebase from initializing multiple times
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

// If you want to use Firebase Analytics:
// import { getAnalytics, type Analytics } from "firebase/analytics";
// let analytics: Analytics;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }
// export { app, db, analytics };

export { app, db };
