import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * LegalPage - Comprehensive Privacy Policy & Terms of Service
 * Covers minimum legal requirements for NurturInk
 * This can be expanded later with more detailed sections
 */
const LegalPage = () => {
  const [openSections, setOpenSections] = useState([]);

  const sections = [
    {
      id: 'privacy-overview',
      title: 'Privacy Policy Overview',
      category: 'Privacy',
      content: `At NurturInk, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.

We collect information you provide directly (name, email, address, payment information), information about your usage (IP address, browser type, pages visited), and information from third parties (CRM integrations, payment processors).

We use this information to provide and improve our service, process transactions, send communications, and comply with legal obligations. We do not sell your personal data to third parties.

Your data is stored securely using industry-standard encryption. We retain your data only as long as necessary to provide services or as required by law.`
    },
    {
      id: 'data-security',
      title: 'Data Security & Protection',
      category: 'Privacy',
      content: `NurturInk implements comprehensive security measures to protect your personal information:

- All data transmissions are encrypted using SSL/TLS protocols
- We use secure authentication methods for account access
- Payment information is processed through PCI-DSS compliant payment processors
- We conduct regular security audits and vulnerability assessments
- Our servers are protected by firewalls and intrusion detection systems
- We limit employee access to personal data on a need-to-know basis

However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.`
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities & Acceptable Use',
      category: 'Terms',
      content: `By using NurturInk, you agree to:

- Use the service only for lawful purposes and in compliance with all applicable laws
- Not engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service
- Not transmit obscene, offensive, or defamatory material
- Not attempt to gain unauthorized access to our systems
- Not reverse engineer, decompile, or disassemble our service
- Not use the service to send unsolicited bulk communications or spam
- Not impersonate or misrepresent your identity
- Not violate any third-party intellectual property rights

Violation of these terms may result in suspension or termination of your account without refund.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      category: 'Terms',
      content: `NurturInk owns all intellectual property rights in the service, including software, designs, and content. You retain ownership of any content you create (messages, templates, designs).

By using NurturInk, you grant us a limited license to use your content solely to provide and improve our service. You are responsible for ensuring you have the right to use any third-party content you upload.

You may not reproduce, distribute, or transmit any content without our prior written permission, except for personal, non-commercial use.`
    },
    {
      id: 'payment-terms',
      title: 'Payment & Billing Terms',
      category: 'Terms',
      content: `Payment Terms:
- Credits are purchased in advance and do not expire
- Pricing is subject to change with 30 days notice
- We accept major credit cards and process payments through secure payment processors
- All charges are in USD unless otherwise specified

Refund Policy:
- Unused credits can be refunded within 30 days of purchase
- Credits used for services rendered are non-refundable
- Refunds will be issued to the original payment method
- For refund requests, contact support@nurturink.com

Billing:
- You are responsible for providing accurate billing information
- We reserve the right to suspend service for non-payment
- Failed payment attempts may result in account suspension`
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      category: 'Terms',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, NURTURINK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE.

Our total liability for any claim shall not exceed the amount you paid for the service in the 12 months preceding the claim.

Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of these limitations may not apply to you.`
    },
    {
      id: 'third-party-links',
      title: 'Third-Party Links & Integrations',
      category: 'Terms',
      content: `NurturInk may contain links to third-party websites and services. We are not responsible for the content, accuracy, or practices of these external sites.

When you integrate third-party services (CRM systems, payment processors), you agree to their terms of service and privacy policies. NurturInk is not responsible for how third parties handle your data.

We recommend reviewing the privacy policies and terms of any third-party services before integrating them with NurturInk.`
    },
    {
      id: 'cookies',
      title: 'Cookies & Tracking',
      category: 'Privacy',
      content: `NurturInk uses cookies and similar tracking technologies to:
- Remember your preferences and login information
- Analyze how you use our service to improve functionality
- Provide personalized content and recommendations
- Detect and prevent fraud

You can control cookie settings through your browser. However, disabling cookies may limit your ability to use certain features of NurturInk.

We use analytics tools to understand user behavior. This data is aggregated and does not identify you personally.`
    },
    {
      id: 'contact-communications',
      title: 'Contact & Communications',
      category: 'Privacy',
      content: `We may contact you via email, phone, or in-app notifications for:
- Account updates and service announcements
- Response to your inquiries
- Marketing communications (with your consent)
- Legal notices and policy updates

You can opt out of marketing communications at any time by clicking "unsubscribe" in our emails or adjusting your account preferences. However, we will continue to send transactional and legal notices.

For privacy concerns or inquiries, contact: privacy@nurturink.com`
    },
    {
      id: 'termination',
      title: 'Account Termination & Service Changes',
      category: 'Terms',
      content: `We reserve the right to:
- Suspend or terminate your account for violation of these terms
- Modify or discontinue the service with 30 days notice
- Remove content that violates our policies

Upon termination:
- Your account access will be revoked
- Unused credits will be forfeited (unless otherwise required by law)
- We will delete your personal data within 30 days, except where retention is required by law
- You remain liable for any outstanding charges

You may terminate your account at any time by contacting support@nurturink.com`
    },
    {
      id: 'changes-policy',
      title: 'Changes to This Policy',
      category: 'General',
      content: `We may update this policy from time to time. We will notify you of material changes via email or by posting the updated policy on our website.

Your continued use of NurturInk after changes become effective constitutes your acceptance of the updated terms.

Last Updated: January 2026`
    },
    {
      id: 'contact-support',
      title: 'Contact & Support',
      category: 'General',
      content: `For questions about this Privacy Policy and Terms of Service, contact us at:

Email: legal@nurturink.com
Phone: (916) 990-2020
Address: [Your Business Address]

We will respond to inquiries within 5 business days.

For urgent privacy concerns or data requests, please include "URGENT" in the subject line.`
    }
  ];

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const categories = ['Privacy', 'Terms', 'General'];
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Privacy':
        return 'bg-blue-50 border-blue-200';
      case 'Terms':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Privacy':
        return 'bg-blue-100 text-blue-800';
      case 'Terms':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a2332] to-[#2d3e52] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy & Terms of Service
          </h1>
          <p className="text-xl text-gray-300">
            Last Updated: January 2026
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2332] mb-6">Quick Navigation</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="font-semibold text-[#1a2332] mb-3">{category}</h3>
                <ul className="space-y-2">
                  {sections
                    .filter(s => s.category === category)
                    .map(section => (
                      <li key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="text-[#FF7A00] hover:underline text-sm"
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-4">
          {sections.map((section) => (
            <Collapsible
              key={section.id}
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <div className={`rounded-lg border overflow-hidden transition-all ${getCategoryColor(section.category)}`}>
                <CollapsibleTrigger className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-opacity-75 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(section.category)}`}>
                      {section.category}
                    </span>
                    <h3 className="text-lg font-semibold text-[#1a2332]">
                      {section.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform text-[#FF7A00] ${
                      openSections.includes(section.id) ? 'transform rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-5 border-t border-opacity-20">
                    <p className="text-[#4a5568] leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-[#1a2332] mb-3">⚠️ Important Disclaimer</h3>
          <p className="text-[#4a5568] text-sm leading-relaxed">
            This policy provides basic legal coverage for NurturInk. It is not a substitute for professional legal advice. We strongly recommend consulting with a qualified attorney to ensure full compliance with all applicable laws in your jurisdiction, including GDPR, CCPA, and other data protection regulations. This document should be customized based on your specific business operations and legal requirements.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[#FF7A00] to-[#E56A00] rounded-lg text-white">
          <h3 className="text-2xl font-bold mb-3">Questions About Our Policies?</h3>
          <p className="mb-4 text-lg">
            We're here to help. Contact our legal team for any clarifications or concerns.
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> legal@nurturink.com</p>
            <p><strong>Phone:</strong> (916) 990-2020</p>
            <p><strong>Response Time:</strong> Within 5 business days</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-[#4a5568] text-sm">
          <p>
            By using NurturInk, you acknowledge that you have read and agree to these terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
