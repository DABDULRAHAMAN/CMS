import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  startUTC: Date,
  endUTC: Date,

  recurrence: {
    type: String,
    enum: ['daily', 'weekly', null],
    default: null
  },
  recurrenceEndUTC: Date,

  calendarType: { type: String, enum: ['personal', 'team'] },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true })

eventSchema.index({ startUTC: 1 })
eventSchema.index({ userId: 1 })

export default mongoose.model('Event', eventSchema)
