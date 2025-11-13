import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";

export default function LPContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-red-500 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Get Your Free Sample Card
              </h2>
              <p className="text-lg text-gray-600">
                See the quality for yourself. We'll send you a real handwritten notecard at no cost.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    name="company"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <Textarea
                  name="message"
                  placeholder="Tell us about your roofing business (optional)"
                  value={formData.message}
                  onChange={handleChange}
                  className="h-32"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 font-semibold"
              >
                Get Your Free Sample Now
              </Button>

              <p className="text-xs text-center text-gray-500">
                No credit card required. We'll mail it to you within 3-5 business days.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}