/**
 * LPHowItWorksSectionPremium - Enhanced how it works section
 * Features: scroll-triggered animations, connecting lines, step indicators
 */
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Send, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { 
  ScrollReveal, 
  GradientText,
  DepthCard,
  ScaleOnScroll,
} from '@/components/premium';

const steps = [
  {
    number: '01',
    icon: Users,
    title: 'Import Your Clients',
    description: 'Upload your contact list or connect your CRM... We support CSV imports and direct integrations with popular platforms.',
    color: '#FF7A00',
    highlights: ['CSV Import', 'CRM Sync', 'Manual Entry'],
  },
  {
    number: '02',
    icon: FileText,
    title: 'Choose Your Message',
    description: 'Select from proven templates or write your own. Personalize each note with merge fields for names, companies, and more.',
    color: '#16a34a',
    highlights: ['50+ Templates', 'Custom Messages', 'Merge Fields'],
  },
  {
    number: '03',
    icon: Send,
    title: 'We Handle the Rest',
    description: 'Our team hand-writes each note, addresses envelopes, and mails them via USPS. You get tracking updates every step of the way.',
    color: '#3b82f6',
    highlights: ['Hand-Written', 'USPS Delivery', 'Full Tracking'],
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Track Your Results',
    description: 'Monitor delivery status, track responses, and measure ROI. See which messages drive the best results for your business.',
    color: '#8b5cf6',
    highlights: ['Analytics', 'Response Tracking', 'ROI Reports'],
  },
];

const LPHowItWorksSectionPremium = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section 
      id="how-it-works" 
      ref={containerRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50" />

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="text-center mb-20">
          <motion.span 
            className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            How It Works
          </motion.span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a2332] mb-4">
            From Click to{' '}
            <GradientText colors={['#FF7A00', '#16a34a']}>
              Mailbox
            </GradientText>
            {' '}in 4 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've streamlined the entire process so you can send heartfelt notes 
            without the hassle.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Animated connecting line - desktop only */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div className="h-full w-full bg-gray-200 rounded-full" />
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-orange-500 via-green-500 to-purple-500 rounded-full"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <ScrollReveal
                key={index}
                animation={index % 2 === 0 ? 'fadeLeft' : 'fadeRight'}
                delay={index * 0.1}
              >
                <div className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  {/* Content side */}
                  <div className="flex-1 lg:text-left">
                    <ScaleOnScroll scaleRange={[0.95, 1]} opacityRange={[0.8, 1]}>
                      <DepthCard depth="medium" hover={true} className="p-6 lg:p-8">
                        {/* Step number badge */}
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4"
                          style={{ 
                            background: `${step.color}15`,
                            color: step.color,
                          }}
                        >
                          <span>Step {step.number}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[#1a2332] mb-3">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2">
                          {step.highlights.map((highlight, i) => (
                            <motion.span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {highlight}
                            </motion.span>
                          ))}
                        </div>
                      </DepthCard>
                    </ScaleOnScroll>
                  </div>

                  {/* Center icon - timeline node */}
                  <div className="relative z-10 order-first lg:order-none">
                    <motion.div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                        boxShadow: `0 10px 30px -10px ${step.color}80`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileInView={{ 
                        scale: [0.8, 1.1, 1],
                        rotate: [0, -5, 0],
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      <step.icon className="w-9 h-9 text-white" />
                    </motion.div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <ScrollReveal animation="fadeUp" delay={0.4} className="text-center mt-20">
          <motion.div
            className="inline-flex items-center gap-2 text-[#FF7A00] font-semibold cursor-pointer"
            whileHover={{ x: 5 }}
          >
            <span>Ready to get started?</span>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LPHowItWorksSectionPremium;