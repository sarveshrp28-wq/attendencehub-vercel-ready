# Complete Attendance Web App Plan with Supabase - UPDATED WITH USER-SPECIFIC ACCESS

## Project Overview (UPDATED)
A three-tier attendance management system:
1. **Admin Mode**: Full control (attendencehub@gmail.com)
2. **Student Mode**: Individual users can only see their OWN attendance data
3. **No Public Viewer**: All data is private and access-controlled

***

## Core Requirements Summary (UPDATED)

### Admin Mode
- **Login**: attendencehub@gmail.com / attendencehub123
- **Full Access**: View, create, edit, delete ALL students
- **Attendance Control**: Mark attendance for all students
- **Student Management**: Add students with their Gmail addresses
- **View Everything**: See all students' data and statistics

### Student/User Mode (NEW)
- **Login**: Each student logs in with their own Gmail (added by admin)
- **Personal View Only**: See ONLY their own profile and attendance
- **No Editing**: Cannot edit their own data
- **No Access to Others**: Cannot see any other student's information
- **Dashboard**: Personal attendance percentage, history, statistics

### Auto-Calculations
- Each student sees their own attendance percentage
- Admin sees everyone's statistics
- Class-wise averages (admin only)
- Monthly tracking (personal for students, all for admin)

***

## Technology Stack

### Frontend Layer
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6 with role-based routes
- **State Management**: React Context API (Auth context for user role)
- **UI Library**: Tailwind CSS or Material-UI (MUI)
- **Form Handling**: React Hook Form with Yup validation
- **Data Fetching**: Supabase JS Client
- **Icons**: React Icons or Lucide React

### Backend Layer (Supabase)
- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth with email authentication
- **API**: Auto-generated REST API with RLS
- **Storage**: Supabase Storage (for future profile pictures)
- **Real-time**: Supabase Realtime (optional for live updates)

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Supabase Cloud (free tier)
- **Domain**: Custom domain (optional)

***

## Database Architecture (UPDATED)

### Tables Structure

#### 1. Students Table (UPDATED)
**Purpose**: Store all student information linked to their Gmail accounts

**Fields**:
- ID (UUID, primary key, auto-generated)
- User ID (UUID, foreign key to auth.users, unique, required) **[NEW]**
- Email (text, unique, required) **[NEW]**
- Name (text, required)
- Class (text, required)
- Register Number (text, unique, required)
- Phone Number (text, required)
- Date of Birth (date, required)
- Gender (enum: Male/Female/Other, required)
- Created At (timestamp, auto-generated)
- Updated At (timestamp, auto-updated)

**Key Changes**:
- Each student is linked to a Supabase auth user
- Student's email stored for easy reference
- One student = One email = One login account

**Indexes**:
- User ID (for fast user-specific queries)
- Email (for login matching)
- Class field (for class-wise queries)
- Register number (for unique constraint)

#### 2. Attendance Table (UNCHANGED)
**Purpose**: Store daily attendance records

**Fields**:
- ID (UUID, primary key, auto-generated)
- Student ID (foreign key to students, cascade delete)
- Date (date, required)
- Status (enum: Present/Absent/Late/Excused)
- Marked By (text, admin email)
- Marked At (timestamp, auto-generated)

**Constraints**:
- Unique combination of student_id + date

**Indexes**:
- Student ID
- Date

#### 3. Admin & Student Authentication (UPDATED)
**Purpose**: Managed by Supabase Auth

**Configuration**:
- **Admin User**: attendencehub@gmail.com (password: attendencehub123)
- **Student Users**: Created by admin when adding students
- Each student gets their Gmail added to auth.users
- Email authentication enabled
- Password reset emails enabled for students

### Database Views (Virtual Tables - UPDATED)

#### Student Attendance Stats View (UPDATED)
**Purpose**: Automatically calculate attendance with user context

**Computed Fields**:
- Student ID
- User ID **[NEW]**
- Email **[NEW]**
- All student fields
- Total days
- Present days
- Absent days
- Attendance percentage

**Logic**: JOIN students with attendance, include user_id and email for filtering

#### Personal Attendance View (NEW)
**Purpose**: Student-specific view (filtered by logged-in user)

**Computed Fields**:
- Only shows data for the authenticated user
- Same calculations as admin view
- Used by student dashboard

### Database Functions (UPDATED)

#### 1. Get My Attendance (NEW)
**Purpose**: Fetch attendance for logged-in student only

**Input**: Authenticated user's ID (from JWT)
**Output**: Personal attendance stats
**Security**: Automatically filters by user_id

