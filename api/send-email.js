import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev';

// Validation helper
function validateEmailRequest(body) {
  const { to_email, subject, html_message } = body;
  const errors = [];
  
  if (!to_email) errors.push('to_email is required');
  if (!subject) errors.push('subject is required');
  if (!html_message) errors.push('html_message is required');
  
  return errors.length > 0 ? errors : null;
}

// Attachment processing helper
function processAttachments(attachments) {
  if (!attachments?.length) return [];
  
  return attachments.map(att => ({
    filename: att.filename,
    content: Buffer.from(att.content, 'base64'),
  }));
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate input
  const validationErrors = validateEmailRequest(req.body);
  if (validationErrors) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }

  try {
    const { to_email, operator_name, subject, html_message, attachments } = req.body;

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: to_email,
      subject: subject,
      html: html_message,
      attachments: processAttachments(attachments),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur Resend:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message 
    });
  }
}
