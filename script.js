const canvas = document.querySelector(".wave-field");
const context = canvas.getContext("2d");
const glass = document.querySelector("#glass");
const secretMessage = document.querySelector("#secret-message");
const secretAfter = document.querySelector("#secret-after");
const scrollReveals = document.querySelectorAll(".scroll-reveal");

const pointer = { x: 0.5, y: 0.5 };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let width = 0;
let height = 0;
let pixelRatio = 1;
let frame = 0;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawWaves(time = 0) {
  context.clearRect(0, 0, width, height);

  const lineCount = width < 700 ? 8 : 12;
  const centerY = height * (0.49 + (pointer.y - 0.5) * 0.035);
  const motion = prefersReducedMotion.matches ? 0 : time * 0.00018;

  for (let line = 0; line < lineCount; line += 1) {
    const spacing = (line - (lineCount - 1) / 2) * (width < 700 ? 14 : 18);
    const opacity = 0.055 + (line / lineCount) * 0.03;

    context.beginPath();
    context.strokeStyle = `rgba(10, 10, 11, ${opacity})`;
    context.lineWidth = 0.8;

    for (let x = -20; x <= width + 20; x += 8) {
      const progress = x / width;
      const envelope = Math.sin(progress * Math.PI);
      const primaryWave = Math.sin(progress * Math.PI * 2.1 + motion + line * 0.12);
      const fineWave = Math.sin(progress * Math.PI * 5.2 - motion * 1.5 + line * 0.07);
      const pull = (pointer.x - 0.5) * 22 * envelope;
      const y = centerY + spacing + primaryWave * 72 * envelope + fineWave * 11 + pull;

      if (x === -20) context.moveTo(x, y);
      else context.lineTo(x, y);
    }

    context.stroke();
  }

  if (!prefersReducedMotion.matches) {
    frame = window.requestAnimationFrame(drawWaves);
  }
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / width;
  pointer.y = event.clientY / height;
});

window.addEventListener("resize", () => {
  resizeCanvas();
  if (prefersReducedMotion.matches) drawWaves();
});

prefersReducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(frame);
  drawWaves();
});

resizeCanvas();
drawWaves();

glass.addEventListener("click", () => {
  glass.classList.add("is-broken");
  glass.setAttribute("aria-expanded", "true");
  glass.setAttribute("aria-label", "Segreto svelato");
  secretMessage.setAttribute("aria-hidden", "false");
  secretAfter.classList.add("is-visible");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in-view");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 },
);

scrollReveals.forEach((element) => revealObserver.observe(element));
