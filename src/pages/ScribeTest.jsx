import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';

const FORMAT_TESTS = [
  {
    id: 0,
    name: 'No Return Address',
    description: 'Baseline test - no return_address field at all',
    isBaseline: true
  },
  {
    id: 1,
    name: 'JSON.stringify (camelCase)',
    description: 'JSON.stringify({ firstName, lastName, street, city, state, zip })',
    code: 'formData.append("return_address", JSON.stringify({ firstName: "...", street: "..." }))'
  },
  {
    id: 2,
    name: 'Array Notation (camelCase)',
    description: 'PHP-style array: return_address[firstName], return_address[street], etc.',
    code: 'formData.append("return_address[firstName]", "...")\nformData.append("return_address[street]", "...")'
  },
  {
    id: 3,
    name: 'Dot Notation',
    description: 'Dot-style: return_address.firstName, return_address.street, etc.',
    code: 'formData.append("return_address.firstName", "...")'
  },
  {
    id: 4,
    name: 'JSON.stringify (snake_case)',
    description: 'JSON.stringify({ first_name, last_name, street, city, state, zip })',
    code: 'formData.append("return_address", JSON.stringify({ first_name: "...", street: "..." }))'
  },
  {
    id: 5,
    name: 'Array Notation (snake_case)',
    description: 'PHP-style array with snake_case: return_address[first_name], etc.',
    code: 'formData.append("return_address[first_name]", "...")'
  },
  {
    id: 6,
    name: 'Flat Fields',
    description: 'Flat prefixed fields: return_first_name, return_street, etc.',
    code: 'formData.append("return_first_name", "...")\nformData.append("return_street", "...")'
  },
  {
    id: 7,
    name: 'JSON with "name" field',
    description: 'Using "name" instead of firstName/lastName: { name, street, city, state, zip }',
    code: 'formData.append("return_address", JSON.stringify({ name: "...", street: "..." }))'
  },
  {
    id: 8,
    name: 'JSON with "address" field',
    description: 'Using "address" instead of "street": { firstName, lastName, address, city, state, zip }',
    code: 'formData.append("return_address", JSON.stringify({ firstName: "...", address: "..." }))'
  }
];

export default function ScribeTest() {
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [runningAll, setRunningAll] = useState(false);

  const runTest = async (testId) => {
    setLoading(testId);
    
    try {
      const response = await base44.functions.invoke('scribeReturnAddressTester', { 
        test: testId,
        fullTest: false
      });
      
      setResults(prev => ({
        ...prev,
        [testId]: {
          success: response.data?.campaignCreated || response.campaignCreated,
          data: response.data || response,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (err) {
      let errorData = { message: err.message || 'Test failed' };
      try {
        if (err.response?.data) errorData = err.response.data;
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
    
    for (const test of FORMAT_TESTS) {
      await runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setRunningAll(false);
  };

  const clearResults = () => setResults({});

  const getStatusInfo = (result) => {
    if (!result) return { color: 'gray', icon: null, text: '' };
    
    if (result.success) {
      return { 
        color: 'green', 
        icon: <CheckCircle className="w-5 h-5 text-green-600" />, 
        text: 'Campaign Created!' 
      };
    }
    
    const is500 = result.data?.httpStatus === 500 || result.error?.message?.includes('500');
    if (is500) {
      return { 
        color: 'red', 
        icon: <XCircle className="w-5 h-5 text-red-600" />, 
        text: '500 Error - Format rejected' 
      };
    }
    
    return { 
      color: 'orange', 
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, 
        text: 'Other error' 
    };
  };

  const getCardClass = (result) => {
    if (!result) return '';
    const status = getStatusInfo(result);
    switch (status.color) {
      case 'green': return 'bg-green-50 border-green-200';
      case 'red': return 'bg-red-50 border-red-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      default: return '';
    }
  };

  const successCount = Object.values(results).filter(r => r?.success).length;
  const failCount = Object.values(results).filter(r => r && !r.success).length;
  const workingFormats = FORMAT_TESTS.filter(t => results[t.id]?.success);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Return Address Format Tester</h1>
          <p className="text-gray-500 mt-1">
            Finding the correct format for Scribe's return_address field
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearResults} disabled={runningAll || loading}>
            <RotateCcw className="w-4 h-4 mr-2" /> Clear
          </Button>
          <Button onClick={runAllTests} disabled={runningAll || loading}>
            {runningAll ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing All...</>
            ) : (
              'Run All Formats'
            )}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">What we're testing:</p>
          <p className="mt-1">
            The return_address field is causing a 500 error. Scribe's PHP expects an array but is receiving a string.
            We're testing different ways to send this data to find what format Scribe actually expects.
          </p>
          <p className="mt-2">
            <span className="text-green-600 font-medium">Green</span> = Format works | 
            <span className="text-red-600 font-medium ml-2">Red</span> = 500 error (format rejected)
          </p>
        </div>
      </div>

      {/* Quick Summary */}
      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className={successCount > 0 ? 'bg-green-50 border-green-200' : ''}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{successCount}</p>
                <p className="text-sm text-green-700">Working Formats</p>
              </div>
            </CardContent>
          </Card>
          <Card className={failCount > 0 && successCount === 0 ? 'bg-red-50 border-red-200' : ''}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{failCount}</p>
                <p className="text-sm text-red-700">Failed Formats</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Working Format Highlight */}
      {workingFormats.length > 0 && (
        <Card className="bg-green-100 border-green-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Working Format Found!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workingFormats.map(format => (
              <div key={format.id} className="mb-2">
                <p className="font-medium text-green-900">{format.name}</p>
                <p className="text-sm text-green-700">{format.description}</p>
                {format.code && (
                  <pre className="mt-1 text-xs bg-white p-2 rounded border border-green-200 overflow-x-auto">
                    {format.code}
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Test Cards */}
      <div className="grid gap-3">
        {FORMAT_TESTS.map((test) => {
          const result = results[test.id];
          const status = getStatusInfo(result);
          
          return (
            <Card key={test.id} className={getCardClass(result)}>
              <CardHeader className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-gray-400 text-sm">#{test.id}</span>
                      {test.name}
                      {test.isBaseline && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Baseline
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">{test.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {result && (
                      <div className="flex items-center gap-2">
                        {status.icon}
                        <span className={`text-sm font-medium text-${status.color}-700`}>
                          {status.text}
                        </span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant={result?.success ? "outline" : "default"}
                      onClick={() => runTest(test.id)}
                      disabled={loading === test.id || runningAll}
                    >
                      {loading === test.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Play className="w-4 h-4 mr-1" /> Test</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {result && (
                <CardContent className="pt-0 pb-3">
                  {result.data?.campaignId && (
                    <p className="text-sm text-green-700 mb-2">
                      <span className="font-medium">Campaign ID:</span> {result.data.campaignId}
                    </p>
                  )}
                  
                  {result.data?.error && (
                    <p className="text-sm text-red-700 mb-2">
                      <span className="font-medium">Error:</span> {result.data.error.substring(0, 100)}...
                    </p>
                  )}
                  
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View full response
                    </summary>
                    <pre className="text-xs overflow-auto bg-white p-2 rounded border mt-1 max-h-32">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Code Sample */}
      {workingFormats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Implementation Code</CardTitle>
            <CardDescription>Use this in submitBatchToScribe.js</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`// Working format: ${workingFormats[0].name}
${workingFormats[0].code || '// See format description above'}`}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}