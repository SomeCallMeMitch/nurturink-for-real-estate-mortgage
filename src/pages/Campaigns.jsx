import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from 'lucide-react';

export default function Campaigns() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-foreground mb-4">Campaigns</h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Campaigns page placeholder - if you see this, the build is working.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}