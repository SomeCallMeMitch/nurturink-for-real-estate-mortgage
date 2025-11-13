import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LPFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does it take to send cards?",
      answer: "Once you approve your batch, cards are typically written and mailed within 24-48 hours. Delivery time is standard USPS First Class Mail (3-5 business days)."
    },
    {
      question: "Are these really handwritten?",
      answer: "Yes! We use advanced robotics with real pens and real ink. Each card has natural pen pressure, ink bleed, and slight imperfections that make it indistinguishable from human handwriting."
    },
    {
      question: "Can I customize the message for each recipient?",
      answer: "Absolutely. You can write individual messages or use merge fields to personalize templates. Add their name, company, or custom details automatically."
    },
    {
      question: "What if I need to send to a large list?",
      answer: "We handle bulk orders with ease. Upload your CSV, customize messages in bulk or individually, and we'll process everything. Perfect for seasonal campaigns or post-storm outreach."
    },
    {
      question: "Do you offer discounts for larger volumes?",
      answer: "Yes! Our pricing automatically scales down per card as you purchase more credits. The Growth Pack offers the best value at under $1.20 per card."
    },
    {
      question: "Can I use my own company branding?",
      answer: "Yes. You can customize envelopes with your return address and choose from various card designs. Enterprise plans include fully custom designs."
    },
    {
      question: "What's included in the price?",
      answer: "Everything: card, envelope, real postage stamp, handwritten message, addressing, and mailing. No hidden fees ever."
    },
    {
      question: "Is there a subscription or contract?",
      answer: "Nope. Pay as you go. Buy credits when you need them. No monthly fees, no contracts, no commitments."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}