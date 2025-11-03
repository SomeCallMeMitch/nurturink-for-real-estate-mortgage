
import React, { useMemo } from 'react';

// ============================================
// Text Utilities (Inlined)
// ============================================

let canvasContext = null;

const getCanvasContext = (fontFamily, fontSize) => {
  if (!canvasContext) {
    const canvas = document.createElement('canvas');
    canvasContext = canvas.getContext('2d');
  }
  canvasContext.font = `${fontSize}px ${fontFamily}`;
  return canvasContext;
};

const replacePlaceholders = (text, client, user, noteStyleProfile) => {
  if (!text) return '';
  
  let result = text;

  if (client) {
    result = result.replace(/{{firstName}}/g, client.firstName || '');
    result = result.replace(/{{lastName}}/g, client.lastName || '');
    result = result.replace(/{{fullName}}/g, client.fullName || '');
    result = result.replace(/{{address1}}/g, client.address1 || '');
    result = result.replace(/{{address2}}/g, client.address2 || '');
    result = result.replace(/{{city}}/g, client.city || '');
    result = result.replace(/{{state}}/g, client.state || '');
    result = result.replace(/{{zip}}/g, client.zip || '');
    result = result.replace(/{{companyName}}/g, client.companyName || client.company || '');
  }

  if (user) {
    result = result.replace(/{{rep_first_name}}/g, user.firstName || '');
    result = result.replace(/{{rep_last_name}}/g, user.lastName || '');
    result = result.replace(/{{rep_full_name}}/g, user.full_name || '');
    result = result.replace(/{{rep_company_name}}/g, user.companyName || '');
    result = result.replace(/{{rep_phone}}/g, user.phone || '');
    result = result.replace(/{{url}}/g, user.websiteUrl || user.companyUrl || '');
  }
  
  const today = new Date();
  result = result.replace(/{{today_date}}/g, today.toLocaleDateString());
  result = result.replace(/{{current_year}}/g, today.getFullYear().toString());

  return result;
};

const wrapTextToLines = (text, options = {}) => {
  if (!text) return [];

  const {
    fontFamily = 'Caveat',
    fontSize = 18,
    maxWidth = 355
  } = options;

  const ctx = getCanvasContext(fontFamily, fontSize);
  const paragraphs = text.split('\n');
  const allLines = [];
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      allLines.push('');
      continue;
    }
    
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          allLines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
};

const composeCompleteMessage = (greeting, messageBody, signature, client, user, noteStyleProfile) => {
  const parts = [];
  
  if (greeting) {
    const processedGreeting = replacePlaceholders(greeting, client, user, noteStyleProfile);
    if (processedGreeting.trim()) {
      parts.push(processedGreeting.trim());
    }
  }
  
  if (messageBody) {
    const processedBody = replacePlaceholders(messageBody, client, user, noteStyleProfile);
    if (processedBody.trim()) {
      parts.push(processedBody.trim());
    }
  }
  
  if (signature) {
    const processedSignature = replacePlaceholders(signature, client, user, noteStyleProfile);
    if (processedSignature.trim()) {
      parts.push(processedSignature.trim());
    }
  }
  
  return parts.join('\n\n');
};

const messageToLines = (completeMessage, options = {}) => {
  if (!completeMessage) return [];
  
  const { maxIndent = 0, ...wrapOptions } = options;
  const adjustedMaxWidth = (wrapOptions.maxWidth || 355) - maxIndent;
  
  const paragraphs = completeMessage.split('\n\n');
  const allLines = [];
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim()) {
      const lines = wrapTextToLines(paragraph.trim(), { ...wrapOptions, maxWidth: adjustedMaxWidth });
      allLines.push(...lines);
      
      if (index < paragraphs.length - 1) {
        allLines.push('');
      }
    }
  });
  
  return allLines;
};

// ============================================
// PRNG Functions
// ============================================

function hash32(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng, mean = 0, stdDev = 1) {
  const u1 = rng();
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// ============================================
// Line Indenting Logic
// ============================================

function makeLineIndenter(seed, settings) {
  const { maxIndent, indentAmplitude, indentNoise, indentFrequency } = settings;
  const rng = mulberry32(seed);
  
  return (lineIndex) => {
    if (maxIndent === 0) return 0;
    
    const wave = Math.sin(lineIndex * indentFrequency) * indentAmplitude;
    const noise = gaussian(rng, 0, indentNoise);
    const raw = wave + noise;
    
    return Math.max(0, Math.min(maxIndent, raw));
  };
}

// ============================================
// Font Class Mapping
// ============================================

const getFontClass = (fontName) => {
  const fontMap = {
    'Caveat': 'font-caveat',
    'Kalam': 'font-kalam',
    'Patrick Hand': 'font-patrick'
  };
  return fontMap[fontName] || 'font-caveat';
};

// ============================================
// CardPreview Component
// ============================================

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
    gapAboveFold,
    gapBelowFold,
    shortBelowFold,
    indentAmplitude,
    indentNoise,
    indentFrequency,
    shiftRight,
    rightPadding,
    frameWidth,
    frameHeight
  } = previewSettings;

  const isShortCard = lines.length <= shortCardMaxLines;

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

  const effectiveTextWidth = baseTextWidth - maxIndent + shiftRight - rightPadding;
  const fontClass = getFontClass(noteStyleProfile?.handwritingFont || 'Caveat');

  const renderLine = (lineText, lineIndex, globalLineIndex) => {
    const indent = getIndent(globalLineIndex);
    
    return (
      <div
        key={globalLineIndex}
        className="relative"
        style={{
          marginLeft: `${baseMarginLeft + indent + shiftRight}px`,
          width: `${effectiveTextWidth}px`,
          minHeight: lineText ? `${fontSize * lineHeight}px` : `${fontSize * lineHeight * 0.5}px`,
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
          {/* Top Half Content */}
          <div 
            className="absolute left-0 right-0"
            style={{ paddingTop: `${topHalfPaddingTop}px` }}
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

          {/* Bottom Half Content (only for non-short cards) */}
          {!isShortCard && bottomHalfLines.length > 0 && (
            <div 
              className="absolute left-0 right-0"
              style={{ 
                top: `${foldY + gapBelowFold}px`
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
