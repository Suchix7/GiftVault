"use client"
import { X } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    (<div
      className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-background border rounded-md shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5"
          )}>
          <div className="flex-1">
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="text-sm text-muted-foreground mt-1">{toast.description}</div>}
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>)
  );
}

