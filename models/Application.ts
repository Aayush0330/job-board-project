import mongoose, { Schema, models } from "mongoose";

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: String,
    resumeUrl: { type: String, required: true },
    // ✅ FIXED: Proper enum + default
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

// Prevent duplicate job applications by same user
applicationSchema.index({ job: 1, userId: 1 }, { unique: true });

const Application = models.Application || mongoose.model("Application", applicationSchema);

export default Application;
