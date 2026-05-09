import barba from 'https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/+esm';
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm";
import { slides } from "./slides.js";

gsap.registerPlugin(ScrollTrigger);

const config = {
  smoothing: 0.1,
  movementThreshold: 0.01,
  sizeFromSpeed: 0.2,
  expandMultiplier: 2,
  expandTime: 2,
  expandEase: "power1.inOut",
  dissolveTime: 3,
  dissolveStart: 2,
  dissolveEase: "power3.in",
};

const heroSection = document.querySelector(".hero");
const smudgeSVG = document.querySelector(".smudge-revealer");
const smudgeContainer = document.querySelector(".smudge-blobs");

const pointer = { x: 0, y: 0 };
const smoothPointer = { x: 0, y: 0 };
let hasStarted = false;

function onPointerMove(x, y) {
  if (!hasStarted) {
    pointer.x = smoothPointer.x = x;
    pointer.y = smoothPointer.y = y;
    hasStarted = true;
    return;
  }

  pointer.x = x;
  pointer.y = y;
}

heroSection.addEventListener("mousemove", function (e) {
  onPointerMove(e.pageX, e.pageY);
});

heroSection.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
    onPointerMove(e.touches[0].pageX, e.touches[0].pageY);
  },
  { passive: false },
);

heroSection.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
    onPointerMove(e.touches[0].pageX, e.touches[0].pageY);
  },
  { passive: false },
);

function matchSVGToViewport() {
  smudgeSVG.style.width = window.innerWidth + "px";
  smudgeSVG.style.height = window.innerHeight + "px";
}

matchSVGToViewport();
window.addEventListener("resize", matchSVGToViewport);

function stampSmudgeAt(x, y, radius) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );

  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", "white");

  smudgeContainer.prepend(circle);

  const animatedRadius = { current: radius };

  const timeline = gsap.timeline({
    onUpdate() {
      circle.setAttribute("r", Math.max(0, animatedRadius.current));
    },
    onComplete() {
      timeline.kill();
      circle.remove();
    },
  });

  timeline.to(animatedRadius, {
    current: radius * config.expandMultiplier,
    duration: config.expandTime,
    ease: config.expandEase,
  });

  timeline.to(
    animatedRadius,
    {
      current: 0,
      duration: config.dissolveTime,
      ease: config.dissolveEase,
    },
    config.dissolveStart,
  );
}

function update() {
  if (hasStarted) {
    // Menghitung pergerakan halus (lerp) pointer
    smoothPointer.x += (pointer.x - smoothPointer.x) * config.smoothing;
    smoothPointer.y += (pointer.y - smoothPointer.y) * config.smoothing;

    // Menghitung kecepatan berdasarkan jarak antara pointer asli dan pointer halus
    const speed = Math.hypot(
      pointer.x - smoothPointer.x,
      pointer.y - smoothPointer.y,
    );

    // Cek jika kecepatan melebihi ambang batas gerakan yang ditentukan
    if (speed > config.movementThreshold) {
      stampSmudgeAt(
        smoothPointer.x,
        smoothPointer.y,
        speed * config.sizeFromSpeed,
      );
    }
  }

  // Melakukan looping animasi
  requestAnimationFrame(update);
}

// Inisialisasi loop pertama kali
requestAnimationFrame(update);

// About
const splitText = new SplitType(".about-text h3", {
  types: "lines",
  lineClass: "line",
});

splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".about",
  start: "top center",
  onEnter: () => {
    gsap.to(".about-text h3 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
});

const aboutContainer = document.querySelector(".about");
const aboutText = document.querySelector(".about-text");

aboutContainer.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e;
  const { left, top, width, height } = aboutContainer.getBoundingClientRect();

  // Menghitung titik tengah container
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  // Menghitung jarak mouse dari titik tengah (-1 sampai 1)
  const posX = (clientX - centerX) / (width / 2);
  const posY = (clientY - centerY) / (height / 2);

  // Jalankan animasi tilt dengan GSAP
  gsap.to(aboutText, {
    duration: 0.8,
    rotateY: posX * 15, // Maksimal rotasi Y (kiri-kanan) 15 derajat
    rotateX: -posY * 15, // Maksimal rotasi X (atas-bawah) 15 derajat
    ease: "power2.out",
    overwrite: true,
  });
});

// Reset posisi saat mouse keluar area
aboutContainer.addEventListener("mouseleave", () => {
  gsap.to(aboutText, {
    duration: 1,
    rotateY: 0,
    rotateX: 0,
    ease: "power3.out",
  });
});

