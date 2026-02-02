import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function CampaignSetupWizard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link to={createPageUrl('Campaigns')}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Campaign setup wizard coming soon in Stage 2...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}