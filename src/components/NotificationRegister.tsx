"use client";

import { useEffect } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";

export const NotificationRegister = () => {
    useEffect(() => {
        const setupNotifications = async () => {
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    await requestForToken();
                } else if (Notification.permission !== "denied") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        await requestForToken();
                    }
                }
            }
        };

        setupNotifications();

        onMessageListener().then((payload: any) => {
            console.log("Foreground Notification:", payload);
            // This could be a toast notification for foreground messages
            alert(`Notification: ${payload.notification.title}\n${payload.notification.body}`);
        }).catch(err => console.log('failed: ', err));
    }, []);

    return null;
};
