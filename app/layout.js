import './globals.css'
import './index.css'
import Navbar from './components/Navbar'
import { GlobalProvider } from './context/GlobalContext'
import { ThemeProvider } from './context/ThemeContext'
import { useEffect, useState } from 'react'

export const metadata = {
  title: "MedScan AI",
  description: "Upload scans and get analysis with guidance",
}
  

  // Inject PWA tags (add type/sizes/purpose to improve install detection)
  if (typeof window !== "undefined" && !window.__medscan_pwa) {
    window.__medscan_pwa = true;
    const addLink = (attrs) => {
      const l = document.createElement('link');
      Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
      document.head.appendChild(l);
    };
    const addMeta = (attrs) => {
      const m = document.createElement('meta');
      Object.entries(attrs).forEach(([k, v]) => m.setAttribute(k, v));
      document.head.appendChild(m);
    };

    addLink({ rel: 'manifest', href: '/manifest.json', type: 'application/manifest+json', crossOrigin: 'use-credentials' });
    // SVG or PNG icons (ensure these files exist in /public/icons/)
    addLink({ rel: 'icon', href: '/icons/logo.svg', sizes: 'any', type: 'image/svg+xml' });
    addLink({ rel: 'icon', href: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' });
    addLink({ rel: 'icon', href: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' });
    addLink({ rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png', sizes: '180x180' });
    addMeta({ name: 'theme-color', content: '#0f172a' });
    addMeta({ name: 'application-name', content: 'MedScan AI' });
    addMeta({ name: 'apple-mobile-web-app-capable', content: 'yes' });
    addMeta({ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  // Minimal install prompt component
  function PWAInstallPrompt() {
    const [deferred, setDeferred] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const handler = (e) => {
        e.preventDefault();
        setDeferred(e);
        setVisible(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      // Hide if already installed
      window.addEventListener('appinstalled', () => {
        setVisible(false);
        setDeferred(null);
      });
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }, []);

    const install = async () => {
      if (!deferred) return;
      deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome !== 'accepted') {
        // Keep button available if user dismissed
        setTimeout(() => setDeferred(null), 0);
      } else {
        setVisible(false);
      }
    };

    if (!visible) return null;

    return (
      <motion.button
        onClick={install}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl font-medium shadow-lg border backdrop-blur-md
          bg-gradient-to-r from-cyan-600 to-cyan-800 border-cyan-400 text-white
          hover:from-cyan-500 hover:to-cyan-700 hover:shadow-cyan-500/40
          active:scale-95 transition-all"
        aria-label="Install MedScan AI"
      >
        Install App
      </motion.button>
    );
  }

if (typeof window !== "undefined" && !window.__medscan_bg_canvas) {
  window.__medscan_bg_canvas = true;
  setTimeout(() => {
    let canvas, ctx, animationId;
    let lines = [];
    const colors = ["#22d3ee", "#67e8f9", "#a5b4fc", "#f472b6", "#facc15", "#f87171"];
    const lineCount = 40;
    const speedRange = [2, 6];
    let mouseX = 0.5, mouseY = 0.5;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initLines() {
      lines = [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      for (let i = 0; i < lineCount; i++) {
        lines.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 1.5 + 0.5, // z for parallax (0.5 = far, 2 = near)
          len: 80 + Math.random() * 120,
          speed: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
          color: colors[Math.floor(Math.random() * colors.length)],
          width: 1.5 + Math.random() * 2.5,
          alpha: 0.18 + Math.random() * 0.45,
        });
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      // Black gradient background
      let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.5, "#18181b");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Parallax offset based on mouse
      const px = (mouseX - 0.5) * 60;
      const py = (mouseY - 0.5) * 60;

      // Falling neon lines with parallax
      for (let l of lines) {
        ctx.save();
        ctx.globalAlpha = l.alpha;
        // Parallax: closer lines move more with mouse
        const parallaxX = l.x + px * l.z;
        const parallaxY = l.y + py * l.z;
        const lineGrad = ctx.createLinearGradient(parallaxX, parallaxY, parallaxX, parallaxY + l.len);
        lineGrad.addColorStop(0, l.color);
        lineGrad.addColorStop(1, "#000");
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = l.width * l.z;
        ctx.beginPath();
        ctx.moveTo(parallaxX, parallaxY);
        ctx.lineTo(parallaxX, parallaxY + l.len * l.z);
        ctx.stroke();
        ctx.restore();

        l.y += l.speed * l.z;
        if (l.y > canvas.height + l.len) {
          l.x = Math.random() * canvas.width;
          l.y = -l.len;
          l.z = Math.random() * 1.5 + 0.5;
          l.len = 80 + Math.random() * 120;
          l.speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
          l.color = colors[Math.floor(Math.random() * colors.length)];
          l.width = 1.5 + Math.random() * 2.5;
          l.alpha = 0.18 + Math.random() * 0.45;
        }
      }
      animationId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    }

    let canvasId = 'falling-lines-bg-canvas';
    let existing = document.getElementById(canvasId);
    if (!existing) {
      canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.display = "block";
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.zIndex = "-1";
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "1";
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      resize();
      initLines();
      draw();
      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", e => {
        if (e.touches && e.touches.length) {
          mouseX = e.touches[0].clientX / window.innerWidth;
          mouseY = e.touches[0].clientY / window.innerHeight;
        }
      });
    }

    // Clean up on hot reload (dev only)
    if (import.meta && import.meta.hot) {
      import.meta.hot.dispose(() => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouseMove);
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        window.__medscan_bg_canvas = false;
      });
    }
  }, 0);
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased ${typeof window !== "undefined" && document?.documentElement?.classList?.contains('light') ? 'bg-white text-zinc-900' : 'bg-black text-zinc-100'} dark:bg-black dark:text-zinc-100 light:bg-white light:text-zinc-900`}>
        <ThemeProvider>
          <GlobalProvider>
            <Navbar />
            {children}
            <PWAInstallPrompt /> {/* Added install button */}
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
