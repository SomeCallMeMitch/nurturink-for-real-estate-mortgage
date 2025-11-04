
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
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{company\}\}/g, client.company || '');
    result = result.replace(/\{\{address1\}\}/g, client.address1 || '');
    result = result.replace(/\{\{city\}\}/g, client.city || '');
    result = result.replace(/\{\{state\}\}/g, client.state || '');
    result = result.replace(/\{\{zip\}\}/g, client.zip || '');
  }
  
  // User/Rep placeholders
  if (user) {
    result = result.replace(/\{\{rep_full_name\}\}/g, user.full_name || '');
    result = result.replace(/\{\{rep_first_name\}\}/g, user.firstName || '');
    result = result.replace(/\{\{rep_last_name\}\}/g, user.lastName || '');
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
  }
  
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

  // Use different top padding based on card length
  const topPadding = isShortCard ? topHalfPaddingTop : longCardTopPadding;

  let topHalfLines = [];
  let bottomHalfLines = [];

  if (isShortCard) {
    topHalfLines = lines;
  } else {
    const midPoint = Math.ceil(lines.length / 2);
    topHalfLines = lines.slice(0, midPoint);
    bottomHalfLines = lines.slice(midPoint);
  }

  const seed = hash32(lines.join(''));
  const getIndent = randomIndentEnabled 
    ? makeLineIndenter(seed, { maxIndent, indentAmplitude, indentNoise, indentFrequency })
    : () => 0;

  const effectiveTextWidth = baseTextWidth - maxIndent;
  const fontClass = getFontClass(noteStyleProfile?.handwritingFont || 'Caveat');

  const renderLine = (lineText, lineIndex, globalLineIndex) => {
    const indent = getIndent(globalLineIndex);
    
    // Calculate actual line height in pixels
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

  // Calculate fold position - ALWAYS at vertical center
  const foldY = frameHeight / 2;

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
          {/* Top Half Content with gap below */}
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

          {/* Bottom Half Content with gap above */}
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
