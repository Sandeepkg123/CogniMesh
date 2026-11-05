import { cert, initializeApp } from "firebase-admin";
import serviceAccount from "../multiagent-6b886-firebase-adminsdk-fbsvc-78fd116c0b.json"  with {type:"json"};

export const app=initializeApp({
  credential: cert(serviceAccount)
});