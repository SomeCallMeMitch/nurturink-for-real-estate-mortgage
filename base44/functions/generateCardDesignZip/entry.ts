import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from 'npm:jszip@3.10.1';

/**
 * generateCardDesignZip
 * 
 * Pre-generates a ZIP file containing card design images for Scribe API.
 * Called when a CardDesign is created or when its images are updated.
 * 
 * Scribe expects a ZIP with:
 * - 1.png = outside/front image (1375x2000px)
 * - 2.png = inside/back image (1375x2000px)
 * 
 * The ZIP is stored in Base44 private storage and the URI is saved to CardDesign.scribeZipUrl
 * 
 * If insideImageUrl is not set, falls back to DEFAULT_WHITE_INSIDE_URL environment variable.
 */

// Default white inside image - set via environment variable
const DEFAULT_WHITE_INSIDE_URL = Deno.env.get('DEFAULT_WHITE_INSIDE_URL') || null;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { cardDesignId } = await req.json();
    
    if (!cardDesignId) {
      return Response.json({ 
        success: false, 
        error: 'cardDesignId is required' 
      }, { status: 400 });
    }
    
    console.log(`[generateCardDesignZip] Starting for CardDesign: ${cardDesignId}`);
    
    // Load CardDesign
    const designList = await base44.entities.CardDesign.filter({ id: cardDesignId });
    if (!designList || designList.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'CardDesign not found' 
      }, { status: 404 });
    }
    
    const cardDesign = designList[0];
    console.log(`[generateCardDesignZip] Found design: ${cardDesign.name}`);
    
    // Validate outside image exists (required)
    if (!cardDesign.outsideImageUrl) {
      return Response.json({ 
        success: false, 
        error: 'CardDesign is missing required outsideImageUrl' 
      }, { status: 400 });
    }
    
    // Determine inside image - use default white if not specified
    const insideImageUrl = cardDesign.insideImageUrl || DEFAULT_WHITE_INSIDE_URL;
    const usingDefaultWhite = !cardDesign.insideImageUrl;
    
    if (!insideImageUrl) {
      return Response.json({ 
        success: false, 
        error: 'CardDesign has no insideImageUrl and no default white image is configured. Set DEFAULT_WHITE_INSIDE_URL environment variable.' 
      }, { status: 400 });
    }
    
    if (usingDefaultWhite) {
      console.log(`[generateCardDesignZip] Using default white inside image`);
    }
    
    // Helper function to fetch image buffer from URL or file_uri
    const fetchImageBuffer = async (imageUrl, imageName) => {
      let fetchUrl = imageUrl;
      
      // Check if it's a private file URI
      if (imageUrl.startsWith('private/') || imageUrl.includes('file_uri') || imageUrl.startsWith('file:')) {
        const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri: imageUrl
        });
        fetchUrl = signedUrlResult.signed_url;
      }
      
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${imageName}: HTTP ${response.status}`);
      }
      return await response.arrayBuffer();
    };
    
    // Fetch outside image (1.png - front/cover)
    console.log(`[generateCardDesignZip] Fetching outside image...`);
    let outsideBuffer;
    try {
      outsideBuffer = await fetchImageBuffer(cardDesign.outsideImageUrl, 'outside image');
    } catch (err) {
      console.error(`[generateCardDesignZip] Failed to fetch outside image:`, err);
      return Response.json({ 
        success: false, 
        error: `Failed to fetch outside image: ${err.message}` 
      }, { status: 500 });
    }
    
    // Fetch inside image (2.png - interior)
    console.log(`[generateCardDesignZip] Fetching inside image...`);
    let insideBuffer;
    try {
      insideBuffer = await fetchImageBuffer(insideImageUrl, 'inside image');
    } catch (err) {
      console.error(`[generateCardDesignZip] Failed to fetch inside image:`, err);
      return Response.json({ 
        success: false, 
        error: `Failed to fetch inside image: ${err.message}` 
      }, { status: 500 });
    }
    
    // Create ZIP file using JSZip
    console.log(`[generateCardDesignZip] Creating ZIP file...`);
    const zip = new JSZip();
    
    // Add images to ZIP
    // Scribe expects: 1.png = outside (front), 2.png = inside (back)
    zip.file('1.png', outsideBuffer);
    zip.file('2.png', insideBuffer);
    
    // Generate ZIP as Uint8Array
    const zipData = await zip.generateAsync({ 
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    console.log(`[generateCardDesignZip] ZIP created, size: ${zipData.length} bytes`);
    
    // Create a File/Blob for upload
    const zipBlob = new Blob([zipData], { type: 'application/zip' });
    const zipFile = new File([zipBlob], `card-design-${cardDesignId}.zip`, { type: 'application/zip' });
    
    // Upload to Base44 private storage
    console.log(`[generateCardDesignZip] Uploading to private storage...`);
    let uploadResult;
    try {
      uploadResult = await base44.integrations.Core.UploadPrivateFile({
        file: zipFile
      });
    } catch (err) {
      console.error(`[generateCardDesignZip] Failed to upload ZIP:`, err);
      return Response.json({ 
        success: false, 
        error: `Failed to upload ZIP to storage: ${err.message}` 
      }, { status: 500 });
    }
    
    const scribeZipUrl = uploadResult.file_uri;
    console.log(`[generateCardDesignZip] ZIP uploaded, file_uri: ${scribeZipUrl}`);
    
    // Update CardDesign with the new scribeZipUrl
    try {
      await base44.entities.CardDesign.update(cardDesignId, {
        scribeZipUrl: scribeZipUrl
      });
      console.log(`[generateCardDesignZip] CardDesign updated with scribeZipUrl`);
    } catch (err) {
      console.error(`[generateCardDesignZip] Failed to update CardDesign:`, err);
      return Response.json({ 
        success: false, 
        error: `Failed to update CardDesign: ${err.message}` 
      }, { status: 500 });
    }
    
    return Response.json({
      success: true,
      cardDesignId: cardDesignId,
      scribeZipUrl: scribeZipUrl,
      zipSizeBytes: zipData.length,
      usedDefaultWhiteInside: usingDefaultWhite
    });
    
  } catch (error) {
    console.error(`[generateCardDesignZip] Unexpected error:`, error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});