import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LPContactFormSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual form submission to backend
    // For now, simulate submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', company: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div>
            <h2 className="text-[36px] font-bold text-[#1a2332] mb-4">
              Get In Touch
            </h2>
            <p className="text-[18px] text-[#4a5568] mb-8">
              Have questions about NurturInk? Want to discuss enterprise pricing or custom integrations? We'd love to hear from you.
            </p>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#fff7ed' }}
                >
                  <Mail className="w-6 h-6" style={{ color: '#FF7A00' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2332] mb-1">Email Us</h3>
                  <p className="text-[#4a5568]">support@nurturink.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#fff7ed' }}
                >
                  <Phone className="w-6 h-6" style={{ color: '#FF7A00' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2332] mb-1">Call Us</h3>
                  <p className="text-[#4a5568]">1-800-NURTUR-INK</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#fff7ed' }}
                >
                  <MessageCircle className="w-6 h-6" style={{ color: '#FF7A00' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2332] mb-1">Live Chat</h3>
                  <p className="text-[#4a5568]">Available Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>
            </div>

            {/* Social Media Links (Placeholder) */}
            <div className="mt-8">
              <p className="text-sm text-[#6b7280] mb-3">Follow us on social media</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#FF7A00] transition-colors">
                  <span className="text-sm font-semibold" style={{ color: '#1a2332' }}>X</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#FF7A00] transition-colors">
                  <span className="text-sm font-semibold" style={{ color: '#1a2332' }}>in</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#FF7A00] transition-colors">
                  <span className="text-sm font-semibold" style={{ color: '#1a2332' }}>FB</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Company
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full h-32"
                    placeholder="Tell us about your needs..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#16a34a' }}
                  className="w-full text-white font-semibold"
                  size="lg"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LPContactFormSection;