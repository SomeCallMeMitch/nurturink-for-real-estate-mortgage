/**
 * LPPricingSectionPremium - Enhanced pricing section with premium effects
 * Features: glassmorphism, hover effects, animated badges
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Star, Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { 
  ScrollReveal, 
  StaggerContainer, 
  StaggerItem,
  GlassCard,
  MagneticButton,
  GradientText,
  GradientBorder,
  FloatingElement,
} from '@/components/premium';

const tiers = [
  {
    name: 'Starter',
    credits: 5,
    price: 19.97,
    pricePerNote: 3.99,
    popular: false,
    features: [
      'Hand-written notes',
      'Basic templates',
      'Email support',
      'Delivery tracking',
    ],
    color: '#6b7280',
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Professional',
    credits: 20,
    price: 59.97,
    pricePerNote: 2.99,
    popular: true,
    features: [
      'Everything in Starter',
      'Premium templates',
      'Priority support',
      'Team access (2 users)',
      'Analytics dashboard',
    ],
    color: '#FF7A00',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Growth',
    credits: 50,
    price: 124.97,
    pricePerNote: 2.49,
    popular: false,
    features: [
      'Everything in Professional',
      'Custom templates',
      'Dedicated support',
      'Team access (5 users)',
      'Advanced analytics',
      'CRM integrations',
    ],
    color: '#16a34a',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const LPPricingSectionPremium = () => {
  const [hoveredTier, setHoveredTier] = useState(null);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/Home');
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      {/* Floating decorations */}
      <FloatingElement duration={10} yRange={30} className="absolute top-20 right-[10%] opacity-10">
        <Sparkles className="w-16 h-16 text-orange-500" />
      </FloatingElement>
      <FloatingElement duration={12} yRange={25} className="absolute bottom-32 left-[5%] opacity-10">
        <Star className="w-12 h-12 text-yellow-500" />
      </FloatingElement>

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="text-center mb-16">
          <motion.span 
            className="inline-block px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Simple Pricing
          </motion.span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a2332] mb-4">
            Choose Your{' '}
            <GradientText colors={['#FF7A00', '#16a34a']}>
              Perfect Plan
            </GradientText>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No subscriptions, no hidden fees. Buy credits when you need them and 
            they never expire.
          </p>
        </ScrollReveal>

        {/* Pricing Cards */}
        <StaggerContainer 
          staggerDelay={0.15}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {tiers.map((tier, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="h-full"
                onMouseEnter={() => setHoveredTier(index)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {tier.popular ? (
                  <GradientBorder
                    colors={['#FF7A00', '#f59e0b', '#FF7A00']}
                    borderWidth={2}
                    borderRadius={24}
                    animate={true}
                    className="h-full"
                  >
                    <PricingCardContent 
                      tier={tier} 
                      isHovered={hoveredTier === index}
                      onGetStarted={handleGetStarted}
                    />
                  </GradientBorder>
                ) : (
                  <div className="h-full border-2 border-gray-100 rounded-3xl bg-white hover:border-gray-200 transition-colors">
                    <PricingCardContent 
                      tier={tier} 
                      isHovered={hoveredTier === index}
                      onGetStarted={handleGetStarted}
                    />
                  </div>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom note */}
        <ScrollReveal animation="fadeUp" delay={0.5} className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            All plans include <span className="font-medium text-gray-700">USPS First Class delivery</span>, 
            <span className="font-medium text-gray-700"> premium card stock</span>, and 
            <span className="font-medium text-gray-700"> handwritten addressing</span>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Extracted card content component
const PricingCardContent = ({ tier, isHovered, onGetStarted }) => (
  <div className="relative p-6 lg:p-8 h-full flex flex-col">
    {/* Popular badge */}
    {tier.popular && (
      <motion.div
        className="absolute -top-4 left-1/2 -translate-x-1/2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-500/30">
          <Star className="w-4 h-4 fill-current" />
          Most Popular
        </span>
      </motion.div>
    )}

    {/* Tier name */}
    <h3 className="text-xl font-bold text-[#1a2332] mb-2 mt-2">
      {tier.name}
    </h3>

    {/* Credits */}
    <p className="text-gray-500 mb-4">
      {tier.credits} handwritten notes
    </p>

    {/* Price */}
    <div className="mb-6">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-[#1a2332]">
          ${tier.price.toFixed(2)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        ${tier.pricePerNote.toFixed(2)} per note
      </p>
    </div>

    {/* Features */}
    <ul className="space-y-3 mb-8 flex-grow">
      {tier.features.map((feature, i) => (
        <motion.li 
          key={i}
          className="flex items-start gap-3"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
          viewport={{ once: true }}
        >
          <Check 
            className="w-5 h-5 flex-shrink-0 mt-0.5" 
            style={{ color: tier.popular ? '#FF7A00' : '#16a34a' }}
          />
          <span className="text-gray-600">{feature}</span>
        </motion.li>
      ))}
    </ul>

    {/* CTA Button */}
    <MagneticButton
      as="div"
      strength={0.1}
      className="w-full"
    >
      <Button
        onClick={onGetStarted}
        className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
          tier.popular
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25'
            : 'bg-[#1a2332] hover:bg-[#2a3342] text-white'
        }`}
        size="lg"
      >
        Get Started
        <motion.span
          className="ml-2"
          animate={{ x: isHovered ? 4 : 0 }}
        >
          <ArrowRight className="w-5 h-5" />
        </motion.span>
      </Button>
    </MagneticButton>
  </div>
);

export default LPPricingSectionPremium;