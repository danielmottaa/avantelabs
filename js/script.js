const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-panel a");
const topLinks = document.querySelectorAll('a[href="#inicio"]');
const backToTop = document.querySelector(".back-to-top");
const revealElements = document.querySelectorAll(".reveal");
const heroCard = document.querySelector(".hero-card");
const heroCopy = document.querySelector(".hero-copy");
const heroOrbLeft = document.querySelector(".hero-orb-left");
const heroOrbRight = document.querySelector(".hero-orb-right");
const networkCanvas = document.querySelector(".tech-network");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const setMenuState = (isOpen) => {
  body.classList.toggle("menu-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

topLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setMenuState(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

const updateScrollState = () => {
  const scrollY = window.scrollY;
  const hasScrolled = scrollY > 18;
  header?.classList.toggle("scrolled", hasScrolled);
  backToTop?.classList.toggle("is-visible", scrollY > 420);

  if (reduceMotionQuery.matches) return;

  const heroOffset = Math.min(scrollY, 320);
  heroCopy?.style.setProperty("transform", `translate3d(0, ${heroOffset * -0.06}px, 0)`);
  heroCard?.style.setProperty("transform", `translate3d(0, ${heroOffset * 0.04}px, 0)`);
  heroOrbLeft?.style.setProperty("transform", `translate3d(0, ${heroOffset * 0.12}px, 0) scale(1.04)`);
  heroOrbRight?.style.setProperty("transform", `translate3d(0, ${heroOffset * 0.16}px, 0) scale(1.08)`);
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

backToTop?.addEventListener("click", () => {
  setMenuState(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const setupNetworkBackground = () => {
  if (!networkCanvas) return;

  const context = networkCanvas.getContext("2d");
  if (!context) return;

  const prefersReducedMotion = reduceMotionQuery.matches;
  const nodes = [];
  const palette = [
    "79, 209, 255",
    "138, 125, 255",
    "93, 255, 207",
  ];
  const pointer = {
    x: 0,
    y: 0,
    activeX: 0,
    activeY: 0,
    strength: 0,
    targetStrength: 0,
    inside: false,
  };

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let lastTimestamp = 0;

  const createNodes = () => {
    nodes.length = 0;
    const area = width * height;
    const count = Math.max(24, Math.min(70, Math.round(area / 26000)));

    for (let index = 0; index < count; index += 1) {
      const color = palette[index % palette.length];
      const radius = 1.2 + Math.random() * 2.2;
      const drift = prefersReducedMotion ? 0 : 0.08 + Math.random() * 0.22;

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        radius,
        color,
        angle: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * drift,
        driftY: (Math.random() - 0.5) * drift,
        pointerOffsetX: 0,
        pointerOffsetY: 0,
      });
    }
  };

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    networkCanvas.width = Math.round(width * ratio);
    networkCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createNodes();
  };

  const drawFrame = (timestamp = 0) => {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    context.clearRect(0, 0, width, height);

    if (!prefersReducedMotion) {
      pointer.activeX += (pointer.x - pointer.activeX) * 0.08;
      pointer.activeY += (pointer.y - pointer.activeY) * 0.08;
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.08;
    }

    if (!prefersReducedMotion) {
      nodes.forEach((node) => {
        node.angle += 0.0015 * delta;
        node.x += node.driftX;
        node.y += node.driftY;

        const offsetX = Math.cos(node.angle) * 8;
        const offsetY = Math.sin(node.angle * 0.92) * 8;

        if (Math.abs(node.x - node.originX) > 42) node.driftX *= -1;
        if (Math.abs(node.y - node.originY) > 42) node.driftY *= -1;

        const baseX = node.x + offsetX;
        const baseY = node.y + offsetY;
        const pointerDx = pointer.activeX - baseX;
        const pointerDy = pointer.activeY - baseY;
        const pointerDistance = Math.hypot(pointerDx, pointerDy);
        const pointerRange = 220;

        if (pointerDistance < pointerRange && pointer.strength > 0.001) {
          const influence = (1 - pointerDistance / pointerRange) * pointer.strength;
          node.pointerOffsetX = pointerDx * influence * 0.16;
          node.pointerOffsetY = pointerDy * influence * 0.16;
        } else {
          node.pointerOffsetX *= 0.9;
          node.pointerOffsetY *= 0.9;
        }

        node.renderX = baseX + node.pointerOffsetX;
        node.renderY = baseY + node.pointerOffsetY;
      });
    } else {
      nodes.forEach((node) => {
        node.renderX = node.x;
        node.renderY = node.y;
      });
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const source = nodes[index];

      for (let targetIndex = index + 1; targetIndex < nodes.length; targetIndex += 1) {
        const target = nodes[targetIndex];
        const dx = source.renderX - target.renderX;
        const dy = source.renderY - target.renderY;
        const distance = Math.hypot(dx, dy);

        if (distance > 170) continue;

        const midX = (source.renderX + target.renderX) / 2;
        const midY = (source.renderY + target.renderY) / 2;
        const cursorDistance = Math.hypot(midX - pointer.activeX, midY - pointer.activeY);
        const cursorInfluence =
          pointer.strength > 0.001 && cursorDistance < 210
            ? (1 - cursorDistance / 210) * pointer.strength
            : 0;
        const alpha = 0.18 - (distance / 170) * 0.14 + cursorInfluence * 0.22;

        context.strokeStyle = `rgba(123, 168, 255, ${Math.max(alpha, 0.025)})`;
        context.lineWidth = distance < 90 ? 1 : 0.65;
        context.beginPath();
        context.moveTo(source.renderX, source.renderY);
        context.lineTo(target.renderX, target.renderY);
        context.stroke();
      }
    }

    nodes.forEach((node) => {
      const cursorDistance = Math.hypot(node.renderX - pointer.activeX, node.renderY - pointer.activeY);
      const cursorInfluence =
        pointer.strength > 0.001 && cursorDistance < 180
          ? (1 - cursorDistance / 180) * pointer.strength
          : 0;

      context.fillStyle = `rgba(${node.color}, ${0.88 + cursorInfluence * 0.12})`;
      context.beginPath();
      context.arc(node.renderX, node.renderY, node.radius + cursorInfluence * 0.8, 0, Math.PI * 2);
      context.fill();
    });

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(drawFrame);
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.targetStrength = 1;
    pointer.inside = true;
  });

  window.addEventListener("pointerleave", () => {
    pointer.targetStrength = 0;
    pointer.inside = false;
  });

  window.addEventListener("pointerdown", () => {
    pointer.targetStrength = 1.15;
  });

  window.addEventListener("pointerup", () => {
    pointer.targetStrength = pointer.inside ? 1 : 0;
  });

  if (prefersReducedMotion) {
    drawFrame();
    return;
  }

  animationFrame = window.requestAnimationFrame(drawFrame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      return;
    }

    lastTimestamp = 0;
    animationFrame = window.requestAnimationFrame(drawFrame);
  });
};

setupNetworkBackground();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const mediaQuery = window.matchMedia("(min-width: 960px)");
const syncMenuWithViewport = (event) => {
  if (event.matches) {
    setMenuState(false);
  }
};

syncMenuWithViewport(mediaQuery);

if (typeof mediaQuery.addEventListener === "function") {
  mediaQuery.addEventListener("change", syncMenuWithViewport);
} else if (typeof mediaQuery.addListener === "function") {
  mediaQuery.addListener(syncMenuWithViewport);
}
