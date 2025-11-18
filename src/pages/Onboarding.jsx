import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Crown, ArrowRight, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // 'sales_rep', 'company', 'whitelabel'
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    jobTitle: "",
    phone: ""
  });

  useEffect(() => {
    // Check if already onboarded
    const checkStatus = async () => {
      const user = await base44.auth.me();
      if (user?.onboardingStatus === 'completed') {
        navigate('/Home');
      }
    };
    checkStatus();
  }, [navigate]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await base44.functions.invoke('setupAccount', {
        role,
        companyName: formData.companyName,
        details: {
          website: formData.website,
          jobTitle: formData.jobTitle,
          phone: formData.phone
        }
      });

      if (response.data.success) {
        toast({
          title: "Account Setup Complete",
          description: "Welcome to RoofScribe! Let's get you started.",
        });
        // Force reload or re-fetch user to update context if needed, but navigation should trigger re-render
        window.location.href = '/Home'; 
      } else {
        throw new Error(response.data.error || "Setup failed");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to RoofScribe</h1>
          <p className="text-xl text-gray-600">Let's set up your account</p>
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Individual Rep */}
            <Card 
              className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden group"
              onClick={() => handleRoleSelect('sales_rep')}
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  <User size={24} />
                </div>
                <CardTitle>Individual Sales Rep</CardTitle>
                <CardDescription>
                  I want to send cards to my own clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Buy credits directly</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Manage personal templates</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Track your sent notes</li>
                </ul>
              </CardContent>
            </Card>

            {/* Company / Team */}
            <Card 
              className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden group"
              onClick={() => handleRoleSelect('company')}
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                  <Building2 size={24} />
                </div>
                <CardTitle>Company / Team</CardTitle>
                <CardDescription>
                  I manage a team of reps and want to centralized billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Manage team members</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Allocate credits to reps</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Shared or private pools</li>
                </ul>
              </CardContent>
            </Card>

            {/* Whitelabel Partner */}
            <Card 
              className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden group"
              onClick={() => handleRoleSelect('whitelabel')}
            >
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                  <Crown size={24} />
                </div>
                <CardTitle>Whitelabel Partner</CardTitle>
                <CardDescription>
                  I want to resell this platform under my own brand.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Custom branding & domain</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Wholesale credit pricing</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Manage multiple clients</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {role === 'sales_rep' && "Complete your Profile"}
                  {role === 'company' && "Company Details"}
                  {role === 'whitelabel' && "Partner Agency Details"}
                </CardTitle>
                <CardDescription>
                  Please provide a few more details to finish setup.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {(role === 'company' || role === 'whitelabel') && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        required 
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder="Acme Roofing Co."
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      required 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      placeholder="Sales Manager"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input 
                      id="website" 
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}