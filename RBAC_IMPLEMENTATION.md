# Role-Based Access Control (RBAC) Implementation

## Overview
The application now implements a comprehensive role-based access control system with 5 distinct roles, each with specific permissions and capabilities.

## User Roles

### 1. **ADMIN** (System Administrator)
**Email:** admin@company.com

**Permissions:**
- Supreme control over the entire platform
- All permissions of lower roles
- Can manage all users, projects, sprints, and work items
- Can access all data across the organization
- Can modify system settings and configurations

**Key Capabilities:**
- User management (create, update, delete, assign roles)
- System-wide settings and configuration
- Access to all projects and data
- Override any permission restrictions

### 2. **PROJECT_MANAGER** (Project Manager)
**Emails:** sarah.johnson@company.com, mike.chen@company.com

**Permissions:**
- Create and manage projects
- Assign users to projects
- Change user roles within their projects
- View project analytics and reports
- Manage project capacity and allocations

**Key Capabilities:**
- `canCreateProject()` - Create new projects
- `canManageUserRoles()` - Assign roles to team members
- Project oversight and management
- Resource allocation within projects
- Team composition management

### 3. **TECHNICAL_DELIVERY_MANAGER** (TDM)
**Emails:** alex.rivera@company.com, priya.sharma@company.com

**Permissions:**
- Create and manage work items/tickets
- Provide technical depth and guidance
- Assign tasks to developers
- Review technical deliverables
- Manage technical debt and architecture decisions

**Key Capabilities:**
- `canCreateWorkItem()` - Create tickets and work items
- Technical oversight of projects
- Code review and technical guidance
- Architecture and design decisions
- Performance and quality monitoring

### 4. **SCRUM_MASTER**
**Emails:** emma.wilson@company.com, david.park@company.com

**Permissions:**
- Create and manage sprints
- Create work items within sprints
- Facilitate scrum ceremonies
- Manage sprint backlog
- Track team velocity and capacity

**Key Capabilities:**
- `canCreateSprint()` - Create and manage sprints
- `canCreateWorkItem()` - Create tickets for sprints
- Sprint planning and retrospectives
- Daily standup management
- Team velocity tracking
- Remove blockers

### 5. **EMPLOYEE** (Developer/Team Member)
**Emails:** john.doe@company.com, jane.smith@company.com, robert.brown@company.com, lisa.anderson@company.com, kevin.martinez@company.com, maria.garcia@company.com, thomas.lee@company.com, amy.taylor@company.com

**Permissions:**
- Submit timesheets
- Apply for leave
- Update assigned work items
- Participate in sprints
- View project information

**Key Capabilities:**
- `canApplyLeave()` - Apply for leave
- `canSubmitTimesheet()` - Log work hours
- Work on assigned tickets
- Attend sprint ceremonies
- View assigned projects and tasks

## Permission Matrix

| Action | Admin | PM | TDM | SM | Employee |
|--------|-------|----|----|-----|----------|
| Create Project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign User Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Work Items | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Sprint | ✅ | ✅ | ❌ | ✅ | ❌ |
| Manage Sprint | ✅ | ✅ | ❌ | ✅ | ❌ |
| Submit Timesheet | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply Leave | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

## Database Schema Changes

### User Model
Added `role` field:
```prisma
model User {
  // ... existing fields
  role String @default("EMPLOYEE") 
  // Possible values: ADMIN, PROJECT_MANAGER, TECHNICAL_DELIVERY_MANAGER, SCRUM_MASTER, EMPLOYEE
}
```

### Project Model
Added creator and manager tracking:
```prisma
model Project {
  // ... existing fields
  createdById String?  // User who created the project
  managerId   String?  // Project Manager
  
  createdBy User? @relation("ProjectCreator", fields: [createdById], references: [id])
  manager   User? @relation("ProjectManager", fields: [managerId], references: [id])
}
```

## RBAC Helper Functions

Located in `src/lib/rbac.ts`:

### User Retrieval
```typescript
getUserByEmail(email: string): Promise<UserWithRole | null>
```

