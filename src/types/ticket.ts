export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  platform: 'jira' | 'github' | 'gitlab' | 'azure' | 'bitbucket';
  url?: string;
  assignee?: string;
  reporter?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  loggedHours?: number;
  remainingHours?: number;
  labels?: string[];
  sprint?: string;
  storyPoints?: number;
}

export interface TicketWithTimeTracking extends Ticket {
  timeEntries?: TimeEntry[];
  totalLoggedHours: number;
  averageHoursPerDay: number;
}

export interface TimeEntry {
  id: string;
  ticketId: string;
  date: Date;
  hours: number;
  description?: string;
  userId: string;
}

export interface DashboardStats {
  totalTickets: number;
  inProgress: number;
  completed: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  totalRemainingHours: number;
  platformBreakdown: PlatformStats[];
  sprintSummary: SprintSummary[];
  weeklyTimesheet: DailyTimesheet[];
}

export interface PlatformStats {
  platform: string;
  count: number;
  tickets: Ticket[];
}

export interface SprintSummary {
  name: string;
  total: number;
  completed: number;
  remaining: number;
  tickets: number;
  completedTickets: number;
  velocity: number;
}

export interface DailyTimesheet {
  date: string;
  hours: number;
  tickets: number;
  averagePerTicket: number;
}
