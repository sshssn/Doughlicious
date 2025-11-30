"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: November 2025
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4 mt-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Introduction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Doughlicious ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make purchases, or interact with our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Information We Collect</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                    <li>Account credentials and profile information</li>
                    <li>Order history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Automatically Collected Information</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    When you visit our website, we automatically collect certain information about your device, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                    <li>IP address and browser type</li>
                    <li>Device identifiers and operating system</li>
                    <li>Pages viewed, time spent on pages, and navigation patterns</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. How We Use Your Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders, products, services, and promotional offers</li>
                <li>Improve and personalize your experience on our website</li>
                <li>Analyze usage patterns and trends to enhance our services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Send you marketing communications (with your consent where required)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Information Sharing and Disclosure</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, shipping, analytics)</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of our business</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Data Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Your Rights and Choices</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Cookies and Tracking Technologies</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings, though this may affect website functionality.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Children's Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. International Data Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Changes to This Privacy Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">11. Contact Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@doughlicious.com<br />
                  <strong>Address:</strong> Doughlicious Privacy Team<br />
                  [Your Business Address]
                </p>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

