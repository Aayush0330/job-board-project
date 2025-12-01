'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import DragDropFileUpload from '@/components/DragDropFileUpload';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building2, User, Calendar, ArrowLeft, Mail, ExternalLink, CheckCircle } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  postedBy: string;
  createdAt: string;
}

export default function JobDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params?.id;
  const id = useMemo(() => (Array.isArray(rawId) ? rawId[0] : rawId) ?? '', [rawId]);

  const { user, isSignedIn, isLoaded } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/jobs?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Job not found');
        const data: Job = await res.json();
        setJob(data);
      } catch {
        setError('Failed to load job details');
        setJob(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 🔥 FIXED - JSON API call instead of FormData
  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyMsg('');

    // Validation
    if (!isLoaded || !isSignedIn || !user?.id) {
      setApplyMsg('❌ Please login first');
      setApplyLoading(false);
      return;
    }
    if (!job?._id) {
      setApplyMsg('❌ Invalid job ID');
      setApplyLoading(false);
      return;
    }
    if (!resumeFile) {
      setApplyMsg('❌ Resume is required');
      setApplyLoading(false);
      return;
    }

    // Prepare JSON data
    const formData = {
      job: job._id,
      userId: user.id,
      name: user.fullName || user.firstName || 'Applicant',
      email: user.primaryEmailAddress?.emailAddress || '',
      message: (e.currentTarget as any).message?.value || '',
      resumeUrl: resumeFile.name, // Full upload later
    };

    console.log('🚀 Sending to API:', formData);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('📡 API Response:', res.status, data);

      if (res.ok) {
        setApplied(true);
        setApplyModal(false);
        setApplyMsg('✅ Application submitted successfully!');
        setResumeFile(null);
      } else {
        setApplyMsg(`❌ ${data.error || 'Failed to apply'}`);
      }
    } catch (err: any) {
      console.error('❌ Network Error:', err);
      setApplyMsg('❌ Network error. Please try again.');
    }
    setApplyLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#EAF5FF] via-[#D6E9FF]/40 to-[#002E6E]/10">
        <div className="w-14 h-14 border-4 border-[#007BFF]/30 border-t-[#002E6E] rounded-full animate-spin mb-4" />
        <p className="text-[#002E6E] font-medium">Fetching job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#EAF5FF] via-[#D6E9FF]/30 to-[#002E6E]/10">
        <Card className="max-w-md w-full shadow-xl border border-[#007BFF]/20 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#002E6E]">Job Not Found</h2>
            <p className="text-[#002E6E]/70">{error}</p>
          </CardHeader>
          <CardContent>
            <Link href="/jobs">
              <Button className="w-full bg-[#007BFF] hover:bg-[#005FBE] text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF5FF] via-white to-[#002E6E]/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center text-[#007BFF] hover:text-[#005FBE] mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>

        <Card className="shadow-2xl border border-[#007BFF]/30 mb-10 overflow-hidden rounded-2xl backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-[#007BFF] via-[#3DBDFF] to-[#002E6E] text-white p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1">{job.title}</h1>
                <p className="flex items-center gap-2 text-blue-100 text-lg font-medium">
                  <Building2 className="w-5 h-5" /> {job.company}
                </p>
              </div>
              <Badge className="bg-white text-[#002E6E] font-semibold text-base px-4 py-2 shadow">
                {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-10 px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-6 border-b border-[#007BFF]/10">
              {[
                { icon: MapPin, label: 'Location', value: job.location },
                { icon: Briefcase, label: 'Job Type', value: 'Full-time' },
                { icon: Calendar, label: 'Posted', value: new Date(job.createdAt).toLocaleDateString() },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-[#007BFF] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                    <p className="text-lg font-semibold text-[#002E6E]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-[#002E6E] mb-3">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">{job.description}</p>
            </div>

            <div className="bg-[#EAF5FF] border border-[#007BFF]/20 rounded-xl p-5 mb-10">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-5 h-5 text-[#005FBE]" />
                <p className="text-sm text-gray-600">Posted by</p>
              </div>
              <p className="text-lg font-semibold text-[#002E6E]">{job.postedBy}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              {applied ? (
                <div className="flex-1 bg-[#D1FADF] border border-green-300 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-900 text-lg">You've successfully applied!</p>
                    <p className="text-sm text-green-700">Check your dashboard or email for updates.</p>
                  </div>
                </div>
              ) : isSignedIn ? (
                <>
                  <Button 
                    onClick={() => setApplyModal(true)} 
                    className="flex-1 bg-gradient-to-r from-[#3DBDFF] via-[#007BFF] to-[#002E6E] text-white font-semibold py-3 text-lg rounded-lg hover:opacity-90 transition-all"
                  >
                    <Mail className="w-5 h-5 mr-2" /> Apply Now
                  </Button>

                  <Button variant="outline" className="px-6 text-lg font-semibold hover:bg-[#EAF5FF]">
                    <ExternalLink className="w-5 h-5 mr-2" /> Share
                  </Button>
                </>
              ) : (
                <Link href="/sign-in">
                  <Button className="flex-1 bg-gradient-to-r from-[#3DBDFF] via-[#007BFF] to-[#002E6E] text-white font-semibold py-3 text-lg rounded-lg hover:opacity-90 transition-all">
                    <Mail className="w-5 h-5 mr-2" /> Sign In to Apply
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 🔥 APPLY MODAL */}
        {applyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 relative">
              <button 
                onClick={() => setApplyModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl font-bold"
              >
                ×
              </button>
              
              <h3 className="text-2xl font-bold mb-6 text-[#002E6E]">Apply for {job.title}</h3>
              
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    className="w-full bg-gray-100 p-3 rounded-lg outline-none cursor-not-allowed text-gray-700" 
                    value={user?.fullName ?? ''} 
                    disabled 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    className="w-full bg-gray-100 p-3 rounded-lg outline-none cursor-not-allowed text-gray-700" 
                    value={user?.primaryEmailAddress?.emailAddress ?? ''} 
                    disabled 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
                  <textarea 
                    name="message" 
                    placeholder="Tell us why you're a great fit for this role..." 
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg resize-vertical focus:ring-2 focus:ring-[#007BFF] focus:border-transparent min-h-[100px]"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume <span className="text-red-500">*</span></label>
                  <DragDropFileUpload onFileSelect={setResumeFile} />
                  {resumeFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
                
                {applyMsg && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    applyMsg.includes('✅') || applyMsg.includes('success')
                      ? 'bg-green-100 border border-green-300 text-green-800'
                      : 'bg-red-100 border border-red-300 text-red-800'
                  }`}>
                    {applyMsg}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#3DBDFF] via-[#007BFF] to-[#002E6E] text-white font-semibold py-3 text-lg rounded-lg hover:opacity-90 transition-all"
                  disabled={applyLoading}
                >
                  {applyLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Applying...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        <section className="mt-12">
          <h3 className="text-2xl font-bold text-[#002E6E] mb-6">Similar Jobs</h3>
          <p className="text-[#002E6E]/70 text-lg">
            Explore more opportunities from <span className="font-semibold">{job.company}</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
