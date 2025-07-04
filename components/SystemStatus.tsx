"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"

export function SystemStatus() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const { showToast } = useToast()

  const testApiConnection = async () => {
    setIsTestingConnection(true)
    try {
      const healthResponse = await fetch("/api/health")
      const healthData = await healthResponse.json()

      setSystemInfo({ health: healthData })

      if (healthData.status === "ok") {
        showToast("System is healthy and ready", "success")
      } else if (healthData.status === "warning") {
        showToast("System is functional with warnings", "warning")
      } else {
        showToast("System has errors", "error")
      }
    } catch (error) {
      showToast("API connection error", "error")
      console.error("Health check failed:", error)
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: "20px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderLeft: "4px solid #28a745",
      }}
    >
      <div className="card-header">
        <h3>
          <div className="card-icon">
            <i className="fas fa-cloud"></i>
          </div>
          System Status
        </h3>
        <p>Supabase database and storage integration</p>
      </div>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <strong>Database:</strong>
            <span
              style={{
                marginLeft: "8px",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.85rem",
                background: "#e3f2fd",
                color: "#1976d2",
              }}
            >
              Supabase PostgreSQL
            </span>
          </div>
          <div>
            <strong>Storage:</strong>
            <span
              style={{
                marginLeft: "8px",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.85rem",
                background: "#e8f5e8",
                color: "#2e7d32",
              }}
            >
              Supabase Storage
            </span>
          </div>
        </div>

        {systemInfo && (
          <div style={{ marginBottom: "15px", fontSize: "14px" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>System Health:</strong>
              <span
                style={{
                  marginLeft: "8px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  background:
                    systemInfo.health.status === "ok"
                      ? "#e8f5e8"
                      : systemInfo.health.status === "warning"
                        ? "#fff3e0"
                        : "#ffebee",
                  color:
                    systemInfo.health.status === "ok"
                      ? "#2e7d32"
                      : systemInfo.health.status === "warning"
                        ? "#f57c00"
                        : "#c62828",
                }}
              >
                {systemInfo.health.status.toUpperCase()}
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Database Status:</strong>
              <span style={{ marginLeft: "8px" }}>{systemInfo.health.database}</span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Storage Status:</strong>
              <span style={{ marginLeft: "8px" }}>{systemInfo.health.storage}</span>
            </div>
            {systemInfo.health.warnings?.length > 0 && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#f57c00" }}>
                <strong>Warnings:</strong>
                <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                  {systemInfo.health.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {systemInfo.health.errors?.length > 0 && (
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#c62828" }}>
                <strong>Errors:</strong>
                <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                  {systemInfo.health.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={testApiConnection}
          className="btn btn-outline"
          disabled={isTestingConnection}
          style={{ marginRight: "10px" }}
        >
          <i className="fas fa-wifi"></i>
          {isTestingConnection ? "Testing..." : "Test Supabase Connection"}
        </button>
      </div>
    </div>
  )
}
