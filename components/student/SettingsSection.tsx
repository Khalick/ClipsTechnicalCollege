"use client"

import React, { useState, useEffect } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"

interface StudentData {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  status: string
  national_id?: string
  date_of_birth?: string
  email?: string
  phone?: string
  photo_url?: string
  postal_address?: string
  clips_email?: string
  gender?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  next_of_kin_name?: string
  next_of_kin_phone?: string
  next_of_kin_relationship?: string
}

interface SettingsSectionProps {
  studentData: StudentData | null
  onStudentDataChange: (data: StudentData) => void
  user: any
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ studentData, onStudentDataChange, user }) => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<StudentData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { showToast } = useToast()

  // Initialize form data when studentData changes
  useEffect(() => {
    if (studentData) {
      setFormData({
        name: studentData.name,
        email: studentData.email || "",
        phone: studentData.phone || "",
        postal_address: studentData.postal_address || "",
        clips_email: studentData.clips_email || "",
        gender: studentData.gender || "Male",
        emergency_contact_name: studentData.emergency_contact_name || "",
        emergency_contact_phone: studentData.emergency_contact_phone || "",
        next_of_kin_name: studentData.next_of_kin_name || "",
        next_of_kin_phone: studentData.next_of_kin_phone || "",
        next_of_kin_relationship: studentData.next_of_kin_relationship || "",
      })
    }
  }, [studentData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast("File size must be less than 5MB", "error")
        return
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        showToast("Please select a valid image file (JPEG, PNG, or GIF)", "error")
        return
      }

      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!studentData) return

    setIsLoading(true)
    try {
      // Update profile information
      const response = await fetch(`/api/students/profile/${studentData.registration_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onStudentDataChange({ ...studentData, ...formData })
          setIsEditing(false)
          showToast("Profile updated successfully", "success")
        } else {
          showToast(result.message || "Failed to update profile", "error")
        }
      } else {
        showToast("Failed to update profile", "error")
      }

      // Upload profile picture if selected
      if (profilePicture) {
        const formDataImg = new FormData()
        formDataImg.append('image', profilePicture)
        formDataImg.append('registrationNumber', studentData.registration_number)

        const uploadResponse = await fetch('/api/students/upload-photo', {
          method: 'POST',
          body: formDataImg,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          if (uploadResult.success) {
            onStudentDataChange({ ...studentData, ...formData, photo_url: uploadResult.photoUrl })
            showToast("Profile picture updated successfully", "success")
          }
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Failed to update profile", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: studentData?.name || "",
      email: studentData?.email || "",
      phone: studentData?.phone || "",
      postal_address: studentData?.postal_address || "",
      clips_email: studentData?.clips_email || "",
      gender: studentData?.gender || "Male",
      emergency_contact_name: studentData?.emergency_contact_name || "",
      emergency_contact_phone: studentData?.emergency_contact_phone || "",
      next_of_kin_name: studentData?.next_of_kin_name || "",
      next_of_kin_phone: studentData?.next_of_kin_phone || "",
      next_of_kin_relationship: studentData?.next_of_kin_relationship || "",
    })
    setProfilePicture(null)
    setPreviewUrl(null)
  }

  const handlePasswordChange = async (formData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match", "error")
      return
    }

    if (formData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters long", "error")
      return
    }

    try {
      const response = await fetch('/api/students/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: studentData?.registration_number,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showToast("Password changed successfully", "success")
          setActiveTab("profile")
        } else {
          showToast(result.message || "Failed to change password", "error")
        }
      } else {
        showToast("Failed to change password", "error")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      showToast("Failed to change password", "error")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <h3>Settings Navigation</h3>
          <nav className="settings-nav">
            <ul>
              <li>
                <button
                  className={`settings-nav-item ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <span className="nav-icon">👤</span>
                  <span>Profile Settings</span>
                </button>
              </li>
              <li>
                <button
                  className={`settings-nav-item ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <span className="nav-icon">🔒</span>
                  <span>Change Password</span>
                </button>
              </li>
              <li>
                <button
                  className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <span className="nav-icon">🔔</span>
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button
                  className={`settings-nav-item ${activeTab === "privacy" ? "active" : ""}`}
                  onClick={() => setActiveTab("privacy")}
                >
                  <span className="nav-icon">🔐</span>
                  <span>Privacy Settings</span>
                </button>
              </li>
              <li>
                <button
                  className={`settings-nav-item ${activeTab === "help" ? "active" : ""}`}
                  onClick={() => setActiveTab("help")}
                >
                  <span className="nav-icon">❓</span>
                  <span>Help & Support</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Profile Settings</h3>
                <p>Update your personal information and profile picture</p>
              </div>

              <div className="profile-settings-card">
                <div className="profile-photo-section">
                  <div className="photo-display">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Profile Preview"
                        width={120}
                        height={120}
                        className="profile-photo"
                      />
                    ) : studentData?.photo_url ? (
                      <Image
                        src={studentData.photo_url}
                        alt="Student Photo"
                        width={120}
                        height={120}
                        className="profile-photo"
                      />
                    ) : (
                      <div className="profile-avatar">
                        {getInitials(studentData?.name || "Student")}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="photo-upload">
                      <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        title="Upload profile picture"
                      />
                      <label htmlFor="profilePicture" className="upload-btn">
                        📷 Change Photo
                      </label>
                      <p className="photo-hint">Max size: 5MB. Formats: JPEG, PNG, GIF</p>
                    </div>
                  )}
                </div>

                <div className="profile-form">
                  <div className="form-sections">
                    <div className="form-section">
                      <h4>Basic Information</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Full Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.name || ""}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className="form-input"
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <span className="form-value">{studentData?.name || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Registration Number</label>
                          <span className="form-value readonly">{studentData?.registration_number || "Not provided"}</span>
                        </div>
                        <div className="form-group">
                          <label>Course</label>
                          <span className="form-value readonly">{studentData?.course || "Not provided"}</span>
                        </div>
                        <div className="form-group">
                          <label>Level of Study</label>
                          <span className="form-value readonly">{studentData?.level_of_study || "Not provided"}</span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="gender">Gender</label>
                          {isEditing ? (
                            <select
                              id="gender"
                              value={formData.gender || "Male"}
                              onChange={(e) => handleInputChange("gender", e.target.value)}
                              className="form-select"
                              title="Select gender"
                              aria-label="Select gender"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <span className="form-value">{studentData?.gender || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Date of Birth</label>
                          <span className="form-value readonly">
                            {studentData?.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Contact Information</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Email Address</label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={formData.email || ""}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="form-input"
                              placeholder="Enter your email address"
                            />
                          ) : (
                            <span className="form-value">{studentData?.email || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.phone || ""}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="form-input"
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <span className="form-value">{studentData?.phone || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Postal Address</label>
                          {isEditing ? (
                            <textarea
                              value={formData.postal_address || ""}
                              onChange={(e) => handleInputChange("postal_address", e.target.value)}
                              className="form-textarea"
                              rows={3}
                              placeholder="Enter your postal address"
                            />
                          ) : (
                            <span className="form-value">{studentData?.postal_address || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>CLIPS Email</label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={formData.clips_email || ""}
                              onChange={(e) => handleInputChange("clips_email", e.target.value)}
                              className="form-input"
                              placeholder="Enter your CLIPS email address"
                            />
                          ) : (
                            <span className="form-value">{studentData?.clips_email || "Not provided"}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Emergency Contact</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Contact Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.emergency_contact_name || ""}
                              onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                              className="form-input"
                              title="Enter emergency contact name"
                              placeholder="Enter emergency contact name"
                            />
                          ) : (
                            <span className="form-value">{studentData?.emergency_contact_name || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Contact Phone</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.emergency_contact_phone || ""}
                              onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                              className="form-input"
                              title="Enter emergency contact phone number"
                              placeholder="Enter emergency contact phone number"
                            />
                          ) : (
                            <span className="form-value">{studentData?.emergency_contact_phone || "Not provided"}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Next of Kin</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.next_of_kin_name || ""}
                              onChange={(e) => handleInputChange("next_of_kin_name", e.target.value)}
                              className="form-input"
                              placeholder="Enter next of kin name"
                              title="Next of kin name"
                            />
                          ) : (
                            <span className="form-value">{studentData?.next_of_kin_name || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.next_of_kin_phone || ""}
                              onChange={(e) => handleInputChange("next_of_kin_phone", e.target.value)}
                              className="form-input"
                              placeholder="Enter next of kin phone number"
                            />
                          ) : (
                            <span className="form-value">{studentData?.next_of_kin_phone || "Not provided"}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Relationship</label>
                          {isEditing ? (
                            <select
                              value={formData.next_of_kin_relationship || ""}
                              onChange={(e) => handleInputChange("next_of_kin_relationship", e.target.value)}
                              className="form-select"
                              title="Select relationship to next of kin"
                            >
                              <option value="">Select relationship</option>
                              <option value="Parent">Parent</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <span className="form-value">{studentData?.next_of_kin_relationship || "Not provided"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    {isEditing ? (
                      <div className="edit-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={handleSave}
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Change Password</h3>
                <p>Update your account password for security</p>
              </div>

              <div className="password-settings-card">
                <PasswordChangeForm onPasswordChange={handlePasswordChange} />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Notification Settings</h3>
                <p>Configure your notification preferences</p>
              </div>

              <div className="notifications-settings-card">
                <NotificationSettings />
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Privacy Settings</h3>
                <p>Control your privacy and data sharing preferences</p>
              </div>

              <div className="privacy-settings-card">
                <PrivacySettings />
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Help & Support</h3>
                <p>Get help and support for your account</p>
              </div>

              <div className="help-settings-card">
                <HelpSupport />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Password Change Form Component
const PasswordChangeForm: React.FC<{ onPasswordChange: (data: any) => void }> = ({ onPasswordChange }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPasswordChange(formData)
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password</label>
        <div className="password-input-group">
          <input
            type={showPasswords.current ? "text" : "password"}
            id="currentPassword"
            value={formData.currentPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
            className="form-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
          >
            {showPasswords.current ? "👁️" : "🙈"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <div className="password-input-group">
          <input
            type={showPasswords.new ? "text" : "password"}
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            className="form-input"
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
          >
            {showPasswords.new ? "👁️" : "🙈"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <div className="password-input-group">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="form-input"
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
          >
            {showPasswords.confirm ? "👁️" : "🙈"}
          </button>
        </div>
      </div>

      <div className="password-requirements">
        <h4>Password Requirements:</h4>
        <ul>
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Contains at least one special character</li>
        </ul>
      </div>

      <button type="submit" className="btn btn-primary">
        Change Password
      </button>
    </form>
  )
}

// Notification Settings Component
const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    feeReminders: true,
    academicUpdates: true,
    systemAlerts: true,
    marketingEmails: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    fetchNotificationSettings()
  }, [])

  const fetchNotificationSettings = async () => {
    if (!user?.registrationNumber) return

    try {
      const response = await fetch(`/api/students/notifications?registrationNumber=${user.registrationNumber}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSettings({
            emailNotifications: result.data.email_notifications,
            smsNotifications: result.data.sms_notifications,
            pushNotifications: result.data.push_notifications,
            feeReminders: result.data.fee_reminders,
            academicUpdates: result.data.academic_updates,
            systemAlerts: result.data.system_alerts,
            marketingEmails: result.data.marketing_emails
          })
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }))
  }

  const handleSave = async () => {
    if (!user?.registrationNumber) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/students/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: user.registrationNumber,
          email_notifications: settings.emailNotifications,
          sms_notifications: settings.smsNotifications,
          push_notifications: settings.pushNotifications,
          fee_reminders: settings.feeReminders,
          academic_updates: settings.academicUpdates,
          system_alerts: settings.systemAlerts,
          marketing_emails: settings.marketingEmails
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showToast('Notification settings updated successfully', 'success')
        } else {
          showToast(result.message || 'Failed to update settings', 'error')
        }
      } else {
        showToast('Failed to update settings', 'error')
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
      showToast('Failed to update settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="notification-settings">
      <div className="settings-group">
        <h4>Communication Preferences</h4>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
            />
            <span>Email Notifications</span>
          </label>
          <p className="setting-description">Receive notifications via email</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={() => handleToggle("smsNotifications")}
            />
            <span>SMS Notifications</span>
          </label>
          <p className="setting-description">Receive notifications via SMS</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
            />
            <span>Push Notifications</span>
          </label>
          <p className="setting-description">Receive browser push notifications</p>
        </div>
      </div>

      <div className="settings-group">
        <h4>Content Preferences</h4>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.feeReminders}
              onChange={() => handleToggle("feeReminders")}
            />
            <span>Fee Reminders</span>
          </label>
          <p className="setting-description">Get reminders about fee payments</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.academicUpdates}
              onChange={() => handleToggle("academicUpdates")}
            />
            <span>Academic Updates</span>
          </label>
          <p className="setting-description">Receive updates about academic activities</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={() => handleToggle("systemAlerts")}
            />
            <span>System Alerts</span>
          </label>
          <p className="setting-description">Important system notifications</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={() => handleToggle("marketingEmails")}
            />
            <span>Marketing Emails</span>
          </label>
          <p className="setting-description">Receive promotional content and updates</p>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Notification Settings'}
      </button>
    </div>
  )
}

