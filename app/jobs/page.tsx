'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Calendar, Search, X } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  postedBy: string;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/jobs', { cache: 'no-store' });
        const data = await res.json();
        const list: Job[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        setJobs(list);
        setFilteredJobs(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const locations = useMemo(
    () => Array.from(new Set((jobs ?? []).map(j => j.location))).filter(Boolean),
    [jobs]
  );
  const companies = useMemo(
    () => Array.from(new Set((jobs ?? []).map(j => j.company))).filter(Boolean),
    [jobs]
  );

  useEffect(() => {
    let next = jobs;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      next = next.filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q));
    }
    if (selectedLocation) next = next.filter(j => j.location === selectedLocation);
    if (selectedCompany) next = next.filter(j => j.company === selectedCompany);
    setFilteredJobs(next);
  }, [searchTerm, selectedLocation, selectedCompany, jobs]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedCompany('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8FF] via-white to-[#003F91]/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#006DFF]/10 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-[#006DFF]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#003F91] tracking-tight mb-2">Find the Right Job for You</h1>
          <p className="text-[#003F91]/70">
            Showing <span className="font-semibold text-[#006DFF]">{filteredJobs.length}</span> of{' '}
            <span className="font-semibold text-[#41B2FF]">{jobs.length}</span> opportunities
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#41B2FF]" />
          <input
            type="text"
            placeholder="Search jobs by title or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#41B2FF]/30 rounded-xl focus:ring-2 focus:ring-[#006DFF] focus:border-transparent outline-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-6 sticky top-4 border border-[#41B2FF]/20">
              <h3 className="text-lg font-bold text-[#003F91] mb-5">Filters</h3>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#003F91] mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-[#41B2FF]/30 rounded-lg focus:ring-2 focus:ring-[#006DFF] outline-none"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#003F91] mb-2">Company</label>
                <select
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-[#41B2FF]/30 rounded-lg focus:ring-2 focus:ring-[#006DFF] outline-none"
                >
                  <option value="">All Companies</option>
                  {companies.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedLocation || selectedCompany) && (
                <Button onClick={clearFilters} variant="outline" className="w-full flex items-center justify-center gap-2 border-[#41B2FF]/40 hover:bg-[#E6F8FF]">
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#41B2FF]/30 border-t-[#006DFF] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#003F91]/70 font-medium">Loading jobs...</p>
              </div>
            )}

            {!loading && filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#41B2FF]/10">
                <Briefcase className="w-16 h-16 text-[#41B2FF]/30 mx-auto mb-4" />
                <p className="text-[#003F91]/70 mb-4">No jobs found matching your criteria</p>
                <Button onClick={clearFilters} variant="outline" className="border-[#41B2FF]/30 hover:bg-[#E6F8FF]">
                  Clear Filters
                </Button>
              </div>
            )}

            {!loading &&
              filteredJobs.map(job => (
                <Link key={job._id} href={`/jobs/${job._id}`}>
                  <Card className="group cursor-pointer border border-[#41B2FF]/20 hover:border-[#006DFF]/40 transition-all duration-300 rounded-2xl shadow-md hover:shadow-xl bg-white/90 backdrop-blur-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#003F91] group-hover:text-[#006DFF] transition-colors duration-300">
                            {job.title}
                          </h3>
                          <p className="text-[#006DFF] font-semibold">{job.company}</p>
                        </div>
                        <Badge className="bg-[#E6F8FF] text-[#003F91] font-semibold px-3 py-1 rounded-full text-xs">{job.location}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#006DFF]" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-[#41B2FF]" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-[#41B2FF]/10">
                        <span className="text-xs text-[#003F91]/70">
                          Posted by <span className="font-medium">{job.postedBy}</span>
                        </span>
                        <Button className="bg-gradient-to-r from-[#006DFF] via-[#41B2FF] to-[#003F91] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-300">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
