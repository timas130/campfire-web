import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

let authStateChangeResolve;
// This Promise is resolved after Firebase has finished loading all the stuff.
// It is used in client-api.js/fetcher so no requests are sent before logging in.
export const authStatePromise = new Promise((resolve) => authStateChangeResolve = resolve);

// You might need to change these values if you're using a custom server.
export const fbApp = initializeApp({
  apiKey: "AIzaSyACrbV2hnCsYZmdzAa7-8M5eaZUWYiXd5c",
  authDomain: "campfire-2fb33.firebaseio.com",
  projectId: "campfire-2fb33",
  storageBucket: "campfire-2fb33.appspot.com",
  messagingSenderId: "276237287601",
  appId: "1:276237287601:android:cbd136978e8fc1ea",
});
export const fbAuth = getAuth(fbApp);
fbAuth.onAuthStateChanged(user => authStateChangeResolve(user));
fbAuth.useDeviceLanguage();
