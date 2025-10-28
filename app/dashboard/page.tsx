'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, MapPin, Calendar, Download } from 'lucide-react';

interface Application {
  _id: string;
  job: { _id: string; title: string; company: string; location: string; createdAt: string };
  message: string;
  resumeUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/applications?userId=${user.id}`, { signal: ac.signal });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data: Application[] = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as any).name !== 'AbortError') setError('Unable to load your applications');
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [isSignedIn, user?.id]);

  const acceptedCount = useMemo(
    () => applications.filter(a => a.status === 'accepted').length,
    [applications]
  );
  const pendingCount = useMemo(
    () => applications.filter(a => a.status === 'pending').length,
    [applications]
  );

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-[#003F91]">Access Denied</h2>
            <p className="text-gray-600 mt-2">Please sign in to view your applications</p>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full bg-[#006DFF] hover:bg-[#0057D9]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10">
        <div className="w-14 h-14 border-4 border-[#41B2FF]/30 border-t-[#003F91] rounded-full animate-spin mb-4" />
        <p className="text-[#003F91] font-medium">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center text-[#006DFF] hover:text-[#0057D9] mb-8 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003F91] mb-2">My Applications</h1>
          <p className="text-gray-600">Track all your job applications in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#E6F8FF] to-white border-[#41B2FF]/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#006DFF]">{applications.length}</div>
              <p className="text-gray-600 text-sm mt-1">Total Applications</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
              <p className="text-gray-600 text-sm mt-1">Accepted</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-gray-600 text-sm mt-1">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <Card className="shadow-lg border-[#41B2FF]/20">
            <CardContent className="pt-12 pb-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">Start applying to jobs to see them here</p>
              <Link href="/jobs">
                <Button className="bg-[#006DFF] hover:bg-[#0057D9]">Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app._id} className="shadow-lg border-[#41B2FF]/20 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex-1">
                      <Link href={`/jobs/${app.job._id}`}>
                        <h3 className="text-lg font-bold text-[#003F91] hover:text-[#006DFF] transition">
                          {app.job.title}
                        </h3>
                      </Link>
                      <p className="text-[#006DFF] font-semibold">{app.job.company}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {app.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Cover Letter:</span> {app.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge
                        className={
                          app.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Resume
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
