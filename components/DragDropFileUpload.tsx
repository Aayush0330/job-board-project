'use client'

import { useState, useRef } from 'react'
import { UploadCloud } from 'lucide-react'

export default function DragDropFileUpload({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0])
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed text-center transition-all duration-300 ease-in-out cursor-pointer
        ${
          dragActive
            ? 'border-[#00FF81] bg-[#00FF8110] shadow-[0_0_20px_#00FF8140]'
            : 'border-gray-300 hover:border-[#00F0FF] hover:bg-[#00F0FF10]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleChange}
      />

      <div
        className={`p-4 rounded-full transition-transform duration-300 ${
          dragActive ? 'bg-[#00FF81]/10 scale-110' : 'bg-[#00F0FF]/10'
        }`}
      >
        <UploadCloud
          className={`w-10 h-10 ${
            dragActive ? 'text-[#00FF81]' : 'text-[#00F0FF]'
          } transition-colors duration-300`}
        />
      </div>

      <p className="mt-3 text-gray-700 font-medium leading-relaxed">
        <span className="text-[#00F0FF] font-semibold">Drag & drop</span> your{' '}
        <span className="text-[#FFA900] font-bold">resume</span>
        <br />
        or <span className="text-[#00FF81] font-semibold">click to upload</span>
      </p>

      <p className="mt-2 text-xs text-gray-500">Supported formats: .pdf, .doc, .docx</p>
    </div>
  )
}