#### 2. Monthly Attendance Calculator (UPDATED)
**Purpose**: Get attendance stats for specific month

**Input**: Student ID or User ID, month date
**Output**: Monthly stats
**Admin**: Can query any student
**Student**: Can only query their own data

#### 3. Admin Check Function (NEW)
**Purpose**: Verify if current user is admin

**Input**: User email from JWT
**Output**: Boolean (true if admin)
**Usage**: Frontend checks to show/hide features

***

## Security Architecture (COMPLETELY UPDATED)

### Row Level Security (RLS) Policies

#### Students Table Policies

**Admin Full Access**:
- **Policy Name**: "Admin can do everything"
- **Scope**: When user email = 'attendencehub@gmail.com'
- **Actions**: SELECT, INSERT, UPDATE, DELETE
- **Access**: All rows

**Student Read Own Data**:
- **Policy Name**: "Students can view own profile"
- **Scope**: When auth.uid() = students.user_id
- **Actions**: SELECT only
- **Access**: Only their own row

**Student Cannot Edit**:
- **Enforcement**: No UPDATE/DELETE policies for students
- **Result**: Students can only view, never modify

**No Anonymous Access**:
- **Removed**: Public/anon access completely blocked
- **Result**: Must be logged in to see anything

#### Attendance Table Policies

**Admin Full Access**:
- **Policy Name**: "Admin can manage all attendance"
- **Scope**: When user email = 'attendencehub@gmail.com'
- **Actions**: SELECT, INSERT, UPDATE, DELETE
- **Access**: All attendance records

**Student View Own Attendance**:
- **Policy Name**: "Students can view own attendance only"
- **Scope**: When auth.uid() = (SELECT user_id FROM students WHERE id = attendance.student_id)
- **Actions**: SELECT only
- **Access**: Only attendance records linked to their student_id

**Student Cannot Modify**:
- **Enforcement**: No INSERT/UPDATE/DELETE policies for students
- **Result**: Cannot mark or edit attendance

### Authentication Security
- JWT tokens with 24-hour expiry
- Email verification required for new students (optional)
- Password requirements: Minimum 8 characters
- Rate limiting on login attempts
- Account lockout after 5 failed attempts
- Secure password hashing (bcrypt by Supabase)
- HTTPS enforced in production

### Role Detection Logic
- **Admin Check**: auth.email() = 'attendencehub@gmail.com'
- **Student Check**: auth.uid() exists in students.user_id
- **Unknown User**: No access to any data

***

## Application Features Breakdown (UPDATED)

### Admin Dashboard (UNCHANGED FUNCTIONALITY)

#### 1. Overview Section
- Total students count
- Overall attendance percentage
- Today's attendance summary
- Class-wise distribution chart
- Recent activity feed
- Quick actions

#### 2. Student Management Module (UPDATED PROCESS)

**Add Student Form - NEW WORKFLOW**:
1. Admin enters student details
2. **Additional Field**: Student's Gmail address (required)
3. System creates Supabase auth user with that Gmail
4. Student receives invitation/welcome email with temporary password
5. Student record created and linked to auth user
6. Student can now log in with their Gmail

**Form Fields**:
- Name (text, required)
- Email/Gmail (email, required, unique) **[NEW]**
- Class (text, required)
- Register Number (text, required, unique)
- Phone Number (text, required)
- Date of Birth (date, required)
- Gender (select, required)
- Generate Password: Auto-generated or admin-set **[NEW]**
- Send Welcome Email: Checkbox **[NEW]**

**Student List View**:
- Shows all students with their Gmail addresses
- Column added: Email/Gmail
- Click to send password reset email
- Shows last login time (optional)

**Edit Student**:
- Can update all fields except email (email is login ID)
- To change email: Must delete and recreate user

**Delete Student**:
- Deletes student record
- Deletes auth user account
- Cascades to delete all attendance records
- Student can no longer log in

#### 3. Attendance Management (UNCHANGED)
- Admin marks attendance for all students
- Same interface as before
- Students cannot mark their own attendance

#### 4. Reports & Analytics (UNCHANGED)
- Admin can generate reports for all students
- Class-wise reports
- Individual student reports
- Export functionality

### Student Dashboard (NEW SECTION)

#### 1. Personal Homepage
**After Login**:
- Welcome message with student name
- Personal attendance percentage (large display)
- Today's status (Present/Absent)
- This month's attendance
- Overall attendance

**Statistics Cards**:
- Total Days: Count of all attendance records
- Present Days: Days marked present
- Absent Days: Days marked absent
- Current Streak: Consecutive present days

