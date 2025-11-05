import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, Building2, Users, TrendingUp, Globe } from "lucide-react";

export default function Certifications() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Certifications & Trust</h1>
          <p className="text-xl text-slate-600">
            We maintain the highest standards of quality, compliance, and business ethics
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">International Certifications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Award,
                title: "CE Certification",
                subtitle: "European Conformity",
                description: "All products comply with European Union safety, health, and environmental protection standards. Valid for electrical and electronic equipment.",
                details: ["Electromagnetic Compatibility", "Low Voltage Directive", "RoHS Compliance"]
              },
              {
                icon: Award,
                title: "FCC Approval",
                subtitle: "US Federal Communications Commission",
                description: "Products meet FCC regulations for radio frequency emissions and interference. Required for sale in the United States.",
                details: ["Part 15 Compliance", "EMI/RFI Testing", "Safety Standards"]
              },
              {
                icon: Award,
                title: "RoHS Compliance",
                subtitle: "Restriction of Hazardous Substances",
                description: "All electronic products are free from lead, mercury, cadmium, and other restricted substances. Meets both EU and China standards.",
                details: ["Hazardous Substance Testing", "Material Declaration", "Supply Chain Verification"]
              },
              {
                icon: Award,
                title: "ISO 9001:2015",
                subtitle: "Quality Management System",
                description: "Our quality management system is certified to ISO 9001:2015 standards, ensuring consistent product quality and customer satisfaction.",
                details: ["Process Management", "Quality Control", "Continuous Improvement"]
              }
            ].map((cert, idx) => (
              <Card key={idx} className="border-slate-200 hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <cert.icon className="w-12 h-12 text-green-600 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-xl">{cert.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{cert.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{cert.description}</p>
                  <div className="space-y-2">
                    {cert.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Company Credentials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Company Credentials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Registered Business",
                description: "Officially registered wholesale supplier in Dongguan, China with valid business license and tax registration"
              },
              {
                icon: Users,
                title: "Experienced Team",
                description: "10+ years of experience in B2B wholesale trade with dedicated account managers for each client"
              },
              {
                icon: TrendingUp,
                title: "Proven Track Record",
                description: "Serving 50+ countries with 10,000+ satisfied customers and 99.2% on-time delivery rate"
              },
              {
                icon: Globe,
                title: "Global Partnerships",
                description: "Partnerships with leading logistics providers and financial institutions for secure international transactions"
              },
              {
                icon: Award,
                title: "Industry Recognition",
                description: "Member of China Chamber of Commerce and recognized supplier on major B2B platforms"
              },
              {
                icon: CheckCircle,
                title: "Quality Assurance",
                description: "100% product inspection before shipment with detailed quality reports provided to customers"
              }
            ].map((cred, idx) => (
              <Card key={idx} className="border-slate-200 text-center hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <cred.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{cred.title}</h3>
                  <p className="text-sm text-slate-600">{cred.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quality Assurance Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Quality Assurance Process</h2>
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {[
                { step: 1, title: "Supplier Verification", desc: "Verify supplier credentials and product authenticity" },
                { step: 2, title: "Incoming Inspection", desc: "100% visual and functional testing of all products" },
                { step: 3, title: "Quality Testing", desc: "Compliance testing for certifications (CE, FCC, RoHS)" },
                { step: 4, title: "Packaging", desc: "Secure packaging with protective materials and labeling" },
                { step: 5, title: "Final Check", desc: "Random sampling and documentation before shipment" }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Result:</strong> Only products meeting our strict quality standards are shipped to customers. We maintain detailed quality records for traceability and warranty purposes.
              </p>
            </div>
          </div>
        </section>

        {/* Warranty & Support */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Warranty & After-Sales Support</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Product Warranty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-900">Standard Warranty: 12 Months</p>
                  <p className="text-sm text-slate-600 mt-1">Covers manufacturing defects and functional failures under normal use</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Extended Warranty Available</p>
                  <p className="text-sm text-slate-600 mt-1">Optional extended coverage up to 36 months for critical products</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Replacement Policy</p>
                  <p className="text-sm text-slate-600 mt-1">Defective products replaced at no cost within warranty period</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-900">24/7 Support Available</p>
                  <p className="text-sm text-slate-600 mt-1">Email and phone support in English, Chinese, Spanish, and Russian</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Technical Assistance</p>
                  <p className="text-sm text-slate-600 mt-1">Expert guidance on product selection, installation, and troubleshooting</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Return & Exchange</p>
                  <p className="text-sm text-slate-600 mt-1">30-day return window for unopened products, 14-day exchange for defects</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Customers Trust Us</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "50+", label: "Countries Served" },
              { number: "10,000+", label: "Happy Customers" },
              { number: "99.2%", label: "On-Time Delivery" },
              { number: "10+", label: "Years Experience" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <p className="text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact for Verification */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Verify Our Credentials</h3>
          <p className="text-blue-800 mb-6">
            All certifications and business credentials can be independently verified. Contact us for:
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-slate-900">Certificate Copies</p>
              <p className="text-sm text-slate-600 mt-1">Certified copies of all certifications and compliance documents</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-slate-900">Factory Inspection</p>
              <p className="text-sm text-slate-600 mt-1">Arrange on-site facility inspection and quality control verification</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-slate-900">Reference Customers</p>
              <p className="text-sm text-slate-600 mt-1">Connect with existing customers for direct feedback and testimonials</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-blue-900 font-semibold mb-2">Contact Information:</p>
            <p className="text-blue-800">Email: verify@b2bwholesale.com | Phone: +86 769 1234 5678</p>
          </div>
        </section>
      </div>
    </div>
  );
}
