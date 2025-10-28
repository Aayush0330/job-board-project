import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendStatusEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  return resend.emails.send({
    from: 'Your Jobboard <no-reply@yourdomain.com>',
    to,
    subject,
    html,
  })
}
