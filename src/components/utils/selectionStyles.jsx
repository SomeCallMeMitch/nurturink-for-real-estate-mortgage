/**
 * Selection Styles Utility
 * 
 * Centralized styling for selected/active states in recipient lists.
 * Uses CSS variables for whitelabel compatibility.
 * 
 * Usage:
 *   import { getSelectionStyles } from '@/components/utils/selectionStyles';
 *   <button style={getSelectionStyles(isSelected)} className={...}>
 */

export const getSelectionStyles = (isSelected) => isSelected ? {
  backgroundColor: 'var(--selection-bg)',
  borderLeft: '4px solid var(--selection-border)',
  color: 'var(--selection-text)',
  fontWeight: 600,
  paddingLeft: '8px',
  paddingRight: '12px',
} : {};