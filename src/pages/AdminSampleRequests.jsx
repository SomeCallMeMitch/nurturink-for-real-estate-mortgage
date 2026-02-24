import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, MapPin, Building2, ShoppingCart, RefreshCcw } from 'lucide-react';

// Maps status values to badge styles
const STATUS_STYLES = {
  new:        'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  sent:       'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};

const SOURCE_STYLES = {
  solar:       'bg-yellow-100 text-yellow-800',
  roofing:     'bg-orange-100 text-orange-800',
  insurance:   'bg-purple-100 text-purple-800',
  real_estate: 'bg-teal-100 text-teal-800',
  other:       'bg-gray-100 text-gray-700',
};

export default function AdminSampleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SampleRequest.list('-created_date', 200);
    setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    await base44.entities.SampleRequest.update(id, { status });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setUpdatingId(null);
  };

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sample Requests</h1>
            <p className="text-gray-500 text-sm">
              {requests.length} total request{requests.length !== 1 ? 's' : ''} from landing pages
            </p>
          </div>
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Mail className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sample requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <Card key={r.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">

                    {/* Left: contact info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {r.firstName} {r.lastName}
                        </span>
                        {/* Source badge */}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_STYLES[r.source] || SOURCE_STYLES.other}`}>
                          {r.source?.replace('_', ' ') || 'other'}
                        </span>
                        {/* Status badge */}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] || STATUS_STYLES.new}`}>
                          {r.status || 'new'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline truncate">
                            {r.email}
                          </a>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{r.address}, {r.city}, {r.stateZip}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{r.storeNameOrUrl}</span>
                        </div>
                        {r.productType && (
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{r.productType}</span>
                          </div>
                        )}
                        {r.monthlyOrders && (
                          <div className="text-gray-500 text-xs col-span-2 mt-0.5">
                            Monthly volume: <span className="font-medium text-gray-700">{r.monthlyOrders}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Submitted {formatDate(r.created_date)}
                      </p>
                    </div>

                    {/* Right: status actions */}
                    <div className="flex flex-col gap-2 min-w-[130px]">
                      {['new', 'processing', 'sent', 'cancelled'].map((s) => (
                        <button
                          key={s}
                          disabled={r.status === s || updatingId === r.id}
                          onClick={() => updateStatus(r.id, s)}
                          className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                            ${r.status === s
                              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-default'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {updatingId === r.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : null}
                          {' '}{s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}