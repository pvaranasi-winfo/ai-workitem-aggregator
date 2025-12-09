# Projects and User Mapping Features

## Overview
Added two new major features to the ticket aggregator application:
1. **Projects Management** - Create and manage projects with capacity tracking
2. **User Mapping** - Map users to projects with configurable Microsoft Entra ID integration

## Features Implemented

### 1. Projects View (`/projects`)

#### Features
- **Create/Edit/Delete Projects** with comprehensive details
- **Project Attributes**:
  - Title (required)
  - Description
  - Capacity (hours/week)
  - Location (office location or remote)
  - Status (Active, Inactive, Archived)
  - Start Date & End Date
  - Team member count

#### Dashboard Stats
- Total Projects
- Active Projects count
- Total Capacity across all projects

#### UI Components
- Grid layout with project cards
- Color-coded status badges
- Visual icons for capacity, location, dates
- Edit and delete actions
- Empty state with call-to-action

#### Navigation
- Accessible from dashboard header
- Links to User Mapping page
- Back to Dashboard navigation

---

### 2. User Mapping View (`/user-mapping`)

#### Features
- **Two-Tab Interface**:
  1. **User Mappings Tab** - View and manage user-project assignments
  2. **All Users Tab** - View all users in the system

#### User Mappings Tab
- **Filter & Search**:
  - Search by user name, email, project, or role
  - Filter by specific project
  - Real-time filtering

- **Mapping Attributes**:
  - Project assignment
  - User assignment
  - Role (Developer, Lead, Manager, etc.)
  - Allocation Percentage (0-100%)
  - Start Date & End Date
  
- **Table View** with columns:
  - User (name, email, job title)
  - Project (title, location)
  - Role badge
  - Allocation percentage badge
  - Period (start/end dates)
  - Delete action

- **Stats Cards**:
  - Total Mappings
  - Active Projects
  - Mapped Users

#### All Users Tab
- View all users in the system
- Shows Entra ID badge for synced users
- Displays user information:
  - Display name
  - Email
  - Job title
  - Department
  - Office location
- Sync button for Entra ID integration

---

### 3. Microsoft Entra ID Integration

#### Configuration Dialog
Accessible from User Mapping page via "Entra Config" button

**Settings**:
- **Tenant ID** - Azure AD Tenant ID
- **Client ID** - Application (Client) ID
- **Client Secret** - Application Secret
- **Enable/Disable** toggle

**Setup Instructions** (included in dialog):
1. Register an app in Azure Portal
2. Add API permissions: User.Read.All, Directory.Read.All
3. Grant admin consent for permissions
4. Create a client secret
5. Copy credentials to configuration

#### Sync Functionality
- **Manual Sync Button** - Triggers user sync from Entra ID
- **Mock Implementation** - Currently uses mock data (ready for Graph API)
- **User Fields Synced**:
  - Email (unique identifier)
  - Display Name
  - Job Title
  - Department
  - Office Location
  - Entra ID (unique ID from Azure)

#### Database Storage
- `EntraConfig` table stores configuration
- User table has Entra ID fields:
  - `entraId` (unique)
  - `displayName`
  - `jobTitle`
  - `department`
  - `officeLocation`

---

## Database Schema Changes

### New Models

#### Project
```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  capacity    Float?
  location    String?
  status      String   @default("Active")
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userProjects UserProject[]
}
```

#### UserProject
```prisma
model UserProject {
  id                   String   @id @default(cuid())
  userId               String
  projectId            String
  role                 String?
  allocationPercentage Float?   @default(100)
  startDate            DateTime?
  endDate              DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])
  
  @@unique([userId, projectId])
}
```

