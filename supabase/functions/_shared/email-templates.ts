// Email templates for transactional emails
// All templates use consistent branding and styling

const MASTER_LOGO_URL = 'https://storage.wearemaster.com/storage/v1/object/public/templates//Master-branco-1%203%201%20(1).png'

interface EmailData {
  name?: string
  [key: string]: unknown
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #1d1d1f; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #020034; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #E94A02; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #d13d00; }
    .signature { margin-top: 30px; color: #6b7280; }
    .heart { color: #E94A02; }
  </style>
`

function getEmailTemplate(template: string, data: EmailData = {}): EmailContent | null {
  const name = data.name || 'there'
  const firstName = name.split(' ')[0]

  switch (template) {
    case 'cart_abandoned_1h': {
      return {
        subject: "You're almost done — finish your booking in seconds",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>You were just one step away from completing your booking.</p>
      <p>Your details are saved, you can finish in under a minute and secure your preferred date.</p>
      <p style="text-align: center;">
        <a href="https://www.wearemaster.com" class="button">👉 Complete your booking here</a>
      </p>
      <p>If you need help, just reply to this email.</p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nYou were just one step away from completing your booking.\n\nYour details are saved, you can finish in under a minute and secure your preferred date.\n\n👉 Complete your booking here: https://www.wearemaster.com\n\nIf you need help, just reply to this email.\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'cart_abandoned_24h': {
      return {
        subject: "Still need help with this job?",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Just checking in, your booking is still waiting.</p>
      <ul style="line-height: 2;">
        <li>No back and forth.</li>
        <li>Clear pricing.</li>
        <li>Trusted professionals.</li>
      </ul>
      <p style="text-align: center;">
        <a href="https://www.wearemaster.com" class="button">Check availability & finish booking</a>
      </p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nJust checking in, your booking is still waiting.\n\nNo back and forth.\nClear pricing.\nTrusted professionals.\n\nCheck availability & finish booking: https://www.wearemaster.com\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'booking_confirmed': {
      const bookingRef = data.bookingRef || 'N/A'
      return {
        subject: "Your booking is confirmed",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your booking has been confirmed and payment successfully received.</p>
      <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      <p>Everything is now in place. Your job is scheduled and being managed by our operations team to ensure a smooth delivery.</p>
      <p>You'll receive updates as the job progresses.</p>
      <p>If you need anything in the meantime, just reply to this email.</p>
      <div class="signature">
        <p>Kind regards,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nYour booking has been confirmed and payment successfully received.\n\nBooking Reference: ${bookingRef}\n\nEverything is now in place. Your job is scheduled and being managed by our operations team to ensure a smooth delivery.\n\nYou'll receive updates as the job progresses.\n\nIf you need anything in the meantime, just reply to this email.\n\nKind regards,\nMaster Team 💙`
      }
    }

