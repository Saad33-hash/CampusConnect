/**
 * CAMPUSCONNECT THEME CONSTANTS
 * ==============================
 * This file documents the color system used across the application.
 * Actual colors are defined in index.css as CSS variables.
 * 
 * To change colors globally, edit the CSS variables in src/index.css
 */

export const THEME = {
  // Primary - Used for main brand elements
  colors: {
    primary: {
      main: 'bg-slate-900 text-white',         // Headers, Primary Buttons
      hover: 'hover:bg-slate-800',              // Button Hover
      light: 'bg-slate-700',                    // Secondary Elements
      text: 'text-slate-900',                   // Primary Text
    },

    // Accent - Used for links and interactive elements  
    accent: {
      main: 'bg-blue-600 text-white',          // CTAs, Active States
      hover: 'hover:bg-blue-700',               // Hover States
      text: 'text-blue-600',                    // Links
      textHover: 'hover:text-blue-700',         // Link Hover
      light: 'bg-blue-50 text-blue-700',        // Light Badges
    },

    // Success - Used for positive actions/states
    success: {
      main: 'bg-emerald-500 text-white',       // Success Buttons
      hover: 'hover:bg-emerald-600',            // Hover
      text: 'text-emerald-500',                 // Success Text
      light: 'bg-emerald-50 text-emerald-700',  // Match Score, Accepted Badges
      border: 'border-emerald-500',             // Success Borders
    },

    // Warning - Used for attention-grabbing elements
    warning: {
      main: 'bg-amber-500 text-white',         // Apply Now, Active States
      hover: 'hover:bg-amber-600',              // Hover
      text: 'text-amber-500',                   // Warning Text
      light: 'bg-amber-50 text-amber-700',      // Shortlisted, Startup Tags
      border: 'border-amber-500',               // Warning Borders
    },

    // Error - Used for destructive actions
    error: {
      main: 'bg-red-500 text-white',           // Delete Buttons
      hover: 'hover:bg-red-600',                // Hover
      text: 'text-red-600',                     // Error Text, Logout
      light: 'bg-red-50 text-red-700',          // Rejected Badges
    },

    // Neutral - Text and backgrounds
    neutral: {
      text: 'text-slate-900',                   // Primary Text
      textSecondary: 'text-slate-500',          // Subheadings (Slate Gray #64748B)
      textMuted: 'text-slate-400',              // Placeholders, Hints
      bg: 'bg-white',                           // Main Background
      bgSecondary: 'bg-slate-50',               // Secondary Background
      bgTertiary: 'bg-slate-100',               // Cards, Inputs
      border: 'border-slate-200',               // Default Borders
      borderHover: 'border-slate-300',          // Hover Borders
    },
  },

  // Category colors for post types
  categories: {
    academic: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      icon: 'text-violet-500',
    },
    startup: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'text-amber-500',
    },
    parttime: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      icon: 'text-cyan-500',
    },
    hackathon: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: 'text-emerald-500',
    },
  },

  // Application status colors
  status: {
    pending: 'bg-slate-100 text-slate-700',
    shortlisted: 'bg-amber-50 text-amber-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    filled: 'bg-emerald-50 text-emerald-700',
  },
};

// Helper function to get category styles
export const getCategoryStyle = (category) => {
  const styles = {
    'academic-project': THEME.categories.academic,
    'startup': THEME.categories.startup,
    'part-time': THEME.categories.parttime,
    'hackathon': THEME.categories.hackathon,
  };
  return styles[category] || THEME.categories.academic;
};

// Helper function to get status styles
export const getStatusStyle = (status) => {
  return THEME.status[status] || THEME.status.pending;
};

export default THEME;
