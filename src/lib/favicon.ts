import type { Metadata } from 'next'

export const faviconMetadata: Metadata = {
  icons: {
    icon: [
      // Standard favicon
      { url: '/favicon.ico', sizes: 'any' },
      // PNG favicons for different sizes
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // Android Chrome icons
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      // Apple Touch Icon for iOS/macOS
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      // Shortcut icon for quick access
      { url: '/favicon.ico' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    // Windows tile color
    'msapplication-TileColor': '#ffffff',
    // Windows tile configuration
    'msapplication-config': '/browserconfig.xml',
    // Theme color for mobile browsers
    'theme-color': '#ffffff',
    // Apple mobile web app settings
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Pexry',
    // Format detection for mobile
    'format-detection': 'telephone=no',
  },
}
