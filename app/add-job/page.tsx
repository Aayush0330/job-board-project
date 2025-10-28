'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Building2, User, FileText } from 'lucide-react'

export default function AddJobPage() {
  const { user, isSignedIn } = useUser()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    company: '',
    postedBy: user?.fullName || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
        setForm({
          title: '',
          description: '',
          location: '',
          company: '',
          postedBy: user?.fullName || '',
        })
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Failed to add job. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // =============================
  // Access restriction
  // =============================
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#007BFF]/20 via-[#3DBDFF]/20 to-[#002E6E]/20">
        <Card className="w-full max-w-md shadow-xl border-0 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#003C96]">Access Denied</CardTitle>
            <CardDescription className="text-gray-600">
              You must be logged in to post jobs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // =============================
  // Page UI
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FF] via-[#BEE3FF] to-[#002E6E]/10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007BFF]/20 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-[#007BFF]" />
          </div>
          <h1 className="text-4xl font-bold text-[#002E6E] mb-2">Post a New Job</h1>
          <p className="text-gray-600">
            Share your job opportunity with top professionals
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-[#B9F6CA] border border-[#4CAF50]/40 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <p className="text-[#256029] font-medium">Job posted successfully! 🎉</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#FFE0B2] border border-[#FF9800]/40 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-5 h-5 bg-[#FF9800] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <p className="text-[#B45309] font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <Card className="shadow-xl border-0 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#007BFF] via-[#3DBDFF] to-[#002E6E] text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold">Job Details</CardTitle>
            <CardDescription className="text-white/80">
              Fill in the required job information
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Common Input Fields */}
              {[
                { label: 'Job Title', icon: <Briefcase className="w-4 h-4 text-[#007BFF]" />, name: 'title', type: 'text', placeholder: 'e.g., React Developer' },
                { label: 'Location', icon: <MapPin className="w-4 h-4 text-[#3DBDFF]" />, name: 'location', type: 'text', placeholder: 'e.g., Remote or New York' },
                { label: 'Company Name', icon: <Building2 className="w-4 h-4 text-[#002E6E]" />, name: 'company', type: 'text', placeholder: 'e.g., NextGen Technologies' },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      {field.icon}
                      {field.label}
                    </div>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition"
                  />
                </div>
              ))}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[#3DBDFF]" />
                    Job Description
                  </div>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Posted By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-[#002E6E]" />
                    Posted By
                  </div>
                </label>
                <input
                  type="text"
                  value={form.postedBy}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#007BFF] to-[#002E6E] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </div>
                  ) : (
                    '✨ Post Job'
                  )}
                </Button>

                <Button
                  type="reset"
                  onClick={() =>
                    setForm({
                      title: '',
                      description: '',
                      location: '',
                      company: '',
                      postedBy: user?.fullName || '',
                    })
                  }
                  variant="outline"
                  className="px-6 border-[#3DBDFF] text-[#007BFF] hover:bg-[#E6F4FF] transition"
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Boxes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📋', title: 'Be Detailed', desc: 'Write clear job descriptions' },
            { icon: '📍', title: 'Be Specific', desc: 'Add exact location or remote info' },
            { icon: '⚡', title: 'Be Quick', desc: 'Post jobs instantly with ease' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="text-center p-4 bg-white/80 backdrop-blur border border-[#DCEBFF] rounded-lg shadow-sm hover:shadow-md transition"
            >
              <span className="text-3xl mb-2 block">{item.icon}</span>
              <h3 className="font-semibold text-[#002E6E]">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