    case 'internal_new_job_paid': {
      const s = (x: unknown) => (x != null && String(x).trim() !== '' ? String(x) : '—')
      const bookingRef = s(data.bookingRef)
      const paymentIntentId = s(data.paymentIntentId)
      const amount = data.amount != null ? `${Number(data.amount) / 100} ${(data.currency || 'GBP').toString().toUpperCase()}` : '—'
      const customerName = s(data.customerName)
      const customerEmail = s(data.customerEmail)
      const customerPhone = s(data.customerPhone)
      const addressLine1 = s(data.addressLine1)
      const addressLine2 = s(data.addressLine2)
      const city = s(data.city)
      const postcode = s(data.postcode)
      const serviceName = s(data.serviceName)
      const serviceCategory = s(data.serviceCategory)
      const jobDescription = s(data.jobDescription)
      const preferredDates = s(data.preferredDates)
      const preferredTimeSlots = s(data.preferredTimeSlots)
      const hoursBooked = s(data.hoursBooked)
      const hourlyRate = s(data.hourlyRate)
      const addSubscription = data.addSubscription === true || data.addSubscription === 'true' ? 'Yes (Master Club)' : 'No'
      const paidAt = s(data.paidAt)
      return {
        subject: `[New job paid] ${bookingRef} – ${customerName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
  <style>
    .internal-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .internal-table th { text-align: left; padding: 8px 12px; background: #f3f4f6; border: 1px solid #e5e7eb; }
    .internal-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }
    .internal-section { margin: 20px 0; }
    .internal-section h3 { margin: 0 0 10px 0; font-size: 16px; color: #020034; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p style="font-size: 18px; font-weight: 600; color: #020034;">New job paid – internal use</p>
      <p>A payment has been confirmed and the booking is paid. Details below.</p>

      <div class="internal-section">
        <h3>Reference and payment</h3>
        <table class="internal-table">
          <tr><th>Booking reference</th><td>${bookingRef}</td></tr>
          <tr><th>Payment Intent (Stripe)</th><td>${paymentIntentId}</td></tr>
          <tr><th>Amount paid</th><td>${amount}</td></tr>
          <tr><th>Payment date/time</th><td>${paidAt}</td></tr>
          <tr><th>Joined Master Club?</th><td>${addSubscription}</td></tr>
        </table>
      </div>

      <div class="internal-section">
        <h3>Customer</h3>
        <table class="internal-table">
          <tr><th>Name</th><td>${customerName}</td></tr>
          <tr><th>Email</th><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
          <tr><th>Phone</th><td>${customerPhone}</td></tr>
        </table>
      </div>

      <div class="internal-section">
        <h3>Address</h3>
        <table class="internal-table">
          <tr><th>Line 1</th><td>${addressLine1}</td></tr>
          <tr><th>Line 2</th><td>${addressLine2}</td></tr>
          <tr><th>Town/City</th><td>${city}</td></tr>
          <tr><th>Postcode</th><td>${postcode}</td></tr>
        </table>
      </div>

      <div class="internal-section">
        <h3>Service and job</h3>
        <table class="internal-table">
          <tr><th>Service</th><td>${serviceName}</td></tr>
          <tr><th>Category</th><td>${serviceCategory}</td></tr>
          ${hoursBooked !== '—' ? `<tr><th>Hours booked</th><td>${hoursBooked}</td></tr>` : ''}
          ${hourlyRate !== '—' ? `<tr><th>Hourly rate</th><td>${hourlyRate}</td></tr>` : ''}
          <tr><th>Preferred dates</th><td>${preferredDates}</td></tr>
          <tr><th>Preferred time slots</th><td>${preferredTimeSlots}</td></tr>
        </table>
        <p><strong>Job description:</strong></p>
        <p style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 3px solid #E94A02; white-space: pre-wrap;">${jobDescription}</p>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">This email was sent automatically when the payment was confirmed (Stripe webhook).</p>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `NEW JOB PAID – ${bookingRef}\n\nReference: ${bookingRef}\nPayment Intent: ${paymentIntentId}\nAmount: ${amount}\nPayment date: ${paidAt}\nMaster Club: ${addSubscription}\n\nCUSTOMER\nName: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\n\nADDRESS\n${addressLine1}\n${addressLine2}\n${city} ${postcode}\n\nSERVICE\nService: ${serviceName}\nCategory: ${serviceCategory}\nPreferred dates: ${preferredDates}\nTime slots: ${preferredTimeSlots}\n\nJOB DESCRIPTION\n${jobDescription}\n\n— Sent automatically by Stripe webhook.`
      }
    }

    case 'subscription_welcome': {
      return {
        subject: "Welcome to Master Club, you're all set.",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Master Club</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Welcome to Master Club.</p>
      <p>Your subscription is now active, giving you:</p>
      <ul style="line-height: 2;">
        <li>Priority booking</li>
        <li>Up to 30% discount</li>
        <li>Exclusive member pricing</li>
        <li>Managed jobs & vetted professionals</li>
      </ul>
      <p>You can start booking immediately.</p>
      <p style="text-align: center;">
        <a href="https://www.wearemaster.com" class="button">👉 Book your next job</a>
      </p>
      <p>Thanks for being part of the Master Team.</p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nWelcome to Master Club.\n\nYour subscription is now active, giving you:\n• Priority booking\n• Up to 30% discount\n• Exclusive member pricing\n• Managed jobs & vetted professionals\n\nYou can start booking immediately.\n\n👉 Book your next job: https://www.wearemaster.com\n\nThanks for being part of the Master Team.\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'subscription_cancelled': {
      return {
        subject: "Your subscription has been cancelled",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Master Club</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your Master Club subscription has been cancelled successfully.</p>
      <p>You'll still be able to book services on-demand at standard pricing.</p>
      <p>If you ever want to rejoin, you can do so anytime — no commitment.</p>
      <p>Thanks for trying Master.</p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nYour Master Club subscription has been cancelled successfully.\n\nYou'll still be able to book services on-demand at standard pricing.\n\nIf you ever want to rejoin, you can do so anytime — no commitment.\n\nThanks for trying Master.\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'payment_failed': {
      const retryUrl = data.retryUrl || 'https://www.wearemaster.com'
      return {
        subject: "Action needed — payment issue",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>We couldn't process your payment due to a technical issue.</p>
      <p>No worries — you can retry securely using the link below:</p>
      <p style="text-align: center;">
        <a href="${retryUrl}" class="button">👉 Retry payment</a>
      </p>
      <p>If you need help, just reply to this email.</p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nWe couldn't process your payment due to a technical issue.\n\nNo worries — you can retry securely using the link below:\n\n👉 Retry payment: ${retryUrl}\n\nIf you need help, just reply to this email.\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'job_completed': {
      return {
        subject: "Job completed — thank you for choosing Master",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your job has now been successfully completed.</p>
      <p>Thank you for choosing Master and trusting us with your property.</p>
      <p>Our team has carried out final checks to ensure everything meets our quality standards.</p>
      <p>If you need anything else, we're always here to help.</p>
      <div class="signature">
        <p>Kind regards,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nYour job has now been successfully completed.\n\nThank you for choosing Master and trusting us with your property.\n\nOur team has carried out final checks to ensure everything meets our quality standards.\n\nIf you need anything else, we're always here to help.\n\nKind regards,\nMaster Team 💙`
      }
    }

