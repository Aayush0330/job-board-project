import mongoose, { Schema, models } from 'mongoose';

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    company: { type: String, required: true },
    postedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Optional indexes for faster querying
jobSchema.index({ location: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });

export default models.Job || mongoose.model('Job', jobSchema);
