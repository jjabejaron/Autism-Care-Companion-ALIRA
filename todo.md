# ALIRA - Autism Care Companion TODO

## Phase 1: Database & Backend
- [x] Database schema: users, children, modules, activity_scores, appointments, chat_messages, notifications
- [x] Backend routers: children, modules, progress, appointments, chat, admin, user, notifications
- [x] Module content seeding (Toddler Cognitive/Social/Integrative, Early Childhood Cognitive/Social/Integrative)
- [x] bcryptjs password hashing for admin auth
- [x] LLM integration for ALI chatbot (autism-care-specific system prompt for Filipino families)
- [x] Automated notification creation on appointment booking

## Phase 2: Landing Page & Auth
- [x] Elegant landing page with ALIRA branding (DM Serif Display + Inter fonts)
- [x] Hero section, features grid, stats, ALI chat preview, CTA
- [x] Onboarding: guardian profile (name, birthdate, address, phone, email)
- [x] Child profile registration (name, age, birthdate, gender, clinically diagnosed Yes/No)
- [x] Multi-child support (add/remove child forms)

## Phase 3: Dashboard
- [x] AppShell sidebar navigation (shared across all app pages, mobile responsive)
- [x] Tab-based child profile switching
- [x] Undiagnosed child alert (Schedule Appointment / Dismiss)
- [x] Stats grid: avg score, modules available, upcoming appointments, diagnosis status
- [x] Recent activity scores card
- [x] Upcoming appointments card
- [x] Quick navigation cards to all features

## Phase 4: Learning Modules
- [x] Module listing by age group (Toddler 2-3, Early Childhood 4-6) and skill category (Cognitive, Social, Integrative)
- [x] Full module content display with coaching activities (Streamdown markdown rendering)
- [x] Record activity score dialog (child selection, score slider 0-100, notes)

## Phase 5: Progress Report
- [x] Record activity scores per child
- [x] Progress report view: avg/highest/lowest scores, Recharts line chart, activity history

## Phase 6: Nearby Clinic Finder
- [x] Google Maps integration (Philippines-focused, autism clinics/therapy centers)
- [x] Search bar by location
- [x] List view with clinic name, address, rating, directions

## Phase 7: Appointment Scheduling
- [x] Book appointment (child, clinic, date, time, guardian name/phone, notes)
- [x] View existing appointments with status badges
- [x] Cancel appointment

## Phase 8: ALI Chatbot
- [x] AI chatbot named ALI, autism-care focused for Filipino families
- [x] Chat history persistence in database
- [x] Streaming LLM responses

## Phase 9: Account Settings
- [x] Update name and email
- [x] Change password
- [x] Language toggle (English / Filipino)
- [x] Notifications list with mark-as-read
- [x] Sign out

## Phase 10: Admin Panel
- [x] Fixed admin credentials login (alira_admin / AliraAdmin2024!)
- [x] Manage users, children records, appointments (with status update), activity scores

## Phase 11: Notifications
- [x] In-app notifications for appointment booked/upcoming/follow-up
- [x] Notification badge in sidebar/header

## Phase 12: Testing
- [x] 14 vitest tests passing (auth, children, modules, progress, appointments, notifications, admin, chat, user)
- [x] Zero TypeScript errors

## Phase 13: Custom Email/Password Authentication
- [x] Add passwordHash column to users table (migration)
- [x] Backend: auth.register procedure (email, password, fullName)
- [x] Backend: auth.login procedure (email, password → JWT session cookie)
- [x] Backend: auth.logout clears session cookie
- [x] Sign Up page (full name, email, password, confirm password)
- [x] Login page (email, password, forgot password link)
- [x] Protect all app routes — redirect to /login if not authenticated
- [x] Redirect authenticated users from /login and /signup to /dashboard
- [x] Update AppShell to use custom auth instead of Manus OAuth
- [x] Update Home landing page buttons to link to /signup and /login

## Phase 14: Error Handling Fixes
- [x] Suppress console noise for expected TRPC validation errors (duplicate email, wrong password)
- [x] Show inline "already registered" message with a direct link to /login on SignUp page
- [x] Show inline "wrong credentials" message on Login page

## Phase 15: Clinic Contact + QR Code Redesign
- [ ] Remove Appointments from sidebar navigation in AppShell
- [ ] Remove "Upcoming Appointments" card from Dashboard
- [ ] Remove /appointments route from App.tsx
- [ ] Add "Contact" button to each clinic card in Clinics page
- [ ] Build child selector modal (choose which child for the clinic visit)
- [ ] Generate QR code with child demographics on submit
- [ ] Add disclaimer: ALIRA does not directly book appointments
- [ ] QR code contains: child name, age, birthdate, gender, diagnosis status
