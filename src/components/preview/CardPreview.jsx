import React, { useMemo } from 'react';

// Utility function for font mapping
const getFontClass = (fontName) => {
  const fontMap = {
    'Caveat': 'font-caveat',
    'Patrick Hand': 'font-patrick-hand',
    'Indie Flower': 'font-indie-flower',
    'Dancing Script': 'font-dancing-script'
  };
  return fontMap[fontName] || 'font-caveat';
};

// Replace placeholders in text with actual values
// Supports {{client.firstName}}, {{me.fullName}}, {{org.name}} format
// Must match placeholders defined in PlaceholderModal.js
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.initials\}\}/g, 
      client.firstName && client.lastName 
        ? `${client.firstName[0]}${client.lastName[0]}` 
        : ''
    );
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  // User placeholders
  if (user) {
    result = result.replace(/\{\{user\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{user\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{user\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{user\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{user\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{user\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{user\.companyName\}\}/g, user.companyName || '');
    result = result.replace(/\{\{user\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{user\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{user\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{user\.zipCode\}\}/g, user.zipCode || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
};

// Compose complete message with greeting, body, and signature
const composeCompleteMessage = (greeting, message, signature, client, user, organization) => {
  const parts = [];
  
  if (greeting) {
    const processedGreeting = replacePlaceholders(greeting, client, user, organization);
    if (processedGreeting) parts.push(processedGreeting);
  }
  
  if (message) {
    const processedMessage = replacePlaceholders(message, client, user, organization);
    if (processedMessage) parts.push(processedMessage);
  }
  
  if (signature) {
    const processedSignature = replacePlaceholders(signature, client, user, organization);
    if (processedSignature) parts.push(processedSignature);
  }
  
  return parts.join('\n\n');
};

// Message line breaking logic
const messageToLines = (message, config) => {
  if (!message) return [];
  
  const { fontFamily, fontSize, lineHeight, maxWidth, maxIndent } = config;
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${fontFamily}`;
  
  const effectiveMaxWidth = maxWidth - maxIndent;
  
  const paragraphs = message.split('\n');
  const allLines = [];
  
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === '') {
      allLines.push('');
      return;
    }
    
    const words = paragraph.split(' ');
    let currentLine = '';
    
    words.forEach((word, index) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = context.measureText(testLine);
      
      if (metrics.width > effectiveMaxWidth && currentLine) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
      
      if (index === words.length - 1) {
        allLines.push(currentLine);
      }
    });
  });
  
  return allLines;
};

// Simple hash function for seed generation
const hash32 = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Random indent generator for handwritten effect
const makeLineIndenter = (seed, { maxIndent, indentAmplitude, indentNoise, indentFrequency }) => {
  const rng = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  return (lineIndex) => {
    const drift = indentAmplitude * Math.sin(lineIndex * indentFrequency + seed);
    const noise = indentNoise * (rng(seed + lineIndex) - 0.5) * 2;
    const total = drift + noise;
    
    return Math.max(0, Math.min(maxIndent, total));
  };
};

const CardPreview = ({ 
  message = '', 
  client, 
  user,
  organization,
  noteStyleProfile, 
  selectedDesign, 
  previewSettings,
  includeGreeting = true,
  includeSignature = true,
  randomIndentEnabled = true
}) => {

  const composedMessage = useMemo(() => 
    composeCompleteMessage(
      includeGreeting ? (noteStyleProfile?.defaultGreeting || '') : '',
      message,
      includeSignature ? (noteStyleProfile?.signatureText || '') : '',
      client,
      user,
      organization
    ),
    [message, client, user, organization, noteStyleProfile, includeGreeting, includeSignature]
  );

  const { fontSize, lineHeight, baseTextWidth, maxIndent } = previewSettings;

  const lines = useMemo(() => 
    messageToLines(composedMessage, {
      fontFamily: noteStyleProfile?.handwritingFont || 'Caveat',
      fontSize: fontSize,
      lineHeight: lineHeight,
      maxWidth: baseTextWidth,
      maxIndent: maxIndent
    }),
    [composedMessage, noteStyleProfile, fontSize, lineHeight, baseTextWidth, maxIndent]
  );

  const {
    baseMarginLeft,
    shortCardMaxLines,
    maxPreviewLines,
    topHalfPaddingTop,
    longCardTopPadding,
    gapAboveFold,
    gapBelowFold,
    indentAmplitude,
    indentNoise,
    indentFrequency,
    frameWidth,
    frameHeight
  } = previewSettings;

  const isShortCard = lines.length <= shortCardMaxLines;
  const topPadding = isShortCard ? topHalfPaddingTop : longCardTopPadding;
  const foldY = frameHeight / 2;

  // Calculate signature line count
  const signatureLineCount = useMemo(() => {
    if (!includeSignature || !noteStyleProfile?.signatureText) return 0;
    
    const rawSignature = replacePlaceholders(
      noteStyleProfile.signatureText,
      client,
      user,
      organization
    );
    
    const sigLines = messageToLines(rawSignature, {
      fontFamily: noteStyleProfile?.handwritingFont || 'Caveat',
      fontSize: fontSize,
      lineHeight: lineHeight,
      maxWidth: baseTextWidth,
      maxIndent: maxIndent
    });
    
    return sigLines.length;
  }, [includeSignature, noteStyleProfile, client, user, organization, fontSize, lineHeight, baseTextWidth, maxIndent]);

  // Calculate dynamic split point with signature protection
  const { topHalfLines, bottomHalfLines } = useMemo(() => {
    if (isShortCard) {
      return { topHalfLines: lines, bottomHalfLines: [] };
    }

    const lineHeightPx = fontSize * lineHeight;
    
    let currentY = topPadding;
    const linePositions = [];
    
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const thisLineHeight = lineText ? lineHeightPx : lineHeightPx * 0.5;
      
      linePositions.push({
        index: i,
        startY: currentY,
        endY: currentY + thisLineHeight
      });
      
      currentY += thisLineHeight;
    }
    
    let dynamicSplitIndex = lines.length;
    for (let i = 0; i < linePositions.length; i++) {
      if (linePositions[i].endY > foldY) {
        dynamicSplitIndex = i;
        break;
      }
    }
    
    if (signatureLineCount > 0) {
      const signatureStartIndex = lines.length - signatureLineCount;
      
      if (dynamicSplitIndex > signatureStartIndex && dynamicSplitIndex < lines.length) {
        dynamicSplitIndex = signatureStartIndex;
      }
    }
    
    return {
      topHalfLines: lines.slice(0, dynamicSplitIndex),
      bottomHalfLines: lines.slice(dynamicSplitIndex)
    };
  }, [lines, isShortCard, fontSize, lineHeight, topPadding, foldY, signatureLineCount]);

  const seed = hash32(lines.join(''));
  const getIndent = randomIndentEnabled 
    ? makeLineIndenter(seed, { maxIndent, indentAmplitude, indentNoise, indentFrequency })
    : () => 0;

  const effectiveTextWidth = baseTextWidth - maxIndent;
  const fontClass = getFontClass(noteStyleProfile?.handwritingFont || 'Caveat');

  const renderLine = (lineText, lineIndex, globalLineIndex) => {
    const indent = getIndent(globalLineIndex);
    const lineHeightPx = fontSize * lineHeight;
    
    return (
      <div
        key={globalLineIndex}
        className="relative overflow-hidden"
        style={{
          marginLeft: `${baseMarginLeft + indent}px`,
          width: `${effectiveTextWidth}px`,
          height: lineText ? `${lineHeightPx}px` : `${lineHeightPx * 0.5}px`,
        }}
      >
        <span 
          className={fontClass}
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            display: 'inline-block',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {lineText || '\u00A0'}
        </span>
      </div>
    );
  };

  // Use insideImageUrl for the card preview (where the message goes)
  // Fall back to legacy imageUrl if insideImageUrl is not set
  const designImageUrl = selectedDesign?.insideImageUrl || selectedDesign?.imageUrl;

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ 
          width: `${frameWidth}px`,
          height: `${frameHeight}px`
        }}
      >
        {/* Card Design Background Image - INSIDE view */}
        {designImageUrl ? (
          <img
            src={designImageUrl}
            alt="Card design inside"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : selectedDesign ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400 px-4">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No inside design image</p>
            </div>
          </div>
        ) : null}

        <div className="absolute inset-0 pointer-events-none">
          {/* Top Half Content */}
          <div 
            className="absolute left-0 right-0"
            style={{ 
              paddingTop: `${topPadding}px`,
              paddingBottom: `${gapAboveFold}px`
            }}
          >
            {topHalfLines.map((line, idx) => 
              renderLine(line, idx, idx)
            )}
          </div>

          {/* Fold Line - ALWAYS at vertical center */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 opacity-50"
            style={{ 
              top: `${foldY}px`
            }}
          />

          {/* Bottom Half Content */}
          {!isShortCard && bottomHalfLines.length > 0 && (
            <div 
              className="absolute left-0 right-0"
              style={{ 
                top: `${foldY}px`,
                paddingTop: `${gapBelowFold}px`
              }}
            >
              {bottomHalfLines.map((line, idx) => 
                renderLine(line, idx, topHalfLines.length + idx)
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>
          {lines.length} lines total
          {!isShortCard && ` (${topHalfLines.length} top / ${bottomHalfLines.length} bottom)`}
          {isShortCard && ' (short card)'}
        </p>
        {lines.length > maxPreviewLines && (
          <p className="text-orange-600 font-medium">
            ⚠️ Message exceeds {maxPreviewLines} line limit
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(CardPreview);