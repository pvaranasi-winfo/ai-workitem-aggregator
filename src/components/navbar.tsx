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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  email?: string;
  onLogout?: () => void;
  actions?: React.ReactNode;
}

export function Navbar({ email, onLogout, actions }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/kpi-dashboard', label: 'KPI', icon: TrendingUp },
    { href: '/user-dashboard', label: 'Team', icon: Users },
    { href: '/projects', label: 'Projects', icon: Building2 },
    { href: '/user-mapping', label: 'Mapping', icon: PieChart },
    { href: '/timesheet', label: 'Timesheet', icon: Timer },
    { href: '/leave-management', label: 'Leaves', icon: Calendar },
    { href: '/integrations', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

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
                {email && (
                  <p className="text-xs text-muted-foreground hidden md:block">{email}</p>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
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
          </div>

          {/* Actions & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Custom Actions */}
            {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

            {/* Logout Button - Desktop */}
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="hidden sm:flex gap-2 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            )}

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
            {navItems.map((item) => {
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

            {/* Mobile Actions */}
            {actions && (
              <div className="pt-3 border-t space-y-1">
                {actions}
              </div>
            )}

            {/* Mobile Logout */}
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