#### EntraConfig
```prisma
model EntraConfig {
  id           String   @id @default(cuid())
  tenantId     String
  clientId     String
  clientSecret String   // Should be encrypted in production
  isEnabled    Boolean  @default(false)
  syncInterval Int      @default(24)
  lastSyncedAt DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Updated Models

#### User
Added Entra ID fields:
```prisma
model User {
  // ... existing fields ...
  
  entraId        String?  @unique
  displayName    String?
  jobTitle       String?
  department     String?
  officeLocation String?
  
  userProjects UserProject[]
}
```

---

## API Endpoints

### Projects API

#### `GET /api/projects`
- Fetches all projects with user count
- Returns array of projects with `_count.userProjects`

#### `POST /api/projects`
- Creates new project
- Body: `{ title, description?, capacity?, location?, status?, startDate?, endDate? }`

#### `PUT /api/projects/[id]`
- Updates existing project
- Body: Same as POST

#### `DELETE /api/projects/[id]`
- Deletes project and all related mappings (cascade)

### User Mappings API

#### `GET /api/user-mappings`
- Fetches all user-project mappings
- Optional query param: `?projectId=xxx` to filter by project
- Includes user and project details

#### `POST /api/user-mappings`
- Creates new user-project mapping
- Body: `{ projectId, userId, role?, allocationPercentage?, startDate?, endDate? }`
- Validates uniqueness (one user per project)

#### `DELETE /api/user-mappings/[id]`
- Removes user-project mapping

### Entra ID API

#### `GET /api/entra/config`
- Fetches current Entra ID configuration
- Excludes client secret from response

#### `POST /api/entra/config`
- Saves Entra ID configuration
- Body: `{ tenantId, clientId, clientSecret, isEnabled }`

#### `POST /api/entra/sync`
- Triggers user sync from Microsoft Entra ID
- Currently uses mock data (ready for Graph API integration)
- Updates `lastSyncedAt` timestamp

---

## Navigation Updates

### Dashboard Header
Added new navigation buttons:
- **Projects** button (Building2 icon)
- **User Mapping** button (Users icon)

### Cross-Page Navigation
All pages include navigation to:
- Dashboard
- Projects (where applicable)
- User Mapping (where applicable)
- Integrations
- Timesheet

---

## UI/UX Features

### Projects Page
- **Gradient Background**: Blue to indigo theme
- **Responsive Grid**: 1-3 columns based on screen size
- **Card Design**: Hover effects, shadow transitions
- **Icons**: Building2, Users, MapPin, Calendar, TrendingUp
- **Empty State**: Helpful messaging with call-to-action

### User Mapping Page
- **Gradient Background**: Purple to pink theme
- **Tabbed Interface**: Clean separation of concerns
- **Search & Filters**: Real-time, intuitive
- **Table Layout**: Professional, data-dense view
- **Badges**: Color-coded for status, allocation, roles
- **Stats Cards**: Quick overview metrics

### Dialogs
- **Modal Forms**: Clean, focused data entry
- **Validation**: Required fields marked
- **Help Text**: Setup instructions for Entra ID
- **Responsive**: Works on all screen sizes

---

## Security Considerations

### Production Recommendations

1. **Encrypt Client Secret**:
   ```typescript
   // Use encryption library like bcrypt or node crypto
   const encryptSecret = (secret: string) => {
     // Implement encryption
   };
   ```

2. **Environment Variables**:
   - Store Entra ID credentials in `.env`
   - Never commit secrets to version control

3. **API Authentication**:
   - Add authentication middleware
   - Validate user permissions
   - Rate limiting for sync operations

4. **HTTPS Only**:
   - Enforce HTTPS in production
   - Secure cookie settings

---

## Microsoft Graph API Integration

### Implementation Guide

To implement real Entra ID sync:

1. **Install Package**:
   ```bash
   npm install @microsoft/microsoft-graph-client isomorphic-fetch
   ```

2. **Update Sync Route**:
   ```typescript
   import { Client } from '@microsoft/microsoft-graph-client';
   
   const getAuthenticatedClient = (config) => {
     return Client.init({
       authProvider: async (done) => {
         const tokenResponse = await fetch(
           `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
           {
             method: 'POST',
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
             body: new URLSearchParams({
               client_id: config.clientId,
               client_secret: config.clientSecret,
               scope: 'https://graph.microsoft.com/.default',
               grant_type: 'client_credentials',
             }),
           }
         );
         const { access_token } = await tokenResponse.json();
         done(null, access_token);
       },
     });
   };
   
   const client = getAuthenticatedClient(config);
   const users = await client.api('/users').get();
   ```

3. **Required Permissions**:
   - User.Read.All
   - Directory.Read.All
   - Application permissions (not delegated)

---

## Testing Instructions

### 1. Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 2. Access Features
```
http://localhost:3000/projects
http://localhost:3000/user-mapping
```

### 3. Test Workflow

#### Projects
1. Click "Projects" in dashboard
2. Click "Add Project"
3. Fill in project details (title required)
4. Save and verify in list
5. Edit project details
6. Delete project

#### User Mapping
1. Click "User Mapping" in dashboard
2. Navigate to "All Users" tab
3. Configure Entra ID (optional)
4. Click "Sync from Entra ID" (uses mock data)
5. Switch to "User Mappings" tab
6. Click "Add Mapping"
7. Select project and user
8. Set role and allocation
9. Save and verify in table
10. Test search and filter
11. Delete mapping

---

## File Structure

```
src/
├── app/
│   ├── projects/
│   │   └── page.tsx                 # Projects view
│   ├── user-mapping/
│   │   └── page.tsx                 # User mapping view
│   └── api/
│       ├── projects/
│       │   ├── route.ts             # GET, POST projects
│       │   └── [id]/route.ts        # PUT, DELETE project
│       ├── user-mappings/
│       │   ├── route.ts             # GET, POST mappings
│       │   └── [id]/route.ts        # DELETE mapping
│       └── entra/
│           ├── config/route.ts      # Entra config CRUD
│           └── sync/route.ts        # Entra sync endpoint
├── prisma/
│   ├── schema.prisma                # Updated with new models
│   └── seed-updated.ts              # Seed with projects & mappings
```

---

## Future Enhancements

### Projects
- [ ] Project budget tracking
- [ ] Milestones and deliverables
- [ ] Project health status
- [ ] Resource utilization charts
- [ ] Export project reports

### User Mapping
- [ ] Bulk user import
- [ ] Auto-allocation based on availability
- [ ] Conflict detection (over-allocation)
- [ ] Historical assignment tracking
- [ ] Calendar view of assignments

### Entra ID
- [ ] Auto-sync on schedule (cron job)
- [ ] Group-based project assignment
- [ ] Role mapping from Entra ID
- [ ] Sync status notifications
- [ ] Error logging and retry logic

---

## Summary

✅ **Projects Management** - Complete CRUD with rich metadata
✅ **User-Project Mapping** - Flexible assignment system
✅ **Entra ID Integration** - Configurable with sync capability
✅ **Database Schema** - Properly modeled with relationships
✅ **API Endpoints** - RESTful design with validation
✅ **UI/UX** - Modern, responsive, intuitive
✅ **Navigation** - Seamless cross-page experience
✅ **Build Success** - All routes compiled successfully

The features are ready for use and can be accessed at:
- **Projects**: http://localhost:3000/projects
- **User Mapping**: http://localhost:3000/user-mapping
