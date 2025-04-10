"use client";
import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, type = "default" }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, type };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 3000);

    return id;
  };

  const dismissToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  return { toast, toasts, dismissToast };
}
