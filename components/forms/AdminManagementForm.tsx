"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/useToast"

interface Admin {
  id: string
  username: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export function AdminManagementForm() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    national_id: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins")
      const result = await response.json()
      if (result.success) {
        setAdmins(result.admins)
      }
    } catch (error) {
      showToast("Error loading admins", "error")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.national_id) {
      showToast("Username and National ID are required", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        showToast("Admin created successfully", "success")
        setFormData({ username: "", email: "", full_name: "", national_id: "" })
        fetchAdmins()
      } else {
        showToast(result.error || "Failed to create admin", "error")
      }
    } catch (error) {
      showToast("Error creating admin", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-form-card">
      <div className="form-header">
        <h2><i className="fas fa-users-cog"></i> Admin Management</h2>
        <p className="form-description">Create and manage administrator accounts. National ID will be used as the default password.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="national_id">National ID (Password)</label>
          <input
            type="text"
            id="national_id"
            value={formData.national_id}
            onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
            placeholder="This will be used as the password"
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Creating..." : "Create Admin"}
        </button>
      </form>

      <div className="admins-list">
        <h3>Current Admins</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.username}</td>
                <td>{admin.full_name || "-"}</td>
                <td>{admin.email || "-"}</td>
                <td>{admin.is_active ? "Active" : "Inactive"}</td>
                <td>{new Date(admin.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}