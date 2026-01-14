/**
 * CardPreviewNew.jsx
 * 
 * REFACTORED: Character-count-based formatting to match Scribe API exactly
 * - Uses formatMessageForScribe logic for consistent preview
 * - Shows line count with validation
 * - Matches Scribe's 52-char-per-line rule
 */

import React, { useState, useEffect, useMemo } from 'react';

/**
 * Simple seeded random number generator (matches formatMessageForScribe.js)
 */
function createSeededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Wraps text to fit within maximum character width
 */
function wrapText(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    // Handle words longer than maxWidth
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
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Formats message for preview (matches Scribe formatting exactly)
 */
function formatMessageForPreview(message, textType = 'Short Text') {
  const MAX_CHARS_PER_LINE = 52;
  const MAX_INDENT_SPACES = 3;

  // Create seeded RNG from message content
  const seed = message.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = createSeededRandom(seed);

  // Split by explicit line breaks
  const rawLines = message.split('\n');
  const processedLines = [];

  // Process each line
  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    
    if (trimmed === '') {
      processedLines.push('');
      continue;
    }

    // Wrap at 49 chars to leave room for indentation
    const maxContentChars = MAX_CHARS_PER_LINE - MAX_INDENT_SPACES;
    const wrappedLines = wrapText(trimmed, maxContentChars);
    processedLines.push(...wrappedLines);
  }

  // Apply indentation to middle lines
  const indentedLines = [];

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    
    // No indent for first/last line or blank lines
    if (i === 0 || i === processedLines.length - 1 || line === '') {
      indentedLines.push(line);
      continue;
    }

    // Random 1-3 space indentation
    const indentSpaces = Math.floor(rng() * MAX_INDENT_SPACES) + 1;
    const indent = ' '.repeat(indentSpaces);
    indentedLines.push(indent + line);
  }

  // Re-wrap if any line exceeds 52 chars
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
    const rewrappedLines = wrapText(content, maxContentWidth);

    for (const rewrappedLine of rewrappedLines) {
      finalLines.push(indent + rewrappedLine);
    }
  }

  return finalLines;
}

/**
 * Replace placeholders in text
 */
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  // User placeholders
  if (user) {
    result = result.replace(/\{\{user\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{user\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{user\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{user\.companyName\}\}/g, user.companyName || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
};

/**
 * Compose complete message
 */
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

/**
 * CardPreviewNew Component
 * 
 * Uses character-count-based formatting to match Scribe exactly
 */
export default function CardPreviewNew({ 
  message = '', 
  client, 
  user,
  organization,
  noteStyleProfile, 
  selectedDesign,
  includeGreeting = true,
  includeSignature = true,
  textType = 'Short Text'
}) {
  const [showDebug, setShowDebug] = useState(false);

  // Compose full message
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

  // Format message for preview
  const formattedLines = useMemo(() => {
    if (!composedMessage) return [];
    
    try {
      return formatMessageForPreview(composedMessage, textType);
    } catch (err) {
      console.error('Error formatting message:', err);
      return composedMessage.split('\n');
    }
  }, [composedMessage, textType]);

  // Calculate validation
  const lineCount = formattedLines.length;
  const maxLines = textType === 'Short Text' ? 13 : 19;
  const exceedsLimit = lineCount > maxLines;

  // Font mapping
  const fontFamilyMap = {
    'Caveat': 'font-caveat',
    'Kalam': 'font-kalam',
    'Patrick Hand': 'font-patrick'
  };

  const fontClass = fontFamilyMap[noteStyleProfile?.handwritingFont] || 'font-caveat';

  // Use insideImageUrl for the card preview
  const designImageUrl = selectedDesign?.insideImageUrl || selectedDesign?.imageUrl;

  return (
    <div className="space-y-4">
      {/* Line Count & Validation */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <span className="text-sm text-gray-600">Line Count:</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${exceedsLimit ? 'text-red-600' : 'text-green-600'}`}>
            {lineCount} / {maxLines} lines
          </span>
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        </div>
      </div>

      {/* Overflow Warning */}
      {exceedsLimit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">
            ⚠️ Message exceeds {maxLines} line limit for {textType}
          </p>
          <p className="text-red-700 text-sm mt-1">
            Current: {lineCount} lines. Please shorten your message or content.
          </p>
        </div>
      )}

      {/* Debug View */}
      {showDebug && (
        <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs overflow-auto max-h-64">
          <div className="mb-2 text-gray-400">Formatted message (as sent to Scribe):</div>
          <pre className="whitespace-pre-wrap">{formattedLines.join('\n')}</pre>
          <div className="mt-4 text-gray-400">Line details:</div>
          {formattedLines.map((line, i) => (
            <div key={i} className="text-gray-300">
              Line {i + 1}: {line.length} chars | "{line}"
            </div>
          ))}
        </div>
      )}

      {/* Card Preview */}
      <div className="relative aspect-[412/600] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 max-w-md mx-auto">
        {/* Background Image */}
        {designImageUrl ? (
          <img 
            src={designImageUrl} 
            alt="Card design inside" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400 px-4">
              <p className="text-sm">No card design selected</p>
            </div>
          </div>
        )}

        {/* Message Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="p-8 pt-32">
            <pre 
              className={`${fontClass} whitespace-pre-wrap text-xl leading-relaxed`}
              style={{ color: '#1e3a8a' }}
            >
              {formattedLines.join('\n')}
            </pre>
          </div>
        </div>

        {/* Fold line indicator (for visual reference) */}
        <div className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 opacity-30" style={{ top: '50%' }} />
      </div>
    </div>
  );
}