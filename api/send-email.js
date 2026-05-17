import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to_email, operator_name, subject, html_message, attachments } = req.body;

    const emailAttachments = attachments && attachments.length > 0 ? attachments.map(att => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
    })) : [];

    const data = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: to_email,
      subject: subject,
      html: html_message,
      attachments: emailAttachments,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur Resend:', error);
    return res.status(500).json({ error: error.message });
  }
}