### Role Checks
```typescript
hasRole(user, ['ADMIN', 'PROJECT_MANAGER']): boolean
isAdmin(user): boolean
isProjectManager(user): boolean
isTechnicalDeliveryManager(user): boolean
isScrumMaster(user): boolean
```

### Permission Checks
```typescript
canCreateProject(user): boolean
canCreateWorkItem(user): boolean
canCreateSprint(user): boolean
canManageUserRoles(user): boolean
canApplyLeave(user): boolean
canSubmitTimesheet(user): boolean
```

## API Authentication

All API routes now validate users against the database:

### `/api/auth/validate`
Validates user email and returns user data with role information.

**Request:**
```
GET /api/auth/validate?email=john.doe@company.com
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "john.doe@company.com",
    "name": "John Doe",
    "role": "EMPLOYEE",
    "jobTitle": "Senior Software Engineer",
    "department": "Engineering"
  }
}
```

## Test Accounts

### Login Credentials
All test accounts use email-based login. Use these emails at the login page:

| Role | Email | Name |
|------|-------|------|
| Admin | admin@company.com | System Administrator |
| PM | sarah.johnson@company.com | Sarah Johnson |
| PM | mike.chen@company.com | Mike Chen |
| TDM | alex.rivera@company.com | Alex Rivera |
| TDM | priya.sharma@company.com | Priya Sharma |
| SM | emma.wilson@company.com | Emma Wilson |
| SM | david.park@company.com | David Park |
| Employee | john.doe@company.com | John Doe |
| Employee | jane.smith@company.com | Jane Smith |

## Seeded Data

The database is seeded with:
- ✅ 15 users across all roles
- ✅ 4 active projects with realistic data
- ✅ User-project assignments
- ✅ Project managers assigned to projects
- ✅ Teams with appropriate role distribution

### Projects Created
1. **E-Commerce Platform Redesign** (PM: Sarah Johnson)
2. **Mobile App Development** (PM: Mike Chen)
3. **API Modernization** (PM: Sarah Johnson)
4. **Data Analytics Dashboard** (PM: Mike Chen)

## Migration Commands

### Run Migration
```bash
npx prisma migrate dev --name add_rbac_and_project_relations
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Seed Database
```bash
npx prisma db seed
```

### Reset Database (Clean Slate)
```bash
npx prisma migrate reset --force
```

## Removed Features

### Dummy Data
- ❌ Removed `dummy@example.com` user
- ❌ Removed all hardcoded dummy tickets
- ❌ Removed static demo data from APIs
- ✅ All data now comes from PostgreSQL database

### Files Cleaned
- `/src/app/page.tsx` - Updated with real test accounts
- `/src/app/api/dashboard/route.ts` - Removed dummy data check
- `/src/app/api/tickets/route.ts` - Removed DUMMY_TICKETS array
- `/src/app/api/auth/validate/route.ts` - New validation endpoint

## Implementation Checklist

- [x] Add `role` field to User model
- [x] Add creator/manager tracking to Project model
- [x] Create database migration
- [x] Seed database with RBAC users
- [x] Create RBAC helper functions
- [x] Remove all dummy data references
- [x] Update login page with real accounts
- [x] Create auth validation API
- [x] Test all user roles
- [x] Document RBAC system

## Next Steps

To implement UI-level role restrictions:

1. **Wrap Components with Permission Checks:**
```typescript
import { getUserByEmail, canCreateProject } from '@/lib/rbac';

// In your component
const user = await getUserByEmail(email);
if (canCreateProject(user)) {
  // Show "Create Project" button
}
```

2. **Protect API Routes:**
```typescript
import { getUserByEmail, isAdmin } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  const user = await getUserByEmail(email);
  
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Proceed with admin action
}
```

3. **Role-Based Navigation:**
Update the AppHeader component to show/hide navigation items based on user role.

4. **Dashboard Customization:**
Show different dashboard views based on user role (Admin vs PM vs Employee).

## Security Notes

- All role checks happen server-side in API routes
- Client-side role checks are for UX only (hiding/showing UI elements)
- Never trust client-provided role information
- Always validate permissions in API endpoints
- Use middleware for consistent permission enforcement
