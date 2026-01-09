import React from 'react';

const Security = () => {
  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200/50">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Security
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">1. Data Protection and Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  At CipherGate, we prioritize the security of your data and implement comprehensive measures to protect
                  your personal information and biometric data from unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">2. Encryption and Data Storage</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use industry-standard encryption protocols to protect your data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3</li>
                  <li><strong>Encryption at Rest:</strong> All stored data, including biometric information, is encrypted using AES-256 encryption</li>
                  <li><strong>Secure Key Management:</strong> Encryption keys are managed using industry-standard key management practices</li>
                  <li><strong>Database Security:</strong> Our databases are protected with multiple layers of security including firewalls and access controls</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">3. Biometric Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We take special care in protecting biometric data, which is sensitive by nature. Our biometric data protection measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Template-based Storage:</strong> Facial recognition data is converted to mathematical templates, not stored as images</li>
                  <li><strong>Isolated Storage:</strong> Biometric data is stored separately from other personal information</li>
                  <li><strong>Access Controls:</strong> Only authorized personnel have access to biometric data processing systems</li>
                  <li><strong>Regular Audits:</strong> Access to biometric data is logged and regularly audited</li>
                  <li><strong>Data Minimization:</strong> We only collect and store the minimum amount of biometric data necessary</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">4. Access Control and Authentication</h2>
              <div className="space-y-4 text-gray-700">
                <p>Our access control measures include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Multi-Factor Authentication:</strong> Required for all administrative access to our systems</li>
                  <li><strong>Role-Based Access Control:</strong> Access is granted based on job requirements and responsibilities</li>
                  <li><strong>Regular Access Reviews:</strong> Access permissions are regularly reviewed and updated</li>
                  <li><strong>Session Management:</strong> Secure session management with automatic timeout</li>
                  <li><strong>API Security:</strong> All API endpoints are protected with authentication and rate limiting</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">5. Network Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We maintain robust network security measures:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Firewalls:</strong> Advanced firewall protection at network perimeters</li>
                  <li><strong>Intrusion Detection:</strong> 24/7 monitoring for suspicious network activity</li>
                  <li><strong>DDoS Protection:</strong> Distributed Denial of Service protection</li>
                  <li><strong>Secure Communication:</strong> All internal and external communications are encrypted</li>
                  <li><strong>Network Segmentation:</strong> Critical systems are isolated from general network access</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">6. Physical Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>Physical security measures include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Secure Data Centers:</strong> All servers are housed in secure, monitored data centers</li>
                  <li><strong>Access Controls:</strong> Physical access to servers requires multi-factor authentication</li>
                  <li><strong>Surveillance:</strong> 24/7 video surveillance of all critical areas</li>
                  <li><strong>Environmental Controls:</strong> Fire suppression, temperature, and humidity controls</li>
                  <li><strong>Backup Systems:</strong> Secure, encrypted backup systems with geographically distributed storage</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">7. Security Monitoring and Incident Response</h2>
              <div className="space-y-4 text-gray-700">
                <p>Our security monitoring and incident response capabilities include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>24/7 Monitoring:</strong> Continuous security monitoring by trained professionals</li>
                  <li><strong>Automated Alerts:</strong> Real-time alerts for potential security incidents</li>
                  <li><strong>Incident Response Team:</strong> Dedicated team ready to respond to security incidents</li>
                  <li><strong>Regular Testing:</strong> Regular penetration testing and vulnerability assessments</li>
                  <li><strong>Security Updates:</strong> Timely application of security patches and updates</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">8. Compliance and Certifications</h2>
              <div className="space-y-4 text-gray-700">
                <p>We maintain compliance with relevant standards and regulations:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Data Protection Laws:</strong> Compliance with applicable data protection regulations</li>
                  <li><strong>Industry Standards:</strong> Adherence to industry security standards and best practices</li>
                  <li><strong>Regular Audits:</strong> Regular third-party security audits and assessments</li>
                  <li><strong>Employee Training:</strong> Ongoing security training for all personnel</li>
                  <li><strong>Privacy by Design:</strong> Security measures built into all aspects of our platform</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">9. User Security Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
                <p>As a user, you play an important role in maintaining security:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Strong Passwords:</strong> Use strong, unique passwords for your account</li>
                  <li><strong>Account Security:</strong> Keep your login credentials secure and private</li>
                  <li><strong>Software Updates:</strong> Keep your devices and software up to date</li>
                  <li><strong>Phishing Awareness:</strong> Be cautious of suspicious emails or messages</li>
                  <li><strong>Report Incidents:</strong> Report any suspected security incidents immediately</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">10. Transparency and Communication</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We believe in transparency and clear communication about security matters:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li><strong>Security Updates:</strong> Regular updates on our security practices and improvements</li>
                  <li><strong>Incident Communication:</strong> Prompt communication in case of any security incidents</li>
                  <li><strong>Security Resources:</strong> Providing resources to help you understand and maintain security</li>
                  <li><strong>Feedback Channel:</strong> Open channels for security-related feedback and concerns</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">11. Contact Security Team</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any security concerns or wish to report a security issue, please contact our security team:
                </p>
                <div className="bg-white/50 p-6 rounded-lg mt-4 border border-gray-100">
                  <p className="font-semibold">Email: techvaseegrah@gmail.com</p>
                  <p className="font-semibold">Phone: +91 85240 89733</p>
                  <p className="font-semibold">Address: 9, Vijaya Nagar, Reddypalayam Road, Thanjavur-613009</p>
                  <p className="font-semibold mt-2">For urgent security issues, please call our emergency line during business hours</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;