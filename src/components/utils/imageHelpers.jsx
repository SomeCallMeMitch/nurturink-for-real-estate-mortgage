import { base44 } from "@/api/base44Client";

/**
 * Image resizing and variant generation utilities
 */

const VARIANTS = {
  w600: { width: 600, height: 873 },
  w400: { width: 400, height: 582 },
  w200: { width: 200, height: 291 }
};

const JPEG_QUALITY = 0.8;

/**
 * Resizes an image to specific dimensions using Canvas
 * @param {HTMLImageElement} img - Source image
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<Blob>} - Resized image blob
 */
const resizeToCanvas = (img, width, height) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', JPEG_QUALITY);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Loads a file object into an HTMLImageElement
 * @param {File} file 
 * @returns {Promise<HTMLImageElement>}
 */
const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
};

/**
 * Generates and uploads image variants
 * @param {File} file - Original file object
 * @returns {Promise<{full: string, w600: string, w400: string, w200: string}>}
 */
export const uploadImageVariants = async (file) => {
  // 1. Load image
  const img = await loadImageFromFile(file);
  
  // 2. Prepare resize promises
  // We use the aspect ratio of the variants defined in VARIANTS, but we should strictly use the defined dimensions as per plan constraints
  // Plan says: "Variant sizes are fixed at 600×873, 400×582, 200×291 using Math.round."
  // Note: The original image might have a different aspect ratio. 
  // Plan says: "Always scale down, preserve aspect ratio, never crop."
  // IF we must preserve aspect ratio AND fix dimensions, we must calculate height based on width and aspect ratio of original.
  // BUT the plan explicitly listed "600x873" etc. which implies a specific aspect ratio (approx 1.455).
  // Nurturink cards are usually 5x7 or similar. 
  // Re-reading plan: "Heights will be calculated by preserving the aspect ratio of the outsideImageUrl (canonical full image) based on the target width, and rounded using Math.round."
  // OK, so the fixed heights in the plan (873, 582, 291) were likely EXAMPLES based on a standard 5x7 card (or similar).
  // I should calculate height dynamically to preserve aspect ratio.
  
  const aspectRatio = img.height / img.width;
  
  const generateVariant = async (targetWidth) => {
    const targetHeight = Math.round(targetWidth * aspectRatio);
    const blob = await resizeToCanvas(img, targetWidth, targetHeight);
    const variantFile = new File([blob], `variant_${targetWidth}.jpg`, { type: 'image/jpeg' });
    return base44.integrations.Core.UploadFile({ file: variantFile });
  };

  // 3. Upload Full (Original)
  // We upload the original file as is
  const uploadFullPromise = base44.integrations.Core.UploadFile({ file });
  
  // 4. Generate and Upload Variants in parallel
  const [fullRes, w600Res, w400Res, w200Res] = await Promise.all([
    uploadFullPromise,
    generateVariant(600),
    generateVariant(400),
    generateVariant(200)
  ]);

  return {
    full: fullRes.file_url,
    w600: w600Res.file_url,
    w400: w400Res.file_url,
    w200: w200Res.file_url
  };
};

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