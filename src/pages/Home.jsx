
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign,
  Zap 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Existing state
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
  
  // NEW: Simulated purchase state
  const [purchaseType, setPurchaseType] = useState('user');
  const [creditAmount, setCreditAmount] = useState(20);
  const [simulating, setSimulating] = useState(false);
  const [simulateResult, setSimulateResult] = useState(null);
  const [user, setUser] = useState(null);
  const [isOrgOwner, setIsOrgOwner] = useState(false);

  // Load user on mount to check permissions
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user is org owner (dual check)
      const orgOwner = currentUser.appRole === 'organization_owner' || currentUser.isOrgOwner === true;
      setIsOrgOwner(orgOwner);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  // NEW: Handle simulated purchase
  const handleSimulatePurchase = async () => {
    try {
      setSimulating(true);
      setSimulateResult(null);
      
      const response = await base44.functions.invoke('simulateCreditPurchase', {
        creditAmount: parseInt(creditAmount),
        purchaseType: purchaseType
      });
      
      setSimulateResult({
        success: response.data.success,
        message: response.data.message,
        creditsAdded: response.data.creditsAdded,
        previousBalance: response.data.previousBalance,
        newBalance: response.data.newBalance,
        purchaseType: response.data.purchaseType,
        targetEntity: response.data.targetEntity
      });
      
      // Show success toast
      toast({
        title: 'Credits Added! 🎉',
        description: `Successfully added ${response.data.creditsAdded} credits to ${response.data.purchaseType === 'user' ? 'your account' : 'organization pool'}`,
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      // Navigate to Credits page after a brief delay
      setTimeout(() => {
        navigate(createPageUrl('Credits'));
      }, 1500);
      
    } catch (error) {
      console.error('Failed to simulate purchase:', error);
      
      setSimulateResult({
        success: false,
        message: error.response?.data?.error || 'Failed to simulate credit purchase'
      });
      
      // Show error toast
      toast({
        title: 'Purchase Failed',
        description: error.response?.data?.error || 'Failed to simulate credit purchase',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setSimulating(false);
    }
  };

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
      
    } catch (error) {
      console.error('Failed to seed data:', error);
      setSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed test data'
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
      
    } catch (error) {
      console.error('Failed to seed categories:', error);
      setCategorySeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed template categories'
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
      
    } catch (error) {
      console.error('Failed to seed templates and profiles:', error);
      setTemplateSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed templates and profiles'
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
      
    } catch (error) {
      console.error('Failed to seed pricing tiers:', error);
      setPricingSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed pricing tiers'
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
      
    } catch (error) {
      console.error('Failed to seed credits:', error);
      setCreditsSeedResult({
        success: false,
        message: error.response?.data?.error || 'Failed to seed credits'
      });
    } finally {
      setSeedingCredits(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-8 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-indigo-600">RoofScribe</span>
          </h1>
          <p className="text-xl text-gray-600">
            Send personalized handwritten notecards to your clients
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 mb-8">
          {/* Send a Card */}
          <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Mail className="w-6 h-6 text-indigo-600" />
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
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* NEW: Simulate Credit Purchase - Enhanced */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Simulate Credit Purchase</CardTitle>
                  <CardDescription>
                    Flexible credit testing tool - Add any amount to user or organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Purchase Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Credit Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="type-user"
                        name="purchaseType"
                        value="user"
                        checked={purchaseType === 'user'}
                        onChange={(e) => setPurchaseType(e.target.value)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="type-user" className="text-sm text-gray-700 cursor-pointer">
                        Personal Credits
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="type-org"
                        name="purchaseType"
                        value="organization"
                        checked={purchaseType === 'organization'}
                        onChange={(e) => setPurchaseType(e.target.value)}
                        disabled={!user?.orgId}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      <label 
                        htmlFor="type-org" 
                        className={`text-sm cursor-pointer ${
                          !user?.orgId ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        Organization Credits
                        {!user?.orgId && ' (No org)'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Credit Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="creditAmount" className="text-sm font-semibold text-gray-700">
                    Credit Amount
                  </Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    min="1"
                    max="1000"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="text-lg font-semibold"
                    placeholder="20"
                  />
                </div>
              </div>

              {/* Info Message */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Testing Mode:</strong> This bypasses Stripe and directly adds credits. 
                  {purchaseType === 'organization' && !user?.orgId && (
                    <span className="text-orange-600 block mt-1">
                      ⚠️ Cannot add organization credits as you are not part of an organization.
                    </span>
                  )}
                  {purchaseType === 'organization' && user?.orgId && !isOrgOwner && user?.appRole !== 'super_admin' && (
                    <span className="text-orange-600 block mt-1">
                      ⚠️ You need to be an organization owner or Super Admin to add org credits.
                    </span>
                  )}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleSimulatePurchase}
                disabled={simulating || !creditAmount || creditAmount <= 0 || (purchaseType === 'organization' && (!user?.orgId || (!isOrgOwner && user?.appRole !== 'super_admin')))}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
              >
                {simulating ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Add {creditAmount} {purchaseType === 'user' ? 'Personal' : 'Organization'} Credits
                  </>
                )}
              </Button>

              {/* Result Display */}
              {simulateResult && (
                <CardContent className="px-0 pt-0"> {/* Adjusted padding to match design */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    simulateResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {simulateResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        simulateResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {simulateResult.message}
                      </p>
                      {simulateResult.success && (
                        <div className="text-sm text-green-700 mt-2 space-y-1">
                          <p>Balance: {simulateResult.previousBalance} → <strong>{simulateResult.newBalance}</strong> credits</p>
                          <p>Type: {simulateResult.purchaseType === 'user' ? 'Personal' : 'Organization'}</p>
                          <p className="text-xs text-green-600 mt-2">Redirecting to Credits page...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </CardContent>
          </Card>

          {/* OLD: Simple Seed Credits (Keep for quick 20 credit add) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Quick Add 20 Credits</CardTitle>
                    <CardDescription>
                      Fast way to add 20 personal credits (one-click)
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
                        Balance: {creditsSeedResult.previousBalance} → {creditsSeedResult.newBalance} credits
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Seed Test Data */}
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

            {/* Seed Result Message */}
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

          {/* Seed Template Categories (Super Admin Only) */}
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

          {/* Seed Templates & Profiles */}
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

            {/* Template Seed Result Message */}
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

          {/* Seed Pricing Tiers */}
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

          {/* Card Design Management (Super Admin Only) */}
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
        </div>

        {/* Info Box */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Start Guide:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">1.</span>
                <span>Use "Simulate Credit Purchase" to add any amount of personal or organization credits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">2.</span>
                <span>Click "Seed Test Data" to create 10 sample clients (first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>Click "Seed Categories" to create template categories (super admin, first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Click "Seed Templates" to create sample templates and note style profiles (first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">5.</span>
                <span>Click "Seed Pricing" to create default pricing tiers (super admin or org owner)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">6.</span>
                <span>Click "Manage Cards" to create card designs and categories (super admin)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">7.</span>
                <span>Click "Send a Card" to start the workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">8.</span>
                <span>Select clients and compose your message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">9.</span>
                <span>Choose a design and send your notecards!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
