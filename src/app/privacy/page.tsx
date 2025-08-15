import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Professional Portfolio',
  description: 'Learn how we collect, use, and protect your personal information when you visit our portfolio website.',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Your privacy is important to us
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Last Updated */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-8">
              <p className="text-blue-800 dark:text-blue-300 mb-2 font-medium">
                Last Updated: December 15, 2024
              </p>
              <p className="text-blue-700 dark:text-blue-400">
                This Privacy Policy describes how your personal information is collected, used, and shared when you visit or interact with this portfolio website.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <a href="#information-we-collect" className="block text-blue-600 dark:text-blue-400 hover:underline">1. Information We Collect</a>
                <a href="#how-we-use-information" className="block text-blue-600 dark:text-blue-400 hover:underline">2. How We Use Your Information</a>
                <a href="#information-sharing" className="block text-blue-600 dark:text-blue-400 hover:underline">3. Information Sharing</a>
                <a href="#data-security" className="block text-blue-600 dark:text-blue-400 hover:underline">4. Data Security</a>
                <a href="#cookies" className="block text-blue-600 dark:text-blue-400 hover:underline">5. Cookies and Tracking</a>
                <a href="#your-rights" className="block text-blue-600 dark:text-blue-400 hover:underline">6. Your Rights</a>
                <a href="#contact" className="block text-blue-600 dark:text-blue-400 hover:underline">7. Contact Us</a>
              </nav>
            </div>

            <section id="information-we-collect" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-green-600" />
                1. Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                  <p>When you contact us through our contact form or service inquiry form, we collect:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number (optional)</li>
                    <li>Company name (optional)</li>
                    <li>Message content</li>
                    <li>Service requirements and project details</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
                  <p>When you visit our website, we automatically collect:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on each page</li>
                    <li>Referring website</li>
                    <li>Device information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="how-we-use-information" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                2. How We Use Your Information
              </h2>
              
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Respond to your inquiries and provide requested services</li>
                <li>Send you information about our services (only if requested)</li>
                <li>Improve our website and user experience</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section id="information-sharing" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-600" />
                3. Information Sharing
              </h2>
              
              <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties except in the following situations:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist in website operations, email delivery, or analytics (such as Supabase for data storage and EmailJS for form submissions)</li>
                <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, sale, or business transfer</li>
                <li><strong>Protection:</strong> To protect our rights, property, or safety, or that of others</li>
              </ul>
            </section>

            <section id="data-security" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                4. Data Security
              </h2>
              
              <p>We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure database storage with Supabase</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to personal information</li>
                <li>Industry-standard security practices</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section id="cookies" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-orange-600" />
                5. Cookies and Tracking
              </h2>
              
              <div className="space-y-4">
                <p>Our website uses cookies and similar tracking technologies to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Remember your preferences (theme, language)</li>
                  <li>Analyze website traffic and performance</li>
                  <li>Provide personalized content</li>
                  <li>Maintain user sessions for authenticated features</li>
                </ul>
                <p>You can control cookie settings through your browser preferences. Note that disabling cookies may affect website functionality.</p>
              </div>
            </section>

            <section id="your-rights" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                6. Your Rights
              </h2>
              
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                <p className="text-amber-800 dark:text-amber-300">
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-green-600" />
                7. Contact Us
              </h2>
              
              <p className="mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p><strong>Email:</strong> privacy@yourportfolio.com</p>
                  <p><strong>Website:</strong> <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Form</Link></p>
                  <p><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</p>
                </div>
              </div>
            </section>

            {/* Changes Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Changes to This Policy</h3>
              <p className="text-blue-700 dark:text-blue-400">
                We may update this Privacy Policy from time to time. We will notify users of any significant changes by posting the new policy on this page with an updated "Last Updated" date. Your continued use of our website after any changes indicates acceptance of the updated policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}