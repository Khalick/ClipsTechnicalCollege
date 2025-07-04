"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"

interface Document {
  id: number
  registration_number: string
  document_type: string
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

interface DocumentsSectionProps {
  registrationNumber: string
}

export function DocumentsSection({ registrationNumber }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (registrationNumber) {
      fetchDocuments()
    } else {
      setIsLoading(false)
    }
  }, [registrationNumber])

  const fetchDocuments = async () => {
    if (!registrationNumber) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const result = await apiRequest(`/api/students/documents/${registrationNumber}`)
      
      if (result.success) {
        setDocuments(result.data.documents)
      } else {
        showToast(result.error || "Failed to load documents", "error")
      }
    } catch (error) {
      showToast("Error loading documents", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadDocument = (doc: Document) => {
    window.open(doc.file_url, '_blank')
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "exam-card":
        return "📋"
      case "fees-structure":
        return "💰"
      case "results":
        return "📊"
      default:
        return "📄"
    }
  }

  return (
    <div className="card" id="documents">
      <h2>My Documents</h2>
      <div className="documents-grid">
        {isLoading ? (
          <div className="loading-message">Loading documents...</div>
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">
                <span className="doc-icon">{getDocumentIcon(doc.document_type)}</span>
              </div>
              <div className="document-info">
                <h4>{doc.file_name}</h4>
                <div className="document-date">{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                <div className="document-type">{doc.document_type}</div>
              </div>
              <div className="document-actions">
                <button onClick={() => downloadDocument(doc)} className="download-btn">
                  Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">
            <p>No documents available yet.</p>
          </div>
        )}
      </div>
      <div className="documents-summary">
        <p>
          Total Documents: <span>{documents.length}</span>
        </p>
      </div>
    </div>
  )
}
