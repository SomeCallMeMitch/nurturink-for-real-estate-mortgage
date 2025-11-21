import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    leadsPerMonth: 50,
    currentCloseRate: 15,
    averageJobValue: 15000,
    costPerNote: 3.5
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  // Calculate ROI metrics
  const currentMonthlyRevenue = (inputs.leadsPerMonth * inputs.currentCloseRate / 100) * inputs.averageJobValue;
  const improvedCloseRate = inputs.currentCloseRate + (inputs.currentCloseRate * 0.25); // 25% improvement
  const newMonthlyRevenue = (inputs.leadsPerMonth * improvedCloseRate / 100) * inputs.averageJobValue;
  const additionalRevenue = newMonthlyRevenue - currentMonthlyRevenue;
  const monthlyCost = inputs.leadsPerMonth * inputs.costPerNote;
  const monthlyProfit = additionalRevenue - monthlyCost;
  const roi = ((monthlyProfit / monthlyCost) * 100).toFixed(0);
  const annualProfit = monthlyProfit * 12;

  return (
    <Card className="bg-white shadow-xl">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Business Details</h3>
            
            <div>
              <Label htmlFor="leadsPerMonth">Leads per month</Label>
              <Input
                id="leadsPerMonth"
                type="number"
                value={inputs.leadsPerMonth}
                onChange={(e) => handleInputChange('leadsPerMonth', e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="currentCloseRate">Current close rate (%)</Label>
              <Input
                id="currentCloseRate"
                type="number"
                value={inputs.currentCloseRate}
                onChange={(e) => handleInputChange('currentCloseRate', e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="averageJobValue">Average job value ($)</Label>
              <Input
                id="averageJobValue"
                type="number"
                value={inputs.averageJobValue}
                onChange={(e) => handleInputChange('averageJobValue', e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="costPerNote">Cost per note ($)</Label>
              <Input
                id="costPerNote"
                type="number"
                step="0.1"
                value={inputs.costPerNote}
                onChange={(e) => handleInputChange('costPerNote', e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Potential Results</h3>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Additional Monthly Revenue</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${additionalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Monthly Net Profit</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                ${monthlyProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                After ${monthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} in note costs
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Return on Investment</div>
              <div className="text-3xl font-bold text-orange-600">{roi}%</div>
              <div className="text-sm text-gray-600 mt-2">
                Annual profit: ${annualProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="text-xs text-gray-500 italic">
              * Based on a conservative 25% improvement in close rate. Results may vary.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}