/**
 * LPFeaturesSectionPremium - Enhanced features section with premium animations
 * Features: staggered reveals, depth cards, hover effects, floating elements
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pen, 
  Clock, 
  Users, 
  BarChart3, 
  Zap, 
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { 
  ScrollReveal, 
  StaggerContainer, 
  StaggerItem,
  DepthCard,
  GradientText,
  FloatingElement,
  MagneticWrapper,
} from '@/components/premium';

const features = [
  {
    icon: Pen,
    title: 'Authentic Handwriting',
    description: 'Every note is written with real pens by our team, not printed to look handwritten. Recipients can feel the difference.',
    color: '#FF7A00',
    gradient: 'from-orange-500/10 to-amber-500/5',
  },
  {
    icon: Clock,
    title: 'Send in 60 Seconds',
    description: 'Select a client, choose a template, and click send. We handle printing, addressing, and mailing.',
    color: '#16a34a',
    gradient: 'from-green-500/10 to-emerald-500/5',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Invite your sales team, track performance, and ensure consistent follow-up across your organization.',
    color: '#3b82f6',
    gradient: 'from-blue-500/10 to-cyan-500/5',
  },
  {
    icon: BarChart3,
    title: 'Track Results',
    description: 'See which notes drive responses, appointments, and closed deals with our built-in analytics.',
    color: '#8b5cf6',
    gradient: 'from-purple-500/10 to-violet-500/5',
  },
  {
    icon: Zap,
    title: 'Quick Send Templates',
    description: 'Pre-built templates for every occasion: thank you notes, referral requests, birthday wishes, and more.',
    color: '#f59e0b',
    gradient: 'from-amber-500/10 to-yellow-500/5',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with encrypted data storage. Your client information is always protected.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/10 to-teal-500/5',
  },
];

const LPFeaturesSectionPremium = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Floating decorative elements */}
      <FloatingElement duration={8} yRange={20} className="absolute top-32 left-[10%] opacity-20">
        <Sparkles className="w-8 h-8 text-orange-500" />
      </FloatingElement>
      <FloatingElement duration={10} yRange={25} xRange={10} className="absolute bottom-40 right-[15%] opacity-20">
        <Target className="w-10 h-10 text-blue-500" />
      </FloatingElement>

      <div className="relative max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="text-center mb-16">
          <motion.span 
            className="inline-block px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Features
          </motion.span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a2332] mb-4">
            Everything You Need to{' '}
            <GradientText colors={['#FF7A00', '#f59e0b']}>
              Stand Out
            </GradientText>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help sales professionals build stronger relationships 
            and close more deals.
          </p>
        </ScrollReveal>

        {/* Features Grid */}
        <StaggerContainer 
          staggerDelay={0.1}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <MagneticWrapper strength={0.05}>
                <DepthCard
                  depth="medium"
                  hover={true}
                  className="p-6 lg:p-8 h-full group"
                >
                  {/* Gradient overlay on hover */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        background: `linear-gradient(135deg, ${feature.color}25 0%, ${feature.color}10 100%)`,
                      }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <feature.icon 
                        className="w-7 h-7 transition-transform group-hover:scale-110" 
                        style={{ color: feature.color }} 
                      />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-[#1a2332] mb-3 group-hover:text-[#1a2332] transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover indicator */}
                    <motion.div
                      className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: feature.color }}
                    >
                      <span>Learn more</span>
                      <motion.span
                        className="ml-1"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </div>
                </DepthCard>
              </MagneticWrapper>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default LPFeaturesSectionPremium;