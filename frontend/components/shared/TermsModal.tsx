"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: November 2025
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4 mt-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Doughlicious ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Use License</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Permission is granted to temporarily access the materials on Doughlicious's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Account Registration</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                To access certain features of our Service, you may be required to register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Products and Pricing</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Product Information</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Pricing</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    All prices are in the currency displayed and are subject to change without notice. We reserve the right to modify prices at any time. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Availability</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Product availability is subject to change. We reserve the right to limit quantities and to discontinue products at any time. If a product becomes unavailable after you place an order, we will notify you and provide a refund or alternative solution.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Orders and Payment</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Order Acceptance</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Your order is an offer to purchase products from us. We reserve the right to accept or reject your order for any reason, including product availability, errors in pricing or product information, or suspected fraud.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Payment must be received by us before we ship your order. We accept various payment methods as displayed on our website. You represent and warrant that you have the legal right to use any payment method you provide.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Cancellation</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    You may cancel your order before it ships. Once an order has shipped, it cannot be cancelled, but you may return it in accordance with our return policy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Shipping and Delivery</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We will make every effort to deliver products within the estimated timeframe. However, delivery times are estimates and not guaranteed. We are not responsible for delays caused by:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Carrier delays or errors</li>
                <li>Incorrect shipping addresses</li>
                <li>Weather conditions or natural disasters</li>
                <li>Other circumstances beyond our control</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Returns and Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                We want you to be completely satisfied with your purchase. Please review our return policy, which is available on our website. Refunds will be processed according to our refund policy and may take 5-10 business days to appear in your account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. User Conduct</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Collect or store personal data about other users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Doughlicious or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. You may not use, reproduce, or distribute any content without our express written permission.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Disclaimer of Warranties</h3>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">11. Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, DOUGHLICIOUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">12. Indemnification</h3>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless Doughlicious and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">13. Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">14. Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">15. Changes to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">16. Severability</h3>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">17. Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> legal@doughlicious.com<br />
                  <strong>Address:</strong> Doughlicious Legal Department<br />
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

