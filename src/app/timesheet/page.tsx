'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Clock, Save, Plus, Trash2, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface TimeEntry {
  id?: string;
  ticketId: string;
  ticketTitle: string;
  ticketExternalId: string;
  platform: string;
  hours: number;
  description: string;
}

export default function TimesheetPage() {
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [confirmedAutoFill, setConfirmedAutoFill] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const today = startOfDay(new Date());
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isPastDate = isBefore(selectedDate, today);
  const isFutureDate = isAfter(selectedDate, today);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Fetch tickets worked on selected date
  const { data: workedTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['worked-tickets', email, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(
        `/api/timesheet/worked-tickets?email=${email}&date=${format(selectedDate, 'yyyy-MM-dd')}`
      );
      if (!res.ok) throw new Error('Failed to fetch worked tickets');
      return res.json();
    },
    enabled: !!email && isToday,
  });

  // Fetch existing time entries for selected date
  const { data: existingEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['time-entries', email, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(
        `/api/timesheet?email=${email}&date=${format(selectedDate, 'yyyy-MM-dd')}`
      );
      if (!res.ok) throw new Error('Failed to fetch time entries');
      return res.json();
    },
    enabled: !!email,
  });

  // Fetch all user tickets for manual selection
  const { data: allTickets, isLoading: allTicketsLoading } = useQuery({
    queryKey: ['all-tickets', email],
    queryFn: async () => {
      const res = await fetch(`/api/tickets?email=${email}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
    enabled: !!email && showTicketDialog,
  });

  // Auto-fill time entries from worked tickets
  useEffect(() => {
    if (workedTickets?.tickets && !confirmedAutoFill && isToday && timeEntries.length === 0) {
      const autoEntries = workedTickets.tickets.map((ticket: any) => ({
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        ticketExternalId: ticket.externalId,
        platform: ticket.platform,
        hours: 0,
        description: '',
      }));
      setTimeEntries(autoEntries);
    }
  }, [workedTickets, confirmedAutoFill, isToday, timeEntries.length]);

  // Load existing entries for past dates
  useEffect(() => {
    if (existingEntries?.entries && isPastDate) {
      const entries = existingEntries.entries.map((entry: any) => ({
        id: entry.id,
        ticketId: entry.ticketId,
        ticketTitle: entry.ticket.title,
        ticketExternalId: entry.ticket.externalId,
        platform: entry.ticket.platform,
        hours: entry.hours,
        description: entry.description || '',
      }));
      setTimeEntries(entries);
    }
  }, [existingEntries, isPastDate]);

  const saveMutation = useMutation({
    mutationFn: async (entries: TimeEntry[]) => {
      const res = await fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          date: format(selectedDate, 'yyyy-MM-dd'),
          entries: entries.map(e => ({
            ticketId: e.ticketId,
            hours: e.hours,
            description: e.description,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save timesheet');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Timesheet saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleConfirmAutoFill = () => {
    setConfirmedAutoFill(true);
    toast.success('Auto-filled tickets loaded! Please enter hours worked.');
  };

  const handleDeclineAutoFill = () => {
    setConfirmedAutoFill(true);
    setTimeEntries([]);
    setShowManualEntry(true);
  };

  const handleAddManualEntry = () => {
    setShowManualEntry(true);
    setShowTicketDialog(true);
    setSelectedTickets([]);
    setSearchQuery('');
  };

  const handleRemoveEntry = (index: number) => {
    setTimeEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleAddSelectedTickets = () => {
    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    const tickets = allTickets?.tickets || [];
    const newEntries: TimeEntry[] = selectedTickets.map(ticketId => {
      const ticket = tickets.find((t: any) => t.id === ticketId);
      return {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        ticketExternalId: ticket.externalId,
        platform: ticket.platform,
        hours: 0,
        description: '',
      };
    });

    // Filter out tickets already added
    const existingTicketIds = timeEntries.map(e => e.ticketId);
    const uniqueNewEntries = newEntries.filter(e => !existingTicketIds.includes(e.ticketId));

    if (uniqueNewEntries.length === 0) {
      toast.error('All selected tickets are already added');
      return;
    }

    setTimeEntries(prev => [...prev, ...uniqueNewEntries]);
    setShowTicketDialog(false);
    setSelectedTickets([]);
    setSearchQuery('');
    toast.success(`Added ${uniqueNewEntries.length} ticket(s) to timesheet`);
  };

  const handleUpdateEntry = (index: number, field: keyof TimeEntry, value: any) => {
    setTimeEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = () => {
    const validEntries = timeEntries.filter(e => e.hours > 0);
    if (validEntries.length === 0) {
      toast.error('Please enter hours for at least one ticket');
      return;
    }
    saveMutation.mutate(validEntries);
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={email} onLogout={handleLogout} />
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* Date Selection */}
          <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              Select Date
            </CardTitle>
            <CardDescription>
              Choose a date to log your work hours. Future dates are not allowed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-72 justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => {
                      if (date && !isAfter(date, today)) {
                        setSelectedDate(date);
                        setConfirmedAutoFill(false);
                        setShowManualEntry(false);
                        setTimeEntries([]);
                      }
                    }}
                    disabled={(date: Date) => isAfter(date, today)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {isToday && (
                <Badge variant="default" className="bg-green-600">
                  Today
                </Badge>
              )}
              {isPastDate && (
                <Badge variant="secondary">Past Date - Read Only</Badge>
              )}
              {isFutureDate && (
                <Badge variant="destructive">Future Date - Not Allowed</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto-fill Confirmation (Only for today) */}
        {isToday && !confirmedAutoFill && workedTickets?.tickets?.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertCircle className="h-5 w-5" />
                Auto-Fill Detected
              </CardTitle>
              <CardDescription className="text-blue-800">
                We found {workedTickets.tickets.length} ticket(s) you worked on today based on recent activity.
                Would you like to use these for your timesheet?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {workedTickets.tickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <Badge variant="outline">{ticket.platform}</Badge>
                    <span className="text-sm font-medium">{ticket.externalId}</span>
                    <span className="text-sm text-gray-600 flex-1">{ticket.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleConfirmAutoFill} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Yes, Use These Tickets
                </Button>
                <Button onClick={handleDeclineAutoFill} variant="outline" className="gap-2">
                  No, I'll Enter Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Entries Form */}
        {(confirmedAutoFill || isPastDate || showManualEntry) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Time Entries for {format(selectedDate, 'MMMM dd, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {isPastDate ? 'Viewing past entries (read-only)' : 'Log your work hours for each ticket'}
                  </CardDescription>
                </div>
                {isToday && !isPastDate && (
                  <Button
                    onClick={handleAddManualEntry}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Ticket
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {timeEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No time entries yet</p>
                  {isToday && (
                    <Button onClick={handleAddManualEntry} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Entry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.map((entry, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{entry.platform}</Badge>
                                <span className="text-sm font-mono text-gray-600">
                                  {entry.ticketExternalId}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">{entry.ticketTitle}</h4>
                            </div>
                            {!isPastDate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`hours-${index}`}>Hours Worked *</Label>
                              <Input
                                id={`hours-${index}`}
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={entry.hours || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleUpdateEntry(index, 'hours', parseFloat(e.target.value) || 0)
                                }
                                disabled={isPastDate}
                                placeholder="0.0"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
                              <Textarea
                                id={`description-${index}`}
                                value={entry.description}
                                onChange={(e) =>
                                  handleUpdateEntry(index, 'description', e.target.value)
                                }
                                disabled={isPastDate}
                                placeholder="What did you work on?"
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Summary */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="text-3xl font-bold text-purple-900">{totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Entries</p>
                          <p className="text-2xl font-semibold text-purple-900">{timeEntries.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  {!isPastDate && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTimeEntries([]);
                          setConfirmedAutoFill(false);
                          setShowManualEntry(false);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending || totalHours === 0}
                        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Save className="h-4 w-4" />
                        {saveMutation.isPending ? 'Saving...' : 'Save Timesheet'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ticket Selection Dialog */}
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Tickets</DialogTitle>
              <DialogDescription>
                Choose tickets to add to your timesheet for {format(selectedDate, 'MMMM dd, yyyy')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets by ID, title, or description..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Ticket List */}
              <div className="flex-1 overflow-y-auto border rounded-lg">
                {allTicketsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-sm text-gray-500">Loading tickets...</div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allTickets?.tickets
                      ?.filter((ticket: any) => {
                        const search = searchQuery.toLowerCase();
                        return (
                          ticket.externalId.toLowerCase().includes(search) ||
                          ticket.title.toLowerCase().includes(search) ||
                          (ticket.description && ticket.description.toLowerCase().includes(search))
                        );
                      })
                      .map((ticket: any) => (
                        <div
                          key={ticket.id}
                          className={cn(
                            'flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                            selectedTickets.includes(ticket.id) && 'bg-purple-50 hover:bg-purple-100'
                          )}
                          onClick={() => handleTicketSelection(ticket.id)}
                        >
                          <Checkbox
                            checked={selectedTickets.includes(ticket.id)}
                            onCheckedChange={() => handleTicketSelection(ticket.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{ticket.platform}</Badge>
                              <span className="text-sm font-mono text-gray-600">
                                {ticket.externalId}
                              </span>
                              <Badge
                                variant={
                                  ticket.status.toLowerCase().includes('done')
                                    ? 'default'
                                    : ticket.status.toLowerCase().includes('progress')
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs"
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                            {ticket.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {allTickets?.tickets?.filter((ticket: any) => {
                      const search = searchQuery.toLowerCase();
                      return (
                        ticket.externalId.toLowerCase().includes(search) ||
                        ticket.title.toLowerCase().includes(search) ||
                        (ticket.description && ticket.description.toLowerCase().includes(search))
                      );
                    }).length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No tickets found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTicketDialog(false);
                  setSelectedTickets([]);
                  setSearchQuery('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSelectedTickets}
                disabled={selectedTickets.length === 0}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add {selectedTickets.length > 0 ? `${selectedTickets.length} ` : ''}Ticket
                {selectedTickets.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
      <Footer />
    </div>
  );
}
