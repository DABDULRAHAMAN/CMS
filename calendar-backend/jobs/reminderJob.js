import cron from 'node-cron'
import nodemailer from 'nodemailer'
import Event from '../models/Event.js'
import User from '../models/User.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

cron.schedule('* * * * *', async () => {
  const now = new Date()
  const upcoming = new Date(now.getTime() + 30 * 60000)

  const events = await Event.find({
    startUTC: { $gte: now, $lte: upcoming },
    reminderSent: false
  })

  for (const event of events) {
    const user = await User.findById(event.userId)

    await transporter.sendMail({
      to: user.email,
      subject: '⏰ Upcoming Event Reminder',
      text: `You have an upcoming event: ${event.title}`
    })

    event.reminderSent = true
    await event.save()
  }
})
