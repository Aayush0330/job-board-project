// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

/* GET /api/applications
   - Candidate:  /api/applications?userId=CLERK_USER_ID
   - Admin:      /api/applications?postedBy=ADMIN_USER_ID
   - Optional:   &status=pending|accepted|rejected &jobId=... */
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const postedBy = searchParams.get('postedBy') || '';
  const status = searchParams.get('status') || '';
  const jobId = searchParams.get('jobId') || '';

  const q: any = {};
  if (status) q.status = status;
  if (jobId) q.job = jobId;

  // Admin branch: all applications for jobs posted by this admin
  if (postedBy) {
    const jobs = await Job.find({ postedBy }, { _id: 1 });
    const jobIds = jobs.map(j => j._id);
    if (jobIds.length === 0) return NextResponse.json([], { status: 200 });
    q.job = q.job ?? { $in: jobIds };

    const apps = await Application.find(q)
      .populate({ path: 'job', select: 'title company location createdAt' })
      .sort({ createdAt: -1 });

    return NextResponse.json(apps, { status: 200 });
  }

  // Candidate branch
  if (userId) {
    q.userId = userId;

    const apps = await Application.find(q)
      .populate({ path: 'job', select: 'title company location createdAt' })
      .sort({ createdAt: -1 });

    return NextResponse.json(apps, { status: 200 });
  }

  return NextResponse.json([], { status: 200 });
}

/* POST /api/applications  (multipart/form-data)
   fields: job,userId,name,email,message  file: resume */
export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.formData();
  const job = String(formData.get('job') || '');
  const userId = String(formData.get('userId') || '');
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const message = String(formData.get('message') || '');
  const file = formData.get('resume') as File | null;

  if (!job || !userId || !name || !email || !file) {
    return NextResponse.json({ error: 'All fields and resume required' }, { status: 400 });
  }

  const jobExists = await Job.findById(job);
  if (!jobExists) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const dup = await Application.findOne({ job, userId });
  if (dup) return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });

  // Upload to Vercel Blob (persistent across deployments)
  const blob = await put(`resumes/${Date.now()}_${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  const application = await Application.create({
    job,
    userId,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    resumeUrl: blob.url,
    status: 'pending',
  });

  return NextResponse.json({ message: 'Application submitted', application }, { status: 201 });
}

/* PATCH /api/applications  body: { applicationId, status } */
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { applicationId, status } = body as { applicationId?: string; status?: string };
  if (!applicationId || !status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'applicationId and valid status required' }, { status: 400 });
  }

  const appDoc = await Application.findById(applicationId).populate({ path: 'job', select: 'postedBy' });
  if (!appDoc) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  // TODO: add authorization to ensure caller owns appDoc.job.postedBy
  appDoc.status = status as any;
  await appDoc.save();

  return NextResponse.json({ message: 'Status updated', application: appDoc }, { status: 200 });
}
