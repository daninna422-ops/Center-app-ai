import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaeiQk55PVBPdxVm1T6TbTpk6TadZzE3c",
  authDomain: "center-app-ai.firebaseapp.com",
  projectId: "center-app-ai",
  storageBucket: "center-app-ai.firebasestorage.app",
  messagingSenderId: "885493707552",
  appId: "1:885493707552:web:3987b74d77771cd3031d45",
  measurementId: "G-1DJ1RKQ074"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
