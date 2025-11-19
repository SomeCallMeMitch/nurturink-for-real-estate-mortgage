import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import RequireAuth from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Building2, Crown, ArrowRight, Check, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // 'sales_rep', 'company', 'whitelabel'
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    jobTitle: "",
    phone: ""
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.onboardingComplete) {
          navigate('/Home');
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setCheckingStatus(false);
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
        // Force a hard reload to ensure auth state is fresh everywhere
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

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
            <span className={step >= 1 ? "text-blue-600" : ""}>Role Selection</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Account Details</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Step {step} of 2</p>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to RoofScribe</h1>
          <p className="text-gray-600">Let's set up your account experience</p>
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <RoleCard 
              icon={User}
              color="blue"
              title="Individual Sales Rep"
              description="I want to send cards to my own clients."
              features={["Buy credits directly", "Manage personal templates", "Track your sent notes"]}
              onClick={() => handleRoleSelect('sales_rep')}
            />
            <RoleCard 
              icon={Building2}
              color="indigo"
              title="Company / Team"
              description="I manage a team of reps and want centralized billing."
              features={["Manage team members", "Allocate credits to reps", "Shared or private pools"]}
              onClick={() => handleRoleSelect('company')}
            />
            <RoleCard 
              icon={Crown}
              color="purple"
              title="Whitelabel Partner"
              description="I want to resell this platform under my own brand."
              features={["Custom branding & domain", "Wholesale credit pricing", "Manage multiple clients"]}
              onClick={() => handleRoleSelect('whitelabel')}
            />
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
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  
                  {/* Dynamic Fields based on Role */}
                  {(role === 'company' || role === 'whitelabel') && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        {role === 'whitelabel' ? "Agency Name" : "Company Name"}
                      </Label>
                      <Input 
                        id="companyName" 
                        required 
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder={role === 'whitelabel' ? "My Agency LLC" : "Acme Roofing Co."}
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
                      placeholder="e.g. Sales Manager"
                    />
                  </div>

                  {(role === 'company' || role === 'whitelabel') && (
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        type="url"
                        required={role === 'whitelabel'} // Required for WL
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
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
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </RequireAuth>
  );
}

function RoleCard({ icon: Icon, color, title, description, features, onClick }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:border-blue-500",
    indigo: "bg-indigo-100 text-indigo-600 group-hover:border-indigo-500",
    purple: "bg-purple-100 text-purple-600 group-hover:border-purple-500",
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group border-2 border-transparent hover:border-opacity-50 ${colorClasses[color].split(' ').pop()}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
          <Icon size={24} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={16} className="text-green-500 shrink-0" /> 
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}