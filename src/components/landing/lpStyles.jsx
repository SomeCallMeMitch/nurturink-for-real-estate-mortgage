/**
 * Centralized Landing Page Typography Styles
 * Edit these values once to update all landing page sections
 */

export const lpStyles = {
  // Section Headers (h2)
  sectionHeader: {
    mobile: "text-[28px]",
    desktop: "lg:text-[40px]",
    lineHeight: "leading-[1.1]",
    color: "text-[#1a2332]",
    weight: "font-bold",
  },
  
  // Hero Header (h1) - slightly different
  heroHeader: {
    mobile: "text-[28px]",
    desktop: "lg:text-[48px]",
    lineHeight: "leading-[1.1]",
    color: "text-[#1a2332]",
    weight: "font-bold",
  },
  
  // Section Subheads (paragraphs below headers)
  sectionSubhead: {
    size: "text-[17px]",
    lineHeight: "leading-[1.1]",
    color: "text-[#4a5568]",
  },
  
  // Card Titles
  cardTitle: {
    size: "text-[19.8px]",
    lineHeight: "leading-[1.1]",
    color: "text-[#1a2332]",
    weight: "font-semibold",
  },
  
  // Card Descriptions
  cardDescription: {
    size: "text-base",
    lineHeight: "leading-[1.1]",
    color: "text-[#4a5568]",
  },
};

// Helper function to combine style classes
export const getHeaderClasses = (type = 'section') => {
  const style = type === 'hero' ? lpStyles.heroHeader : lpStyles.sectionHeader;
  return `${style.mobile} ${style.desktop} ${style.lineHeight} ${style.weight} ${style.color}`;
};

export const getSubheadClasses = () => {
  const style = lpStyles.sectionSubhead;
  return `${style.size} ${style.lineHeight} ${style.color}`;
};

export const getCardTitleClasses = () => {
  const style = lpStyles.cardTitle;
  return `${style.size} ${style.lineHeight} ${style.color} ${style.weight}`;
};

export const getCardDescriptionClasses = () => {
  const style = lpStyles.cardDescription;
  return `${style.size} ${style.lineHeight} ${style.color}`;
};