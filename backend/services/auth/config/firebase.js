import fs from "node:fs";
import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin";

dotenv.config();

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

const serviceAccount = raw
  ? JSON.parse(raw)
  : JSON.parse(
      fs.readFileSync(
        new URL(
          "../multiagent-6b886-firebase-adminsdk-fbsvc-78fd116c0b.json",
          import.meta.url
        ),
        "utf8"
      )
    );

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

export const app = initializeApp({
  credential: cert(serviceAccount)
});
