"use client";

// This is a simplified version of the toast hook
import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 3000);

    return id;
  };

  return { toast, toasts };
}
