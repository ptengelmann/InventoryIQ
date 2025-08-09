'use client'

import React, { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  className?: string
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }, [])

  const handleFileSelection = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setUploadedFile(file)
      setUploadStatus('success')
      onFileUpload(file)
    } else {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          uploadStatus === 'success' ? "border-green-500 bg-green-50" : "",
          uploadStatus === 'error' ? "border-red-500 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <File className="h-8 w-8 text-gray-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                File Ready for Analysis
              </h3>
              <p className="text-gray-600">
                {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
              </p>
            </div>
            
            <button
              onClick={removeFile}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Remove File</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {uploadStatus === 'error' ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <Upload className={cn(
                  "h-12 w-12 transition-colors",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )} />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {uploadStatus === 'error' ? 'Invalid File Type' : 'Upload Your Inventory Data'}
              </h3>
              <p className="text-gray-600">
                {uploadStatus === 'error' 
                  ? 'Please upload a CSV file with your inventory data'
                  : 'Drag and drop your CSV file here, or click to browse'
                }
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Expected columns: SKU, Price, Weekly_Sales, Inventory_Level</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}