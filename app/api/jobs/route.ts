// app/api/jobs/route.ts - CLEAN (Vercel safe)
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Job from "@/models/job";
import { getAuth } from "@clerk/nextjs/server"; // sirf getAuth use ho raha hai [web:15]

export const runtime = "nodejs";

// Helpers
function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}
function serverError(msg = "Internal server error") {
  return NextResponse.json({ error: msg }, { status: 500 });
}

// GET /api/jobs
// - /api/jobs?id=<jobId>
// - ?q=search&location=...&company=...&postedBy=...&skip=0&limit=10
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Single job by id
  if (id) {
    try {
      const job = await Job.findById(id);
      if (!job)
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      return NextResponse.json(job, { status: 200 });
    } catch {
      return badRequest("Invalid job id");
    }
  }

  // List with filters
  const q = (searchParams.get("q") || "").trim();
  const location = (searchParams.get("location") || "").trim();
  const company = (searchParams.get("company") || "").trim();
  const postedBy = (searchParams.get("postedBy") || "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
  const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10), 0);

  const filter: any = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }
  if (location) filter.location = { $regex: location, $options: "i" };
  if (company) filter.company = { $regex: company, $options: "i" };
  if (postedBy) filter.postedBy = postedBy;

  const [items, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  return NextResponse.json(
    {
      items,
      total,
      page: Math.floor(skip / Math.max(limit, 1)) + 1,
      pageSize: limit,
    },
    { status: 200 }
  );
}

// POST /api/jobs – postedBy = Clerk userId
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    // Clerk se current userId [web:15]
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - User not logged in" },
        { status: 401 }
      );
    }

    const { title, company, location, description } = await req.json();

    if (
      !title?.trim() ||
      !company?.trim() ||
      !location?.trim() ||
      !description?.trim()
    ) {
      return badRequest(
        "Title, company, location, and description are required"
      );
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      postedBy: userId, // yahi field dashboard + admin ke liye use hogi
    });

    console.log("✅ Job created:", job._id, "by user:", userId);

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("❌ Job create error:", error);
    return serverError("Failed to create job");
  }
}
