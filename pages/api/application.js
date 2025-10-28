import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { dbConnect } from '@/lib/mongodb';
import Application from '@/models/Application';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const form = new formidable.IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Form parse error' });

      const { job, userId, name, email, message } = fields;
      const resume = files.resume;
      if (!job || !userId || !name || !email || !resume)
        return res.status(400).json({ error: 'All fields and resume required' });

      const resumePath = '/uploads/' + path.basename(resume.filepath);

      const application = await Application.create({
        job,
        userId,
        name,
        email,
        message: message || '',
        resumeUrl: resumePath,
      });
      return res.status(201).json({ message: 'Application submitted', application });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
