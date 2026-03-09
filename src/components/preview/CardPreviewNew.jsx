/**
 * CardPreviewNew.jsx
 *
 * MERGED: Character-count-based line breaking (matches Scribe API exactly)
 *         + Full fold-aware layout (top half / bottom half split at card center)
 *
 * Line breaking rule: 52 characters max per line (Scribe's actual rule).
 * The old CardPreview used canvas pixel-width measurement, which produced
 * different wrap points than what Scribe actually prints. This version fixes
 * that while preserving all fold layout logic.
 *
 * Props (same as old CardPreview minus randomIndentEnabled and showLineCounter):
 *   message, client, user, organization, noteStyleProfile,
 *   selectedDesign, previewSettings, includeGreeting, includeSignature
 */

import React, { useMemo, useState } from 'react';

// ─────────────────────────────────────────────
// CHARACTER-COUNT LINE BREAKING (replaces canvas measureText)
// ─────────────────────────────────────────────

/**
 * Seeded pseudo-random number generator.
 * Matches the algorithm in formatMessageForScribe.ts so preview
 * indentation is consistent with what Scribe receives.
 */
function createSeededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Wraps a single line of text at maxWidth characters.
 * Handles words longer than maxWidth by hard-breaking them.
 */
function wrapText(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (word.length > maxWidth) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      for (let i = 0; i < word.length; i += maxWidth) {
        lines.push(word.substring(i, i + maxWidth));
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine.trim());

  return lines.length > 0 ? lines : [''];
}

/**
 * Converts a full composed message string into an array of display lines,
 * using Scribe's exact 52-character rule.
 *
 * - Preserves explicit line breaks (paragraphs stay separate)
 * - Wraps long lines at 52 chars
 * - Applies 1–3 space random indent to middle lines (matches Scribe spec)
 */
function messageToLines(message) {
  if (!message) return [];

  const MAX_CHARS_PER_LINE = 52;
  const MAX_INDENT_SPACES = 3;

  const seed = message.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = createSeededRandom(seed);

  // Step 1: split on explicit newlines and wrap each paragraph
  const rawLines = message.split('\n');
  const processedLines = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (trimmed === '') {
      processedLines.push('');
      continue;
    }
    // Reserve space for indentation on middle lines
    const maxContentChars = MAX_CHARS_PER_LINE - MAX_INDENT_SPACES;
    const wrapped = wrapText(trimmed, maxContentChars);
    processedLines.push(...wrapped);
  }

  // Step 2: apply random indent to middle lines
  const indentedLines = [];

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    if (i === 0 || i === processedLines.length - 1 || line === '') {
      indentedLines.push(line);
      continue;
    }
    const spaces = Math.floor(rng() * MAX_INDENT_SPACES) + 1;
    indentedLines.push(' '.repeat(spaces) + line);
  }

  // Step 3: safety re-wrap for any line that still exceeds 52 chars
  const finalLines = [];

  for (const line of indentedLines) {
    if (line.length <= MAX_CHARS_PER_LINE) {
      finalLines.push(line);
      continue;
    }
    const indentMatch = line.match(/^\s*/);
    const indent = indentMatch ? indentMatch[0] : '';
    const content = line.trim();
    const maxContentWidth = MAX_CHARS_PER_LINE - indent.length;
    const rewrapped = wrapText(content, maxContentWidth);
    for (const rewrappedLine of rewrapped) {
      finalLines.push(indent + rewrappedLine);
    }
  }

  return finalLines;
}

// ─────────────────────────────────────────────
// UNSUPPORTED CHARACTER DETECTION
// ─────────────────────────────────────────────

/**
 * Returns an array of unique characters in the message that the robot pen
 * is unlikely to be able to write.
 *
 * The robot uses ballpoint-pen cursive fonts (Caveat, Kalam, Patrick Hand,
 * Dancing Script). These cover Basic Latin, Latin Extended-A/B, and common
 * Western punctuation. Anything outside that range — emoji, non-Latin scripts,
 * Unicode symbols — cannot be physically rendered by the pen.
 *
 * SAFE ranges (robot can write):
 *   U+0020–U+007E  Basic ASCII printable (letters, digits, common punctuation)
 *   U+00A0–U+024F  Latin-1 Supplement + Latin Extended-A/B (accented Western chars)
 *   U+2013         En dash
 *   U+2014         Em dash
 *   U+2018–U+201D  Curly single and double quotes
 *   U+2026         Ellipsis
 *
 * Everything else is flagged as potentially unsupported.
 */
