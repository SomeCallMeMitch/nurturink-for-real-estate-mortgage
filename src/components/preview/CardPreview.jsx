
import React, { useMemo } from 'react';

// Utility functions
const getFontClass = (fontName) => {
  const fontMap = {
    'Caveat': 'font-caveat',
    'Patrick Hand': 'font-patrick-hand',
    'Indie Flower': 'font-indie-flower',
    'Dancing Script': 'font-dancing-script'
  };
  return fontMap[fontName] || 'font-caveat';
};

const replacePlaceholders = (text, client, user, noteStyleProfile) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders - NEW SYNTAX
  if (client) {
    // Name placeholders
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    
    // Calculate initials
    const initials = ((client.firstName?.[0] || '') + (client.lastName?.[0] || '')).toUpperCase();
    result = result.replace(/\{\{client\.initials\}\}/g, initials);
    
    // Contact placeholders
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    
    // Address placeholders
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    
    // Business placeholders
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
    
    // LEGACY SUPPORT - Keep old placeholder syntax working
    result = result.replace(/\{\{firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{company\}\}/g, client.company || '');
    result = result.replace(/\{\{address1\}\}/g, client.street || '');
    result = result.replace(/\{\{city\}\}/g, client.city || '');
    result = result.replace(/\{\{state\}\}/g, client.state || '');
    result = result.replace(/\{\{zip\}\}/g, client.zipCode || '');
  }
  
  // User/Me placeholders - NEW SYNTAX
  if (user) {
    // Name placeholders
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    
    // Contact placeholders
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    
    // Business placeholders
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    
    // Address placeholders
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
    
    // LEGACY SUPPORT - Keep old placeholder syntax working
    result = result.replace(/\{\{rep_full_name\}\}/g, user.full_name || '');
    result = result.replace(/\{\{rep_first_name\}\}/g, user.firstName || '');
    result = result.replace(/\{\{rep_last_name\}\}/g, user.lastName || '');
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
  }
  
  // Organization placeholders - NEW SYNTAX
  // Note: org data would need to be passed in if available
  // For now, these will remain as-is if org data not provided
  
  return result;
};

const composeCompleteMessage = (greeting, body, signature, client, user, noteStyleProfile) => {
  const parts = [];
  
  if (greeting) {
    parts.push(replacePlaceholders(greeting, client, user, noteStyleProfile));
  }
  
  if (body) {
    parts.push(replacePlaceholders(body, client, user, noteStyleProfile));
  }
  
  if (signature) {
    parts.push(replacePlaceholders(signature, client, user, noteStyleProfile));
  }
  
  return parts.join('\n');
};

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

const hash32 = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

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
  noteStyleProfile, 
  selectedDesign, 
  previewSettings,
  includeGreeting = true,
  includeSignature = true,
  leaveUnknownInPreview = false,
  randomIndentEnabled = true, 
  showLineCounter = false
}) => {

  const composedMessage = useMemo(() => 
    composeCompleteMessage(
      includeGreeting ? (noteStyleProfile?.defaultGreeting || '') : '',
      message,
      includeSignature ? (noteStyleProfile?.signatureText || '') : '',
      client,
      user,
      noteStyleProfile
    ),
    [message, client, user, noteStyleProfile, includeGreeting, includeSignature]
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
      noteStyleProfile
    );
    
    const sigLines = messageToLines(rawSignature, {
      fontFamily: noteStyleProfile?.handwritingFont || 'Caveat',
      fontSize: fontSize,
      lineHeight: lineHeight,
      maxWidth: baseTextWidth,
      maxIndent: maxIndent
    });
    
    return sigLines.length;
  }, [includeSignature, noteStyleProfile, client, user, fontSize, lineHeight, baseTextWidth, maxIndent]);

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

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ 
          width: `${frameWidth}px`,
          height: `${frameHeight}px`
        }}
      >
        {selectedDesign?.imageUrl && (
          <img
            src={selectedDesign.imageUrl}
            alt="Card design"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

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
