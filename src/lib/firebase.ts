import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBl4bzBogC_iivVN35ynNbEauw7GqZFaxk",
    authDomain: "border-tracker-6dac8.firebaseapp.com",
    projectId: "border-tracker-6dac8",
    storageBucket: "border-tracker-6dac8.firebasestorage.app",
    messagingSenderId: "280178847362",
    appId: "1:280178847362:web:27911564001796ed624e9b",
    measurementId: "G-53KPQLQ6E9"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Messaging
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;

    try {
        const currentToken = await getToken(messaging, {
            vapidKey: "BO_-RWdmJkUH_tkM5UIUosNiNt4xRtA3WqVngEKed80fd65DzHspqjo_el0igSxkjKOiOVd7vYtadmLNU8ZoijY",
        });

        if (currentToken) {
            console.log("FCM Token:", currentToken);
            // Save token to backend
            await fetch('/api/notifications/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: currentToken }),
            });
            return currentToken;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.error("An error occurred while retrieving token: ", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log("Incoming Message:", payload);
            resolve(payload);
        });
    });

export { app, messaging };
