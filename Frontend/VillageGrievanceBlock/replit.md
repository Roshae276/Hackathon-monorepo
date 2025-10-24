# Village Grievance Redressal System

## Project Overview
A blockchain-integrated, community-verified platform for rural India that addresses false grievance closures. The system empowers communities through transparent verification mechanisms and prevents officials from tampering with or falsely closing complaints.

## Core Mission
Create a formal, accessible, and trustworthy government-style web platform that enables rural citizens to submit grievances through multiple channels and allows community members to verify resolutions, ensuring accountability through blockchain transparency.

## Recent Changes
- **Phase 1 Complete**: Schema & Frontend (Feb 2025)
  - Defined complete data models for grievances, users, verifications, and blockchain transactions
  - Configured government-style color scheme (Primary Blue #1C4587, Secondary Orange #F4511E, Success Green #2E7D32, Warning Amber #F57C00, Alert Red #C62828)
  - Built all React components: multi-step grievance submission form, user dashboard, official dashboard, home page with government portal aesthetic
  - Implemented responsive sidebar navigation with theme toggle (light/dark mode)
  - All components follow design_guidelines.md for exceptional accessibility and visual quality

## Architecture

### Frontend Stack
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components with Tailwind CSS
- Government-aligned color palette with WCAG AAA accessibility
- Responsive, mobile-first design with sidebar navigation

### Backend Stack (Planned)
- Node.js/Express.js API Gateway
- PostgreSQL with Drizzle ORM
- Blockchain simulation (mock smart contracts for MVP)
- File upload handling (evidence storage)
- Auto-escalation logic for overdue grievances

### Data Models
1. **Users**: Citizens, officials, volunteers with role-based access
2. **Grievances**: Complete lifecycle from submission to community verification
3. **Verifications**: Community validation with evidence
4. **Blockchain Records**: Immutable transaction history

## Key Features Implemented (Frontend)
✓ Multi-step grievance submission form (4 steps with progress tracking)
✓ User dashboard with status filtering (All, Pending, Overdue, Verification, Resolved)
✓ Official dashboard for Panchayat officers to accept and manage tasks
✓ Home page with mission statement and feature highlights
✓ Voice recording interface (UI ready for backend integration)
✓ File upload drag-and-drop zones for photo/video evidence
✓ Status badges with color coding (Pending, In Progress, Resolved, Verification, Overdue)
✓ Responsive design with sidebar navigation
✓ Dark/light theme support
✓ Accessibility-first design (large fonts, high contrast, icon+text labels)

## User Preferences
- Government-style formal aesthetic with trust indicators
- High accessibility for low-literacy rural users (minimum 16px body text)
- Color-coded status system for quick visual scanning
- Multi-modal input support (text, voice, file uploads)
- Community verification as core feature to prevent false closures

## Implementation Status
✅ Phase 1: Schema & Frontend - Complete
✅ Phase 2: Backend Implementation - Complete
✅ Phase 3: Integration & Polish - Complete

## Backend Features Implemented
✓ PostgreSQL database with complete schema (grievances, users, verifications, blockchain_records)
✓ API endpoints for all CRUD operations
✓ Blockchain transaction simulation with hash generation
✓ Auto-creation of users on grievance submission
✓ Resolution timeline calculation and due date management
✓ Verification deadline tracking (7 days after resolution)
✓ Community verification workflow with status updates
✓ Blockchain records for all major events (submission, status updates, verification)

## Known Limitations (MVP Scope)
- File upload UI present but backend storage not implemented (ready for integration)
- Voice recording UI present but transcription not implemented (ready for integration)
- SMS/WhatsApp notifications configured but not connected (API keys needed)
- Auto-escalation logic exists but scheduler not implemented (manual trigger possible)
- Authentication system uses demo users (full auth system for production)

## Future Enhancements
1. Real file storage (AWS S3 or similar)
2. Voice-to-text transcription service
3. SMS gateway integration (Twilio/TextLocal)
4. WhatsApp Business API integration
5. Real blockchain integration (Ethereum/Hyperledger)
6. Scheduler for auto-escalation checks
7. Full authentication with Aadhaar integration
8. Multi-language support with Google Translate API
