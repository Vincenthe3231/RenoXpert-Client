# Theme Toggle with localStorage

This implementation provides a complete theme toggle system with localStorage persistence for the RenoXpert client application.

## Features

- ✅ **Theme Mode Toggle**: Switch between light and dark modes
- ✅ **Color Theme Selection**: Choose from multiple color themes (Blue, Green, Aqua, Purple, Orange)
- ✅ **Direction Toggle**: Switch between LTR and RTL layouts
- ✅ **Layout Options**: Vertical and horizontal layouts
- ✅ **Card Shadow Toggle**: Enable/disable card shadows
- ✅ **Boxed Layout Toggle**: Full width or boxed layouts
- ✅ **localStorage Persistence**: All settings are automatically saved and restored
- ✅ **Easy-to-use Components**: Pre-built components for quick integration
- ✅ **Custom Hook**: `useTheme` hook for advanced usage

## Quick Start

### 1. Using the Theme Toggle Component

```tsx
import ThemeToggle from './components/ThemeToggle';

// Simple theme toggle button
<ThemeToggle />

// With custom styling
<ThemeToggle 
  className="my-custom-class" 
  size="lg" 
  showLabel={false} 
/>
```

### 2. Using the Color Theme Selector

```tsx
import ThemeSelector from './components/ThemeSelector';

// Color theme selector
<ThemeSelector />

// Without label
<ThemeSelector showLabel={false} />
```

### 3. Using the Complete Theme Settings Panel

```tsx
import ThemeSettings from './components/ThemeSettings';

// Complete theme settings panel
<ThemeSettings />

// Without title
<ThemeSettings showTitle={false} />
```

### 4. Using the useTheme Hook

```tsx
import { useTheme } from '../hooks/use-theme';

function MyComponent() {
  const { 
    activeMode, 
    toggleTheme, 
    setTheme, 
    activeTheme, 
    setColorTheme 
  } = useTheme();

  return (
    <div>
      <p>Current mode: {activeMode}</p>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button onClick={() => setTheme('dark')}>
        Set Dark Mode
      </button>
    </div>
  );
}
```

## Available Theme Options

### Theme Modes
- `light` - Light mode
- `dark` - Dark mode

### Color Themes
- `BLUE_THEME` - Blue color scheme
- `GREEN_THEME` - Green color scheme
- `AQUA_THEME` - Aqua/Cyan color scheme
- `PURPLE_THEME` - Purple color scheme
- `ORANGE_THEME` - Orange color scheme

### Directions
- `ltr` - Left to right
- `rtl` - Right to left

### Layouts
- `vertical` - Vertical layout
- `horizontal` - Horizontal layout

### Layout Types
- `full` - Full width layout
- `boxed` - Boxed layout

## useTheme Hook API

The `useTheme` hook provides the following functions and values:

### Current Values
- `activeMode` - Current theme mode ('light' | 'dark')
- `activeTheme` - Current color theme
- `activeDir` - Current direction ('ltr' | 'rtl')
- `activeLayout` - Current layout ('vertical' | 'horizontal')
- `isCardShadow` - Card shadow enabled/disabled
- `isLayout` - Layout type ('full' | 'boxed')
- `isBorderRadius` - Border radius value
- `isCollapse` - Sidebar collapse state
- `isLanguage` - Current language

### Theme Mode Functions
- `toggleTheme()` - Toggle between light and dark mode
- `setTheme(mode)` - Set specific theme mode ('light' | 'dark')

### Color Theme Functions
- `setColorTheme(theme)` - Set specific color theme

### Direction Functions
- `setDirection(dir)` - Set direction ('ltr' | 'rtl')
- `toggleDirection()` - Toggle between LTR and RTL

### Layout Functions
- `setLayout(layout)` - Set layout ('vertical' | 'horizontal')
- `toggleLayout()` - Toggle between vertical and horizontal

### Card Shadow Functions
- `setCardShadow(shadow)` - Set card shadow (boolean)
- `toggleCardShadow()` - Toggle card shadow

### Boxed Layout Functions
- `setBoxedLayout(layout)` - Set layout type ('full' | 'boxed')
- `toggleBoxedLayout()` - Toggle between full and boxed

### Other Functions
- `setBorderRadius(radius)` - Set border radius (number)
- `setSidebarCollapse(collapse)` - Set sidebar collapse state
- `setLanguage(language)` - Set language

## localStorage Keys

The following keys are used in localStorage:
- `activeDir` - Text direction
- `activeMode` - Theme mode (light/dark)
- `activeTheme` - Color theme
- `activeLayout` - Layout type
- `isCardShadow` - Card shadow setting
- `isLayout` - Boxed layout setting
- `isBorderRadius` - Border radius value
- `isCollapse` - Sidebar collapse state
- `isLanguage` - Language setting

## Demo

To see the theme toggle in action, you can use the `ThemeDemo` component:

```tsx
import ThemeDemo from './components/ThemeDemo';

// Use in your page or component
<ThemeDemo />
```

## Integration Notes

1. **Context Provider**: Make sure your app is wrapped with `CustomizerContextProvider`
2. **SSR Compatibility**: The implementation uses `"use client"` directive for client-side functionality
3. **Persistence**: All theme changes are automatically saved to localStorage
4. **Initialization**: Theme settings are loaded from localStorage on app startup
5. **Fallbacks**: If localStorage is empty, default values from config are used

## Example Integration

```tsx
// In your layout or main component
import { CustomizerContextProvider } from './context/CustomizerContext';
import ThemeToggle from './components/ThemeToggle';

export default function RootLayout({ children }) {
  return (
    <CustomizerContextProvider>
      <html>
        <body>
          <header>
            <ThemeToggle />
          </header>
          {children}
        </body>
      </html>
    </CustomizerContextProvider>
  );
}
```

This implementation provides a complete, production-ready theme toggle system with localStorage persistence that can be easily integrated into any part of your application.
