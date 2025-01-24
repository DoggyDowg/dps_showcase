import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { siteContent } from '@/config/content'

const { property } = siteContent

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'rickmcolella@gmail.com',
      subject: `New Viewing Request - ${property.full_address}`,
      html: `
        <h2>New Viewing Request</h2>
        <p><strong>Property:</strong> ${property.full_address}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Viewing Time:</strong> ${message}</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 