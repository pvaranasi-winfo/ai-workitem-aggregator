# User Dashboard & Leave Management Features

## Overview
This update adds comprehensive user management features including:
1. **Automatic Resource Tagging** - Users are automatically tagged as Dedicated, Shared, or Unassigned based on project assignments
2. **User Dashboard** - Visual tile-based dashboard displaying all users with their information
3. **Leave Management** - System to capture and track employee leave from multiple sources

## Features Implemented

### 1. Automatic Resource Type Tagging

Users are automatically classified based on their project assignments:

- **Dedicated Resource**: User assigned to exactly ONE project
- **Shared Resource**: User assigned to MULTIPLE projects  
- **Unassigned**: User with NO project assignments

**Implementation**:
- Database field: `User.resourceType` (String, nullable)
- Auto-calculated in `/api/users/dashboard` endpoint
- Updates dynamically based on UserProject relationships

### 2. User Dashboard (`/user-dashboard`)

#### Features:
- **Tile-Based Layout**: Each user displayed as an informative card
- **Statistics Cards**: 
  - Total Users count
  - Dedicated Resources count
  - Shared Resources count
  - Unassigned users count

- **User Tile Information**:
  - Name, job title, department
  - Email, office location
  - Resource type badge (color-coded)
  - Assigned projects with allocation percentages
  - Total hours worked across all tickets
  - Number of assigned tickets
  - Upcoming/recent leave records

- **Filtering Options**:
  - Search by name, department, or job title
  - Filter by resource type (All/Dedicated/Shared/Unassigned)

#### Access:
- URL: `http://localhost:3000/user-dashboard`
- Navigation: Dashboard → User Dashboard button

#### API Endpoints:
- **GET `/api/users/dashboard`**: 
  - Returns all users with calculated stats
  - Includes: projects, hours worked, ticket count, leaves
  - Auto-calculates resource type
  - Returns total hours from time entries

### 3. Leave Management (`/leave-management`)

#### Features:
- **Leave Records Management**:
  - Create, view, and delete leave entries
  - Support for multiple leave types (Annual, Sick, Personal, Maternity, Paternity, Unpaid, Other)
  - Track leave status (Approved, Pending, Rejected)
  - Record number of days (supports half-days: 0.5)
  - Optional reason field

- **External Source Integration**:
  - Sync leave data from project management tools
  - Supported platforms: Jira Time Off, Azure DevOps, Slack
  - Mock implementation ready for real API integration
  - Tracks source of each leave record
  - Prevents duplicate imports using externalId

- **Statistics Dashboard**:
  - Total leave records
  - Approved leaves count
  - Pending leaves count  
  - Total days of leave

- **Filtering & Search**:
  - Filter by user
  - Filter by status (Approved/Pending/Rejected)
  - View leave history in table format

#### Access:
- URL: `http://localhost:3000/leave-management`
- Navigation: Dashboard → Leaves button OR User Dashboard → Leave Management button

#### API Endpoints:

**GET `/api/leaves`**
- Query params: `userId` (optional), `status` (optional)
- Returns: Array of leave records with user details

**POST `/api/leaves`**
- Body: `{ userId, leaveType, startDate, endDate, days, status?, reason? }`
- Creates new leave record

**DELETE `/api/leaves/[id]`**
- Deletes leave record by ID

**POST `/api/leaves/sync`**
- Body: `{ platform: 'jira' | 'azure-devops' | 'slack' }`
- Syncs leave data from external source
- Returns: `{ message, platform, synced: number }`

### 4. Database Schema Changes

#### User Model Updates:
```prisma
model User {
  // ... existing fields
  resourceType String? // "Dedicated", "Shared", "Unassigned"
  leaves       Leave[]
}
```

#### New Leave Model:
```prisma
model Leave {
  id          String   @id @default(cuid())
  userId      String
  leaveType   String   // Annual, Sick, Personal, etc.
  startDate   DateTime
  endDate     DateTime
  days        Float    // Supports 0.5 for half days
  status      String   @default("Approved")
  reason      String?
  source      String?  // jira, azure-devops, slack, manual
  externalId  String?  // ID from external system
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(...)
}
```

## UI/UX Details

### Color Coding:
- **Dedicated Resources**: Green badges/indicators
- **Shared Resources**: Blue badges/indicators
- **Unassigned**: Gray badges/indicators
- **Leave Status**:
  - Approved: Green badge
  - Pending: Yellow badge
  - Rejected: Red badge

### Visual Elements:
- Gradient backgrounds for visual appeal
- Card-based layouts for information organization
- Icon-based navigation and actions
- Responsive grid layouts
- Hover effects on interactive elements
- Badge components for status indicators

### Navigation Flow:
```
Dashboard
├── User Dashboard → View all users
│   ├── Filter/Search users
│   └── Navigate to Leave Management
└── Leave Management → Manage leaves
    ├── Add manual leave entries
    ├── Sync from external sources
    └── Filter/Search leaves
```

## Integration with External Sources

### Leave Sync Implementation

The system includes a mock implementation ready for real API integration:

#### Jira Time Off Integration:
```typescript
// Future implementation with Jira API
async function syncFromJira() {
  const response = await fetch(`${jiraUrl}/rest/api/3/user/timeoff`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Map Jira leave data to Leave model
}
```

