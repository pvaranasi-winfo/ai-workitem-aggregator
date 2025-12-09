import Link from 'next/link';
import { Home, BarChart3, Users, Building2, Calendar, Timer, Settings, PieChart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ticket Aggregator. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
