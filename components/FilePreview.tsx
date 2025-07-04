interface FilePreviewProps {
  file: File
}

export function FilePreview({ file }: FilePreviewProps) {
  const fileSize = (file.size / 1024).toFixed(2) + " KB"
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

  return (
    <div className="file-preview" style={{ display: "flex" }}>
      {isPdf ? (
        <div className="pdf-preview">
          <i className="fas fa-file-pdf pdf-icon"></i>
          <span>PDF Document</span>
        </div>
      ) : (
        <div className="invalid-file-preview">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Invalid file type (PDF required)</span>
        </div>
      )}

      <div className="file-info">
        <div className="file-details">
          <strong>File:</strong> {file.name}
          <br />
          <strong>Type:</strong> {file.type}
          <br />
          <strong>Size:</strong> {fileSize}
        </div>
      </div>
    </div>
  )
}