    case 'review_request': {
      const reviewUrl = data.reviewUrl || 'https://www.wearemaster.com/review'
      return {
        subject: "How did we do?",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>We'd love your feedback — it helps us keep standards high.</p>
      <p style="text-align: center;">
        <a href="${reviewUrl}" class="button">👉 Leave a quick review (30 seconds)</a>
      </p>
      <p>Thanks for choosing Master.</p>
      <div class="signature">
        <p>With Love,<br>Master Team <span class="heart">💙</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},\n\nWe'd love your feedback — it helps us keep standards high.\n\n👉 Leave a quick review (30 seconds): ${reviewUrl}\n\nThanks for choosing Master.\n\nWith Love,\nMaster Team 💙`
      }
    }

    case 'lead_notification': {
      const s = (x: unknown) => (x != null && String(x).trim() !== '' ? String(x) : '—')
      const leadEmail = s(data.email)
      const leadService = s(data.service)
      const leadServiceType = s(data.service_type)
      const leadPostcode = s(data.postcode)
      const leadSource = s(data.source)
      const leadPhone = s(data.phone)
      const leadPreferredContact = s(data.preferred_contact)
      return {
        subject: `[New lead] ${leadSource} – ${leadEmail}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${emailStyles}
  <style>
    .internal-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .internal-table th { text-align: left; padding: 8px 12px; background: #f3f4f6; border: 1px solid #e5e7eb; }
    .internal-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }
    .internal-section { margin: 20px 0; }
    .internal-section h3 { margin: 0 0 10px 0; font-size: 16px; color: #020034; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASTER_LOGO_URL}" alt="Master" style="display: block; max-height: 44px; width: auto; margin: 0 auto;" />
    </div>
    <div class="content">
      <p style="font-size: 18px; font-weight: 600; color: #020034;">New quote request / lead</p>
      <p>A new lead was submitted (LP or hero form). Details below.</p>

      <div class="internal-section">
        <h3>Lead details</h3>
        <table class="internal-table">
          <tr><th>Email</th><td><a href="mailto:${leadEmail}">${leadEmail}</a></td></tr>
          <tr><th>Postcode</th><td>${leadPostcode}</td></tr>
          ${leadServiceType !== '—' ? `<tr><th>Service type</th><td>${leadServiceType}</td></tr>` : ''}
          <tr><th>Service / details</th><td>${leadService}</td></tr>
          <tr><th>Source</th><td>${leadSource}</td></tr>
          ${leadPhone !== '—' ? `<tr><th>Phone</th><td>${leadPhone}</td></tr>` : ''}
          ${leadPreferredContact !== '—' ? `<tr><th>Preferred contact</th><td>${leadPreferredContact}</td></tr>` : ''}
        </table>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">This email was sent automatically when the lead was saved to the database.</p>
    </div>
    <div class="footer">
      <p>Master Services | hello@wearemaster.com</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `NEW LEAD – ${leadSource}\n\nEmail: ${leadEmail}\nPostcode: ${leadPostcode}${leadServiceType !== '—' ? `\nService type: ${leadServiceType}` : ''}\nService: ${leadService}\nSource: ${leadSource}${leadPhone !== '—' ? `\nPhone: ${leadPhone}` : ''}${leadPreferredContact !== '—' ? `\nPreferred contact: ${leadPreferredContact}` : ''}\n\n— Sent automatically when the lead was saved.`
      }
    }

    case 'verification_code': {
      const code = (data.code as string) || '000000'
      const email = (data.email as string) || ''
      
      return {
        subject: 'Your Master verification code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
  <style>
    .code-container {
      background: linear-gradient(135deg, #020034 0%, #1a1a4a 100%);
      padding: 40px 30px;
      border-radius: 16px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid rgba(233, 74, 2, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .code-display {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 12px;
      color: #E94A02;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      margin: 20px 0;
      text-shadow: 0 2px 8px rgba(233, 74, 2, 0.3);
    }
    .code-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .security-note {
      background: rgba(233, 74, 2, 0.1);
      border-left: 3px solid #E94A02;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 13px;
      color: #6b7280;
    }
    .master-logo {
      display: block;
      max-height: 44px;
      width: auto;
      margin: 0 auto 10px auto;
    }
    .grid-pattern {
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      position: relative;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header grid-pattern" style="position: relative;">
      <img src="${MASTER_LOGO_URL}" alt="Master" class="master-logo" />
      <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 16px;">Verification Code</p>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #1d1d1f; margin-bottom: 10px;">Hi ${firstName},</p>
      <p style="color: #6b7280; margin-bottom: 20px;">
        We sent a 6-digit verification code to <strong style="color: #1d1d1f;">${email}</strong>
      </p>
      
      <div class="code-container grid-pattern">
        <div class="code-label">Your Verification Code</div>
        <div class="code-display">${code}</div>
        <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 15px 0 0 0;">
          This code will expire in 10 minutes
        </p>
      </div>
      
      <div class="security-note">
        <strong style="color: #E94A02;">🔒 Security Note:</strong> Never share this code with anyone. Master will never ask for your verification code via phone or email.
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>Master Team</strong>
      </p>
      <p style="margin: 0; font-size: 12px;">
        Need help? Reply to this email or visit 
        <a href="https://www.wearemaster.com" style="color: #E94A02; text-decoration: none;">wearemaster.com</a>
      </p>
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #9ca3af;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hi ${firstName},

We sent a 6-digit verification code to ${email}

Your Verification Code: ${code}

This code will expire in 10 minutes.

🔒 Security Note: Never share this code with anyone. Master will never ask for your verification code via phone or email.

If you didn't request this code, you can safely ignore this email.

Master Team
Need help? Visit wearemaster.com

This is an automated message. Please do not reply directly to this email.`
      }
    }

    default:
      return null
  }
}

export { getEmailTemplate }
