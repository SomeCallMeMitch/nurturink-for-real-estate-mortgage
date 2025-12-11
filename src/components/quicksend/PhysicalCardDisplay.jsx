import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';

/**
 * PhysicalCardDisplay Component
 * Displays front and back images of the physical card (5.5" x 4" ratio)
 * 
 * @param {Object} selectedCardDesign - The selected CardDesign object
 */
export default function PhysicalCardDisplay({ selectedCardDesign }) {
  const [showFront, setShowFront] = useState(true);

  // Determine which image to display
  const displayImageUrl = showFront 
    ? selectedCardDesign?.frontImageUrl 
    : selectedCardDesign?.backImageUrl;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with toggle buttons */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Physical Card</h3>
            <div className="flex gap-2">
              <Button
                variant={showFront ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFront(true)}
              >
                Front
              </Button>
              <Button
                variant={!showFront ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFront(false)}
              >
                Back
              </Button>
            </div>
          </div>

          {/* Card image display */}
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden" style={{ aspectRatio: '5.5/4' }}>
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={showFront ? 'Card Front' : 'Card Back'}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">
                  {selectedCardDesign 
                    ? `No ${showFront ? 'front' : 'back'} image available`
                    : 'Select a card design to preview'}
                </p>
              </div>
            )}
          </div>

          {/* Dimensions label */}
          <p className="text-xs text-gray-500 text-center">
            5.5" × 4" physical card
          </p>
        </div>
      </CardContent>
    </Card>
  );
}