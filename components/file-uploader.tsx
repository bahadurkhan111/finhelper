"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setFileName(file.name)
    onFileUpload(file)
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-muted rounded-full p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-sm text-center">
            <p className="font-medium">Drag and drop your CSV file here</p>
            <p className="text-muted-foreground mt-1">or click to browse files</p>
          </div>
          <Input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <Button variant="outline" size="sm" onClick={handleButtonClick}>
            Browse Files
          </Button>
        </div>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{fileName}</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
