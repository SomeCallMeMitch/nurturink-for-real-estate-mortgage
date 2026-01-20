import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle,
  PlayCircle,
  Briefcase,
  Building2,
  DollarSign,
  Star,
  Clock,
  User,
  BarChart2,
  Gift,
  Heart,
  Plus,
  Minus,
  Menu,
  X,
  Phone,
  Mail as MailIcon,
  MapPin,
  ArrowRight,
  PenSquare,
  Send,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Users,
  Award,
  MessageSquare,
  Calculator,
} from 'lucide-react';
import ROICalculator from '@/components/ROICalculator';

// Helper component for smooth scrolling
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

// Header Component
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2bfa9a29f_RoofScribeLogo.png';

  const navLinks = [
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Samples', id: 'sample-gallery' },
    { name: 'Contact', id: 'footer' },
  ];

  const handleLoginClick = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      navigate('/Home');
    } else {
      base44.auth.redirectToLogin();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          <div className="flex-shrink-0">
             <img src={logoUrl} alt="RoofScribe Logo" className="h-20 md:h-24 w-auto" />
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-lg"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={handleLoginClick}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-lg"
            >
              Login
            </button>
            <Button onClick={() => scrollToSection('free-sample-cta')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md text-lg">
              Get Free Samples
            </Button>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  scrollToSection(link.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left py-3 text-lg text-gray-700 hover:text-blue-600"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => {
                handleLoginClick();
                setIsOpen(false);
              }}
              className="block w-full text-left py-3 text-lg text-gray-700 hover:text-blue-600"
            >
              Login
            </button>
            <Button onClick={() => {
                scrollToSection('free-sample-cta');
                setIsOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md text-lg mt-4"
            >
              Get Free Samples
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Turn More Roofing Leads Into Signed Contracts
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600/90 max-w-xl mx-auto md:mx-0">
              The personal touch that digital can't match - handwritten notes that get opened, read, and remembered by homeowners who need roofing work.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button onClick={() => scrollToSection('free-sample-cta')} size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Your Free Samples Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 2 free samples • Setup in 60 seconds
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&crop=center"
              alt="Handwritten note sample"
              className="rounded-lg shadow-2xl"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">99% Open Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// User Segmentation Component
const UserSegmentation = () => {
  const [selection, setSelection] = useState(null);

  const handleSelection = (role) => {
    setSelection(role);
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built For Roofing Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Whether you're an individual sales rep or managing a roofing company, we have solutions tailored to your needs.
          </p>
          <h3 className="text-xl font-semibold text-blue-600">First, choose your role:</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button onClick={() => handleSelection('rep')} className="text-left">
            <Card className={`p-6 transition-all duration-300 cursor-pointer ${selection === 'rep' ? 'border-2 border-blue-600 ring-2 ring-blue-300 shadow-2xl scale-105' : 'hover:shadow-xl hover:scale-102'}`}>
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Individual Sales Reps</h3>
                <p className="text-gray-600 mb-6">
                  Stand out from the competition with personal touches that build trust and close more deals.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  {selection === 'rep' && <CheckCircle className="w-5 h-5" />}
                  {selection === 'rep' ? 'Selected' : 'Select this option'}
                </div>
              </CardContent>
            </Card>
          </button>

          <button onClick={() => handleSelection('owner')} className="text-left">
            <Card className={`p-6 transition-all duration-300 cursor-pointer ${selection === 'owner' ? 'border-2 border-blue-600 ring-2 ring-blue-300 shadow-2xl scale-105' : 'hover:shadow-xl hover:scale-102'}`}>
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Roofing Companies</h3>
                <p className="text-gray-600 mb-6">
                  Scale personalized outreach across your entire sales team with centralized management and analytics.
                </p>
                 <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  {selection === 'owner' && <CheckCircle className="w-5 h-5" />}
                  {selection === 'owner' ? 'Selected' : 'Select this option'}
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>
    </section>
  );
};

// Benefits Section Component
const BenefitsSection = () => {
  const benefits = [
    {
      icon: Target,
      title: "Guaranteed 99% Open Rate",
      description: "Your message gets seen. Physical mail has an open rate that digital can't touch, ensuring your follow-up isn't ignored."
    },
    {
      icon: TrendingUp,
      title: "Increase Appointments by 20-35%",
      description: "Our clients see a dramatic increase in booked appointments after implementing handwritten follow-ups."
    },
    {
      icon: DollarSign,
      title: "Proven ROI",
      description: "Just one extra $15,000 roofing contract can pay for our service for the entire year. The math just works."
    },
    {
      icon: Clock,
      title: "Save You Hours Every Week",
      description: "Automated personalization lets you focus on what you do best—building relationships and closing deals."
    },
    {
      icon: Shield,
      title: "Authentic Quality That Builds Trust",
      description: "Real ink on quality stationery. Our notes are indistinguishable from your own, building genuine rapport."
    },
    {
      icon: Zap,
      title: "Fast, Reliable Delivery",
      description: "Notes are written, stamped, and mailed within 1 business day of your approval, landing in mailboxes quickly."
    }
  ];

  return (
    <section id="benefits" className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Handwritten Notes Outperform Digital
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            In a world of digital noise, a personal, physical touch makes all the difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Choose Your Message",
      description: "Select from proven templates or write your own personalized message.",
      icon: PenSquare
    },
    {
      number: "2",
      title: "Add Client Details",
      description: "Enter your client's information and delivery address.",
      icon: User
    },
    {
      number: "3",
      title: "We Write & Send",
      description: "Your note is handwritten with real ink and mailed within 1 business day.",
      icon: Send
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Send your first handwritten note in under 3 minutes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ROI Calculator Section
const ROICalculatorSection = () => {
  return (
    <section id="roi-calculator" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Your Potential ROI
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Use our interactive calculator to estimate how a small investment in handwritten notes can lead to significant revenue growth.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
            <ROICalculator />
        </div>
      </div>
    </section>
  )
}

// Social Proof Section Component
const SocialProofSection = () => {
  const testimonials = [
    {
      quote: "These handwritten notes have completely transformed how I follow up with prospects. My close rate has increased by 40% since I started using RoofScribe.",
      author: "Mike Johnson",
      title: "Sales Rep, Premium Roofing"
    },
    {
      quote: "Our team sends over 200 notes per month now. The ROI is incredible - one extra sale pays for hundreds of notes.",
      author: "Sarah Chen",
      title: "Owner, Apex Roofing Solutions"
    },
    {
      quote: "Clients always mention the handwritten note when they call back. It shows we care about the details, just like with their roof.",
      author: "David Rodriguez",
      title: "Sales Manager, Storm Shield Roofing"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Hundreds of Roofing Professionals
          </h2>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-lg font-semibold text-gray-700">4.9/5 from 500+ reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic text-lg">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600">{testimonial.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Sample Gallery Section
const SampleGallerySection = () => {
  const samples = [
    {
      title: "Post-Inspection Follow-Up",
      description: "Sent immediately after an inspection to build trust. This note template has a 25% response rate.",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=400&fit=crop"
    },
    {
      title: "Post-Storm Outreach",
      description: "Reach out to homeowners in storm-affected areas with a personal touch that stands out from flyers.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&h=400&fit=crop"
    },
    {
      title: "Referral Request After Job Completion",
      description: "Ask satisfied customers for referrals. This note generated 3 new leads for a single client.",
      image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=500&h=400&fit=crop"
    }
  ];

  return (
    <section id="sample-gallery" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See the Quality for Yourself
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These are examples of handwritten notes that convert prospects into customers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {samples.map((sample, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="overflow-hidden">
                <img
                  src={sample.image}
                  alt={sample.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{sample.title}</h3>
                <p className="text-gray-600 mb-4 text-base">{sample.description}</p>
                <Button variant="link" className="p-0 text-blue-600">
                  Get samples like these <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section Component
const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      credits: "25 notes",
      pricePerNote: "$3.96 per note",
      features: [
        "25 handwritten notes",
        "Template library access",
        "Basic customization",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$179",
      credits: "50 notes",
      pricePerNote: "$3.58 per note (Save 10%)",
      features: [
        "50 handwritten notes",
        "All templates included",
        "Custom handwriting styles",
        "Priority support",
        "Performance tracking"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$299",
      credits: "100 notes",
      pricePerNote: "$2.99 per note (Save 25%)",
      features: [
        "100 handwritten notes",
        "Team management",
        "Bulk operations",
        "Advanced analytics",
        "Phone support"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pay only for what you use. No monthly fees, no contracts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative transition-all duration-300 ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{plan.price}</div>
                  <div className="text-sm text-gray-600 mb-1">{plan.credits}</div>
                  <div className="text-sm text-green-600 font-semibold">{plan.pricePerNote}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full text-lg py-3 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  onClick={() => scrollToSection('free-sample-cta')}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Free Sample CTA Section
const FreeSampleCTA = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: 'sales_rep'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you! Your free samples will be sent within 1-2 business days.');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="free-sample-cta" className="py-12 md:py-20 bg-blue-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Get Your Free Sample Notes
                  </h2>
                  <p className="text-lg text-gray-600">
                    See the quality for yourself. We'll send you 2 free handwritten notes. <br/><strong>No credit card required.</strong>
                  </p>
                </div>
    
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
    
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
    
                  <div>
                    <Label htmlFor="address">Mailing Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Street, City, State, ZIP"
                      required
                      className="h-12"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_rep">Individual Sales Rep</SelectItem>
                        <SelectItem value="company_owner">Roofing Company Owner</SelectItem>
                        <SelectItem value="manager">Sales Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
    
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 h-14">
                    Send My Free Samples
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
    
                  <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-4">
                      <span>✓ No spam</span>
                      <span>✓ 100% secure</span>
                      <span>✓ Privacy respected</span>
                  </div>
                </form>
              </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "Are these notes really handwritten?",
      answer: "Yes! We use advanced robotic plotters with real ballpoint pens to write your notes. This ensures an authentic, human-like appearance that's indistinguishable from notes written by hand."
    },
    {
      question: "How long does it take to send a note?",
      answer: "Once you approve your note, it's typically written and mailed within 1 business day. Delivery takes 3-5 business days via USPS First-Class Mail."
    },
    {
      question: "Can I customize the handwriting style?",
      answer: "Absolutely! You can choose from several different handwriting styles and even customize the message content, signature, and ink color to match your personal brand."
    },
    {
      question: "What's included in the free samples?",
      answer: "You get 2 complete handwritten notes mailed to addresses of your choice. This lets you experience the quality firsthand and see how recipients react."
    },
    {
      question: "Is there a monthly subscription?",
      answer: "No monthly fees! You only pay for the notes you send. Purchase credits in advance and use them whenever you need to send a note."
    },
    {
      question: "Can I integrate with my CRM?",
      answer: "Yes, we offer integrations with popular CRM systems used by roofing companies. Contact us to discuss your specific integration needs."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about RoofScribe
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    {openFAQ === index ? (
                      <Minus className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2bfa9a29f_RoofScribeLogo.png"
              alt="RoofScribe Logo"
              className="h-10 mb-4 filter brightness-0 invert"
            />
            <p className="text-gray-400 mb-4 max-w-md">
              The personal touch that turns roofing leads into loyal customers. Handwritten notes that get opened, read, and remembered.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MailIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white">How It Works</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white">Pricing</button></li>
              <li><button onClick={() => scrollToSection('sample-gallery')} className="hover:text-white">Samples</button></li>
              <li><a href="#" className="hover:text-white">Templates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 RoofScribe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function WelcomeRoof() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <UserSegmentation />
      <BenefitsSection />
      <HowItWorksSection />
      <ROICalculatorSection />
      <SocialProofSection />
      <SampleGallerySection />
      <PricingSection />
      <FreeSampleCTA />
      <FAQSection />
      <Footer />
    </div>
  );
}