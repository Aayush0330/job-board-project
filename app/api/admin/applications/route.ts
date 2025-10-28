// app/api/admin/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';

export const runtime = 'nodejs'; // App Router me fs/auth jaise Node APIs ke liye [docs]

/**
 * GET /api/admin/applications?postedBy=ADMIN_ID[&status=pending|accepted|rejected][&jobId=...]
 * Returns all applications for jobs posted by the admin, with minimal job fields populated.
 */
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const postedBy = searchParams.get('postedBy') || '';
  const status = searchParams.get('status') || '';
  const jobId = searchParams.get('jobId') || '';

  if (!postedBy) {
    // No owner => nothing to show
    return NextResponse.json([], { status: 200 });
  }

  // Find jobs owned by this admin
  const jobs = await Job.find({ postedBy }, { _id: 1 });
  const jobIds = jobs.map(j => j._id);

  if (jobIds.length === 0) return NextResponse.json([], { status: 200 });

  // Build query
  const q: any = {};
  q.job = jobId ? jobId : { $in: jobIds };
  if (status) q.status = status;

  const apps = await Application.find(q)
    .populate({ path: 'job', select: 'title company location createdAt' })
    .sort({ createdAt: -1 });

  return NextResponse.json(apps, { status: 200 });
}

/**
 * PATCH /api/admin/applications
 * Body: { applicationId: string, status: 'pending' | 'accepted' | 'rejected' }
 * Updates the status of an application (admin action).
 */
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { applicationId, status } = body as {
    applicationId?: string;
    status?: 'pending' | 'accepted' | 'rejected';
  };

  if (!applicationId || !status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return NextResponse.json(
      { error: 'applicationId and valid status required' },
      { status: 400 }
    );
  }

  const appDoc = await Application.findById(applicationId).populate({
    path: 'job',
    select: 'postedBy',
  });
  if (!appDoc) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // TODO: Authorization check (ensure current admin matches appDoc.job.postedBy)
  // if (currentUserId !== String((appDoc.job as any).postedBy)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  appDoc.status = status;
  await appDoc.save();

  return NextResponse.json(
    { message: 'Status updated', application: appDoc },
    { status: 200 }
  );
}
// app/api/admin/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';

export const runtime = 'nodejs'; // App Router me fs/auth jaise Node APIs ke liye [docs]

/**
 * GET /api/admin/applications?postedBy=ADMIN_ID[&status=pending|accepted|rejected][&jobId=...]
 * Returns all applications for jobs posted by the admin, with minimal job fields populated.
 */
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const postedBy = searchParams.get('postedBy') || '';
  const status = searchParams.get('status') || '';
  const jobId = searchParams.get('jobId') || '';

  if (!postedBy) {
    // No owner => nothing to show
    return NextResponse.json([], { status: 200 });
  }

  // Find jobs owned by this admin
  const jobs = await Job.find({ postedBy }, { _id: 1 });
  const jobIds = jobs.map(j => j._id);

  if (jobIds.length === 0) return NextResponse.json([], { status: 200 });

  // Build query
  const q: any = {};
  q.job = jobId ? jobId : { $in: jobIds };
  if (status) q.status = status;

  const apps = await Application.find(q)
    .populate({ path: 'job', select: 'title company location createdAt' })
    .sort({ createdAt: -1 });

  return NextResponse.json(apps, { status: 200 });
}

/**
 * PATCH /api/admin/applications
 * Body: { applicationId: string, status: 'pending' | 'accepted' | 'rejected' }
 * Updates the status of an application (admin action).
 */
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { applicationId, status } = body as {
    applicationId?: string;
    status?: 'pending' | 'accepted' | 'rejected';
  };

  if (!applicationId || !status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return NextResponse.json(
      { error: 'applicationId and valid status required' },
      { status: 400 }
    );
  }

  const appDoc = await Application.findById(applicationId).populate({
    path: 'job',
    select: 'postedBy',
  });
  if (!appDoc) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // TODO: Authorization check (ensure current admin matches appDoc.job.postedBy)
  // if (currentUserId !== String((appDoc.job as any).postedBy)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  appDoc.status = status;
  await appDoc.save();

  return NextResponse.json(
    { message: 'Status updated', application: appDoc },
    { status: 200 }
  );
}
