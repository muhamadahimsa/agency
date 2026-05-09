import barba from 'https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/+esm';
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm";

const awards = [
  {
    name: '01',
    type: 'Identity & Systems',
    project: 'Luminal Art Collective',
    label: 'Explore',
    year: '2026',
  },
  {
    name: '02',
    type: 'Digital Experience',
    project: 'Kinetica: Motion Archive',
    label: 'Explore',
    year: '2026',
  },
  {
    name: '03',
    type: 'Cinematography',
    project: 'Aftermath of Silence',
    label: 'Explore',
    year: '2025',
  },
  {
    name: '04',
    type: 'Web Architecture',
    project: 'Synthetic Dreams v2',
    label: 'Explore',
    year: '2026',
  },
  {
    name: '05',
    type: 'Product Strategy',
    project: 'Ozone: Rebranding',
    label: 'Explore',
    year: '2024',
  },
  {
    name: '06',
    type: 'Experimental Visuals',
    project: 'Void Spectrum 04',
    label: 'Explore',
    year: '2025',
  },
  {
    name: '07',
    type: 'E-commerce System',
    project: 'Monolith Goods',
    label: 'Explore',
    year: '2024',
  },
  {
    name: '08',
    type: 'Interactive Art',
    project: 'Fragmented Realities',
    label: 'Explore',
    year: '2026',
  },
  {
    name: '09',
    type: '3D Development',
    project: 'Nova Interface 2.0',
    label: 'Explore',
    year: '2025',
  },
  {
    name: '10',
    type: 'Brand Direction',
    project: 'Atlas Luxury Group',
    label: 'Explore',
    year: '2023',
  },
  {
    name: '11',
    type: 'Commercial Ads',
    project: 'Pulse Energy Drink',
    label: 'Explore',
    year: '2024',
  },
  {
    name: '12',
    type: 'Creative Coding',
    project: 'Glitch in the Matrix',
    label: 'Explore',
    year: '2026',
  },
  {
    name: '13',
    type: 'Identity Design',
    project: 'Aion Robotics',
    label: 'Explore',
    year: '2023',
  },
  {
    name: '14',
    type: 'Web Platform',
    project: 'Ethereal NFT Portal',
    label: 'Explore',
    year: '2022',
  },
  {
    name: '15',
    type: 'Visual Storytelling',
    project: 'Echoes of Nomads',
    label: 'Explore',
    year: '2024',
  },
  {
    name: '16',
    type: 'App Interface',
    project: 'Vela Smart Home',
    label: 'Explore',
    year: '2023',
  },
  {
    name: '17',
    type: 'Social Content',
    project: 'Hyperforce Campaign',
    label: 'Explore',
    year: '2025',
  },
  {
    name: '18',
    type: 'Art Direction',
    project: 'Zenith Publication',
    label: 'Explore',
    year: '2021',
  },
];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Lenis Setup
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const awardsListContainer = document.querySelector(".awards-list");
  const awardPreview = document.querySelector(".award-preview");

  const POSITIONS = {
    BOTTOM: 0,
    MIDDLE: -40,
    TOP: -80,
  };

  let lastMousePosition = { x: 0, y: 0 };
  let activeAward = null;
  let ticking = false;
  let mouseTimeout = null;

  const isMobile = () => window.innerWidth < 768;

  // 2. Render Awards
  if (typeof awards !== 'undefined') {
    awards.forEach((award) => {
      const awardElement = document.createElement("div");
      awardElement.className = "award";
      awardElement.dataset.open = "false"; // Pakai dataset biar gampang diakses global
      awardElement.innerHTML = `
        <div class="award-wrapper">
          <div class="award-name">
            <div class="award-name-wrapper">
              <h2>${award.name}</h2>
              <h2>${award.project}</h2>
            </div>
            <h2 class="type">${award.type}</h2>
          </div>
          <div class="award-project">
            <h2>${award.year}</h2>
            <h2>${award.label}</h2>
          </div>
          <div class="award-name">
            <div class="award-name-wrapper">
              <h2>${award.name}</h2>
              <h2>${award.project}</h2>
            </div>
            <h2 class="type">${award.type}</h2>
          </div>
        </div>`;
      awardsListContainer.appendChild(awardElement);
    });
  }

  const awardsElements = document.querySelectorAll(".award");

  // 3. Helper Functions
  const showPreview = (index) => {
    const img = document.createElement("img");
    img.src = `./Images/${index + 1}.webp`;
    Object.assign(img.style, {
      position: "absolute",
      top: 0,
      left: 0,
      scale: 0,
      zIndex: Date.now()
    });
    awardPreview.appendChild(img);
    gsap.to(awardPreview, { opacity: 1, duration: 0.3 });
    gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out" });
  };

  const hidePreview = () => {
    const images = awardPreview.querySelectorAll("img");
    images.forEach((img) => {
      gsap.to(img, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => img.remove(),
      });
    });
    gsap.to(awardPreview, { opacity: 0, duration: 0.3 });
  };

  const updateAwardsOnScroll = () => {
    if (isMobile()) return;
    awardsElements.forEach((award) => {
      const rect = award.getBoundingClientRect();
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      const wrapper = award.querySelector(".award-wrapper");

      if (isMouseOver && activeAward !== award) {
        activeAward = award;
        gsap.to(wrapper, { y: POSITIONS.MIDDLE, duration: 0.4, ease: "power2.out" });
      } else if (!isMouseOver && activeAward === award) {
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;
        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = null;
      }
    });
    ticking = false;
  };

  // 4. Global Click Outside Logic
  document.addEventListener("click", (e) => {
    // Cek apakah klik terjadi di luar elemen .award
    if (!e.target.closest(".award")) {
      hidePreview();
      activeAward = null;
      
      // Reset semua wrapper ke posisi BOTTOM (khusus mobile)
      awardsElements.forEach((award) => {
        const wrapper = award.querySelector(".award-wrapper");
        award.dataset.open = "false";
        gsap.to(wrapper, { y: POSITIONS.BOTTOM, duration: 0.4, ease: "power2.out" });
      });
    }
  });

  // 5. Global Events
  document.addEventListener("mousemove", (e) => {
    if (isMobile()) return;
    lastMousePosition.x = e.clientX;
    lastMousePosition.y = e.clientY;

    if (mouseTimeout) clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
      const images = awardPreview.querySelectorAll("img");
      if (images.length > 1) {
        const lastImage = images[images.length - 1];
        images.forEach((img) => {
          if (img !== lastImage) {
            gsap.to(img, { scale: 0, duration: 0.4, onComplete: () => img.remove() });
          }
        });
      }
    }, 1000);
  });

  document.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateAwardsOnScroll);
      ticking = true;
    }
  }, { passive: true });

  // 6. Individual Interaction
  awardsElements.forEach((award, index) => {
    const wrapper = award.querySelector(".award-wrapper");

    // Desktop Hover
    award.addEventListener("mouseenter", (e) => {
      if (isMobile()) return;
      activeAward = award;
      gsap.to(wrapper, { y: POSITIONS.MIDDLE, duration: 0.4, ease: "power2.out" });
      showPreview(index);
    });

    award.addEventListener("mouseleave", (e) => {
      if (isMobile()) return;
      const rect = award.getBoundingClientRect();
      const leavingFromTop = e.clientY < rect.top + rect.height / 2;
      gsap.to(wrapper, {
        y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
        duration: 0.4,
        ease: "power2.out",
      });
      hidePreview();
      activeAward = null;
    });

    // Mobile Click Toggle
    award.addEventListener("click", (e) => {
      if (!isMobile()) return;
      e.stopPropagation(); // Mencegah klik ini lari ke document click handler

      const isOpen = award.dataset.open === "true";

      // Tutup award lain dulu
      awardsElements.forEach((other) => {
        if (other !== award && other.dataset.open === "true") {
          const otherWrapper = other.querySelector(".award-wrapper");
          gsap.to(otherWrapper, { y: POSITIONS.BOTTOM, duration: 0.4 });
          other.dataset.open = "false";
        }
      });

      if (!isOpen) {
        gsap.to(wrapper, { y: POSITIONS.MIDDLE, duration: 0.4, ease: "power2.out" });
        showPreview(index);
        award.dataset.open = "true";
        activeAward = award;
      } else {
        gsap.to(wrapper, { y: POSITIONS.BOTTOM, duration: 0.4, ease: "power2.out" });
        hidePreview();
        award.dataset.open = "false";
        activeAward = null;
      }
    });
  });
});