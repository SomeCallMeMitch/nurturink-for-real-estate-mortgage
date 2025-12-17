import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PillDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pill Component Visual Reference</h1>
          <p className="text-lg text-gray-600">
            Demonstration of semantic and utility pill components used throughout the application
          </p>
        </div>

        {/* Semantic Pills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Semantic Pills</CardTitle>
            <CardDescription>
              Color-coded pills that convey meaning (success, warning, danger, muted)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Success / Positive</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-success">
                  Active
                </span>
                <span className="pill pill-success">
                  Completed
                </span>
                <span className="pill pill-success">
                  Verified
                </span>
                <span className="pill pill-success">
                  Approved
                </span>
              </div>
            </div>

            {/* Warning Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Warning / Caution</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-warning">
                  Pending
                </span>
                <span className="pill pill-warning">
                  In Review
                </span>
                <span className="pill pill-warning">
                  Needs Attention
                </span>
                <span className="pill pill-warning">
                  Expiring Soon
                </span>
              </div>
            </div>

            {/* Danger Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Danger / Error</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-danger">
                  Failed
                </span>
                <span className="pill pill-danger">
                  Error
                </span>
                <span className="pill pill-danger">
                  Rejected
                </span>
                <span className="pill pill-danger">
                  Overdue
                </span>
              </div>
            </div>

            {/* Muted Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Muted / Neutral</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-muted">
                  Draft
                </span>
                <span className="pill pill-muted">
                  Inactive
                </span>
                <span className="pill pill-muted">
                  Archived
                </span>
                <span className="pill pill-muted">
                  Disabled
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utility Pills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Utility Pills (Color 1–3)</CardTitle>
            <CardDescription>
              Generic colored pills for categorization, tags, or visual variety
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color 1 Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color 1 (Blue Tones)</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-color1">
                  VIP Client
                </span>
                <span className="pill pill-color1">
                  Priority
                </span>
                <span className="pill pill-color1">
                  Featured
                </span>
                <span className="pill pill-color1">
                  Pro Plan
                </span>
              </div>
            </div>

            {/* Color 2 Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color 2 (Purple Tones)</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-color2">
                  New Feature
                </span>
                <span className="pill pill-color2">
                  Beta
                </span>
                <span className="pill pill-color2">
                  Premium
                </span>
                <span className="pill pill-color2">
                  Limited
                </span>
              </div>
            </div>

            {/* Color 3 Pills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color 3 (Teal Tones)</h3>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-color3">
                  Hot Lead
                </span>
                <span className="pill pill-color3">
                  Follow Up
                </span>
                <span className="pill pill-color3">
                  High Value
                </span>
                <span className="pill pill-color3">
                  Referred
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dense / Table Context */}
        <Card>
          <CardHeader>
            <CardTitle>Dense / Table Context</CardTitle>
            <CardDescription>
              Smaller pills optimized for use in tables or compact layouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example table-like layout */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Client Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-sm">John Smith</td>
                      <td className="px-4 py-3">
                        <span className="pill pill-success text-xs">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="pill pill-color1 text-xs">
                          High
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className="pill pill-color3 text-xs">
                            VIP
                          </span>
                          <span className="pill pill-color2 text-xs">
                            Referral
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-sm">Jane Doe</td>
                      <td className="px-4 py-3">
                        <span className="pill pill-warning text-xs">
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="pill pill-muted text-xs">
                          Normal
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="pill pill-color3 text-xs">
                          Follow Up
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-sm">Bob Johnson</td>
                      <td className="px-4 py-3">
                        <span className="pill pill-danger text-xs">
                          Overdue
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="pill pill-danger text-xs">
                          Urgent
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="pill pill-muted text-xs">
                          Past Due
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Semantic pills</strong> should be used when the pill's color carries meaning (e.g., status indicators).
            </p>
            <p>
              <strong>Utility pills</strong> (Color 1–3) should be used for categorization, tags, or when multiple distinct colors are needed without specific semantic meaning.
            </p>
            <p>
              <strong>Smaller pills</strong> can be achieved by adding the <code className="bg-blue-100 px-1 rounded">text-xs</code> class for use in dense layouts like tables.
            </p>
            <p>
              All pills automatically adapt to light/dark mode based on the CSS variables defined in <code className="bg-blue-100 px-1 rounded">globals.css</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}