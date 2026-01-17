document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('logo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Images sequence: white -> black
  const imgPaths = ['/Images/1.png', '/Images/4.png'];
  const imgs = imgPaths.map(p => {
    const im = new Image();
    im.src = p;
    return im;
  });

  let currentIdx = 0;

  // Device pixel ratio handling
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Logo dimensions (will compute when image loaded)
  let logoW = 160;
  let logoH = 80;

  // Position and velocity
  const speed = 150; // pixels per second (half speed)
  let x = 50;
  let y = 50;
  // Start with a diagonal velocity
  let vx = speed * Math.cos(Math.PI / 4);
  let vy = speed * Math.sin(Math.PI / 4);

  // When images load, set logo dimensions to image natural aspect
  imgs[0].addEventListener('load', () => {
    const ratio = imgs[0].naturalWidth / imgs[0].naturalHeight || 2;
    logoW = Math.min(220, Math.round(window.innerWidth * 0.18));
    logoH = Math.round(logoW / ratio);
  });

  let last = performance.now();

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // cap dt
    last = now;

    x += vx * dt;
    y += vy * dt;

    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);

    let collidedX = false;
    let collidedY = false;

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
      collidedX = true;
    } else if (x + logoW >= cw) {
      x = cw - logoW;
      vx = -Math.abs(vx);
      collidedX = true;
    }

    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
      collidedY = true;
    } else if (y + logoH >= ch) {
      y = ch - logoH;
      vy = -Math.abs(vy);
      collidedY = true;
    }

    // Change image for each wall hit (both axes mean two hits)
    if (collidedX) {
      currentIdx = (currentIdx + 1) % imgs.length;
    }
    if (collidedY) {
      currentIdx = (currentIdx + 1) % imgs.length;
    }

    // Clear and draw current image
    ctx.clearRect(0, 0, cw, ch);
    const img = imgs[currentIdx];
    if (img.complete) {
      ctx.drawImage(img, x, y, logoW, logoH);
    }

    requestAnimationFrame(step);
  }

  // Center initial position
  function start() {
    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);
    x = Math.round((cw - logoW) * 0.5);
    y = Math.round((ch - logoH) * 0.5);
    last = performance.now();
    requestAnimationFrame(step);
  }

  // Wait for at least first image to load to get dimensions
  if (imgs[0].complete) start();
  else imgs[0].addEventListener('load', start);
});
