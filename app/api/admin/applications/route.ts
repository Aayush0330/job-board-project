// app/api/admin/applications/route.ts - ✅ COMPLETE VERCEL READY CODE
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/job';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const postedBy = searchParams.get('postedBy');
    const status = searchParams.get('status');

    console.log('🔍 Admin API called - postedBy:', postedBy); // DEBUG

    if (!postedBy) {
      return NextResponse.json([]);
    }

    // ✅ STEP 1: Find admin's jobs (TypeScript safe)
    const jobs = await Job.find({ postedBy }).select('_id').lean();
    const jobIds = jobs.map((j: any) => String(j._id)); // ✅ FIXED TypeScript
    
    console.log('Found jobs:', jobIds.length); // DEBUG

    if (jobIds.length === 0) {
      return NextResponse.json([]);
    }

    // ✅ STEP 2: Build query
    const query: any = { 
      job: { $in: jobIds }
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // ✅ STEP 3: Find applications + populate
    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company location createdAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ STEP 4: Transform data for frontend (TypeScript safe)
    const transformedApps = applications.map((app: any) => ({
      _id: String(app._id),
      job: {
        _id: app.job?._id ? String(app.job._id) : '',
        title: app.job?.title || '',
        company: app.job?.company || '',
        location: app.job?.location || 'Remote',
        createdAt: app.job?.createdAt || ''
      },
      name: app.name || 'Unknown',
      email: app.email || 'No email',
      message: app.message || '',
      resumeUrl: app.resumeUrl || '',
      status: ['pending', 'accepted', 'rejected'].includes(app.status || '') 
        ? app.status || 'pending' 
        : 'pending',
      createdAt: app.createdAt || new Date().toISOString()
    }));

    console.log(`✅ Returning ${transformedApps.length} applications`); // DEBUG
    return NextResponse.json(transformedApps);

  } catch (error: any) {
    console.error('❌ Admin API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message }, 
      { status: 500 }
    );
  }
}

// ✅ PATCH for status updates (Accept/Reject)
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { applicationId, status } = body;

    console.log('PATCH request:', { applicationId, status });

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
    }

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const appDoc = await Application.findById(applicationId);
    if (!appDoc) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update status
    appDoc.status = status;
    await appDoc.save();

    console.log(`✅ Status updated: ${status} for ${applicationId}`);
    
    return NextResponse.json({ 
      message: 'Status updated successfully',
      application: { _id: appDoc._id, status: appDoc.status }
    });

  } catch (error: any) {
    console.error('❌ PATCH Error:', error.message);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