function detectUnsupportedChars(text) {
  if (!text) return [];

  const safeChar = (cp) => {
    if (cp >= 0x0020 && cp <= 0x007E) return true; // Basic ASCII printable
    if (cp >= 0x00A0 && cp <= 0x024F) return true; // Latin-1 + Extended A/B
    if (cp === 0x2013 || cp === 0x2014) return true; // En/em dash
    if (cp >= 0x2018 && cp <= 0x201D) return true; // Curly quotes
    if (cp === 0x2026) return true; // Ellipsis
    return false;
  };

  const found = new Set();

  // Use codePointAt to handle emoji and other multi-code-unit characters correctly
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i);
    if (!safeChar(cp)) {
      found.add(String.fromCodePoint(cp));
    }
    // Advance by 2 if this was a surrogate pair (emoji), 1 otherwise
    i += cp > 0xFFFF ? 2 : 1;
  }

  return [...found];
}

// ─────────────────────────────────────────────
// PLACEHOLDER REPLACEMENT
// ─────────────────────────────────────────────

const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';

  let result = text;

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
    // Legacy rep_ format
    result = result.replace(/\{\{rep_full_name\}\}/g, user.full_name || '');
    result = result.replace(/\{\{rep_first_name\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{rep_last_name\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{rep_email\}\}/g, user.email || '');
    // me. format
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
  }

  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }

  return result;
};

// ─────────────────────────────────────────────
// MESSAGE COMPOSITION
// ─────────────────────────────────────────────

const composeCompleteMessage = (greeting, message, signature, client, user, organization) => {
  const parts = [];

  if (greeting) {
    const processed = replacePlaceholders(greeting, client, user, organization);
    if (processed) parts.push(processed);
  }

  if (message) {
    const processed = replacePlaceholders(message, client, user, organization);
    if (processed) parts.push(processed);
  }

  if (signature) {
    const processed = replacePlaceholders(signature, client, user, organization);
    if (processed) parts.push(processed);
  }

  return parts.join('\n\n');
};

// ─────────────────────────────────────────────
// VISUAL RENDERING HELPERS (unchanged from old CardPreview)
// ─────────────────────────────────────────────

const getFontClass = (fontName) => {
  // CSS classes defined in MainLayout.jsx — must match exactly
  const fontMap = {
    'Caveat': 'font-caveat',
    'Kalam': 'font-kalam',
    'Patrick Hand': 'font-patrick', // NOTE: class is font-patrick, NOT font-patrick-hand
  };
  return fontMap[fontName] || 'font-caveat';
};

/** Simple hash for seeding the visual indent wobble */
const hash32 = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

/**
 * Generates a smooth per-line indent offset for the handwritten wobble effect.
 * This is purely visual and does NOT affect line-break calculation.
 */
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

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const CardPreviewNew = ({
  message = '',
  client,
  user,
  organization,
  noteStyleProfile,
  selectedDesign,
  previewSettings,
  includeGreeting = true,
  includeSignature = true,
  // randomIndentEnabled and showLineCounter are accepted but ignored
  // (indent is always on; counter is always shown)
  randomIndentEnabled,
  showLineCounter,
}) => {
  const [showDebug, setShowDebug] = useState(false);

  // ── Compose the full message string ──
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

  // ── Break into lines using 52-char rule ──
  const lines = useMemo(() => messageToLines(composedMessage), [composedMessage]);

  // ── Detect characters the robot pen cannot write ──
  const unsupportedChars = useMemo(
    () => detectUnsupportedChars(composedMessage),
    [composedMessage]
  );

  // ── Extract layout values from previewSettings ──
  // Defensive fallback in case previewSettings is undefined during a loading state
  const settings = previewSettings || {};
  const {
    fontSize = 22,
    lineHeight = 1,
    baseMarginLeft = 40,
    baseTextWidth = 360,
    maxIndent = 16,
    shortCardMaxLines = 13,
    maxPreviewLines = 19,
    topHalfPaddingTop = 345,
    longCardTopPadding = 110,
    gapAboveFold = 14,
    gapBelowFold = 14,
    indentAmplitude = 6,
    indentNoise = 2,
    indentFrequency = 0.35,
    frameWidth = 412,
    frameHeight = 600,
  } = settings;

  // ── Determine card mode and fold position ──
  const isShortCard = lines.length <= shortCardMaxLines;
  const topPadding = isShortCard ? topHalfPaddingTop : longCardTopPadding;
  const foldY = frameHeight / 2;

  // ── Auto-detect text type from line count (matches backend logic) ──
  const textType = lines.length > 13 ? 'Long Text' : 'Short Text';
  const maxLines = textType === 'Short Text' ? 13 : 19;
  const exceedsLimit = lines.length > maxLines;

  // ── Count signature lines for fold-split protection ──
  // Run just the signature text through the same formatter so we know
  // how many lines it occupies, without interfering with the full message.
  const signatureLineCount = useMemo(() => {
    if (!includeSignature || !noteStyleProfile?.signatureText) return 0;

    const rawSignature = replacePlaceholders(
      noteStyleProfile.signatureText,
      client,
      user,
      organization
    );

    return messageToLines(rawSignature).length;
  }, [includeSignature, noteStyleProfile, client, user, organization]);

  // ── Calculate fold split point ──
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
      linePositions.push({ index: i, startY: currentY, endY: currentY + thisLineHeight });
      currentY += thisLineHeight;
    }

    let dynamicSplitIndex = lines.length;
    for (let i = 0; i < linePositions.length; i++) {
      if (linePositions[i].endY > foldY) {
        dynamicSplitIndex = i;
        break;
      }
    }

    // Protect signature: don't split it across the fold
    if (signatureLineCount > 0) {
      const signatureStartIndex = lines.length - signatureLineCount;
      if (dynamicSplitIndex > signatureStartIndex && dynamicSplitIndex < lines.length) {
        dynamicSplitIndex = signatureStartIndex;
      }
    }

    return {
      topHalfLines: lines.slice(0, dynamicSplitIndex),
      bottomHalfLines: lines.slice(dynamicSplitIndex),
    };
  }, [lines, isShortCard, fontSize, lineHeight, topPadding, foldY, signatureLineCount]);

  // ── Visual indent (wobble effect only, not line-break logic) ──
  const seed = hash32(lines.join(''));
  const getIndent = makeLineIndenter(seed, { maxIndent, indentAmplitude, indentNoise, indentFrequency });

  const effectiveTextWidth = baseTextWidth - maxIndent;
  const fontClass = getFontClass(noteStyleProfile?.handwritingFont || 'Caveat');

  // ── Render a single line ──
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
            wordBreak: 'break-word',
          }}
        >
          {lineText || '\u00A0'}
        </span>
      </div>
    );
  };

  const designImageUrl = selectedDesign?.insideImageUrl || selectedDesign?.imageUrl;

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Line count bar + debug toggle ── */}
      <div className="flex items-center justify-between w-full max-w-md p-3 bg-gray-50 rounded-lg border">
        <span className="text-sm text-gray-600">
          {lines.length} lines
          {!isShortCard && ` (${topHalfLines.length} top / ${bottomHalfLines.length} bottom)`}
          {isShortCard && ' (short card)'}
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${exceedsLimit ? 'text-red-600' : 'text-green-600'}`}>
            {lines.length} / {maxLines} max
          </span>
          {user?.appRole === 'super_admin' && (
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
          )}
        </div>
      </div>

      {/* ── Unsupported character warning ── */}
      {unsupportedChars.length > 0 && (
        <div className="w-full max-w-md p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800 font-semibold text-sm">
            Some characters may not print correctly
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            The handwriting robot can only write standard letters, numbers, and
            common punctuation. The following character{unsupportedChars.length > 1 ? 's' : ''} may
            be skipped or produce unexpected results on the physical card:
          </p>
          <p className="text-yellow-900 font-mono text-sm mt-2 tracking-widest">
            {unsupportedChars.join('  ')}
          </p>
        </div>
      )}

      {/* ── Overflow warning ── */}
      {exceedsLimit && (
        <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold text-sm">
            Message exceeds {maxLines} line limit ({textType})
          </p>
          <p className="text-red-700 text-sm mt-1">
            {lines.length} lines used. Please shorten the message.
          </p>
        </div>
      )}

      {/* ── Debug panel ── */}
      {showDebug && (
        <div className="w-full max-w-md p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs overflow-auto max-h-64">
          <div className="mb-2 text-gray-400">Formatted output (as sent to Scribe):</div>
          <pre className="whitespace-pre-wrap">{lines.join('\n')}</pre>
          <div className="mt-4 text-gray-400">Line details:</div>
          {lines.map((line, i) => (
            <div key={i} className="text-gray-300">
              Line {i + 1}: {line.length} chars | "{line}"
            </div>
          ))}
        </div>
      )}

      {/* ── Card frame ── */}
      <div
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
        }}
      >
        {/* Background design image */}
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

          {/* Top half text */}
          <div
            className="absolute left-0 right-0"
            style={{
              paddingTop: `${topPadding}px`,
              paddingBottom: `${gapAboveFold}px`,
            }}
          >
            {topHalfLines.map((line, idx) => renderLine(line, idx, idx))}
          </div>

          {/* Fold line — always at vertical center */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 opacity-50"
            style={{ top: `${foldY}px` }}
          />

          {/* Bottom half text */}
          {!isShortCard && bottomHalfLines.length > 0 && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${foldY}px`,
                paddingTop: `${gapBelowFold}px`,
              }}
            >
              {bottomHalfLines.map((line, idx) =>
                renderLine(line, idx, topHalfLines.length + idx)
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default React.memo(CardPreviewNew);
