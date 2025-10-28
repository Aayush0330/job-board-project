// lib/parseFormData.ts
import formidable from 'formidable';

export function parseFormData(req: any): Promise<{ fields: any, files: any }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir: process.cwd() + '/public/uploads', keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