#### 2. Personal Profile Section
**Read-Only Display**:
- Name
- Email (Gmail)
- Class
- Register Number
- Phone Number
- Date of Birth
- Gender
- No edit buttons visible
- "Contact admin to update" message

#### 3. Attendance History
**Table View**:
- Columns: Date, Status, Marked By
- Sorted by date (newest first)
- Filter by month/date range
- Color-coded status (green/red)
- Pagination (50 records per page)

**Calendar View**:
- Month view calendar
- Dates color-coded: Green (present), Red (absent), Gray (not marked)
- Hover to see status
- Click date to see details
- Cannot edit anything

#### 4. My Statistics
**Monthly Breakdown**:
- Dropdown: Select month/year
- Display: Present days, absent days, percentage for that month
- Comparison with previous month

**Trend Chart** (Optional):
- Line graph showing attendance percentage over months
- Visual representation of performance

**Alerts** (Optional):
- Warning if attendance drops below 75%
- Notification if missed 3+ consecutive days

#### 5. Settings (Limited)
- Change password only
- Update phone number (if allowed)
- Enable/disable email notifications
- Cannot change name, email, class (admin only)

***

## User Workflows (COMPLETELY UPDATED)

### Admin Workflow

**Adding New Student**:
1. Admin logs in
2. Navigate to "Students" → "Add New Student"
3. Fill form including student's Gmail address
4. Click "Create Student"
5. System creates auth user automatically
6. Optional: Send welcome email with login credentials
7. Student added to database with linked user_id

**Managing Student Login Issues**:
1. Student forgot password
2. Admin clicks "Send Password Reset" next to student
3. Student receives reset email
4. Student can reset password and log in

**Viewing Student Data**:
- Admin can click any student to see their profile
- View their attendance history
- Generate their individual report
- Edit their details

### Student Workflow (NEW)

**First Time Login**:
1. Student receives Gmail notification (if welcome email sent)
2. Visit website login page
3. Enter their Gmail and password (provided by admin)
4. Redirected to personal dashboard
5. Sees welcome message and attendance stats

**Checking Attendance**:
1. Student logs in with Gmail
2. Dashboard shows attendance percentage
3. Navigate to "My Attendance" or "History"
4. View all attendance records
5. Check calendar view for visual representation

**Profile Check**:
1. Navigate to "My Profile"
2. View all personal details
3. Cannot edit (read-only)
4. See "Contact admin to update information" message

**Changing Password**:
1. Navigate to "Settings" or "My Account"
2. Click "Change Password"
3. Enter current password
4. Enter new password (confirm)
5. Save changes
6. Next login uses new password

***

## Access Control Matrix

| Feature | Admin | Student | Anonymous |
|---------|-------|---------|-----------|
| **View All Students** | ✅ Yes | ❌ No | ❌ No |
| **View Own Profile** | ✅ Yes | ✅ Yes | ❌ No |
| **View Others' Profiles** | ✅ Yes | ❌ No | ❌ No |
| **Create Student** | ✅ Yes | ❌ No | ❌ No |
| **Edit Student** | ✅ Yes | ❌ No | ❌ No |
| **Delete Student** | ✅ Yes | ❌ No | ❌ No |
| **View All Attendance** | ✅ Yes | ❌ No | ❌ No |
| **View Own Attendance** | ✅ Yes | ✅ Yes | ❌ No |
| **Mark Attendance** | ✅ Yes | ❌ No | ❌ No |
| **Edit Attendance** | ✅ Yes | ❌ No | ❌ No |
| **Generate All Reports** | ✅ Yes | ❌ No | ❌ No |
| **Generate Own Report** | ✅ Yes | ✅ Yes | ❌ No |
| **Change Own Password** | ✅ Yes | ✅ Yes | ❌ No |
| **Reset Others' Password** | ✅ Yes | ❌ No | ❌ No |

***

## Data Flow Architecture (UPDATED)

### Admin Adding Student Flow
1. Admin fills student form with Gmail
2. Frontend validates (unique email, valid Gmail format)
3. **Step 1**: Create Supabase auth user (signUp API)
   - Email: Student's Gmail
   - Password: Auto-generated or admin-provided
   - Email confirmation: Optional
4. **Step 2**: Get new user_id from auth response
5. **Step 3**: Insert student record in students table
   - Include user_id, email, and all other details
6. **Step 4**: Optional - Trigger welcome email
7. Frontend shows success message
8. Student can now log in

### Student Login Flow
1. Student enters Gmail and password
2. Frontend calls Supabase auth.signInWithPassword()
3. Supabase validates credentials
4. Returns JWT token with user_id
5. Frontend fetches student profile using user_id
6. Check if user is admin or student
7. Redirect to appropriate dashboard
8. Store session in browser

