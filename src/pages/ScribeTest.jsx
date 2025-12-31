import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react';

export default function ScribeTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('scribeMinimalTest', {});
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Scribe API Minimal Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Tests the simplified workflow: add-campaign-v2 → add-contacts-bulk → campaign/send
          </p>
          
          <Button 
            onClick={runTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running Test...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Scribe Test</>
            )}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Success!</span>
              </div>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}