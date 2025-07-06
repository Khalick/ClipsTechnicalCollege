"use client"

import React, { useState, useEffect } from 'react'
import { X, Download, FileText, Calendar, User, Plus } from 'lucide-react'
import { useStudentAuth } from '@/hooks/useStudentAuth'
import { useToast } from '@/hooks/useToast'
import { ExamCard } from './ExamCard'

interface ExamCardDocument {
  id: string
  registration_number: string
  document_type: string
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

interface ExamCardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExamCardModal({ isOpen, onClose }: ExamCardModalProps) {
  const [documents, setDocuments] = useState<ExamCardDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<ExamCardDocument | null>(null)
  const [showLiveExamCard, setShowLiveExamCard] = useState(false)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen && user?.registrationNumber) {
      fetchDocuments()
    }
  }, [isOpen, user])

  const fetchDocuments = async () => {
    if (!user?.registrationNumber) return

    setLoading(true)
    try {
      const response = await fetch(`/api/students/documents/${user.registrationNumber}`)
      const result = await response.json()

      if (result.success) {
        // Filter only exam-card documents
        const examCards = result.documents.filter(
          (doc: ExamCardDocument) => doc.document_type === 'exam-card'
        )
        setDocuments(examCards)
      } else {
        showToast('Failed to fetch exam cards', 'error')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      showToast('Error loading exam cards', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (doc: ExamCardDocument) => {
    try {
      const response = await fetch(doc.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('Document downloaded successfully', 'success')
    } catch (error) {
      console.error('Error downloading document:', error)
      showToast('Failed to download document', 'error')
    }
  }

  const handleView = (doc: ExamCardDocument) => {
    setSelectedDocument(doc)
  }

  const handleGenerateLiveExamCard = () => {
    setShowLiveExamCard(true)
  }

  const handleCloseLiveExamCard = () => {
    setShowLiveExamCard(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isOpen) return null

  return (
    <>
      <div className="exam-card-modal">
        <div className="exam-card-container">
          {/* Modal Header */}
          <div className="exam-card-header">
            <h2>
              <FileText size={28} />
              Exam Cards
            </h2>
            <div className="exam-card-header-actions">
              <button
                onClick={handleGenerateLiveExamCard}
                className="exam-card-btn exam-card-btn-success"
                title="Generate Live Exam Card"
              >
                <Plus size={16} />
                Generate Live Card
              </button>
              <button
                onClick={onClose}
                className="close-btn"
                title="Close modal"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
          </div>

        {/* Modal Content */}
        <div className="exam-card-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="loading-spinner-icon"></div>
              <span className="loading-spinner-text">Loading exam cards...</span>
            </div>
          ) : selectedDocument ? (
            // Document Viewer
            <div className="exam-card-viewer">
              <div className="exam-card-viewer-header">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="exam-card-viewer-back"
                >
                  ← Back to list
                </button>
                <div className="exam-card-viewer-actions">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="exam-card-btn exam-card-btn-success"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              <div className="exam-card-viewer-info">
                <h3>Document Details</h3>
                <div className="exam-card-viewer-details">
                  <div><strong>File Name:</strong> {selectedDocument.file_name}</div>
                  <div><strong>Size:</strong> {formatFileSize(selectedDocument.file_size)}</div>
                  <div><strong>Uploaded:</strong> {formatDate(selectedDocument.uploaded_at)}</div>
                  <div><strong>Type:</strong> {selectedDocument.document_type}</div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="exam-card-viewer-iframe">
                <iframe
                  src={selectedDocument.file_url}
                  title="Exam Card Preview"
                />
              </div>
            </div>
          ) : (
            // Document List
            <div className="exam-card-section">
              {user && (
                <div className="exam-card-info">
                  <h3>
                    <User size={20} />
                    Student Information
                  </h3>
                  <div className="exam-card-info-grid">
                    <div className="exam-card-info-item">
                      <span className="exam-card-info-label">Name:</span>
                      <span className="exam-card-info-value">{user.name}</span>
                    </div>
                    <div className="exam-card-info-item">
                      <span className="exam-card-info-label">Registration Number:</span>
                      <span className="exam-card-info-value">{user.registration_number}</span>
                    </div>
                    <div className="exam-card-info-item">
                      <span className="exam-card-info-label">Course:</span>
                      <span className="exam-card-info-value">{user.course}</span>
                    </div>
                  </div>
                </div>
              )}

              {documents.length === 0 ? (
                <div className="exam-card-empty">
                  <div className="exam-card-empty-icon">📄</div>
                  <h3>No Exam Cards Found</h3>
                  <p>
                    No exam cards have been uploaded for your account yet.
                    <br />
                    Please contact the academic office if you need your exam card.
                  </p>
                </div>
              ) : (
                <div className="exam-card-section">
                  <h3>
                    Available Exam Cards ({documents.length})
                  </h3>
                  <div className="exam-card-list">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="exam-card-item"
                      >
                        <div className="exam-card-item-header">
                          <div className="exam-card-item-info">
                            <FileText size={24} />
                            <div className="exam-card-item-details">
                              <div className="exam-card-item-title">{document.file_name}</div>
                              <div className="exam-card-item-meta">
                                <span>
                                  <Calendar size={14} />
                                  {formatDate(document.uploaded_at)}
                                </span>
                                <span>{formatFileSize(document.file_size)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="exam-card-item-actions">
                            <button
                              onClick={() => handleView(document)}
                              className="exam-card-btn exam-card-btn-primary"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(document)}
                              className="exam-card-btn exam-card-btn-success"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="exam-card-footer">
          <p className="exam-card-footer-text">
            Exam cards are uploaded by the academic office and can be downloaded for your records.
          </p>
          <button
            onClick={onClose}
            className="exam-card-btn exam-card-btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    {/* Live Exam Card Modal */}
    {showLiveExamCard && (
      <ExamCard
        isOpen={showLiveExamCard}
        onClose={handleCloseLiveExamCard}
      />
    )}
    </>
  )
}
