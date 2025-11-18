import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Database, ArrowRight, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Onboarding Check
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const user = await base44.auth.me();
        if (user && (!user.onboardingStatus || user.onboardingStatus === 'pending')) {
          // Not onboarded yet, redirect
          navigate('/Onboarding');
        }
      } catch (e) {
        console.error("Failed to check onboarding status", e);
      }
    };
    checkOnboarding();
  }, [navigate]);
  
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedingTemplates, setSeedingTemplates] = useState(false);
  const [templateSeedResult, setTemplateSeedResult] = useState(null);
  const [seedingCategories, setSeedingCategories] = useState(false);
  const [categorySeedResult, setCategorySeedResult] = useState(null);
  const [seedingPricing, setSeedingPricing] = useState(false);
  const [pricingSeedResult, setPricingSeedResult] = useState(null);
  const [seedingCredits, setSeedingCredits] = useState(false);
  const [creditsSeedResult, setCreditsSeedResult] = useState(null);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      setSeedResult(null);
      
      const response = await base44.functions.invoke('seedTestData');
      
      setSeedResult({
        success: response.data.success,
        message: response.data.message,
        clientCount: response.data.clientCount
      });
      
      toast({
        title: 'Test Data Created! ✓',
        description: response.data.message,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (error) {
      console.error('Failed to seed data:', error);
      setSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed test data'
      });
      
      toast({
        title: 'Failed to Create Data',
        description: error.response?.data?.error || 'Failed to seed test data',
        variant: 'destructive'
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedCategories = async () => {
    try {
      setSeedingCategories(true);
      setCategorySeedResult(null);
      
      const response = await base44.functions.invoke('seedTemplateCategories');
      
      setCategorySeedResult({
        success: response.data.success,
        message: response.data.message,
        categoryCount: response.data.categoryCount
      });
      
      toast({
        title: 'Categories Created! ✓',
        description: response.data.message,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (error) {
      console.error('Failed to seed categories:', error);
      setCategorySeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed template categories'
      });
      
      toast({
        title: 'Failed to Create Categories',
        description: error.response?.data?.error || 'Failed to seed template categories',
        variant: 'destructive'
      });
    } finally {
      setSeedingCategories(false);
    }
  };

  const handleSeedTemplatesAndProfiles = async () => {
    try {
      setSeedingTemplates(true);
      setTemplateSeedResult(null);
      
      const profileResult = await base44.functions.invoke('seedNoteStyleProfiles');
      const templateResult = await base44.functions.invoke('seedTemplates');
      
      const profileSuccess = profileResult.data.success;
      const templateSuccess = templateResult.data.success;
      
      setTemplateSeedResult({
        success: profileSuccess || templateSuccess,
        message: `${profileResult.data.message} ${templateResult.data.message}`,
        profileCount: profileResult.data.profileCount,
        templateCount: templateResult.data.templateCount
      });
      
      toast({
        title: 'Templates Created! ✓',
        description: `${profileResult.data.message} ${templateResult.data.message}`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (error) {
      console.error('Failed to seed templates and profiles:', error);
      setTemplateSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed templates and profiles'
      });
      
      toast({
        title: 'Failed to Create Templates',
        description: error.response?.data?.error || 'Failed to seed templates and profiles',
        variant: 'destructive'
      });
    } finally {
      setSeedingTemplates(false);
    }
  };

  const handleSeedPricingTiers = async () => {
    try {
      setSeedingPricing(true);
      setPricingSeedResult(null);
      
      const response = await base44.functions.invoke('seedPricingTiers');
      
      setPricingSeedResult({
        success: response.data.success,
        message: response.data.message,
        tierCount: response.data.tierCount,
        scope: response.data.scope
      });
      
      toast({
        title: 'Pricing Tiers Created! ✓',
        description: response.data.message,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (error) {
      console.error('Failed to seed pricing tiers:', error);
      setPricingSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed pricing tiers'
      });
      
      toast({
        title: 'Failed to Create Pricing',
        description: error.response?.data?.error || 'Failed to seed pricing tiers',
        variant: 'destructive'
      });
    } finally {
      setSeedingPricing(false);
    }
  };

  const handleSeedCredits = async () => {
    try {
      setSeedingCredits(true);
      setCreditsSeedResult(null);
      
      const response = await base44.functions.invoke('seedUserCredits', {
        creditAmount: 20
      });
      
      setCreditsSeedResult({
        success: response.data.success,
        message: response.data.message,
        previousBalance: response.data.previousBalance,
        newBalance: response.data.newBalance,
        creditsAdded: response.data.creditsAdded
      });
      
      toast({
        title: 'Credits Added! ✓',
        description: `Added ${response.data.creditsAdded} credits to your account`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (error) {
      console.error('Failed to seed credits:', error);
      setCreditsSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed credits'
      });
      
      toast({
        title: 'Failed to Add Credits',
        description: error.response?.data?.error || 'Failed to seed credits',
        variant: 'destructive'
      });
    } finally {
      setSeedingCredits(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto p-8 pt-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="brand-text-primary">RoofScribe</span>
          </h1>
          <p className="text-xl text-gray-600">
            Send personalized handwritten notecards to your clients
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid gap-6 mb-8">
          {/* Send a Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="border-2 border-blue-500 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Send a Card</CardTitle>
                      <CardDescription className="text-base">
                        Start the workflow to send notecards to your clients
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(createPageUrl('FindClients'))}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Test Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Test Credits</CardTitle>
                      <CardDescription>
                        Add 20 test credits to your account (Testing Feature)
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSeedCredits}
                    variant="outline"
                    disabled={seedingCredits}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {seedingCredits ? 'Adding...' : 'Add 20 Credits'}
                  </Button>
                </div>
              </CardHeader>

              {creditsSeedResult && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    creditsSeedResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {creditsSeedResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        creditsSeedResult.success ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {creditsSeedResult.message}
                      </p>
                      {creditsSeedResult.success && (
                        <p className="text-sm text-green-700 mt-1">
                          20 company-allocated credits added to your account!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Seed Test Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Database className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle>Test Data</CardTitle>
                      <CardDescription>
                        Create sample clients for testing the workflow
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSeedData}
                    variant="outline"
                    disabled={seeding}
                  >
                    {seeding ? 'Creating...' : 'Seed Test Data'}
                  </Button>
                </div>
              </CardHeader>

              {seedResult && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    seedResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {seedResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        seedResult.success ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {seedResult.message}
                      </p>
                      {seedResult.success && seedResult.clientCount && (
                        <p className="text-sm text-green-700 mt-1">
                          You can now click "Send a Card" to start the workflow!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Seed Template Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Database className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Template Categories</CardTitle>
                      <CardDescription>
                        Create platform-wide template categories (Super Admin only)
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSeedCategories}
                    variant="outline"
                    disabled={seedingCategories}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    {seedingCategories ? 'Creating...' : 'Seed Categories'}
                  </Button>
                </div>
              </CardHeader>

              {categorySeedResult && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    categorySeedResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {categorySeedResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        categorySeedResult.success ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {categorySeedResult.message}
                      </p>
                      {categorySeedResult.success && (
                        <p className="text-sm text-green-700 mt-1">
                          Categories are ready for templates!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Seed Templates & Profiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Templates & Profiles</CardTitle>
                      <CardDescription>
                        Create sample templates and note style profiles
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSeedTemplatesAndProfiles}
                    variant="outline"
                    disabled={seedingTemplates}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {seedingTemplates ? 'Creating...' : 'Seed Templates'}
                  </Button>
                </div>
              </CardHeader>

              {templateSeedResult && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    templateSeedResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {templateSeedResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        templateSeedResult.success ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {templateSeedResult.message}
                      </p>
                      {templateSeedResult.success && (
                        <p className="text-sm text-green-700 mt-1">
                          Templates are ready to use in the content editor!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Seed Pricing Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Database className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Pricing Tiers</CardTitle>
                      <CardDescription>
                        Create default pricing tiers (Super Admin or Org Owner)
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSeedPricingTiers}
                    variant="outline"
                    disabled={seedingPricing}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    {seedingPricing ? 'Creating...' : 'Seed Pricing'}
                  </Button>
                </div>
              </CardHeader>

              {pricingSeedResult && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    pricingSeedResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {pricingSeedResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        pricingSeedResult.success ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {pricingSeedResult.message}
                      </p>
                      {pricingSeedResult.success && (
                        <p className="text-sm text-green-700 mt-1">
                          {pricingSeedResult.scope === 'platform' 
                            ? 'Platform-wide pricing tiers are ready!' 
                            : 'Organization pricing tiers are ready!'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Card Design Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Database className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle>Card Design Management</CardTitle>
                      <CardDescription>
                        Manage platform-wide card designs and categories (Super Admin only)
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(createPageUrl('SuperAdminCardManagement'))}
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    Manage Cards
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Start Guide:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>Click "Add 20 Credits" to get test credits for your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>Click "Seed Test Data" to create 10 sample clients (first time only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>Click "Seed Categories" to create template categories (super admin, first time only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>Click "Seed Templates" to create sample templates and note style profiles (first time only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">5.</span>
                  <span>Click "Seed Pricing" to create default pricing tiers (super admin or org owner)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">6.</span>
                  <span>Click "Manage Cards" to create card designs and categories (super admin)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">7.</span>
                  <span>Click "Send a Card" to start the workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">8.</span>
                  <span>Select clients and compose your message</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">9.</span>
                  <span>Choose a design and send your notecards!</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}