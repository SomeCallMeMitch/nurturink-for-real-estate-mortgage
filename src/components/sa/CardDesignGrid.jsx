import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Trash, 
  Star,
  CheckCircle,
  Image as ImageIcon,
  FileArchive,
  Loader2,
  Check
} from 'lucide-react';
import { getBestOutsideUrl } from '@/components/utils/imageHelpers';

/**
 * CardDesignCard Component
 * Single card design display
 */
function CardDesignCard({ 
  design, 
  categories, 
  isFavorite, 
  onToggleFavorite, 
  onEdit, 
  onDelete,
  onGenerateZip,
  isGeneratingZip
}) {
  return (
    <Card className="overflow-hidden relative group">
      {/* Favorite Star Button */}
      <button
        onClick={(e) => onToggleFavorite(e, design.id)}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
      >
        <Star
          className={`w-5 h-5 ${
            isFavorite 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-400 hover:text-yellow-400'
          }`}
        />
      </button>

      {/* Images - Outside and Inside */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-200" style={{ height: '180px' }}>
        <div className="relative overflow-hidden">
          <img
            src={getBestOutsideUrl(design, 'thumbnail')}
            alt={`${design.name} - Outside`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            Outside
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            src={design.insideImageUrl || design.imageUrl}
            alt={`${design.name} - Inside`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            Inside
          </div>
        </div>
      </div>

      <CardContent className="pt-3 pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1 text-sm">{design.name}</h3>
          {design.isDefault && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Default
            </div>
          )}
        </div>
        
        {/* Categories */}
        {design.cardDesignCategoryIds && design.cardDesignCategoryIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {design.cardDesignCategoryIds.slice(0, 3).map((catId) => {
              const cat = categories.find(c => c.id === catId);
              return cat ? (
                <span key={catId} className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                  {cat.name}
                </span>
              ) : null;
            })}
            {design.cardDesignCategoryIds.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{design.cardDesignCategoryIds.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Physical card indicator */}
        {(design.frontImageUrl || design.backImageUrl) && (
          <div className="text-xs text-gray-500 mb-2">
            ✓ Physical card images
          </div>
        )}

        {/* Scribe ZIP status */}
        <div className="flex items-center gap-2 mb-2">
          {design.scribeZipUrl ? (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Scribe ZIP ready
            </span>
          ) : (
            <span className="text-xs text-amber-600">No Scribe ZIP</span>
          )}
          {!design.insideImageUrl && (
            <span className="text-xs text-gray-500">(Inside: Default white)</span>
          )}
        </div>

        {/* Generate ZIP Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onGenerateZip(design)}
          disabled={isGeneratingZip}
          className="w-full mb-2 h-8"
        >
          {isGeneratingZip ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileArchive className="w-3 h-3 mr-1" />
              {design.scribeZipUrl ? 'Regenerate ZIP' : 'Generate Scribe ZIP'}
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(design)}
            className="flex-1 h-8"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(design)}
            className="text-red-600 hover:text-red-700 h-8"
          >
            <Trash className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CardDesignGrid Component
 * Grid display of card designs with actions
 * 
 * @param {Array} designs - List of card designs
 * @param {Array} categories - Categories for badge display
 * @param {Array} favoriteIds - IDs of favorited designs
 * @param {Function} onToggleFavorite - Toggle favorite callback
 * @param {Function} onEdit - Edit design callback
 * @param {Function} onDelete - Delete design callback
 * @param {Function} onAdd - Add new design callback
 * @param {Function} onGenerateZip - Generate Scribe ZIP callback
 * @param {string|null} generatingZipFor - ID of design currently generating ZIP
 */
export default function CardDesignGrid({
  designs = [],
  categories = [],
  favoriteIds = [],
  onToggleFavorite,
  onEdit,
  onDelete,
  onAdd,
  onGenerateZip,
  generatingZipFor = null
}) {
  if (designs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No card designs yet. Create your first design!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {designs.map((design) => (
        <CardDesignCard
          key={design.id}
          design={design}
          categories={categories}
          isFavorite={favoriteIds.includes(design.id)}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerateZip={onGenerateZip}
          isGeneratingZip={generatingZipFor === design.id}
        />
      ))}
    </div>
  );
}