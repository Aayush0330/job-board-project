// app/api/admin/applications/route.ts - FULLY FIXED
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    console.log('🔍 Admin API called'); // DEBUG

    const { searchParams } = new URL(req.url);
    const postedBy = searchParams.get('postedBy');
    const status = searchParams.get('status');

    console.log('PostedBy:', postedBy, 'Status:', status); // DEBUG

    if (!postedBy) {
      console.log('❌ No postedBy provided');
      return NextResponse.json([], { status: 200 });
    }

    // ✅ STEP 1: Find admin's jobs
    const jobs = await Job.find({ postedBy }).select('_id').lean();
    const jobIds = jobs.map(j => j._id.toString());
    
    console.log('Found jobs:', jobIds.length); // DEBUG

    if (jobIds.length === 0) {
      console.log('❌ No jobs found for this admin');
      return NextResponse.json([], { status: 200 });
    }

    // ✅ STEP 2: Find applications for these jobs + POPULATE applicant data
    const query: any = { 
      job: { $in: jobIds }
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company location createdAt'
      })
      .lean();

    // ✅ STEP 3: Transform data to match frontend interface
    const transformedApps = applications.map(app => ({
      _id: app._id.toString(),
      job: {
        _id: app.job._id,
        title: app.job.title,
        company: app.job.company,
        location: app.job.location || 'Remote',
        createdAt: app.job.createdAt
      },
      name: app.name || app.user?.name || 'Unknown',
      email: app.email || app.user?.email || 'No email',
      message: app.message || '',
      resumeUrl: app.resumeUrl || '',
      status: app.status || 'pending',
      createdAt: app.createdAt
    }));

    console.log(`✅ Found ${transformedApps.length} applications`); // DEBUG
    return NextResponse.json(transformedApps, { status: 200 });

  } catch (error) {
    console.error('❌ Admin API Error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { applicationId, status } = body;

    console.log('PATCH:', { applicationId, status }); // DEBUG

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
    }

    const appDoc = await Application.findById(applicationId);
    if (!appDoc) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update status
    appDoc.status = status;
    await appDoc.save();

    console.log('✅ Status updated:', status); // DEBUG
    return NextResponse.json({ 
      message: 'Status updated', 
      application: { _id: appDoc._id, status: appDoc.status }
    });

  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
