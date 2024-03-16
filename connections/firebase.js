const { initializeApp } = require("firebase/app");
const {getAuth} = require("firebase/auth");
const {getDatabase} = require("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyC1zFNka-9qrDKPdSDv-QQQwOMsnCRnivs",
    authDomain: "sevcs-bcce6.firebaseapp.com",
    databaseURL: "https://sevcs-bcce6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sevcs-bcce6",
    storageBucket: "sevcs-bcce6.appspot.com",
    messagingSenderId: "680435331171",
    appId: "1:680435331171:web:1241e3588aabff16a60856"
  };

  const app = initializeApp(firebaseConfig);

const db  = getDatabase(app);

const auth = getAuth(app);



module.exports = {app,db,auth};