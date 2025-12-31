import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react';

export default function ScribeTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(1);

  const runMinimalTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('scribeMinimalTest', {});
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const runSuiteTest = async (testNum) => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('scribeTestSuite', { test: testNum });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testDescriptions = {
    1: 'Single recipient + return address',
    2: 'Multiple recipients (3), same message',
    3: 'Two separate campaigns (different messages)',
    4: 'Return address with special characters'
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Minimal Test */}
      <Card>
        <CardHeader>
          <CardTitle>Scribe Minimal Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Simple test: add-campaign-v2 → add-contacts-bulk → campaign/send
          </p>
          <Button onClick={runMinimalTest} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><Play className="w-4 h-4 mr-2" /> Run Minimal Test</>}
          </Button>
        </CardContent>
      </Card>

      {/* Test Suite */}
      <Card>
        <CardHeader>
          <CardTitle>Scribe Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">Run specific test scenarios:</p>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(num => (
              <Button
                key={num}
                variant={selectedTest === num ? 'default' : 'outline'}
                onClick={() => !loading && setSelectedTest(num)}
                disabled={loading}
                className="text-left justify-start h-auto py-2"
              >
                <div>
                  <div className="font-semibold">Test {num}</div>
                  <div className="text-xs opacity-80">{testDescriptions[num]}</div>
                </div>
              </Button>
            ))}
          </div>
          <Button onClick={() => runSuiteTest(selectedTest)} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running Test {selectedTest}...</> : <><Play className="w-4 h-4 mr-2" /> Run Test {selectedTest}</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Success!</span>
          </div>
          <pre className="text-xs overflow-auto bg-white p-2 rounded max-h-96">
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
    </div>
  );
}