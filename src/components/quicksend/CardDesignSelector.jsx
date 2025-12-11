import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

/**
 * CardDesignSelector Component
 * Displays selected card design with button to open picker modal
 * 
 * @param {Object} selectedDesign - Currently selected CardDesign object
 * @param {Function} onOpenPicker - Callback to open design picker modal
 */
export default function CardDesignSelector({ selectedDesign, onOpenPicker }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <Label>Card Design *</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between mt-1 h-auto py-3"
            onClick={onOpenPicker}
          >
            <span className="flex items-center gap-3">
              {selectedDesign ? (
                <>
                  <img 
                    src={selectedDesign.frontImageUrl || selectedDesign.outsideImageUrl || selectedDesign.imageUrl} 
                    alt="" 
                    className="w-14 aspect-[11/8] object-cover rounded flex-shrink-0"
                  />
                  <span className="text-gray-900 truncate">{selectedDesign.name}</span>
                </>
              ) : (
                <span className="text-gray-400">Select a card design...</span>
              )}
            </span>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}