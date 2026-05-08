import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // HIDUPKAN LENIS DI SEMUA DEVICE
  const lenis = new Lenis({
    // Semakin besar angkanya, semakin lambat/berat transisinya
    duration: 2,

    // Easing function (Bezier Curve) yang bikin start & stop-nya smooth banget
    // ini mirip dengan style web premium
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

    direction: "vertical", // 'vertical' atau 'horizontal'
    gestureDirection: "vertical",
    smoothWheel: true,

    // Menambah 'inersia' saat scroll berhenti
    wheelMultiplier: 1.1,
    touchMultiplier: 2,

    // Memastikan scroll tetap halus meski frame rate turun
    infinite: false,
  });

  // Update ScrollTrigger secara real-time
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const videoContainer = document.querySelector(".video-container");
  const videoTitleElements = document.querySelectorAll(".video-title p");

  const getInitialValues = () => {
    const width = window.innerWidth;
    // Jika mobile, kita buat dia tidak terlalu jauh lompatnya (translateY lebih kecil)
    if (width < 900) {
      return { translateY: -30, movementMultiplier: 0 }; // Matikan mouse movement di mobile
    }
    // Nilai Desktop (Breakpoints kamu yang lama)
    return { translateY: -110, movementMultiplier: 650 };
  };

  let initialValues = getInitialValues();

  const animationState = {
    scrollProgress: 0,
    initialTranslateY: initialValues.translateY,
    currentTranslateY: initialValues.translateY,
    movementMultiplier: initialValues.movementMultiplier,
    scale: window.innerWidth < 900 ? 0.8 : 0.25, // Start scale lebih besar di mobile
    fontSize: window.innerWidth < 900 ? 40 : 80,
    gap: 2,
    targetMouseX: 0,
    currentMouseX: 0,
  };

  // Update nilai saat resize
  window.addEventListener("resize", () => {
    initialValues = getInitialValues();
    animationState.initialTranslateY = initialValues.translateY;
    animationState.movementMultiplier = initialValues.movementMultiplier;
  });

  // SCROLL ANIMATION (Aktif di semua device)
  ScrollTrigger.create({
    trigger: ".intro",
    start: "top bottom",
    end: "top 10%",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      animationState.scrollProgress = p;

      // Animasi Translate & Scale
      animationState.currentTranslateY = gsap.utils.interpolate(
        animationState.initialTranslateY,
        0,
        p,
      );

      const startScale = window.innerWidth < 900 ? 0.8 : 0.25;
      animationState.scale = gsap.utils.interpolate(startScale, 1, p);

      // Animasi Font Size
      const startFS = window.innerWidth < 900 ? 40 : 80;
      const endFS = window.innerWidth < 900 ? 18 : 20;
      animationState.fontSize = gsap.utils.interpolate(startFS, endFS, p);
    },
  });

  // MOUSE MOVEMENT (Hanya update target jika desktop)
  document.addEventListener("mousemove", (e) => {
    if (window.innerWidth >= 900) {
      animationState.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    }
  });

  const animate = () => {
    const {
      scale,
      targetMouseX,
      currentMouseX,
      currentTranslateY,
      fontSize,
      movementMultiplier,
    } = animationState;

    // Hitung horizontal movement (0 jika mobile karena movementMultiplier = 0)
    const scaleMovementMultiplier = (1 - scale) * movementMultiplier;
    const maxHorizontalMovement =
      scale < 0.95 ? targetMouseX * scaleMovementMultiplier : 0;

    animationState.currentMouseX = gsap.utils.interpolate(
      currentMouseX,
      maxHorizontalMovement,
      0.05,
    );

    // Apply Styles
    videoContainer.style.transform = `translate3d(${animationState.currentMouseX}px, ${currentTranslateY}%, 0) scale(${scale})`;

    videoTitleElements.forEach((element) => {
      element.style.fontSize = `${fontSize}px`;
    });

    requestAnimationFrame(animate);
  };

  animate();
});
