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
                <span>Click "Send a Card" to start the workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>Select clients and compose your message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Choose a design and send your notecards!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}