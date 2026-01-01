import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronRight, RefreshCw, Package, Calendar, User, Mail } from 'lucide-react';
import { format } from 'date-fns';

const TEST_CONFIGS = [
  {
    id: 1,
    name: 'Test 1: Return Address',
    description: 'Single recipient WITH return address - verifies array notation format works',
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
    description: "Return address with apostrophes & ampersand (Tom's Roofing & Sons)",
    payload: { test: 4 },
    critical: false
  },
  {
    id: 5,
    name: 'Test 5: Long Message',
    description: 'Message over 110 words using "Long Text" type',
    payload: { test: 5 },
    critical: false
  }
];

export default function ScribeApiTest() {
  const [loading, setLoading] = useState(null); // Which test is loading
  const [results, setResults] = useState({}); // Results keyed by test ID
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
      // Try to parse error response for more details
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
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setRunningAll(false);
  };

  const clearResults = () => {
    setResults({});
  };

  const getResultStatus = (result) => {
    if (!result) return null;
    
    // Check for 402 (insufficient credits) - this is "success" for our purposes
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
                  
                  {/* Show campaign IDs if available */}
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
                  
                  {/* Show hint for errors */}
                  {result.error?.hint && (
                    <div className="p-2 bg-white rounded border mb-2">
                      <p className="text-sm"><span className="font-medium">Hint:</span> {result.error.hint}</p>
                    </div>
                  )}
                  
                  {/* Collapsible raw response */}
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

      {/* Recent Sends History Section */}
      <RecentSendsHistory />
    </div>
  );
}

// ============================================================
// RECENT SENDS HISTORY COMPONENT
// Shows last 6 MailingBatches with expandable details
// ============================================================
function RecentSendsHistory() {
  const [batches, setBatches] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState(null);

  const loadBatches = async () => {
    setLoading(true);
    try {
      // Get last 6 batches that have been processed (not drafts)
      const batchList = await base44.entities.MailingBatch.filter(
        { status: { $ne: 'draft' } },
        '-created_date',
        6
      );
      setBatches(batchList);

      // Load notes for each batch
      const notesMap = {};
      for (const batch of batchList) {
        if (batch.id) {
          const batchNotes = await base44.entities.Note.filter(
            { mailingBatchId: batch.id },
            '-created_date',
            20
          );
          notesMap[batch.id] = batchNotes;
        }
      }
      setNotes(notesMap);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const toggleExpand = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      sending: 'bg-blue-100 text-blue-800',
      ready_to_send: 'bg-yellow-100 text-yellow-800',
      pending_review: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Sends History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading recent sends...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Sends History (Last 6)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadBatches}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
        <CardDescription>
          Click to expand and see exactly what was sent to Scribe
        </CardDescription>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sends found</p>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => {
              const isExpanded = expandedBatch === batch.id;
              const batchNotes = notes[batch.id] || [];
              
              return (
                <div key={batch.id} className="border rounded-lg overflow-hidden">
                  {/* Collapsed Header */}
                  <button
                    onClick={() => toggleExpand(batch.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Batch #{batch.id?.slice(-8).toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(batch.status)}`}>
                            {batch.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {batch.created_date ? format(new Date(batch.created_date), 'MMM d, yyyy h:mm a') : 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {batch.selectedClientIds?.length || 0} recipients
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {batch.scribeCampaigns?.length || 0} campaign(s)
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                      {/* Global Message */}
                      {batch.globalMessage && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Global Message:</h4>
                          <pre className="text-xs bg-white p-3 rounded border whitespace-pre-wrap font-mono">
                            {batch.globalMessage}
                          </pre>
                        </div>
                      )}

                      {/* Scribe Campaigns */}
                      {batch.scribeCampaigns?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Scribe Campaigns:</h4>
                          <div className="space-y-2">
                            {batch.scribeCampaigns.map((campaign, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border text-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">
                                    Campaign ID: {campaign.scribeCampaignId || 'N/A'}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    campaign.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                    campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {campaign.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div>Contacts: {campaign.contactCount || 0}</div>
                                  <div>Return Address: {campaign.returnAddressMode || 'none'}</div>
                                  <div>Card Design: {campaign.cardDesignId?.slice(-8) || 'N/A'}</div>
                                  {campaign.submittedAt && (
                                    <div>Submitted: {format(new Date(campaign.submittedAt), 'MMM d, h:mm a')}</div>
                                  )}
                                </div>
                                {campaign.errorMessage && (
                                  <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                                    Error: {campaign.errorMessage}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Individual Notes/Cards */}
                      {batchNotes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Individual Cards ({batchNotes.length}):
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {batchNotes.map((note) => (
                              <details key={note.id} className="bg-white rounded border">
                                <summary className="p-2 cursor-pointer hover:bg-gray-50 text-sm">
                                  <span className="font-medium">{note.recipientName}</span>
                                  <span className="text-gray-500 ml-2">
                                    - {note.status}
                                    {note.scribeCampaignId && ` (Campaign: ${note.scribeCampaignId})`}
                                  </span>
                                </summary>
                                <div className="p-3 border-t bg-gray-50 text-xs space-y-2">
                                  {/* Message sent to Scribe (with placeholders) */}
                                  {note.messageTemplate && (
                                    <div>
                                      <span className="font-medium text-gray-700">Message Template (sent to Scribe):</span>
                                      <pre className="mt-1 bg-white p-2 rounded border whitespace-pre-wrap font-mono">
                                        {note.messageTemplate}
                                      </pre>
                                    </div>
                                  )}
                                  {/* Resolved message (for display) */}
                                  <div>
                                    <span className="font-medium text-gray-700">Resolved Message:</span>
                                    <pre className="mt-1 bg-white p-2 rounded border whitespace-pre-wrap font-mono">
                                      {note.message}
                                    </pre>
                                  </div>
                                  {/* Return address mode */}
                                  {note.returnAddressMode && (
                                    <div>
                                      <span className="font-medium text-gray-700">Return Address Mode:</span>
                                      <span className="ml-1">{note.returnAddressMode}</span>
                                    </div>
                                  )}
                                  {/* Scribe contact ID */}
                                  {note.scribeContactId && (
                                    <div>
                                      <span className="font-medium text-gray-700">Scribe Contact ID:</span>
                                      <span className="ml-1 font-mono">{note.scribeContactId}</span>
                                    </div>
                                  )}
                                </div>
                              </details>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Batch Data */}
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View raw batch data
                        </summary>
                        <pre className="text-xs overflow-auto bg-white p-2 rounded border mt-1 max-h-48">
                          {JSON.stringify(batch, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}