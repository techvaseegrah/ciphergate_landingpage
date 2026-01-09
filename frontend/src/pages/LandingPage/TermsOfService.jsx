import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200/50">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Terms of Service
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using CipherGate's services, you accept and agree to be bound by these Terms of Service
                  and our Privacy Policy. If you do not agree to these terms, you should not use our services.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">2. Description of Service</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  CipherGate provides facial recognition-based access control and attendance management services.
                  Our platform offers secure authentication, attendance tracking, and related services for businesses
                  and organizations.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">3. User Registration and Account Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>When registering for our services, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                  <li>Use the service only for lawful purposes</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">4. Biometric Data Usage</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By using our services, you consent to the collection and use of biometric data (facial recognition data)
                  for authentication and attendance purposes. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Your biometric data is collected solely for authentication purposes</li>
                  <li>Data is stored securely with appropriate encryption</li>
                  <li>You have the right to request deletion of your biometric data</li>
                  <li>Biometric data will be retained only as long as necessary for service provision</li>
                  <li>Biometric data will not be shared with third parties without consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">5. Prohibited Activities</h2>
              <div className="space-y-4 text-gray-700">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Reverse engineer, decompile, or disassemble the service</li>
                  <li>Use the service in a way that could damage, disable, or impair our services</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to circumvent security measures</li>
                  <li>Use the service to collect or harvest personal information of other users</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">6. Data Security and Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate security measures to protect your personal information and biometric data.
                  However, you acknowledge that no method of transmission over the internet or electronic storage is 100% secure.
                  While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">7. Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  All content, features, and functionality of the service, including but not limited to source code,
                  software, text, graphics, and logos, are the exclusive property of CipherGate or its licensors
                  and are protected by intellectual property laws.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">8. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  In no event shall CipherGate, its directors, employees, or agents be liable for any indirect,
                  incidental, special, consequential, or punitive damages, including without limitation, loss of
                  profits, data, use, or goodwill, resulting from your use of or inability to use the service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">9. Service Availability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We strive to maintain the availability of our services, but we do not guarantee that the service
                  will be available at all times. We may suspend or terminate service availability for maintenance,
                  security, or other operational reasons with or without notice.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">10. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your access to our service immediately, without prior notice or liability,
                  for any reason whatsoever, including without limitation if you breach the Terms of Service. Upon
                  termination, your right to use the service will cease immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">11. Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These Terms of Service shall be governed and construed in accordance with the laws of India,
                  without regard to its conflict of law provisions. Any disputes arising under these terms shall
                  be subject to the exclusive jurisdiction of courts located in Thanjavur, Tamil Nadu, India.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">12. Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time.
                  If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                  What constitutes a material change will be determined at our sole discretion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">13. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-white/50 p-6 rounded-lg mt-4 border border-gray-100">
                  <p className="font-semibold">Email: techvaseegrah@gmail.com</p>
                  <p className="font-semibold">Phone: +91 85240 89733</p>
                  <p className="font-semibold">Address: 9, Vijaya Nagar, Reddypalayam Road, Thanjavur-613009</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;