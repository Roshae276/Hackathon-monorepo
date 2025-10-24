const mongoose = require('mongoose');

// This is the Mongoose Schema for a Grievance
// It includes all the logic we discussed for the timers and counters.
const grievanceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // We will store the URL of the uploaded photo/video
    mediaUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Overdue', 'PendingVerification', 'Verified', 'Disputed'],
        default: 'Pending',
    },
    
    // --- Timers ---
    // The 'Acceptance Timer'
    acceptBy: {
        type: Date,
        // Set default to 24 hours from creation
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    // The 'Resolution Timer' (set by the official)
    resolveBy: {
        type: Date,
    },
    // The 'Verification Timer' (starts when official marks as resolved)
    verificationDeadline: {
        type: Date,
    },

    // --- Counters ---
    // The 'Dispute Counter'
    disputeCount: {
        type: Number,
        default: 0,
    },

    // --- Relationships ---
    // We can link to the user, official, etc. (Can be added later)
    // submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true }); // `timestamps` adds `createdAt` and `updatedAt`

// This creates the 'Grievance' model in the database
module.exports = mongoose.model('Grievance', grievanceSchema);