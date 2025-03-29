// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDsH3TDq6lV0cHil-HrnoDKEQbxTqEucq8',
  authDomain: 'workflow-management-syst-d34e9.firebaseapp.com',
  projectId: 'workflow-management-syst-d34e9',
  storageBucket: 'workflow-management-syst-d34e9.firebasestorage.app',
  messagingSenderId: '1021774446324',
  appId: '1:1021774446324:web:4ebf11c524f8a503f8a8a1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
};

export type { FirebaseUser };
