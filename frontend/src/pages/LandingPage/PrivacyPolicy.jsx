import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200/50">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We collect information from you when you register on our platform, use our services, or interact with our website.
                  The types of information we collect include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and company information</li>
                  <li><strong>Biometric Data:</strong> Facial recognition data for authentication and attendance purposes</li>
                  <li><strong>Usage Data:</strong> Information about how you use our services, including login times and attendance records</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, operating system, and device information</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process attendance and access control requests</li>
                  <li>Send you service-related communications</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                  <li>Provide customer support</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">3. Biometric Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We take the protection of biometric data extremely seriously. Your facial recognition data is:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Stored securely with encryption</li>
                  <li>Only accessible to authorized personnel</li>
                  <li>Never shared with third parties without your consent</li>
                  <li>Retained only as long as necessary for service provision</li>
                  <li>Subject to strict access controls and audit trails</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption in transit and at rest</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security audits and assessments</li>
                  <li>Access controls and monitoring</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">5. Data Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Service providers who assist us in operating our platform</li>
                  <li>Legal authorities when required by law</li>
                  <li>Other parties with your explicit consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">6. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability (where applicable)</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">7. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
                  Biometric data is retained according to applicable laws and regulations.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">8. Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our platform.
                  You can control cookie preferences through your browser settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">9. Children's Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our services are not intended for children under 13, and we do not knowingly collect personal information from children.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">10. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any significant changes through our platform
                  or other communication methods. Your continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">11. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have questions about this privacy policy, please contact us at:
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

export default PrivacyPolicy;