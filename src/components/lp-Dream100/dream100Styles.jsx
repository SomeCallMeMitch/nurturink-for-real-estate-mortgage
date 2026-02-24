/**
 * Shared style objects for Dream 100 landing page components.
 * All values match the HTML spec's CSS custom properties and inline styles.
 */

export const formCardStyle = {
  background: 'var(--d100-white)',
  borderRadius: 'var(--d100-radius)',
  border: '1px solid var(--d100-border)',
  padding: '26px 20px',
  boxShadow: 'var(--d100-shadow)',
};

export const cardTitleStyle = {
  fontSize: 20, fontWeight: 800,
  color: 'var(--d100-navy)',
  marginBottom: 6, lineHeight: 1.25,
  letterSpacing: '-0.01em',
};

export const cardSubStyle = {
  fontSize: 15, color: 'var(--d100-text-muted)',
  marginBottom: 24, lineHeight: 1.5, fontWeight: 400,
};

export const fieldLabelStyle = {
  display: 'block',
  fontSize: 14, fontWeight: 700,
  color: 'var(--d100-navy)',
  marginBottom: 6, letterSpacing: '0.01em',
};

export const fieldHintStyle = {
  fontSize: 13, color: 'var(--d100-text-muted)',
  marginTop: 7, lineHeight: 1.5, fontStyle: 'italic',
};

export const inputStyle = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid var(--d100-border)', borderRadius: 10,
  fontFamily: "'Sora', sans-serif", fontSize: 16,
  color: 'var(--d100-text)', background: 'var(--d100-cream)',
  outline: 'none', appearance: 'none', WebkitAppearance: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s', lineHeight: 1.4,
};

export const textareaStyle = {
  ...inputStyle, minHeight: 88, resize: 'none',
};

export const selectStyle = {
  ...inputStyle,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%235A6278' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 44,
  cursor: 'pointer',
};

export const formNavStyle = {
  display: 'flex', gap: 10, justifyContent: 'flex-end',
  marginTop: 24, paddingTop: 20,
  borderTop: '1px solid var(--d100-border)',
};

export const btnNextStyle = {
  flex: 1, padding: '14px 20px', border: 'none',
  borderRadius: 10, background: 'var(--d100-navy)',
  color: 'var(--d100-white)', fontFamily: "'Sora', sans-serif",
  fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
};

export const btnBackStyle = {
  padding: '13px 20px',
  border: '1.5px solid var(--d100-border)', borderRadius: 10,
  background: 'transparent', color: 'var(--d100-text-muted)',
  fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s',
};

export const btnGenerateStyle = {
  flex: 1, padding: '15px 20px', border: 'none',
  borderRadius: 10, background: 'var(--d100-gold)',
  color: 'var(--d100-navy)', fontFamily: "'Sora', sans-serif",
  fontSize: 17, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 16px rgba(201,151,58,0.35)',
};