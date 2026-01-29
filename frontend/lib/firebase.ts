import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAs398C7kw6VNZ10cGmEfkrTPn7_Ka2HbY",
  authDomain: "settle-up-e996b.firebaseapp.com",
  projectId: "settle-up-e996b",
  storageBucket: "settle-up-e996b.firebasestorage.app",
  messagingSenderId: "88331472268",
  appId: "1:88331472268:web:30dbb00fc347e5be1edaa9",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
