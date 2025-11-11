import './globals.css'
import './index.css'
import Navbar from './components/Navbar'
import { GlobalProvider } from './context/GlobalContext'
import { ThemeProvider } from './context/ThemeContext'

export const metadata = {
  title: "MedScan AI",
  description: "Upload scans and get analysis with guidance",
}

// Add animated falling lines/stars with 3D parallax effect using mouse movement
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
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
