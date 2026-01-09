/**
 * LPSocialProofPremium - Enhanced social proof section with animations
 * Features: infinite marquee, counter animations, logo reveals
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Mail, 
  Award,
  Star,
} from 'lucide-react';
import { 
  ScrollReveal, 
  CountUp,
  GradientText,
} from '@/components/premium';

// Placeholder company logos (would be replaced with actual logos)
const companies = [
  'Salesforce', 'HubSpot', 'Zillow', 'Keller Williams', 
  'RE/MAX', 'Coldwell Banker', 'Century 21', 'eXp Realty',
];

const stats = [
  { icon: Mail, value: 50000, suffix: '+', label: 'Notes Sent' },
  { icon: Users, value: 500, suffix: '+', label: 'Happy Clients' },
  { icon: Award, value: 98, suffix: '%', label: 'Satisfaction' },
  { icon: Star, value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
];

const LPSocialProofPremium = () => {
  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Stats Row */}
      <div className="max-w-[1200px] mx-auto px-6 mb-12">
        <ScrollReveal animation="fadeUp">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[#FF7A00]" />
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-[#1a2332]">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                    duration={2}
                    delay={0.3 + index * 0.1}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Company Logos Marquee */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <ScrollReveal animation="fadeUp" delay={0.2}>
          <p className="text-center text-sm text-gray-500 mb-6">
            Trusted by sales teams at leading companies
          </p>
          
          {/* Infinite scroll marquee */}
          <div className="relative overflow-hidden py-4">
            <motion.div
              className="flex gap-12"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {/* Double the items for seamless loop */}
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-100 shadow-sm flex-shrink-0"
                >
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-medium whitespace-nowrap">
                    {company}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
      </div>

      {/* Testimonial highlight */}
      <ScrollReveal animation="scaleUp" delay={0.3} className="mt-12">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            className="relative bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quote mark */}
            <div className="absolute -top-4 left-8 w-8 h-8 bg-[#FF7A00] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-serif">"</span>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
              "NurturInk has completely transformed how I follow up with clients. 
              My response rate has <GradientText colors={['#FF7A00', '#f59e0b']} className="font-semibold">tripled</GradientText> since 
              I started sending handwritten notes. It's the secret weapon every 
              sales professional needs."
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <span className="text-[#FF7A00] font-bold">SJ</span>
              </div>
              <div>
                <p className="font-semibold text-[#1a2332]">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Top Producer, Keller Williams</p>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default LPSocialProofPremium;