export interface Student {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  national_id?: string
  birth_certificate?: string
  date_of_birth?: string
  email?: string
  photo_url?: string
  status: "active" | "deregistered" | "on_leave"
  deregistered?: boolean
  deregistration_date?: string
  deregistration_reason?: string
  academic_leave?: boolean
  academic_leave_start?: string
  academic_leave_end?: string
  academic_leave_reason?: string
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  unit_name: string
  unit_code: string
  created_at: string
}

export interface StudentDocument {
  id: string
  registration_number: string
  document_type: string
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  created_at: string
}
