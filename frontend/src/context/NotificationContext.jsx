import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: "init-1",
      message: "System initialized and ready.",
      time: "10m ago",
      read: false,
      type: "info"
    }
  ]);

  const addNotification = (message, type = "info") => {
    setNotifications((prev) => [
      {
        id: Math.random().toString(36).substring(2, 11),
        message,
        time: "Just now",
        read: false,
        type
      },
      ...prev
    ]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