### Student Viewing Own Data Flow
1. Student authenticated (JWT in header)
2. Frontend requests: GET students WHERE user_id = {current_user_id}
3. Supabase RLS checks: Does auth.uid() match user_id in query?
4. If yes: Return student data
5. If no: Return empty (403 Forbidden)
6. Frontend displays data
7. Same flow for attendance records

### Admin Viewing Any Student Flow
1. Admin authenticated (JWT in header)
2. Frontend requests: GET students WHERE id = {any_student_id}
3. Supabase RLS checks: Is user admin?
4. If yes: Return requested student data
5. If no: Return empty
6. Frontend displays data

***

## UI/UX Design Plan (UPDATED)

### Design Principles
- **Role-Based Interface**: Different UI for admin vs student
- **Privacy First**: No hints of other users for students
- **Clean and Simple**: Students see minimal, focused interface
- **Admin Power**: Rich features for admin
- **Mobile Responsive**: Works on all devices

### Admin Interface
**Layout**: Sidebar + Top bar + Main content
**Components**: Tables, forms, charts, bulk actions
**Colors**: Professional blue theme
**Features**: Full CRUD, reports, charts

### Student Interface
**Layout**: Top navigation + Simple content area
**Components**: Cards, simple lists, calendar
**Colors**: Friendly, welcoming theme (blue/green)
**Features**: View-only, personal focus
**Navigation**: Dashboard, My Attendance, My Profile, Settings

### Login Page
**Universal Login**: One login page for both admin and students
**Fields**: Email, Password
**Auto-detect**: System redirects based on email
**Links**: Forgot password, Contact admin

***

## Navigation Structure (UPDATED)

### Universal Routes
- `/login` - Login page for both admin and students
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

### Admin Routes (Protected)
- `/admin/dashboard` - Admin overview
- `/admin/students` - All students list
- `/admin/students/add` - Add new student
- `/admin/students/edit/:id` - Edit student
- `/admin/students/:id` - View any student
- `/admin/attendance` - Mark attendance
- `/admin/attendance/history` - Attendance history
- `/admin/reports` - Reports and analytics

### Student Routes (Protected)
- `/student/dashboard` - Personal dashboard
- `/student/profile` - My profile (read-only)
- `/student/attendance` - My attendance history
- `/student/attendance/calendar` - Calendar view
- `/student/settings` - Change password

### Route Protection Logic
```
1. Check if user is logged in
   - No: Redirect to /login
   - Yes: Continue

2. Check user role
   - If email = admin: Allow /admin/* routes
   - If user_id in students table: Allow /student/* routes
   - Else: Show error "Contact admin"

3. Prevent cross-access
   - Admin trying /student/*: Redirect to /admin/dashboard
   - Student trying /admin/*: Redirect to /student/dashboard
```

***

## Email Notifications System (NEW)

### Welcome Email (When Student Created)
**Triggered**: Admin creates new student
**Recipient**: Student's Gmail
**Content**:
- Welcome message
- Login URL
- Username (their Gmail)
- Temporary password
- Instructions to change password
- Contact admin info

### Password Reset Email
**Triggered**: Student clicks "Forgot Password"
**Recipient**: Student's Gmail
**Content**:
- Password reset link (expires in 1 hour)
- Instructions
- Security note

### Low Attendance Alert (Optional)
**Triggered**: Attendance drops below threshold (e.g., 75%)
**Recipient**: Student's Gmail
**Content**:
- Current attendance percentage
- Warning message
- Days needed to improve
- Contact admin if issues

### Attendance Marked Notification (Optional)
**Triggered**: Admin marks attendance
**Recipient**: Student's Gmail (daily summary)
**Content**:
- Today's status (Present/Absent)
- Current percentage
- Optional: Streak info

***

## Student Account Management

### Creating Student Account
**Admin Process**:
1. Enter all student details + Gmail
2. Set initial password (auto-generated or manual)
3. Choose: Send welcome email (yes/no)
4. Submit form
5. Account created, student can log in

**Automated Process**:
- Auth user created automatically
- user_id linked to student record
- Welcome email sent (if enabled)
- Student receives login credentials

### Password Management
**Student Forgot Password**:
1. Click "Forgot Password" on login page
2. Enter their Gmail
3. Receive reset email
4. Click link, enter new password
5. Password updated, can log in

**Admin Reset Student Password**:
1. Admin navigates to student list
2. Click "Reset Password" button next to student
3. System sends reset email to student
4. Or admin can set new password directly

