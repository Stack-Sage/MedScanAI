import './globals.css'
import './index.css'
import Navbar from './components/Navbar'
import { GlobalProvider } from './context/GlobalContext'
import { ThemeProvider } from './context/ThemeContext'

// PWA metadata (server side)
export const metadata = {
  title: 'MedScan AI',
  description: 'Upload scans and get analysis with guidance',
  applicationName: 'MedScan AI',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  icons: {
    icon: [
      { url: '/icons/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icons/apple-touch-icon.png'
  }
}

// Server component layout (no client hooks)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Extra meta for iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-black text-zinc-100">
        <ThemeProvider>
          <GlobalProvider>
            <Navbar />
            {children}
          </GlobalProvider>
        </ThemeProvider>
        {/* SW registration (no hooks) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
`
          }}
        />
      </body>
    </html>
  )
}