// Privacy Settings Component
const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    profileVisibility: "private",
    shareAcademicInfo: false,
    shareContactInfo: false,
    dataAnalytics: true,
    thirdPartySharing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    fetchPrivacySettings()
  }, [])

  const fetchPrivacySettings = async () => {
    if (!user?.registrationNumber) return

    try {
      const response = await fetch(`/api/students/privacy-settings?registrationNumber=${user.registrationNumber}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSettings({
            profileVisibility: result.data.profile_visibility,
            shareAcademicInfo: result.data.share_academic_info,
            shareContactInfo: result.data.share_contact_info,
            dataAnalytics: result.data.data_analytics,
            thirdPartySharing: result.data.third_party_sharing
          })
        }
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
    }
  }

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }))
  }

  const handleSelectChange = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleSave = async () => {
    if (!user?.registrationNumber) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/students/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: user.registrationNumber,
          profile_visibility: settings.profileVisibility,
          share_academic_info: settings.shareAcademicInfo,
          share_contact_info: settings.shareContactInfo,
          data_analytics: settings.dataAnalytics,
          third_party_sharing: settings.thirdPartySharing
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showToast('Privacy settings updated successfully', 'success')
        } else {
          showToast(result.message || 'Failed to update settings', 'error')
        }
      } else {
        showToast('Failed to update settings', 'error')
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      showToast('Failed to update settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="privacy-settings">
      <div className="settings-group">
        <h4>Profile Privacy</h4>
        <div className="setting-item">
          <label>Profile Visibility</label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => handleSelectChange("profileVisibility", e.target.value)}
            className="form-select"
            title="Select profile visibility"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
          <p className="setting-description">Control who can view your profile information</p>
        </div>
      </div>

      <div className="settings-group">
        <h4>Data Sharing</h4>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.shareAcademicInfo}
              onChange={() => handleToggle("shareAcademicInfo")}
            />
            <span>Share Academic Information</span>
          </label>
          <p className="setting-description">Allow sharing of academic performance data</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.shareContactInfo}
              onChange={() => handleToggle("shareContactInfo")}
            />
            <span>Share Contact Information</span>
          </label>
          <p className="setting-description">Allow sharing of contact details with other students</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.dataAnalytics}
              onChange={() => handleToggle("dataAnalytics")}
            />
            <span>Data Analytics</span>
          </label>
          <p className="setting-description">Help improve our services by sharing usage data</p>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.thirdPartySharing}
              onChange={() => handleToggle("thirdPartySharing")}
            />
            <span>Third-party Sharing</span>
          </label>
          <p className="setting-description">Allow sharing data with trusted third-party services</p>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Privacy Settings'}
      </button>
    </div>
  )
}

// Help & Support Component
const HelpSupport: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [message, setMessage] = useState("")
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    fetchSupportTickets()
  }, [])

  const fetchSupportTickets = async () => {
    if (!user?.registrationNumber) return

    try {
      const response = await fetch(`/api/students/support?registrationNumber=${user.registrationNumber}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSupportTickets(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.registrationNumber) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/students/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: user.registrationNumber,
          category: selectedCategory,
          subject: `${selectedCategory} support request`,
          message: message
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showToast('Support request submitted successfully!', 'success')
          setSelectedCategory("")
          setMessage("")
          fetchSupportTickets() // Refresh the tickets list
        } else {
          showToast(result.message || 'Failed to submit request', 'error')
        }
      } else {
        showToast('Failed to submit request', 'error')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      showToast('Failed to submit request', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="help-support">
      <div className="help-sections">
        <div className="help-section">
          <h4>Frequently Asked Questions</h4>
          <div className="faq-list">
            <div className="faq-item">
              <h5>How do I change my password?</h5>
              <p>Go to Settings {'>'}  Change Password and follow the instructions.</p>
            </div>
            <div className="faq-item">
              <h5>How do I update my profile information?</h5>
              <p>Navigate to Settings {'>'}  Profile Settings and click Edit Profile.</p>
            </div>
            <div className="faq-item">
              <h5>How do I check my fee balance?</h5>
              <p>Go to the Financials section to view your fee balance and payment history.</p>
            </div>
            <div className="faq-item">
              <h5>How do I register for units?</h5>
              <p>Navigate to Academics {'>'}  Register Units to select and register for available units.</p>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h4>Contact Support</h4>
          <div className="contact-info">
            <div className="contact-item">
              <strong>Email:</strong> support@clips.edu
            </div>
            <div className="contact-item">
              <strong>Phone:</strong> +254 700 000 000
            </div>
            <div className="contact-item">
              <strong>Office Hours:</strong> Mon - Fri, 8:00 AM - 5:00 PM
            </div>
          </div>
        </div>

        <div className="help-section">
          <h4>Submit a Support Request</h4>
          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issues</option>
                <option value="account">Account Problems</option>
                <option value="billing">Billing & Payments</option>
                <option value="academic">Academic Issues</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-textarea"
                rows={6}
                placeholder="Describe your issue or question..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        <div className="help-section">
          <h4>Resources</h4>
          <div className="resource-links">
            <a href="#" className="resource-link">📘 Student Handbook</a>
            <a href="#" className="resource-link">🎥 Video Tutorials</a>
            <a href="#" className="resource-link">📋 System Requirements</a>
            <a href="#" className="resource-link">🔧 Troubleshooting Guide</a>
          </div>
        </div>

        <div className="help-section">
          <h4>My Support Tickets</h4>
          <div className="tickets-list">
            {supportTickets.length === 0 ? (
              <p>No support tickets found.</p>
            ) : (
              supportTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className={`ticket-status status-${ticket.status}`}>{ticket.status}</span>
                  </div>
                  <h5>{ticket.subject}</h5>
                  <p className="ticket-category">{ticket.category}</p>
                  <p className="ticket-date">Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsSection
