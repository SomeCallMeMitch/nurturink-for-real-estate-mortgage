import React, { useMemo } from 'react';
import { 
  composeCompleteMessage, 
  messageToLines 
} from '@/utils/textUtils';

// ============================================
// PRNG Functions (Pseudo-Random Number Generator)
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
  showLineCounter = true
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
        {showLineCounter && (
          <span 
            className="absolute left-[-30px] text-[10px] text-gray-400 font-mono"
            style={{ top: '0px' }}
          >
            {globalLineIndex + 1}
          </span>
        )}
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
          <div 
            className="absolute top-0 left-0 right-0"
            style={{ paddingTop: `${topHalfPaddingTop}px` }}
          >
            {topHalfLines.map((line, idx) => 
              renderLine(line, idx, idx)
            )}
          </div>

          {!isShortCard && bottomHalfLines.length > 0 && (
            <>
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 opacity-30"
                style={{ 
                  top: `${frameHeight / 2 - gapAboveFold}px`
                }}
              />
              
              <div 
                className="absolute left-0 right-0"
                style={{ 
                  top: `${frameHeight / 2 + gapBelowFold}px`
                }}
              >
                {bottomHalfLines.map((line, idx) => 
                  renderLine(line, idx, topHalfLines.length + idx)
                )}
              </div>
            </>
          )}

          {isShortCard && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 opacity-30"
              style={{ 
                top: `${topHalfPaddingTop + (topHalfLines.length * fontSize * lineHeight) + shortBelowFold}px`
              }}
            />
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