'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import DragDropFileUpload from '@/components/DragDropFileUpload';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building2, User, Calendar, ArrowLeft, Mail, ExternalLink } from 'lucide-react';

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
  // 1) Strongly type params; support string | string[] for catch-all routes
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params?.id;
  const id = useMemo(() => (Array.isArray(rawId) ? rawId[0] : rawId) ?? '', [rawId]);

  const { user, isSignedIn } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyMsg('');

    if (!resumeFile) {
      setApplyMsg('Resume required!');
      setApplyLoading(false);
      return;
    }
    if (!job?._id) {
      setApplyMsg('Invalid job.');
      setApplyLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('job', job._id);
    formData.append('userId', user?.id || '');
    formData.append('name', user?.fullName || '');
    formData.append('email', user?.primaryEmailAddress?.emailAddress || '');
    formData.append('message', (e.currentTarget as any).message?.value || '');
    formData.append('resume', resumeFile);

    const res = await fetch('/api/applications', { method: 'POST', body: formData });

    if (res.ok) {
      setApplied(true);
      setApplyModal(false);
      setApplyMsg('Application submitted!');
      setResumeFile(null);
    } else {
      setApplyMsg('Failed to apply. Try again.');
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
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-2xl mr-2">🎉</div>
                  <div>
                    <p className="font-semibold text-green-900 text-lg">You’ve successfully applied!</p>
                    <p className="text-sm text-green-700">We’ve received your application and sent you a confirmation email.</p>
                  </div>
                </div>
              ) : isSignedIn ? (
                <>
                  <Button onClick={() => setApplyModal(true)} className="flex-1 bg-gradient-to-r from-[#3DBDFF] via-[#007BFF] to-[#002E6E] text-white font-semibold py-3 text-lg rounded-lg hover:opacity-90 transition-all">
                    <Mail className="w-5 h-5 mr-2" /> Apply Now
                  </Button>

                  {applyModal && (
                    <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setApplyModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-gray-900 text-2xl">
                          &times;
                        </button>
                        <h3 className="text-xl font-bold mb-3 text-[#002E6E]">Apply for this Job</h3>
                        <form onSubmit={handleApplySubmit}>
                          <input className="w-full bg-gray-100 p-2 rounded mb-3 outline-none cursor-not-allowed" value={user?.fullName ?? ''} disabled />
                          <input className="w-full bg-gray-100 p-2 rounded mb-3 outline-none cursor-not-allowed" value={user?.primaryEmailAddress?.emailAddress ?? ''} disabled />
                          <textarea name="message" placeholder="Introduce yourself or cover letter (optional)" className="w-full border px-3 py-2 rounded resize-none mb-3" rows={4} />
                          <DragDropFileUpload onFileSelect={setResumeFile} />
                          {resumeFile && <p className="text-sm mt-2">Selected: {resumeFile.name}</p>}
                          {uploadLoading && <p>Uploading Resume...</p>}
                          {uploadError && <p className="text-red-600">{uploadError}</p>}
                          <Button type="submit" className="w-full mt-4" disabled={applyLoading}>
                            {applyLoading ? 'Applying...' : 'Submit Application'}
                          </Button>
                          {applyMsg && <p className="text-green-700 mt-2">{applyMsg}</p>}
                        </form>
                      </div>
                    </div>
                  )}

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

        <section>
          <h3 className="text-2xl font-bold text-[#002E6E] mb-2">Similar Jobs</h3>
          <p className="text-[#002E6E]/70">
            Explore more opportunities from <span className="font-semibold">{job.company}</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