### Deactivating Student
**Options**:
- **Soft Delete**: Mark as inactive, keep data
- **Hard Delete**: Remove from auth and database
- **Suspend**: Disable login, keep data

**Admin Action**:
1. Select student
2. Click "Delete" or "Deactivate"
3. Confirm action
4. Student cannot log in anymore
5. Data removed or archived

***

## Security Considerations (ENHANCED)

### Data Privacy
- Students NEVER see other students' data
- RLS enforces separation at database level
- Frontend also checks and hides UI elements
- No API endpoint returns multiple students for non-admin

### Email Validation
- Only accept Gmail addresses (optional restriction)
- Verify email format before account creation
- Check for duplicate emails
- Prevent multiple accounts with same email

### Password Security
- Minimum 8 characters
- Auto-generated passwords: Random, strong
- Hashed with bcrypt by Supabase
- Password reset tokens expire in 1 hour
- Cannot reuse last 3 passwords (optional)

### Session Management
- JWT tokens expire after 24 hours
- Refresh tokens for extended sessions
- Logout clears all tokens
- Concurrent login detection (optional)

### Audit Trail (Optional Enhancement)
- Log all admin actions (create, edit, delete)
- Log attendance changes with timestamp
- Track login history
- Monitor failed login attempts

***

## Implementation Phases

### Phase 1: Setup & Authentication (Week 1)
- Supabase project setup
- Create database schema with user_id linkage
- Admin authentication
- Student authentication system
- Role detection logic
- RLS policies implementation

### Phase 2: Admin Module (Week 2)
- Admin dashboard
- Add student with Gmail (create auth user)
- View all students
- Edit student details
- Delete student (remove auth user)
- Send welcome/reset emails

### Phase 3: Student Module (Week 3)
- Student login flow
- Personal dashboard
- View own profile
- View own attendance history
- Calendar view
- Change password feature

### Phase 4: Attendance System (Week 4)
- Admin mark attendance for all
- Admin edit attendance history
- Student view attendance (read-only)
- Auto-calculations in database views
- Monthly and overall percentages

### Phase 5: Reports & Polish (Week 5)
- Admin reports (all students)
- Student reports (own only)
- Export functionality
- Email notifications
- UI/UX improvements
- Mobile responsiveness

### Phase 6: Testing & Deployment (Week 6)
- Test RLS policies thoroughly
- Test role-based access
- Security audit
- Performance testing
- Bug fixes
- Production deployment

***

## Testing Checklist

### Security Testing
- [ ] Student cannot see other students' profiles
- [ ] Student cannot see others' attendance
- [ ] Student cannot edit their own data
- [ ] Student cannot mark attendance
- [ ] Admin can access everything
- [ ] Anonymous users blocked completely
- [ ] RLS policies work correctly
- [ ] JWT tokens validated properly

### Functionality Testing
- [ ] Admin can create student with Gmail
- [ ] Auth user created automatically
- [ ] Student can log in with Gmail
- [ ] Student sees only own data
- [ ] Admin sees all data
- [ ] Attendance calculations correct
- [ ] Password reset works
- [ ] Delete cascades properly
- [ ] Email notifications sent

### User Experience Testing
- [ ] Correct dashboard based on role
- [ ] Navigation appropriate for role
- [ ] No broken links
- [ ] Forms validate properly
- [ ] Error messages clear
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] Fast page loads

***

## Future Enhancements

### Student Features
- Parent access (view child's attendance)
- Leave application system
- Excuse submission for absences
- Attendance goals and streaks
- Achievement badges

### Admin Features
- Bulk student upload via CSV
- SMS notifications (in addition to email)
- Advanced analytics and trends
- Timetable integration
- Multiple admin roles (super admin, class teacher)
- Student grouping (sections within class)

### System Features
- QR code attendance marking
- Face recognition attendance
- Mobile app (React Native)
- Offline mode
- API for third-party integrations
- Webhook notifications
- Two-factor authentication

***

## Key Differences from Previous Plan

| Aspect | Previous Plan | Updated Plan |
|--------|---------------|--------------|
| **Public Access** | Yes (viewer mode) | No (must log in) |
| **Student Accounts** | No accounts | Each student has account |
| **Data Visibility** | Anyone can see all | Students see only own |
| **Authentication** | Admin only | Admin + all students |
| **Student Table** | No user linkage | Linked to auth.users |
| **RLS Policies** | Public read | User-specific read |
| **Email Field** | Optional | Required (login ID) |
| **Navigation** | Two modes | Three role-based |
| **Welcome Email** | Not needed | Sent when created |
| **Password Reset** | Admin only | Students can self-reset |
