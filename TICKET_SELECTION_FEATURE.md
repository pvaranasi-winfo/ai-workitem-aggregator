# Timesheet Ticket Selection Feature

## New Functionality Added

### 1. **Add Ticket Button**
Located in the timesheet page header, this button allows users to manually add tickets to their timesheet at any time.

### 2. **Add First Entry Button**
Appears when the timesheet is empty, providing a quick way to get started with manual ticket selection.

## Features

### Smart Ticket Selection Dialog
- **Full-screen searchable dialog** with all user's tickets
- **Real-time search** by ticket ID, title, or description
- **Multi-select capability** with checkboxes
- **Visual indicators**:
  - Platform badges (Jira, GitHub, GitLab, etc.)
  - Ticket status badges with color coding
  - External ticket IDs (e.g., PROJ-123)
  - Ticket descriptions with line clamping

### Search Functionality
- Search bar with magnifying glass icon
- Filters tickets by:
  - External ID
  - Title
  - Description
- Case-insensitive search
- Real-time filtering as you type

### Selection Management
- Click anywhere on the ticket row to select/deselect
- Checkbox for explicit selection
- Visual highlight for selected tickets (purple background)
- Selected count in the Add button
- Prevents duplicate ticket additions

### User Experience
- **Loading states**: Shows "Loading tickets..." while fetching
- **Empty states**: Shows "No tickets found" when search has no results
- **Validation**: Prevents adding zero tickets with helpful error message
- **Success feedback**: Toast notification showing how many tickets were added
- **Cancel option**: Clear selections and close dialog

## How It Works

### Workflow

1. **Open Dialog**
   - Click "Add Ticket" button (in header when entries exist)
   - OR click "Add First Entry" button (when no entries exist)

2. **Search & Select**
   - Optionally search for specific tickets
   - Click on tickets to select them (checkbox or row)
   - Selected tickets highlight in purple
   - Can select multiple tickets at once

3. **Add to Timesheet**
   - Review selection count in button ("Add 3 Tickets")
   - Click "Add" button
   - Dialog closes and tickets appear in timesheet
   - Success toast shows confirmation

4. **Fill Hours**
   - Each added ticket starts with 0 hours
   - Fill in hours worked and optional description
   - Save timesheet when complete

### Technical Implementation

#### New State Variables
```typescript
const [showTicketDialog, setShowTicketDialog] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
```

#### New Query
```typescript
const { data: allTickets } = useQuery({
  queryKey: ['all-tickets', email],
  queryFn: async () => {
    const res = await fetch(`/api/tickets?email=${email}`);
    return res.json();
  },
  enabled: !!email && showTicketDialog, // Only fetch when dialog is open
});
```

#### Key Functions

**`handleTicketSelection(ticketId: string)`**
- Toggles ticket selection
- Adds/removes from selectedTickets array

**`handleAddSelectedTickets()`**
- Validates selection (at least 1 ticket)
- Filters out already-added tickets
- Creates TimeEntry objects with 0 hours
- Adds to timeEntries state
- Shows success toast
- Closes dialog and resets state

**`handleAddManualEntry()`**
- Opens the ticket selection dialog
- Resets search and selections

## UI Components

### Dialog Structure
```
<Dialog>
  <DialogContent>
    <DialogHeader>
      - Title: "Select Tickets"
      - Description: Date context
    </DialogHeader>
    
    <Search Input>
      - Icon + placeholder
      - Real-time filtering
    </Search>
    
    <Ticket List>
      - Scrollable with max-height
      - Checkbox + Ticket Details
      - Platform badge, ID, status
      - Title and description
    </Ticket List>
    
    <DialogFooter>
      - Cancel button
      - Add button (with count)
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Ticket Card in Dialog
Each ticket displays:
- ✅ Checkbox for selection
- 🏷️ Platform badge (Jira, GitHub, etc.)
- 🔢 External ID (PROJ-123)
- 📊 Status badge (color-coded)
- 📝 Title (bold)
- 📄 Description (2-line clamp)
- 🎨 Hover effects and selection highlight

## Integration Points

### Updated Buttons
1. **"Add Ticket" button** in time entries header
   - Visible when entries exist
   - Opens ticket selection dialog

2. **"Add First Entry" button** in empty state
   - Visible when no entries
   - Opens ticket selection dialog

### State Management
- Dialog state controlled by `showTicketDialog`
- Search query managed in component state
- Selected tickets tracked in array
- All state resets on dialog close/cancel

## Validation & Error Handling

### Prevents Issues
- ✅ Cannot add zero tickets (button disabled)
- ✅ Cannot add duplicate tickets (filtered out)
- ✅ Shows helpful messages for empty selections
- ✅ Graceful handling of no search results
- ✅ Loading states while fetching tickets

### User Feedback
- Toast on successful addition
- Toast on error (no selection, all duplicates)
- Visual selection states
- Dynamic button text with count

## Accessibility Features

- Keyboard navigation support
- ARIA labels on dialog
- Focus management
- Screen reader friendly
- Close on Escape key
- Close button with icon

## Performance Optimizations

- **Lazy loading**: Only fetches tickets when dialog opens
- **React Query caching**: Subsequent opens use cached data
- **Efficient filtering**: Client-side search on fetched data
- **Conditional rendering**: Dialog content only when open

## Future Enhancements (Optional)

1. **Filters**: Add platform, status, or date filters
2. **Sorting**: Sort by date, priority, or title
3. **Bulk actions**: Select all, clear all buttons
4. **Recent tickets**: Show recently worked tickets first
5. **Favorites**: Pin frequently used tickets
6. **Keyboard shortcuts**: Quick add with hotkeys

## Testing Instructions

1. Start dev server: `npm run dev`
2. Navigate to timesheet page
3. Click "Add Ticket" or "Add First Entry"
4. Search for a ticket (e.g., "bug" or "feature")
5. Select multiple tickets by clicking
6. Click "Add 2 Tickets" (or however many selected)
7. Verify tickets appear in timesheet with 0 hours
8. Try adding same ticket again (should show error)
9. Test cancel button (should close without adding)
10. Test search with no results
