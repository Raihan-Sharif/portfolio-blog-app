import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, Gavel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Professional Portfolio',
  description: 'Read our terms of service to understand the rules and guidelines for using our portfolio website and services.',
  robots: 'index, follow',
};

export default function TermsOfServicePage(): JSX.Element {
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
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Please read these terms carefully before using our services
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
            <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-lg border border-purple-200 dark:border-purple-800 mb-8">
              <p className="text-purple-800 dark:text-purple-300 mb-2 font-medium">
                Last Updated: December 15, 2024
              </p>
              <p className="text-purple-700 dark:text-purple-400">
                These Terms of Service govern your use of our portfolio website and any services provided through this platform.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-muted/50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <a href="#acceptance" className="block text-blue-600 dark:text-blue-400 hover:underline">1. Acceptance of Terms</a>
                <a href="#services" className="block text-blue-600 dark:text-blue-400 hover:underline">2. Services Description</a>
                <a href="#user-conduct" className="block text-blue-600 dark:text-blue-400 hover:underline">3. User Conduct</a>
                <a href="#intellectual-property" className="block text-blue-600 dark:text-blue-400 hover:underline">4. Intellectual Property</a>
                <a href="#privacy" className="block text-blue-600 dark:text-blue-400 hover:underline">5. Privacy</a>
                <a href="#disclaimers" className="block text-blue-600 dark:text-blue-400 hover:underline">6. Disclaimers</a>
                <a href="#limitation-liability" className="block text-blue-600 dark:text-blue-400 hover:underline">7. Limitation of Liability</a>
                <a href="#termination" className="block text-blue-600 dark:text-blue-400 hover:underline">8. Termination</a>
                <a href="#changes" className="block text-blue-600 dark:text-blue-400 hover:underline">9. Changes to Terms</a>
                <a href="#contact" className="block text-blue-600 dark:text-blue-400 hover:underline">10. Contact Information</a>
              </nav>
            </div>

            <section id="acceptance" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Scale className="w-6 h-6 text-green-600" />
                1. Acceptance of Terms
              </h2>
              
              <div className="space-y-4">
                <p>By accessing and using this portfolio website ("the Site"), you accept and agree to be bound by the terms and provision of this agreement.</p>
                <p>If you do not agree to abide by the above, please do not use this service.</p>
                
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300">
                    <strong>Agreement:</strong> Your use of this website constitutes your agreement to follow and be bound by these terms.
                  </p>
                </div>
              </div>
            </section>

            <section id="services" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                2. Services Description
              </h2>
              
              <div className="space-y-4">
                <p>This website serves as a professional portfolio showcasing:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Professional services and capabilities</li>
                  <li>Portfolio of completed projects</li>
                  <li>Blog articles and technical content</li>
                  <li>Contact information and inquiry forms</li>
                  <li>Professional experience and skills</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Service Inquiries</h3>
                <p>When you submit a service inquiry through our forms:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>We will respond within 48 hours during business days</li>
                  <li>All project quotes and timelines are estimates subject to detailed requirements</li>
                  <li>Services are provided based on separate service agreements</li>
                  <li>This website does not constitute a contract for services</li>
                </ul>
              </div>
            </section>

            <section id="user-conduct" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                3. User Conduct
              </h2>
              
              <div className="space-y-4">
                <p>You agree not to use this website to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Transmit any harmful, offensive, or illegal content</li>
                  <li>Attempt to gain unauthorized access to any part of the website</li>
                  <li>Interfere with the website's operation or other users' experience</li>
                  <li>Submit spam, automated requests, or malicious code</li>
                  <li>Collect or harvest information about other users</li>
                  <li>Use the website for any commercial purpose without permission</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                  <p className="text-amber-800 dark:text-amber-300">
                    <strong>Enforcement:</strong> We reserve the right to restrict or terminate access for users who violate these terms.
                  </p>
                </div>
              </div>
            </section>

            <section id="intellectual-property" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                4. Intellectual Property
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Website Content</h3>
                <p>All content on this website, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Text, images, graphics, logos, and designs</li>
                  <li>Code examples and technical implementations</li>
                  <li>Blog articles and written content</li>
                  <li>Project descriptions and case studies</li>
                </ul>
                <p>Is owned by the website owner and protected by copyright laws.</p>

                <h3 className="text-xl font-semibold mt-6">Use Permissions</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Allowed:</strong> Viewing content for personal or professional evaluation</li>
                  <li><strong>Allowed:</strong> Sharing links to specific pages</li>
                  <li><strong>Allowed:</strong> Brief quotations with proper attribution</li>
                  <li><strong>Not Allowed:</strong> Copying, reproducing, or redistributing content without permission</li>
                  <li><strong>Not Allowed:</strong> Using content for commercial purposes</li>
                </ul>
              </div>
            </section>

            <section id="privacy" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                5. Privacy
              </h2>
              
              <div className="space-y-4">
                <p>Your privacy is important to us. Please review our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.</p>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-indigo-800 dark:text-indigo-300">
                    <strong>Data Collection:</strong> We only collect information necessary to provide our services and improve user experience.
                  </p>
                </div>
              </div>
            </section>

            <section id="disclaimers" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                6. Disclaimers
              </h2>
              
              <div className="space-y-4">
                <p>This website and its content are provided "as is" without any warranties, expressed or implied.</p>
                
                <h3 className="text-xl font-semibold">We Disclaim:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Any warranties regarding the accuracy, completeness, or timeliness of content</li>
                  <li>Any warranties that the website will be error-free or uninterrupted</li>
                  <li>Any warranties regarding the results of using the website</li>
                  <li>Any implied warranties of merchantability or fitness for a particular purpose</li>
                </ul>

                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800 mt-6">
                  <p className="text-red-800 dark:text-red-300">
                    <strong>Important:</strong> Information on this website should not be considered as professional advice for your specific situation.
                  </p>
                </div>
              </div>
            </section>

            <section id="limitation-liability" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-orange-600" />
                7. Limitation of Liability
              </h2>
              
              <div className="space-y-4">
                <p>In no event shall the website owner be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your use or inability to use the website</li>
                  <li>Any errors or omissions in content</li>
                  <li>Any interruption or cessation of transmission</li>
                  <li>Any bugs, viruses, or similar harmful components</li>
                  <li>Any loss of data or business interruption</li>
                </ul>

                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mt-6">
                  <p className="text-orange-800 dark:text-orange-300">
                    <strong>Maximum Liability:</strong> Our total liability for any claim shall not exceed the amount you paid (if any) to access this website.
                  </p>
                </div>
              </div>
            </section>

            <section id="termination" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
                8. Termination
              </h2>
              
              <div className="space-y-4">
                <p>We reserve the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Terminate or suspend your access to the website at any time</li>
                  <li>Remove any content that violates these terms</li>
                  <li>Modify or discontinue any part of the website without notice</li>
                </ul>

                <p>Upon termination, your right to use the website ceases immediately.</p>
              </div>
            </section>

            <section id="changes" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-600" />
                9. Changes to Terms
              </h2>
              
              <div className="space-y-4">
                <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.</p>
                <p>Your continued use of the website after any changes indicates acceptance of the new terms.</p>
                
                <div className="bg-teal-50 dark:bg-teal-900/10 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                  <p className="text-teal-800 dark:text-teal-300">
                    <strong>Notification:</strong> We recommend checking this page periodically for updates.
                  </p>
                </div>
              </div>
            </section>

            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                10. Contact Information
              </h2>
              
              <div className="space-y-4">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Email:</strong> legal@yourportfolio.com</p>
                    <p><strong>Website:</strong> <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Form</Link></p>
                    <p><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <div className="bg-slate-50 dark:bg-slate-900/20 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-300 mb-2">Governing Law</h3>
              <p className="text-slate-700 dark:text-slate-400">
                These terms are governed by and construed in accordance with the laws of [Your Jurisdiction]. 
                Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of [Your Jurisdiction].
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}