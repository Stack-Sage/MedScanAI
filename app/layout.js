import './globals.css'
import './index.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: "MedScan AI",
  description: "Upload scans and get analysis with guidance",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
