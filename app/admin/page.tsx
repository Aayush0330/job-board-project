// app/admin/page.tsx - FULLY WORKING VERSION
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Check, X, RotateCcw, MapPin, Calendar, Search } from 'lucide-react';

type Status = 'pending' | 'accepted' | 'rejected';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
  };
  name: string;
  email: string;
  message: string;
  resumeUrl: string;
  status: Status;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const { user, isSignedIn } = useUser();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');

  // ✅ FIXED: Admin API endpoint
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;
    
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError('');

        // ✅ ADMIN ENDPOINT - ALL applications jo tumhare jobs pe aaye
        const url = new URL('/api/admin/applications', window.location.origin);
        url.searchParams.set('postedBy', user.id);
        if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

        console.log('Fetching from:', url.toString()); // DEBUG

        const res = await fetch(url.toString(), { 
          cache: 'no-store', 
          signal: ac.signal 
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to load applications: ${res.status}`);
        }
        
        const data: Application[] = await res.json();
        console.log('Applications loaded:', data); // DEBUG
        
        setApps(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error('Fetch error:', e);
        if (e.name !== 'AbortError') {
          setError(`Unable to load applications: ${e.message}`);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [isSignedIn, user?.id, statusFilter]);

  // Client-side search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(a => {
      const hay = `${a.job.title} ${a.job.company} ${a.name} ${a.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [apps, query]);

  const counts = useMemo(() => {
    return {
      total: apps.length,
      accepted: apps.filter(a => a.status === 'accepted').length,
      pending: apps.filter(a => a.status === 'pending').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
    };
  }, [apps]);

  // ✅ FIXED: Status update with better error handling
  async function updateStatus(appId: string, next: Status) {
    const prev = apps.slice();
    setApps(curr => curr.map(a => (a._id === appId ? { ...a, status: next } : a)));

    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: next }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} - ${errorText}`);
      }
    } catch (e: any) {
      console.error('Status update failed:', e);
      setApps(prev); // Revert
      setError('Failed to update status');
    }
  }

  function statusBadge(s: Status) {
    const cls =
      s === 'accepted'
        ? 'bg-green-100 text-green-800'
        : s === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800';
    return <Badge className={cls}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-[#003F91]">Admin Access Required</h2>
            <p className="text-gray-600 mt-2">Please sign in to view applications</p>
          </CardHeader>
          <CardContent className="pb-6">
            <Link href="/sign-in">
              <Button className="w-full bg-[#006DFF] hover:bg-[#0057D9]">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#003F91]">Admin Applications Dashboard</h1>
          <p className="text-gray-600 mt-1">Review applications for your posted jobs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#E6F8FF] to-white border-[#41B2FF]/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#006DFF]">{counts.total}</div>
              <p className="text-gray-600 text-sm mt-1">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{counts.pending}</div>
              <p className="text-gray-600 text-sm mt-1">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{counts.accepted}</div>
              <p className="text-gray-600 text-sm mt-1">Accepted</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{counts.rejected}</div>
              <p className="text-gray-600 text-sm mt-1">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-6">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white w-full md:max-w-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full outline-none text-sm"
              placeholder="Search by title, company, or applicant"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Card className="shadow border-[#41B2FF]/20">
            <CardContent className="p-8 text-center text-gray-600">Loading applications…</CardContent>
          </Card>
        ) : error ? (
          <Card className="shadow border-red-200">
            <CardContent className="p-8 text-center text-red-700">
              <div className="font-semibold mb-2">Error: {error}</div>
              <div className="text-sm text-red-600 mb-4">
                Check browser console (F12) for details
              </div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="shadow border-[#41B2FF]/20">
            <CardContent className="p-8 text-center text-gray-600">
              No applications to display yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(a => (
              <Card key={a._id} className="shadow border-[#41B2FF]/20 hover:shadow-md transition">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex-1">
                      <Link href={`/jobs/${a.job._id}`}>
                        <h3 className="text-lg font-bold text-[#003F91] hover:text-[#006DFF] transition">
                          {a.job.title}
                        </h3>
                      </Link>
                      <p className="text-[#006DFF] font-semibold">{a.job.company}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {a.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Applicant:</span> {a.name} • {a.email}
                        </p>
                        {a.message && (
                          <p className="mt-1">
                            <span className="font-semibold">Cover Letter:</span> {a.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[220px]">
                      <div>{statusBadge(a.status)}</div>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-9 px-3"
                          onClick={() => updateStatus(a._id, 'accepted')}
                          disabled={a.status === 'accepted'}
                        >
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 px-3"
                          onClick={() => updateStatus(a._id, 'rejected')}
                          disabled={a.status === 'rejected'}
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-3"
                          onClick={() => updateStatus(a._id, 'pending')}
                          disabled={a.status === 'pending'}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" /> Pending
                        </Button>
                        {a.resumeUrl && (
                          <a 
                            href={a.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-9"
                          >
                            <Button size="sm" variant="outline" className="h-9 px-3">
                              <Download className="w-4 h-4 mr-1" /> Resume
                            </Button>
                          </a>
                        )}
                      </div>
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
