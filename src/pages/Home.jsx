
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Database, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [seedingTemplates, setSeedingTemplates] = useState(false);
  const [templateSeedResult, setTemplateSeedResult] = useState(null);
  const [seedingCategories, setSeedingCategories] = useState(false);
  const [categorySeedResult, setCategorySeedResult] = useState(null);

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

          {/* NEW: Card Design Management (Super Admin Only) */}
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
                <span>Click "Seed Test Data" to create 10 sample clients (first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">2.</span>
                <span>Click "Seed Categories" to create template categories (super admin, first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>Click "Seed Templates" to create sample templates and note style profiles (first time only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Click "Manage Cards" to create card designs and categories (super admin)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">5.</span>
                <span>Click "Send a Card" to start the workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">6.</span>
                <span>Select clients and compose your message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">7.</span>
                <span>Choose a design and send your notecards!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
