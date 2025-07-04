"use client"

import { useAuth } from "@/hooks/useAuth"
import { StudentRegistrationForm } from "./forms/StudentRegistrationForm"
import { StudentDeregistrationForm } from "./forms/StudentDeregistrationForm"
import { AcademicLeaveForm } from "./forms/AcademicLeaveForm"
import { StudentPromotionForm } from "./forms/StudentPromotionForm"
import { UnitAllocationForm } from "./forms/UnitAllocationForm"
import { ExamCardUploadForm } from "./forms/ExamCardUploadForm"
import { DocumentUploadForm } from "./forms/DocumentUploadForm"
import { AdminManagementForm } from "./forms/AdminManagementForm"
import { AdminFeesBillingForm } from "./forms/AdminFeesBillingForm"
import { StudentsTable } from "./StudentsTable"
import { SystemStatus } from "./SystemStatus"

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-view">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="fas fa-th-large"></i>
            Admin Dashboard
          </h1>
          <div className="user-info">
            <span>
              <i className="fas fa-user-shield"></i>
              Welcome, <strong>{user?.username || "Admin"}</strong>
            </span>
            <button onClick={logout} className="btn btn-outline">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>

        <SystemStatus />

        <div className="admin-actions">
          <StudentRegistrationForm />
          <StudentDeregistrationForm />
          <AcademicLeaveForm />
          <StudentPromotionForm />
          <UnitAllocationForm />
          <ExamCardUploadForm />
          <DocumentUploadForm />
          <AdminManagementForm />
          <AdminFeesBillingForm />
          <StudentsTable />
        </div>
      </div>
    </div>
  )
}
