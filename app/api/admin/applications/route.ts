// app/api/admin/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';

export const runtime = 'nodejs';

/**
 * GET /api/admin/applications?postedBy=ADMIN_ID[&status=...][&jobId=...]
 * Returns all applications for jobs posted by this admin.
 */
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const postedBy = searchParams.get('postedBy') || '';
  const status = searchParams.get('status') || '';
  const jobId = searchParams.get('jobId') || '';

  if (!postedBy) return NextResponse.json([], { status: 200 });

  const jobs = await Job.find({ postedBy }, { _id: 1 });
  const jobIds = jobs.map(j => j._id);
  if (jobIds.length === 0) return NextResponse.json([], { status: 200 });

  const q: any = jobId ? { job: jobId } : { job: { $in: jobIds } };
  if (status) q.status = status;

  const apps = await Application.find(q)
    .populate({ path: 'job', select: 'title company location createdAt' })
    .sort({ createdAt: -1 });

  return NextResponse.json(apps, { status: 200 });
}

/**
 * PATCH /api/admin/applications
 * Body: { applicationId: string, status: 'pending' | 'accepted' | 'rejected' }
 */
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { applicationId, status } = body as {
    applicationId?: string;
    status?: 'pending' | 'accepted' | 'rejected';
  };

  if (!applicationId || !status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'applicationId and valid status required' }, { status: 400 });
  }

  const appDoc = await Application.findById(applicationId).populate({
    path: 'job',
    select: 'postedBy',
  });
  if (!appDoc) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  // TODO: Add authorization check to ensure the caller owns appDoc.job.postedBy.

  appDoc.status = status;
  await appDoc.save();

  return NextResponse.json({ message: 'Status updated', application: appDoc }, { status: 200 });
}
