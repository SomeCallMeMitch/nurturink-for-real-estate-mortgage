/**
 * formatMessageForScribe.js
 * 
 * Formats messages for Scribe API according to their requirements:
 * - Max 52 characters per line (including indentation)
 * - Random 1-3 space indentation on middle lines
 * - Explicit \n line breaks
 * - Max 13 lines for Short Text, 19 lines for Long Text
 * 
 * @module formatMessageForScribe
 */

/**
 * Seeded pseudo-random number generator for consistent indentation
 * Uses a simple linear congruential generator (LCG)
 * 
 * @param {number} seed - Seed value for deterministic randomness
 * @returns {Function} A function that returns pseudo-random numbers between 0 and 1
 */
function createSeededRandom(seed) {
  let state = seed;
  return () => {
    // LCG parameters (from Numerical Recipes)
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Wraps text to fit within a maximum character width
 * Breaks at word boundaries when possible
 * 
 * @param {string} text - The text to wrap
 * @param {number} maxWidth - Maximum characters per line
 * @returns {string[]} Array of wrapped lines
 */
function wrapText(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    // If word itself is longer than maxWidth, we need to break it
    if (word.length > maxWidth) {
      // Flush current line if it has content
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      
      // Break the long word into chunks
      for (let i = 0; i < word.length; i += maxWidth) {
        lines.push(word.substring(i, i + maxWidth));
      }
      continue;
    }

    // Try adding word to current line
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      // Line would be too long, start new line
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = word;
    }
  }

  // Add final line
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Formats a message for Scribe API
 * 
 * @param {string} message - The raw message text (may contain \n line breaks)
 * @param {('Short Text'|'Long Text')} textType - The text type
 * @param {number} [seed] - Optional seed for consistent random indentation (defaults to message hash)
 * @returns {Object} Formatted message result
 * @returns {string} result.formatted - The formatted message with \n line breaks
 * @returns {number} result.lineCount - Number of lines in the formatted message
 * @returns {('Short Text'|'Long Text')} result.textType - Text type used
 * @returns {boolean} result.exceedsLimit - Whether the message exceeds the line limit
 * 
 * @example
 * const result = formatMessageForScribe(
 *   "Dear John,\n\nThanks for your business!",
 *   "Short Text"
 * );
 * console.log(result.formatted);
 * // Output:
 * // Dear John,
 * //
 * //   Thanks for your business!
 */
export function formatMessageForScribe(message, textType, seed) {
  // Constants
  const MAX_CHARS_PER_LINE = 52;
  const MAX_INDENT_SPACES = 3;
  const MAX_LINES_SHORT = 13;
  const MAX_LINES_LONG = 19;
  
  const maxLines = textType === 'Short Text' ? MAX_LINES_SHORT : MAX_LINES_LONG;

  // Create seeded random number generator
  // If no seed provided, create one from message content
  const actualSeed = seed !== undefined ? seed : message.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = createSeededRandom(actualSeed);

  // Step 1: Split message by explicit line breaks
  const rawLines = message.split('\n');

  // Step 2: Process each line
  const processedLines = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    
    // Preserve blank lines
    if (trimmed === '') {
      processedLines.push('');
      continue;
    }

    // Wrap line at (52 - 3) = 49 chars to leave room for indentation
    // We wrap at 49 because middle lines will get 1-3 spaces added
    const maxContentChars = MAX_CHARS_PER_LINE - MAX_INDENT_SPACES;
    const wrappedLines = wrapText(trimmed, maxContentChars);
    
    processedLines.push(...wrappedLines);
  }

  // Step 3: Apply random indentation to middle lines
  // First line: no indent (greeting)
  // Last line: no indent (signature)
  // Middle lines: 1-3 spaces
  const indentedLines = [];

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    
    // Skip indentation for first line, last line, and blank lines
    if (i === 0 || i === processedLines.length - 1 || line === '') {
      indentedLines.push(line);
      continue;
    }

    // Apply random 1-3 space indentation
    const indentSpaces = Math.floor(rng() * MAX_INDENT_SPACES) + 1;
    const indent = ' '.repeat(indentSpaces);
    const indentedLine = indent + line;

    indentedLines.push(indentedLine);
  }

  // Step 4: Re-wrap any lines that exceed 52 chars after indentation
  // This handles edge cases where indentation pushed a line over the limit
  const finalLines = [];

  for (let i = 0; i < indentedLines.length; i++) {
    const line = indentedLines[i];

    if (line.length <= MAX_CHARS_PER_LINE) {
      finalLines.push(line);
      continue;
    }

    // Line exceeds limit - need to re-wrap
    // Extract the indent
    const indentMatch = line.match(/^\s*/);
    const indent = indentMatch ? indentMatch[0] : '';
    const content = line.trim();

    // Re-wrap content at (52 - indent.length) chars
    const maxContentWidth = MAX_CHARS_PER_LINE - indent.length;
    const rewrappedLines = wrapText(content, maxContentWidth);

    // Add indent to each rewrapped line
    for (const rewrappedLine of rewrappedLines) {
      finalLines.push(indent + rewrappedLine);
    }
  }

  // Step 5: Join lines with \n
  const formatted = finalLines.join('\n');
  const lineCount = finalLines.length;

  // Step 6: Check if message exceeds line limit
  const exceedsLimit = lineCount > maxLines;

  // Step 7: Validate - throw error if exceeds limit
  if (exceedsLimit) {
    throw new Error(
      `Message exceeds ${maxLines} lines for ${textType}. ` +
      `Current: ${lineCount} lines. Please shorten the message.`
    );
  }

  return {
    formatted,
    lineCount,
    textType,
    exceedsLimit
  };
}

/**
 * Determines the appropriate text type based on message content
 * 
 * @param {string} message - The message to analyze
 * @returns {('Short Text'|'Long Text')} The recommended text type
 * 
 * @example
 * const textType = determineTextType("Dear John,\n\nThanks!");
 * console.log(textType); // "Short Text"
 */
export function determineTextType(message) {
  if (!message) return 'Short Text';
  
  // Count lines in message
  const lineCount = message.split('\n').length;
  
  // Short Text: ≤13 lines
  // Long Text: ≤19 lines
  return lineCount > 13 ? 'Long Text' : 'Short Text';
}

/**
 * Validates a formatted message without throwing errors
 * 
 * @param {string} formatted - The formatted message to validate
 * @param {('Short Text'|'Long Text')} textType - The text type
 * @returns {Object} Validation result
 * @returns {boolean} result.isValid - Whether the message is valid
 * @returns {number} result.lineCount - Number of lines
 * @returns {number} result.maxLines - Maximum allowed lines
 * @returns {string[]} result.errors - Array of validation error messages
 */
export function validateFormattedMessage(formatted, textType) {
  const MAX_CHARS_PER_LINE = 52;
  const MAX_LINES_SHORT = 13;
  const MAX_LINES_LONG = 19;
  
  const maxLines = textType === 'Short Text' ? MAX_LINES_SHORT : MAX_LINES_LONG;
  const lines = formatted.split('\n');
  const errors = [];

  // Check line count
  if (lines.length > maxLines) {
    errors.push(`Message has ${lines.length} lines but ${textType} allows max ${maxLines} lines`);
  }

  // Check character count per line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > MAX_CHARS_PER_LINE) {
      errors.push(`Line ${i + 1} has ${lines[i].length} chars (max ${MAX_CHARS_PER_LINE}): "${lines[i]}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    lineCount: lines.length,
    maxLines,
    errors
  };
}