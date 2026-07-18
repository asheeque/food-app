// Fresh Supply Portal - Color System
export const colors = {
  // Primary Brand Color (Emerald Green)
  primary: {
    main: '#10b981',
    light: '#6ffbbe',
    dark: '#005236',
    container: '#10b981',
    onContainer: '#00422b',
  },

  // Secondary Colors
  secondary: {
    main: '#2b6954',
    light: '#b0f0d6',
    dark: '#0b513d',
    container: '#adedd3',
    onContainer: '#306d58',
  },

  // Tertiary (Accent)
  tertiary: {
    main: '#a43a3a',
    light: '#ffb3af',
    dark: '#842225',
    container: '#fc7c78',
    onContainer: '#711419',
  },

  // Surface & Background
  surface: {
    default: '#f9f9ff',
    dim: '#d3daea',
    bright: '#f9f9ff',
    container: {
      lowest: '#ffffff',
      low: '#f0f3ff',
      default: '#e7eefe',
      high: '#e2e8f8',
      highest: '#dce2f3',
    },
  },

  background: '#f9f9ff',
  onBackground: '#151c27',

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ba1a1a',
  info: '#0c7ff2',

  // Neutral Text & Borders
  neutral: {
    text: '#151c27',
    textSecondary: '#3c4a42',
    border: '#bbcabf',
    borderLight: '#e5e7eb',
    placeholder: '#9ca3af',
  },

  // Inverse (for dark themes)
  inverseSurface: '#2a313d',
  inverseOnSurface: '#ebf1ff',
  inversePrimary: '#4edea3',

  // Text Colors
  text: {
    primary: '#151c27',
    secondary: '#3c4a42',
    tertiary: '#6b7280',
    inverse: '#ebf1ff',
  },

  // Legacy (for backwards compatibility)
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9f9ff',
    100: '#f0f3ff',
    200: '#e7eefe',
    300: '#dce2f3',
    400: '#c7d1e8',
    500: '#a8b3d0',
    600: '#6c7a71',
    700: '#3c4a42',
    800: '#2a313d',
    900: '#151c27',
  },
};

export type ColorKey = keyof typeof colors;
