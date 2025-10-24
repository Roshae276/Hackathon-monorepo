require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import our Grievance model
const Grievance = require('./models/Grievance');

const app = express();
const PORT = process.env.PORT || 3000;

// === 1. MIDDLEWARE ===
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allow the server to parse JSON

// === 2. DATABASE CONNECTION ===
if (!process.env.MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
  });

// === 3. API ROUTES (The "API Contract") ===

// --- Auth Endpoints (Mocked for now) ---
// TODO: Build real User model and authentication
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    // MOCK RESPONSE
    res.json({ token: 'mock-auth-token-12345', role: 'user' });
});

app.post('/api/auth/register', (req, res) => {
    console.log('Register attempt:', req.body.username);
    // MOCK RESPONSE
    res.status(201).json({ status: 'User registered successfully' });
});


// --- Grievance Endpoints (Using Real Logic) ---

// 1. (USER) Submit a new grievance
app.post('/api/grievance/submit', async (req, res) => {
    try {
        const { title, description, mediaUrl } = req.body;
        
        // The 'acceptBy' timer is automatically set by the schema default
        const newGrievance = new Grievance({
            title,
            description,
            mediaUrl,
            // TODO: Add 'submittedBy' field with the user's ID from auth token
        });

        await newGrievance.save();
        res.status(201).json({ status: 'Grievance submitted', grievanceId: newGrievance._id });
    } catch (error) {
        console.error('Error submitting grievance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. (USER) Get all grievances for their private dashboard
app.get('/api/grievance/user', async (req, res) => {
    try {
        // TODO: Get user ID from auth token and filter
        // const grievances = await Grievance.find({ submittedBy: req.user.id });
        const grievances = await Grievance.find(); // For now, fetches all
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching user grievances:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. (OFFICIAL) Get all grievances assigned to them (or all pending)
app.get('/api/grievance/official', async (req, res) => {
    try {
        // TODO: Get official ID from auth token and filter
        // const grievances = await Grievance.find({ assignedTo: req.user.id, status: 'Pending' });
        const grievances = await Grievance.find({ status: 'Pending' }); // For now, fetches all 'Pending'
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching official grievances:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. (COMMUNITY) Get all grievances for the public verification dashboard
app.get('/api/grievance/community', async (req, res) => {
    try {
        // Find all grievances waiting for community verification
        const grievances = await Grievance.find({ status: 'PendingVerification' });
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching community grievances:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. (OFFICIAL) Accept a new task
app.post('/api/grievance/accept/:id', async (req, res) => {
    try {
        // TODO: Check if user is an official
        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) {
            return res.status(404).json({ error: 'Grievance not found' });
        }
        // This endpoint just confirms acceptance. The 'acceptBy' timer is already running.
        // You could change the status here, e.g., from 'Pending' to 'Accepted'
        console.log(`Grievance ${req.params.id} accepted by official`);
        res.json({ status: 'Grievance accepted' });
    } catch (error) {
        console.error('Error accepting grievance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6. (OFFICIAL) Set the resolution time
app.post('/api/grievance/set-time/:id', async (req, res) => {
    try {
        const { timeInDays } = req.body;
        
        // --- LOOPHOLE 3 SOLUTION ---
        if (!timeInDays || timeInDays > 30) {
            return res.status(400).json({ error: 'Invalid time limit. Max 30 days.' });
        }

        const resolveByDate = new Date(Date.now() + timeInDays * 24 * 60 * 60 * 1000);

        const grievance = await Grievance.findByIdAndUpdate(req.params.id, {
            resolveBy: resolveByDate,
        }, { new: true });

        if (!grievance) {
            return res.status(404).json({ error: 'Grievance not found' });
        }
        res.json({ status: 'Time limit set', grievance });
    } catch (error) {
        console.error('Error setting time:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 7. (OFFICIAL) Mark a grievance as resolved
app.post('/api/grievance/resolve/:id', async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
         if (!grievance) {
            return res.status(404).json({ error: 'Grievance not found' });
        }

        // --- LOOPHOLE 4 CHECK ---
        if (grievance.disputeCount >= 2) {
             return res.status(403).json({ error: 'This grievance has been disputed multiple times and can only be resolved by an Admin.' });
        }
        
        // --- LOOPHOLE 2 SOLUTION ---
        // Set the 7-day verification timer
        const verificationDeadlineDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        grievance.status = 'PendingVerification';
        grievance.verificationDeadline = verificationDeadlineDate;
        await grievance.save();

        res.json({ status: 'Pending Verification', grievance });
    } catch (error) {
        console.error('Error resolving grievance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 8. (COMMUNITY) Dispute a resolution
app.post('/api/grievance/dispute/:id', async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) {
            return res.status(404).json({ error: 'Grievance not found' });
        }
        
        // --- LOOPHOLE 4 SOLUTION ---
        // Increment the dispute counter
        grievance.disputeCount += 1;
        grievance.status = 'Disputed';
        // Clear the verification deadline
        grievance.verificationDeadline = undefined;

        await grievance.save();
        
        if (grievance.disputeCount >= 2) {
            console.warn(`Grievance ${grievance._id} has been disputed multiple times. Needs Admin review.`);
            // TODO: Add logic here to notify Admin
        }

        res.json({ status: 'Disputed', grievance });
    } catch (error) {
        console.error('Error disputing grievance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- Admin Endpoints (Real Logic) ---
app.get('/api/admin/disputed', async (req, res) => {
    try {
        const grievances = await Grievance.find({ status: 'Disputed' });
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching disputed grievances:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/overdue', async (req, res) => {
    try {
        // This just fetches the list. The 'Cron Job' will set the status.
        const grievances = await Grievance.find({ status: 'Overdue' });
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching overdue grievances:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === 4. CRON JOB (Scheduled Task) ===
// This function will run on a timer to enforce our loopholes
const runScheduledTasks = async () => {
    console.log('Running scheduled tasks...');
    const now = new Date();

    try {
        // 1. Check for 'Acceptance Timer'
        const acceptanceOverdue = await Grievance.updateMany(
            { status: 'Pending', acceptBy: { $lt: now } },
            { status: 'Overdue' }
        );
        if (acceptanceOverdue.modifiedCount > 0) {
            console.log(`Marked ${acceptanceOverdue.modifiedCount} grievances as Overdue (Acceptance).`);
        }

        // 2. Check for 'Resolution Timer'
        const resolutionOverdue = await Grievance.updateMany(
            { status: { $in: ['Pending'] }, resolveBy: { $lt: now } }, // Add any other active statuses
            { status: 'Overdue' }
        );
         if (resolutionOverdue.modifiedCount > 0) {
            console.log(`Marked ${resolutionOverdue.modifiedCount} grievances as Overdue (Resolution).`);
        }

        // 3. Check for 'Verification Timer' (Loophole 2)
        const grievancesToVerify = await Grievance.find({
            status: 'PendingVerification',
            verificationDeadline: { $lt: now }
        });

        if (grievancesToVerify.length > 0) {
            for (const grievance of grievancesToVerify) {
                grievance.status = 'Verified';
                await grievance.save();
                
                // --- TRIGGER BLOCKCHAIN ---
                console.log(`Grievance ${grievance._id} auto-verified. Triggering blockchain...`);
                // TODO: Call the blockchain developer's function here
                // blockchain.recordVerification(grievance._id);
            }
        }

    } catch (error) {
        console.error('Error in scheduled tasks:', error);
    }
};

// Run the tasks every minute for testing. Change to '0 * * * *' (every hour) for production.
setInterval(runScheduledTasks, 60000); // 60 seconds

// === 5. START THE SERVER ===
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
