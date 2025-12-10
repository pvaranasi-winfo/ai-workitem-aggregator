'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Home,
  BarChart3,
  Users,
  Building2,
  Calendar,
  Timer,
  Settings,
  PieChart,
  LogOut,
  Menu,
  X,
  TrendingUp,
  FileText,
  RefreshCw,
  Bell,
  Activity,
  MoreHorizontal,
  ChevronDown,
  User,
  Zap,
  Target,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  email: string;
  role?: string;
  onLogout: () => void;
}

export function AppHeader({ email, role, onLogout }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RBAC helpers
  const isAdmin = role === 'ADMIN';
  const isProjectManager = role === 'PROJECT_MANAGER';
  const isTDM = role === 'TECHNICAL_DELIVERY_MANAGER';
  const isScrumMaster = role === 'SCRUM_MASTER';
  const isEmployee = role === 'EMPLOYEE';

  // Permission helpers
  const canManageProjects = isAdmin || isProjectManager;
  const canManageSprints = isAdmin || isScrumMaster;
  const canViewAnalytics = isAdmin || isProjectManager || isTDM;
  const canManageUsers = isAdmin || isProjectManager;
  const canAccessKPI = isAdmin || isProjectManager || isTDM;

  // Navigation organized by feature groups with RBAC filtering and descriptions
  const allNavigationGroups = {
    core: [
      { 
        href: '/dashboard', 
        label: 'Dashboard', 
        icon: Home, 
        visible: true,
        description: 'Overview of your tickets and projects'
      },
      { 
        href: '/kpi-dashboard', 
        label: 'KPI', 
        icon: TrendingUp, 
        visible: canAccessKPI,
        description: 'Track key performance indicators'
      },
    ],
    work: [
      { 
        href: '/projects', 
        label: 'Projects', 
        icon: Building2, 
        visible: true,
        description: 'Manage and view all projects'
      },
      { 
        href: '/sprints', 
        label: 'Sprints', 
        icon: BarChart3, 
        visible: true,
        description: 'Plan and track sprint progress'
      },
      { 
        href: '/timesheet', 
        label: 'Timesheet', 
        icon: Timer, 
        visible: true,
        description: 'Submit your daily work efforts'
      },
    ],
    team: [
      { 
        href: '/user-dashboard', 
        label: 'Team', 
        icon: Users, 
        visible: canManageUsers,
        description: 'View team members and assignments'
      },
      { 
        href: '/capacity', 
        label: 'Capacity', 
        icon: PieChart, 
        visible: canManageUsers,
        description: 'Monitor team capacity and allocation'
      },
      { 
        href: '/leave-management', 
        label: 'Leaves', 
        icon: Calendar, 
        visible: true,
        description: 'Apply and manage leave requests'
      },
    ],
    insights: [
      { 
        href: '/analytics', 
        label: 'Analytics', 
        icon: Activity, 
        visible: canViewAnalytics,
        description: 'Detailed reports and insights'
      },
      { 
        href: '/notifications', 
        label: 'Alerts', 
        icon: Bell, 
        visible: true,
        description: 'Stay updated with notifications'
      },
    ],
    system: [
      { 
        href: '/user-mapping', 
        label: 'Mapping', 
        icon: Settings, 
        visible: isAdmin,
        description: 'Configure user mappings'
      },
      { 
        href: '/integrations', 
        label: 'Settings', 
        icon: Settings, 
        visible: true,
        description: 'Manage integrations and preferences'
      },
    ],
  };

  // Filter out invisible items
  const navigationGroups = {
    core: allNavigationGroups.core.filter(item => item.visible),
    work: allNavigationGroups.work.filter(item => item.visible),
    team: allNavigationGroups.team.filter(item => item.visible),
    insights: allNavigationGroups.insights.filter(item => item.visible),
    system: allNavigationGroups.system.filter(item => item.visible),
  };

  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const isActive = (href: string) => pathname === href;

  // For employees and scrum masters, show direct links instead of mega menu
  const showDirectLinks = isEmployee || isScrumMaster;
  
  // For admins, show settings and insights in main nav (no "More" menu)
  const showAdminDirectLinks = isAdmin;
  
  const directLinks = showDirectLinks ? [
    ...navigationGroups.core,
    ...navigationGroups.work,
    ...navigationGroups.team,
    ...navigationGroups.insights,
    ...navigationGroups.system,
  ] : [];

  const userInitials = email.substring(0, 2).toUpperCase();
  const userName = email.split('@')[0];

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Ticket Aggregator
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Mega Menu or Direct Links */}
          <div className="hidden lg:flex items-center gap-1">
            {showDirectLinks ? (
              // Direct Links for Employees/Scrum Masters
              <>
                {directLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'gap-2 text-xs',
                          active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </>
            ) : (
              // Mega Menu for Managers/Admins
              <>
            {/* Overview Menu */}
            <div className="relative"
              onMouseEnter={() => setOpenMegaMenu('overview')}
              onMouseLeave={() => setOpenMegaMenu(null)}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 text-xs',
                  (navigationGroups.core.some(item => isActive(item.href))) && 'bg-blue-50 text-blue-600'
                )}
              >
                <Home className="h-3.5 w-3.5" />
                Overview
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
              {openMegaMenu === 'overview' && navigationGroups.core.length > 0 && (
                <div 
                  className="absolute top-full left-0 pt-2 z-50"
                  onMouseEnter={() => setOpenMegaMenu('overview')}
                  onMouseLeave={() => setOpenMegaMenu(null)}
                >
                  <div className="w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-3">
                  {navigationGroups.core.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={cn(
                          'px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer',
                          active && 'bg-blue-50'
                        )}>
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                              active ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gray-100'
                            )}>
                              <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                            </div>
                            <div className="flex-1">
                              <div className={cn('font-semibold text-sm', active && 'text-blue-600')}>
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            {/* Work Menu */}
            <div className="relative"
              onMouseEnter={() => setOpenMegaMenu('work')}
              onMouseLeave={() => setOpenMegaMenu(null)}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 text-xs',
                  (navigationGroups.work.some(item => isActive(item.href))) && 'bg-blue-50 text-blue-600'
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                Work
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
              {openMegaMenu === 'work' && navigationGroups.work.length > 0 && (
                <div 
                  className="absolute top-full left-0 pt-2 z-50"
                  onMouseEnter={() => setOpenMegaMenu('work')}
                  onMouseLeave={() => setOpenMegaMenu(null)}
                >
                  <div className="w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-3">
                  {navigationGroups.work.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={cn(
                          'px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer',
                          active && 'bg-blue-50'
                        )}>
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                              active ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gray-100'
                            )}>
                              <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                            </div>
                            <div className="flex-1">
                              <div className={cn('font-semibold text-sm', active && 'text-blue-600')}>
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            {/* Team Menu */}
            {navigationGroups.team.length > 0 && (
              <div className="relative"
                onMouseEnter={() => setOpenMegaMenu('team')}
                onMouseLeave={() => setOpenMegaMenu(null)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-1.5 text-xs',
                    (navigationGroups.team.some(item => isActive(item.href))) && 'bg-blue-50 text-blue-600'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  Team
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
                {openMegaMenu === 'team' && (
                  <div 
                    className="absolute top-full left-0 pt-2 z-50"
                    onMouseEnter={() => setOpenMegaMenu('team')}
                    onMouseLeave={() => setOpenMegaMenu(null)}
                  >
                    <div className="w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-3">
                    {navigationGroups.team.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href}>
                          <div className={cn(
                            'px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer',
                            active && 'bg-blue-50'
                          )}>
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                active ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gray-100'
                              )}>
                                <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                              </div>
                              <div className="flex-1">
                                <div className={cn('font-semibold text-sm', active && 'text-blue-600')}>
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Insights & Settings - Direct Links for Admin, Mega Menu for others */}
            {showAdminDirectLinks ? (
              <>
                {/* Direct Insights Links */}
                {navigationGroups.insights.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'gap-2 text-xs',
                          active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                {/* Direct Settings Links */}
                {navigationGroups.system.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'gap-2 text-xs',
                          active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </>
            ) : (
              // More Menu for non-admin managers
              <div className="relative"
                onMouseEnter={() => setOpenMegaMenu('more')}
                onMouseLeave={() => setOpenMegaMenu(null)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-1.5 text-xs',
                    ([...navigationGroups.insights, ...navigationGroups.system].some(item => isActive(item.href))) && 'bg-blue-50 text-blue-600'
                  )}
                >
                  <Activity className="h-3.5 w-3.5" />
                  More
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
                {openMegaMenu === 'more' && (
                  <div 
                    className="absolute top-full right-0 pt-2 z-50"
                    onMouseEnter={() => setOpenMegaMenu('more')}
                    onMouseLeave={() => setOpenMegaMenu(null)}
                  >
                    <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-3">
                  {navigationGroups.insights.length > 0 && (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Insights</p>
                      </div>
                      {navigationGroups.insights.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link key={item.href} href={item.href}>
                            <div className={cn(
                              'px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer',
                              active && 'bg-blue-50'
                            )}>
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                  active ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gray-100'
                                )}>
                                  <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                                </div>
                                <div className="flex-1">
                                  <div className={cn('font-semibold text-sm', active && 'text-blue-600')}>
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </>
                  )}
                  {navigationGroups.system.length > 0 && (
                    <>
                      {navigationGroups.insights.length > 0 && <div className="border-t my-2"></div>}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
                      </div>
                      {navigationGroups.system.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link key={item.href} href={item.href}>
                            <div className={cn(
                              'px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer',
                              active && 'bg-blue-50'
                            )}>
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                  active ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gray-100'
                                )}>
                                  <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                                </div>
                                <div className="flex-1">
                                  <div className={cn('font-semibold text-sm', active && 'text-blue-600')}>
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </>
                  )}
                  </div>
                </div>
              )}
            </div>
            )}
            </>
            )}
          </div>

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Profile Badge with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">{userName}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                  {role && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/integrations" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-3 space-y-1">
            {/* Core */}
            <div className="px-2 py-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Core</p>
            </div>
            {navigationGroups.core.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-3 text-sm',
                      active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Work */}
            <div className="px-2 py-1 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Work</p>
            </div>
            {navigationGroups.work.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-3 text-sm',
                      active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Team */}
            <div className="px-2 py-1 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Team</p>
            </div>
            {navigationGroups.team.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-3 text-sm',
                      active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Insights */}
            <div className="px-2 py-1 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Insights</p>
            </div>
            {navigationGroups.insights.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-3 text-sm',
                      active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* System */}
            <div className="px-2 py-1 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">System</p>
            </div>
            {navigationGroups.system.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-3 text-sm',
                      active && 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
