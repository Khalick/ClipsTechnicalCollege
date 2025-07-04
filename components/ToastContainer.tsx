"use client"

import { useToast } from "@/hooks/useToast"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {toast.type === "success" && (
                <i
                  className="fas fa-check-circle"
                  style={{ color: "var(--success-color)", fontSize: "1.2rem", marginRight: "10px" }}
                ></i>
              )}
              {toast.type === "error" && (
                <i
                  className="fas fa-exclamation-circle"
                  style={{ color: "var(--error-color)", fontSize: "1.2rem", marginRight: "10px" }}
                ></i>
              )}
              {toast.type === "warning" && (
                <i
                  className="fas fa-exclamation-triangle"
                  style={{ color: "var(--warning-color)", fontSize: "1.2rem", marginRight: "10px" }}
                ></i>
              )}
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
              </div>
            </div>
            <div style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => removeToast(toast.id)}>
              <i className="fas fa-times" style={{ color: "#888", fontSize: "0.9rem" }}></i>
            </div>
          </div>
          <div style={{ marginTop: "8px", marginLeft: "32px", fontSize: "0.95rem", lineHeight: 1.5 }}>
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  )
}