// Work
document.addEventListener("DOMContentLoaded", () => {
  // --- FIX MOBILE VIEWPORT JUMP ---
  const updateVh = () => {
    // Ambil tinggi asli jendela (pixel)
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
  };

  updateVh();
  // Update hanya jika orientasi layar berubah, bukan pas scroll
  window.addEventListener('orientationchange', updateVh);

  let activeSlideIndex = 0;
  let previousProgress = 0;
  let isAnimatingSlide = false;
  let triggerDestroyed = false;

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const initialSlide = document.querySelector(".carousel .slide");
  gsap.set(initialSlide, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });
  gsap.set(initialSlide.querySelector(".slide-img img"), { y: "0%" });

  function updateProgressBars(progress) {
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar, index) => {
      const barProgress = Math.min(Math.max(progress * 4 - index, 0), 1);
      bar.style.setProperty("--progress", barProgress);
    });
  }

  function createAndAnimateSlide(index, isScrollingForward) {
    const carousel = document.querySelector(".carousel");

    const currentSlide = document.querySelector(".carousel .slide");
    if (!currentSlide) {
      isAnimatingSlide = false;
      return;
    }

    const slideData = slides[index];

    const newSlide = document.createElement("div");
    newSlide.className = "slide";
    newSlide.innerHTML = `
      <div class="slide-img">
        <img src="./Images/work${index + 1}.webp" alt="${slideData.alt}" />
      </div>
      <div class="slide-copy">
        <div class="slide-tag">
          <p>${slideData.tag}</p>
          <p>${slideData.type}</p>
          <p>${slideData.year}</p>
          <a href="${slideData.links}">${slideData.link}</a>
        </div>
        <div class="slide-title">
            <h4>${slideData.marquee}</h4>
        </div>
      </div>`;

    const currentSlideImg = currentSlide.querySelector(".slide-img");
    const currentSlideCopy = currentSlide.querySelector(".slide-copy");

    if (!currentSlideImg || !currentSlideCopy) {
      isAnimatingSlide = false;
      return;
    }

    gsap.killTweensOf(currentSlide);
    gsap.killTweensOf(currentSlideImg);
    gsap.killTweensOf(currentSlideCopy);

    if (isScrollingForward) {
      const newSlideImg = newSlide.querySelector(".slide-img img");
      const newSlideCopy = newSlide.querySelector(".slide-copy");

      gsap.set(newSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.set(newSlideImg, { y: "25%" });
      gsap.set(newSlideCopy, { y: "100%" });

      carousel.appendChild(newSlide);

      gsap.to(newSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to([newSlideCopy, newSlideImg], {
        y: "0%",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(currentSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to(currentSlideImg, {
            y: "-25%",
            duration: 1,
            ease: "power4.inOut",
          });
          gsap.to(currentSlideCopy, {
            y: "-100%",
            duration: 1,
            ease: "power4.inOut",
          });
        },
        onComplete: () => {
          if (currentSlide.parentNode) {
            currentSlide.remove();
          }
          isAnimatingSlide = false;
        },
      });
    } else {
      const newSlideImg = newSlide.querySelector(".slide-img img");
      const newSlideCopy = newSlide.querySelector(".slide-copy");

      gsap.set(newSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      });
      gsap.set(newSlideImg, { y: "0%" });
      gsap.set(newSlideCopy, { y: "0%" });

      carousel.insertBefore(newSlide, currentSlide);

      gsap.to(newSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to([currentSlideImg, currentSlideCopy], {
        y: "0%",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(currentSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to(currentSlideImg, {
            y: "25%",
            duration: 1,
            ease: "power4.inOut",
          });
          gsap.to(currentSlideCopy, {
            y: "100%",
            duration: 1,
            ease: "power4.inOut",
          });
        },
        onComplete: () => {
          if (currentSlide.parentNode) {
            currentSlide.remove();
          }
          isAnimatingSlide = false;
        },
      });
    }
  }

  const scrollTrigger = ScrollTrigger.create({
    trigger: ".carousel",
    start: "top top",
    end: () => `+=${window.innerHeight * 3}`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      if (triggerDestroyed) return;

      const progress = self.progress;
      updateProgressBars(progress);

      if (isAnimatingSlide) {
        previousProgress = progress;
        return;
      }

      const isScrollingForward = progress > previousProgress;
      const targetSlideIndex = Math.min(Math.floor(progress * 4), 3); // Disesuaikan indexnya

      if (targetSlideIndex !== activeSlideIndex) {
        isAnimatingSlide = true;
        try {
          createAndAnimateSlide(targetSlideIndex, isScrollingForward);
          activeSlideIndex = targetSlideIndex;
        } catch (err) {
          isAnimatingSlide = false;
        }
      }
      previousProgress = progress;
    },
    onKill: () => {
      triggerDestroyed = true;
    },
  });
});

// Services
const services = document.querySelectorAll(".service-item");

services.forEach((service, index) => {
  service.addEventListener("mouseenter", () => {
    const serviceItemImages = services[index].querySelectorAll(
      ".service-item-img img",
    );

    gsap.to(serviceItemImages, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "power4.out",
    });
  });

  service.addEventListener("mouseleave", () => {
    const serviceItemImages = services[index].querySelectorAll(
      ".service-item-img img",
    );

    gsap.to(serviceItemImages, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "power4.out",
    });
  });
});

// Insight
const insights = document.querySelectorAll(".insight");
const read = document.querySelectorAll(".in-img .ofh p");

insights.forEach((insight, index) => {
  insight.addEventListener("mouseenter", () => {
    gsap.to(read[index], {
      transform: "translateY(0%)",
      duration: 0.5,
      ease: "power4.out",
    });
  });

  insight.addEventListener("mouseleave", () => {
    gsap.to(read[index], {
      transform: "translateY(100%)",
      duration: 0.5,
      ease: "power4.out",
    });
  });
});
