/**
 * Gets the best image URL for the given context
 * @param {Object} cardDesign - Card design object
 * @param {string} context - 'thumbnail', 'cardTile', 'modal', 'detail', 'print'
 * @returns {string} - Best available URL
 */
export const getBestOutsideUrl = (cardDesign, context = 'detail') => {
  if (!cardDesign) return '';
  
  const variants = cardDesign.outsideImageVariants || {};
  const fullUrl = cardDesign.outsideImageUrl || cardDesign.imageUrl || '';
  
  // Context mapping
  // thumbnail / tile -> w200
  // picker / modal -> w400
  // detail / admin -> w600
  // print / export -> full
  
  let preferredVariant = null;
  
  switch (context) {
    case 'thumbnail':
    case 'cardTile':
    case 'list':
      preferredVariant = variants.w200 || variants.w400 || variants.w600;
      break;
    case 'picker':
    case 'modal':
    case 'preview':
      preferredVariant = variants.w400 || variants.w600 || variants.w200;
      break;
    case 'detail':
    case 'admin':
      preferredVariant = variants.w600 || variants.w400 || variants.w200;
      break;
    case 'print':
    case 'export':
    case 'full':
    default:
      preferredVariant = null; // Always force full
      break;
  }
  
  return preferredVariant || fullUrl;
};