import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Shield, Cookie, FileText, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Legal() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const handleCookiePreference = (key: keyof typeof cookiePreferences) => {
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Save to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify({
      ...cookiePreferences,
      [key]: !cookiePreferences[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Legal & Compliance</h1>
          <p className="text-lg text-slate-600">
            We are committed to protecting your privacy and ensuring compliance with international regulations.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="gdpr" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          {/* GDPR Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  GDPR Compliance
                </CardTitle>
                <CardDescription>
                  General Data Protection Regulation Compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Your Data Rights</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Under GDPR, you have the right to access, correct, delete, and port your personal data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Your Rights</h3>
                  <ul className="space-y-3">
                    {[
                      "Right to Access: Request a copy of your personal data",
                      "Right to Rectification: Correct inaccurate personal data",
                      "Right to Erasure: Request deletion of your data (right to be forgotten)",
                      "Right to Restrict Processing: Limit how we use your data",
                      "Right to Data Portability: Receive your data in a portable format",
                      "Right to Object: Opt-out of certain data processing activities",
                      "Right to Withdraw Consent: Withdraw consent at any time",
                    ].map((right, idx) => (
                      <li key={idx} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Data Processing</h3>
                  <p className="text-slate-600">
                    We only process personal data for legitimate business purposes, with your explicit consent, or as required by law. All data is processed securely and stored in compliant data centers.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Data Retention</h3>
                  <p className="text-slate-600">
                    We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, typically not exceeding 3 years unless required by law.
                  </p>
                </div>

                <div className="bg-slate-100 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Exercise Your Rights</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    To exercise any of your GDPR rights, please contact our Data Protection Officer:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Email:</strong> dpo@b2bwholesale.com</p>
                    <p><strong>Phone:</strong> +86 769 1234 5678</p>
                    <p><strong>Address:</strong> Dongguan, China</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  How we collect, use, and protect your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Information We Collect</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Account information (name, email, company details)</li>
                    <li>• Contact information (phone, address)</li>
                    <li>• Order and transaction history</li>
                    <li>• Payment information (processed securely by Stripe)</li>
                    <li>• Communication preferences</li>
                    <li>• Usage data and analytics</li>
                    <li>• IP address and browser information</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">How We Use Your Data</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Process and fulfill your orders</li>
                    <li>• Provide customer support</li>
                    <li>• Send transactional emails</li>
                    <li>• Improve our services</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Prevent fraud and abuse</li>
                    <li>• Marketing (with your consent)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Data Security</h3>
                  <p className="text-slate-600">
                    We implement industry-standard security measures including:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• SSL/TLS encryption for all data in transit</li>
                    <li>• AES-256 encryption for data at rest</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• PCI-DSS compliance for payment processing</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">Third-Party Sharing</h3>
                  <p className="text-slate-600">
                    We do not sell your data. We may share information with:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Payment processors (Stripe, PayPal)</li>
                    <li>• Shipping and logistics partners</li>
                    <li>• Analytics providers</li>
                    <li>• Legal authorities (when required)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service Tab */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Terms of Service
                </CardTitle>
                <CardDescription>
                  Terms and conditions for using our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">1. Acceptance of Terms</h3>
                  <p className="text-slate-600">
                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">2. Use License</h3>
                  <p className="text-slate-600">
                    Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">3. Disclaimer</h3>
                  <p className="text-slate-600">
                    The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">4. Limitations</h3>
                  <p className="text-slate-600">
                    In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">5. Accuracy of Materials</h3>
                  <p className="text-slate-600">
                    The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-900">6. Modifications</h3>
                  <p className="text-slate-600">
                    We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cookie Preferences Tab */}
          <TabsContent value="cookies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-blue-600" />
                  Cookie Preferences
                </CardTitle>
                <CardDescription>
                  Manage your cookie and tracking preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900">Cookie Notice</h3>
                      <p className="text-sm text-amber-800 mt-1">
                        We use cookies to enhance your experience. You can manage your preferences below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "necessary",
                      name: "Necessary Cookies",
                      description: "Required for the website to function properly",
                      disabled: true,
                    },
                    {
                      key: "analytics",
                      name: "Analytics Cookies",
                      description: "Help us understand how you use our website",
                    },
                    {
                      key: "marketing",
                      name: "Marketing Cookies",
                      description: "Used to deliver personalized advertisements",
                    },
                    {
                      key: "preferences",
                      name: "Preference Cookies",
                      description: "Remember your preferences and settings",
                    },
                  ].map((cookie) => (
                    <div key={cookie.key} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{cookie.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{cookie.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={cookiePreferences[cookie.key as keyof typeof cookiePreferences]}
                        onChange={() => handleCookiePreference(cookie.key as keyof typeof cookiePreferences)}
                        disabled={cookie.disabled}
                        className="w-5 h-5 mt-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Reject All
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Accept All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Security & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: "SSL/TLS Encryption", status: "Active" },
                    { name: "PCI-DSS Compliant", status: "Verified" },
                    { name: "GDPR Compliant", status: "Compliant" },
                    { name: "SOC 2 Type II", status: "Certified" },
                  ].map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">{cert.name}</p>
                        <p className="text-sm text-slate-600">{cert.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Questions About Our Policies?</CardTitle>
            <CardDescription>
              Contact our legal and compliance team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Data Protection Officer</h4>
                <p className="text-slate-600 text-sm mb-3">For GDPR and privacy matters</p>
                <p className="text-sm"><strong>Email:</strong> dpo@b2bwholesale.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Legal Team</h4>
                <p className="text-slate-600 text-sm mb-3">For general legal inquiries</p>
                <p className="text-sm"><strong>Email:</strong> legal@b2bwholesale.com</p>
              </div>
            </div>
            <Button className="mt-6 w-full md:w-auto">
              Contact Us
            </Button>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last updated: November 2024</p>
          <p>These policies are effective immediately and will remain in effect unless and until modified by us.</p>
        </div>
      </div>
    </div>
  );
}
