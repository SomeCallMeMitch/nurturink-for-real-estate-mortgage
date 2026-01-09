/**
 * LPStatsBannerPremium - Animated stats banner with count-up effects
 * Features: scroll-triggered counters, glassmorphism, gradient backgrounds
 */
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Mail } from 'lucide-react';
import { 
  ScrollReveal, 
  StaggerContainer, 
  StaggerItem,
  CountUp,
  GlassCard,
  MeshGradient,
  GradientText,
} from '@/components/premium';

const stats = [
  {
    icon: Mail,
    value: 98,
    suffix: '%',
    label: 'Open Rate',
    description: 'Handwritten notes get opened',
    color: '#FF7A00',
  },
  {
    icon: TrendingUp,
    value: 37,
    suffix: '%',
    label: 'More Appointments',
    description: 'Increase in booked meetings',
    color: '#16a34a',
  },
  {
    icon: DollarSign,
    value: 12,
    suffix: 'x',
    label: 'ROI',
    description: 'Average return on investment',
    color: '#3b82f6',
  },
  {
    icon: Users,
    value: 500,
    suffix: '+',
    label: 'Sales Pros',
    description: 'Trust NurturInk daily',
    color: '#8b5cf6',
  },
];

const LPStatsBannerPremium = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e293b] to-[#0f172a]" />
      <MeshGradient 
        colors={['#FF7A00', '#16a34a', '#3b82f6', '#8b5cf6']} 
        className="opacity-30"
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Why Handwritten Notes{' '}
            <GradientText colors={['#FF7A00', '#f59e0b']}>
              Actually Work
            </GradientText>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            In a world of digital noise, a personal touch cuts through. 
            Here's what our clients experience.
          </p>
        </ScrollReveal>

        {/* Stats Grid */}
        <StaggerContainer 
          staggerDelay={0.15}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <GlassCard
                variant="dark"
                hover={true}
                glowColor={`${stat.color}40`}
                className="p-6 h-full"
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}30 0%, ${stat.color}10 100%)`,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                  </motion.div>

                  {/* Value with count-up */}
                  <div className="mb-2">
                    <span className="text-4xl lg:text-5xl font-bold text-white">
                      <CountUp
                        value={stat.value}
                        duration={2.5}
                        delay={0.5 + index * 0.2}
                        suffix={stat.suffix}
                      />
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mt-auto">
                    {stat.description}
                  </p>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA hint */}
        <ScrollReveal animation="fadeUp" delay={0.8} className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Join 500+ sales professionals who are closing more deals with handwritten notes
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LPStatsBannerPremium;