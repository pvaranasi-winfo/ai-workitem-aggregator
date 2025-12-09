'use client';

import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Terms of Use
            </h1>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
              <CardDescription>Last updated: December 9, 2025</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground">
              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using the Ticket Aggregator platform, you agree to be bound by these
                  Terms of Use. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">2. Use License</h3>
                <p className="mb-2">
                  Permission is granted to temporarily access and use the platform for personal or
                  commercial purposes, subject to the following restrictions:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• You may not modify or copy the platform materials</li>
                  <li>• You may not use the materials for commercial purposes without authorization</li>
                  <li>• You may not attempt to reverse engineer any software contained in the platform</li>
                  <li>• You may not remove any copyright or proprietary notations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">3. User Accounts</h3>
                <p className="mb-2">
                  When you create an account with us, you must provide accurate, complete, and current
                  information. You are responsible for:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Maintaining the confidentiality of your account credentials</li>
                  <li>• All activities that occur under your account</li>
                  <li>• Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">4. Data and Privacy</h3>
                <p>
                  We collect and process data in accordance with our Privacy Policy. By using the platform,
                  you consent to our data collection and processing practices. Your data is encrypted and
                  stored securely.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">5. Integrations</h3>
                <p>
                  The platform integrates with third-party services (Jira, GitHub, Azure DevOps, etc.).
                  You are responsible for maintaining valid credentials and licenses for these services.
                  We are not responsible for issues arising from third-party service outages or changes.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">6. Acceptable Use</h3>
                <p className="mb-2">You agree not to:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Use the platform for any unlawful purpose</li>
                  <li>• Attempt to gain unauthorized access to any systems or data</li>
                  <li>• Interfere with or disrupt the platform's operation</li>
                  <li>• Upload malicious code or content</li>
                  <li>• Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">7. Intellectual Property</h3>
                <p>
                  The platform and its original content, features, and functionality are owned by Ticket
                  Aggregator and are protected by international copyright, trademark, patent, trade secret,
                  and other intellectual property laws.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">8. Limitation of Liability</h3>
                <p>
                  In no event shall Ticket Aggregator be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including loss of profits, data, or other intangible
                  losses resulting from your use of the platform.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">9. Service Availability</h3>
                <p>
                  We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We reserve
                  the right to modify, suspend, or discontinue the service at any time with or without notice.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">10. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any
                  material changes via email or platform notification. Continued use after changes constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">11. Termination</h3>
                <p>
                  We may terminate or suspend your account and access to the platform immediately, without
                  prior notice, for any breach of these Terms of Use or for any other reason we deem appropriate.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">12. Contact Information</h3>
                <p>
                  If you have any questions about these Terms of Use, please contact us through the
                  Contact page or email us at support@ticketaggregator.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
