import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    userId: mongoose.Types.ObjectId; // Owner
    type: 'personal' | 'team';
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        description: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['personal', 'team'], default: 'personal' },
    },
    { timestamps: true }
);

// Ensure virtuals are included in JSON
EventSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        ret.id = doc._id;
    },
});

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
