import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Job from '@/models/job';

export const runtime = 'nodejs';

// PATCH /api/admin/backfill-job-owner?jobId=...&postedBy=CLERK_USER_ID
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || '';
  const postedBy = searchParams.get('postedBy') || '';
  if (!jobId || !postedBy) {
    return NextResponse.json({ error: 'jobId & postedBy required' }, { status: 400 });
  }
  const doc = await Job.findByIdAndUpdate(jobId, { postedBy }, { new: true });
  if (!doc) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ ok: true, job: doc }, { status: 200 });
}
