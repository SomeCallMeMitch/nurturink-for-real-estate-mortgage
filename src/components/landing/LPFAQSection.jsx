import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const LPFAQSection = () => {
  const faqs = [
    {
      question: "How much do handwritten notes cost?",
      answer: "Our notes start at $3.49 each and go as low as less than $2.49 per note when you buy in bulk. There are no monthly fees or subscriptions just buy credits and use them whenever you need them."
    },
    {
      question: "Are these really handwritten?",
      answer: "Our notes are written by robots using real pens and real ink on quality cardstock. The result is indistinguishable from human handwriting, giving you all the personal touch without the time investment."
    },
    {
      question: "How long does it take to receive a note?",
      answer: "We write, address, and mail your notes within 24-48 hours of your order. Standard USPS delivery times apply after that typically 3-5 business days for domestic mail."
    },
    {
      question: "Can I customize the message?",
      answer: "Absolutely! Every note is fully customizable. Write your own message, use our proven templates, and include your return address. You can even use merge fields to personalize each recipient's note."
    },
    {
      question: "What if I need to send bulk campaigns?",
      answer: "We make bulk sending easy. Upload a spreadsheet, map your fields, and we'll personalize each note automatically. Whether it's 10 or 1,000 notes, our system handles it seamlessly."
    },
    {
      question: "Do you offer team accounts?",
      answer: "Yes! Our team features let you manage multiple users, allocate credits, share templates, and track usage all from one central dashboard. Perfect for agencies, brokerages, and sales teams."
    },
    {
      question: "What kind of results can I expect?",
      answer: "Our clients typically see 99% open rates (vs. ~20% for email), 20-35% increases in appointment bookings, and 10-50x ROI. One closed deal often pays for an entire year of notes."
    }
  ];

  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="bg-white py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[28px] lg:text-[36px] leading-[1.1] font-bold text-[#1a2332] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[17px] leading-[1.0] text-[#4a5568]">
            Everything you need to know about NurturInk
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible
              key={index}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <CollapsibleTrigger className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors">
                  <h3 className="text-[18px] font-semibold text-[#1a2332] pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      openItems.includes(index) ? 'transform rotate-180' : ''
                    }`}
                    style={{ color: '#FF7A00' }}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-5">
                    <p className="text-[#4a5568] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[#4a5568] mb-4">
            Still have questions?
          </p>
          <a 
            href="#contact"
            className="font-semibold hover:underline"
            style={{ color: '#FF7A00' }}
          >
            Get in touch with our team →
          </a>
        </div>
      </div>
    </section>
  );
};

export default LPFAQSection;