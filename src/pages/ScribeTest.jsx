import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const TEST_CONFIGS = [
  {
    id: 1,
    name: 'Test 1: Return Address',
    description: 'Single recipient WITH return address - tests if return_address format works',
    payload: { test: 1 },
    critical: true
  },
  {
    id: 2,
    name: 'Test 2: Multiple Recipients',
    description: '3 recipients, same message/design in ONE campaign - tests bulk contacts',
    payload: { test: 2 },
    critical: false
  },
  {
    id: 3,
    name: 'Test 3: Two Campaigns',
    description: 'Two separate campaigns with different messages - tests grouping logic',
    payload: { test: 3 },
    critical: false
  },
  {
    id: 4,
    name: 'Test 4: Special Characters',
    description: "Return address with apostrophes, ampersand, accents (Tom's Roofing & Sons)",
    payload: { test: 4 },
    critical: false
  }
];

export default function ScribeTest() {
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [runningAll, setRunningAll] = useState(false);

  const runTest = async (testId, payload) => {
    setLoading(testId);
    
    try {
      const response = await base44.functions.invoke('scribeTestSuite', payload);
      setResults(prev => ({
        ...prev,
        [testId]: {
          success: true,
          data: response.data || response,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (err) {
      let errorData = { message: err.message || 'Test failed' };
      try {
        if (err.response?.data) {
          errorData = err.response.data;
        }
      } catch (e) {}
      
      setResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          error: errorData,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    setResults({});
    
    for (const test of TEST_CONFIGS) {
      await runTest(test.id, test.payload);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setRunningAll(false);
  };

  const clearResults = () => {
    setResults({});
  };

  const getResultStatus = (result) => {
    if (!result) return null;
    
    const is402 = result.data?.status === 'needs_credits' || 
                  result.error?.message?.includes('402') ||
                  result.data?.error?.includes('402');
    
    if (result.success || is402) {
      return is402 ? 'credits' : 'success';
    }
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'credits': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'credits': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Success!';
      case 'credits': return 'Success (needs credits to submit)';
      case 'error': return 'Failed';
      default: return '';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-800';
      case 'credits': return 'text-yellow-800';
      case 'error': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scribe API Test Suite</h1>
          <p className="text-gray-500 mt-1">
            Test the Scribe integration with different scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={runningAll || loading}
          >
            Clear Results
          </Button>
          <Button 
            onClick={runAllTests}
            disabled={runningAll || loading}
          >
            {runningAll ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running All...</>
            ) : (
              'Run All Tests'
            )}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">How to interpret results:</p>
          <ul className="mt-1 space-y-1">
            <li><span className="text-green-600 font-medium">Green</span> = API call succeeded completely</li>
            <li><span className="text-yellow-600 font-medium">Yellow</span> = API worked but needs Scribe credits to submit (expected on staging)</li>
            <li><span className="text-red-600 font-medium">Red</span> = API error - check the error details</li>
          </ul>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid gap-4">
        {TEST_CONFIGS.map((test) => {
          const result = results[test.id];
          const status = getResultStatus(result);
          
          return (
            <Card key={test.id} className={result ? getStatusColor(status) : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {test.name}
                      {test.critical && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          Critical
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{test.description}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runTest(test.id, test.payload)}
                    disabled={loading === test.id || runningAll}
                  >
                    {loading === test.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Run</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {result && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(status)}
                    <span className={`font-semibold ${getStatusTextColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {result.timestamp}
                    </span>
                  </div>
                  
                  {result.data?.campaignId && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Campaign ID:</span> {result.data.campaignId}
                    </p>
                  )}
                  {result.data?.campaigns && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Campaigns:</span>{' '}
                      {result.data.campaigns.map(c => c.id).join(', ')}
                    </p>
                  )}
                  
                  {result.error?.hint && (
                    <div className="p-2 bg-white rounded border mb-2">
                      <p className="text-sm"><span className="font-medium">Hint:</span> {result.error.hint}</p>
                    </div>
                  )}
                  
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View raw response
                    </summary>
                    <pre className="text-xs overflow-auto bg-white p-2 rounded border mt-1 max-h-48">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(results).filter(r => getResultStatus(r) === 'success').length}
                </p>
                <p className="text-sm text-green-700">Passed</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {Object.values(results).filter(r => getResultStatus(r) === 'credits').length}
                </p>
                <p className="text-sm text-yellow-700">Needs Credits</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(results).filter(r => getResultStatus(r) === 'error').length}
                </p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}