#### Azure DevOps Integration:
```typescript
// Future implementation with Azure DevOps API
async function syncFromAzureDevOps() {
  const response = await fetch(
    `${orgUrl}/_apis/work/capacities?api-version=7.0`,
    { headers: { Authorization: `Basic ${token}` } }
  );
  // Map Azure DevOps capacity data to Leave model
}
```

#### Current Mock Implementation:
- Located in `/api/leaves/sync/route.ts`
- Returns sample data for demonstration
- Prevents duplicates using `externalId` field
- Ready to replace with real API calls

## Testing the Features

### 1. Access the Application:
```bash
npm run dev
# Visit http://localhost:3000
```

### 2. Login:
Use any seeded email:
- john.doe@example.com (Dedicated Resource, 1 project)
- jane.smith@example.com (Shared Resource, 2 projects)
- bob.wilson@example.com (Shared Resource, 2 projects)
- alice.johnson@example.com (Dedicated Resource, 1 project)
- mike.brown@example.com (Unassigned)

### 3. Explore Features:

**User Dashboard**:
1. Navigate to User Dashboard from main dashboard
2. View all 5 seeded users displayed as tiles
3. Check resource type badges (Dedicated/Shared/Unassigned)
4. Use search to filter by name/department
5. Use dropdown to filter by resource type
6. Observe total hours worked and ticket counts

**Leave Management**:
1. Navigate to Leave Management
2. View 4 seeded leave records
3. Test filters (by user, by status)
4. Add a new manual leave entry
5. Try syncing from external sources (mock data)
6. Delete a leave record

### 4. Verify Resource Tagging:
- John Doe: Should show "Dedicated" (1 project: E-Commerce Platform)
- Jane Smith: Should show "Shared" (2 projects: E-Commerce + Mobile App)
- Bob Wilson: Should show "Shared" (2 projects: Mobile App + Cloud Migration)
- Alice Johnson: Should show "Dedicated" (1 project: Mobile App)
- Mike Brown: Should show "Unassigned" (0 projects)

## Architecture Details

### Data Flow:

**User Dashboard**:
```
/user-dashboard page
  ↓ useQuery
/api/users/dashboard
  ↓ Prisma queries
1. Fetch all users with tickets & leaves
2. Fetch all UserProject mappings separately
3. Calculate total hours from TimeEntry
4. Determine resource type (count projects)
5. Return enriched user data
```

**Leave Management**:
```
/leave-management page
  ↓ useQuery/useMutation
/api/leaves (+ /[id], /sync)
  ↓ Prisma queries
1. CRUD operations on Leave model
2. Filter by user/status
3. Sync from external sources
4. Return leave data with user info
```

### Performance Considerations:
- UserProject fetched separately to avoid Prisma include issues
- Hours calculated from TimeEntry aggregation
- Resource type calculated dynamically (could be cached)
- Leaves filtered by recent/upcoming (30 days) for performance

## Future Enhancements

1. **Advanced Analytics**:
   - Resource utilization charts
   - Leave trends and patterns
   - Team capacity planning

2. **Real API Integrations**:
   - Complete Jira Time Off integration
   - Azure DevOps capacity sync
   - Slack Time Off bot integration
   - Google Calendar sync

3. **Automated Workflows**:
   - Scheduled leave sync (daily/weekly)
   - Email notifications for leave approvals
   - Automatic resource type updates on project changes

4. **Reporting**:
   - Export leave reports to PDF/Excel
   - Team availability calendar view
   - Resource allocation reports

5. **Enhanced Features**:
   - Leave balance tracking per user
   - Leave approval workflow
   - Conflict detection (overlapping leaves)
   - Resource allocation optimization suggestions

## Security Considerations

- Leave data includes personal information - ensure proper access control
- External API tokens should be encrypted in database
- Implement rate limiting on sync endpoints
- Add user role-based permissions for leave management
- Audit log for leave modifications

## Troubleshooting

### Resource Type Not Updating:
- Check UserProject relationships in database
- Verify `/api/users/dashboard` endpoint response
- Ensure Prisma client is regenerated after schema changes

### Leave Sync Not Working:
- Verify external API credentials (when implemented)
- Check console for error messages
- Ensure `source` and `externalId` fields are properly set
- Check for duplicate prevention logic

### Missing Data on User Tiles:
- Run seed script: `npx tsx prisma/seed-complete.ts`
- Check database has users, projects, tickets, time entries
- Verify API endpoint returns expected data structure

## API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/dashboard` | GET | Fetch all users with enriched data |
| `/api/users` | GET | Fetch basic user list (for dropdowns) |
| `/api/leaves` | GET | Fetch leave records (filterable) |
| `/api/leaves` | POST | Create new leave record |
| `/api/leaves/[id]` | DELETE | Delete leave record |
| `/api/leaves/[id]` | PUT | Update leave record |
| `/api/leaves/sync` | POST | Sync leaves from external source |

---

**Implementation Complete**: All features are functional and ready to use. The system automatically tags users as Dedicated/Shared based on their project assignments, displays comprehensive user information in a dashboard, and provides complete leave management with external source integration capability.
