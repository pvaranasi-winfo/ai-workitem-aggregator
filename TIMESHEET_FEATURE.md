# Timesheet Feature Documentation

## Overview
A comprehensive daily timesheet entry system that allows users to log their work hours for tickets they worked on. The system provides intelligent auto-fill capabilities and enforces date-based access controls.

## Features Implemented

### 1. **Smart Date Selection**
- **Current Date (Today)**: Full editing capabilities with auto-fill suggestions
- **Past Dates**: Read-only view of historical entries  
- **Future Dates**: Blocked and not allowed
- Visual badges indicating the date status

### 2. **Auto-Fill Intelligence**
- When accessing today's date, the system automatically detects tickets you worked on based on:
  - Recent ticket updates (updated today)
  - Tickets currently "In Progress" status
- User consent workflow:
  - **Option 1**: Accept auto-filled tickets and enter hours
  - **Option 2**: Decline and manually select tickets
- Shows preview of detected tickets before confirming

### 3. **Manual Ticket Entry**
- Provision to add tickets manually if auto-fill is declined
- Can add multiple tickets to the same day
- Only tickets worked on the current date are available for selection

### 4. **Time Entry Form**
- For each ticket, users can log:
  - **Hours Worked**: Decimal input (0.5 increments supported)
  - **Description**: Optional notes about what was worked on
- Visual ticket information:
  - Platform badge (Jira, GitHub, GitLab, etc.)
  - Ticket ID and title
  - Delete option for each entry
  
### 5. **Real-time Summary**
- Total hours calculated across all entries
- Entry count display
- Validation before saving (at least one ticket must have hours > 0)

### 6. **Database Integration**
- Saves time entries to PostgreSQL database
- Automatically updates ticket's:
  - `loggedHours`: Total hours logged across all time entries
  - `remainingHours`: Estimated hours minus logged hours
- Deletes and recreates entries for a date to handle edits

## Technical Implementation

### New Files Created

#### 1. `/src/app/timesheet/page.tsx`
Main timesheet page with:
- Date picker with future date blocking
- Auto-fill consent flow
- Time entry form with validation
- Real-time calculations
- Read-only mode for past dates

#### 2. `/src/app/api/timesheet/route.ts`
API endpoints:
- `GET`: Fetch time entries for a specific date
- `POST`: Save/update time entries for a date
- Automatic ticket hour calculations

#### 3. `/src/app/api/timesheet/worked-tickets/route.ts`
API endpoint:
- `GET`: Fetch tickets worked on a specific date
- Logic: Recent updates OR "In Progress" status

#### 4. UI Components Created
- `/src/components/ui/calendar.tsx`: Date picker component
- `/src/components/ui/popover.tsx`: Popover for calendar
- `/src/components/ui/checkbox.tsx`: Checkbox component
- `/src/components/ui/textarea.tsx`: Textarea for descriptions

### Dependencies Installed
```bash
npm install react-day-picker@^8 date-fns @radix-ui/react-popover @radix-ui/react-checkbox --legacy-peer-deps
```

### Database Schema (Already Exists)
```prisma
model TimeEntry {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  date        DateTime @default(now())
  hours       Float
  description String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([ticketId])
  @@index([userId])
  @@index([date])
}

model Ticket {
  // ... existing fields ...
  estimatedHours  Float?   @default(0)
  loggedHours     Float?   @default(0)
  remainingHours  Float?   @default(0)
  // ... existing fields ...
  timeEntries TimeEntry[]
}
```

## User Workflow

### Today's Date Entry
1. Click "Timesheet" button in dashboard header
2. System detects tickets worked on today
3. User sees confirmation dialog with detected tickets
4. User chooses:
   - **Accept**: Tickets pre-filled, user enters hours
   - **Decline**: Manual ticket selection enabled
5. Fill in hours and optional descriptions
6. Review total hours in summary card
7. Click "Save Timesheet"
8. Success confirmation and data persisted

### Past Date View
1. Select a past date from calendar
2. System loads existing time entries (read-only)
3. User can review what was logged
4. No editing allowed

### Future Date Prevention
1. Calendar automatically disables future dates
2. Visual "Future Date - Not Allowed" badge
3. Cannot select or enter data

## API Endpoints

### GET `/api/timesheet/worked-tickets`
**Query Params**: `email`, `date`  
**Response**: List of tickets worked on the specified date
```json
{
  "tickets": [
    {
      "id": "...",
      "title": "...",
      "externalId": "PROJ-123",
      "platform": "jira",
      ...
    }
  ]
}
```

### GET `/api/timesheet`
**Query Params**: `email`, `date`  
**Response**: Time entries for the specified date
```json
{
  "entries": [
    {
      "id": "...",
      "hours": 4.5,
      "description": "...",
      "ticket": { ... }
    }
  ]
}
```

### POST `/api/timesheet`
**Body**:
```json
{
  "email": "user@example.com",
  "date": "2025-12-08",
  "entries": [
    {
      "ticketId": "...",
      "hours": 4.5,
      "description": "..."
    }
  ]
}
```
**Response**: Created entries with success message

## Integration with Dashboard

Added "Timesheet" button in dashboard header navigation:
- Icon: Timer icon from lucide-react
- Links to `/timesheet` page
- Positioned between "Sync" and "Add" buttons

## Validation Rules

1. **Hours Input**:
   - Must be numeric
   - Minimum: 0
   - Maximum: 24 hours per entry
   - Supports decimal (0.5 increments)

2. **Save Requirements**:
   - At least one entry must have hours > 0
   - Description is optional
   - Date must not be in the future

3. **Date Access**:
   - Today: Full read/write
   - Past: Read-only
   - Future: Blocked

## Error Handling

- Invalid date selection shows visual feedback
- Failed API calls show toast notifications
- Empty timesheet validation with helpful messages
- Graceful handling of missing data

## UI/UX Features

- Gradient backgrounds matching dashboard theme
- Responsive design for mobile/desktop
- Loading states for async operations
- Smooth transitions and animations
- Clear visual hierarchy with cards
- Color-coded status badges
- Disabled state for past entries
- Sticky header for easy navigation

## Future Enhancements (Optional)

1. **Ticket Search**: Add search/filter for manual ticket selection
2. **Week View**: Show multiple days in a grid layout
3. **Bulk Entry**: Copy previous day's entries
4. **Approvals**: Manager approval workflow
5. **Reports**: Generate weekly/monthly timesheet reports
6. **Export**: Download timesheet as PDF/CSV
7. **Mobile App**: Native mobile application
8. **Offline Mode**: PWA with offline capabilities

## Testing Checklist

- [x] Date picker blocks future dates
- [x] Auto-fill detects today's tickets
- [x] Consent flow works correctly
- [x] Hours input validation
- [x] Total calculation accurate
- [x] Save persists to database
- [x] Ticket hours update correctly
- [x] Past dates show as read-only
- [x] Navigation works from dashboard
- [x] Build compiles without errors

## Access the Feature

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Login with `dummy@example.com`
4. Click "Timesheet" button in dashboard header
5. Select today's date and start logging hours!
