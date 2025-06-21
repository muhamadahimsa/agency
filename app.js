gsap.registerPlugin(Draggable);
gsap.registerPlugin(ScrollTrigger);

const draggable = {
  element: document.querySelector(".draggable"),
  container: document.querySelector(".draggable-container"),
  items: document.querySelectorAll(".draggable-item"),
};

const isBounded = true;

const init = () => {
  draggable.items.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect(),
      itemWidth = itemRect.width,
      itemHeight = itemRect.height;

    const positions = {
      left: {
        x: gsap.utils.random(-itemWidth - 500, -itemWidth - 100),
        y: gsap.utils.random(0, window.innerHeight - itemHeight),
      },
      right: {
        x: gsap.utils.random(window.innerWidth + 100, window.innerWidth + 500),
        y: gsap.utils.random(0, window.innerHeight - itemHeight),
      },
      top: {
        x: gsap.utils.random(0, window.innerWidth - itemWidth),
        y: gsap.utils.random(-itemHeight - 500, -itemHeight - 100),
      },
      bottom: {
        x: gsap.utils.random(0, window.innerWidth - itemWidth),
        y: gsap.utils.random(
          window.innerHeight + 100,
          window.innerHeight + 500
        ),
      },
    };

    const fromSide = gsap.utils.random(["left", "right", "top", "bottom"]);
    const { x, y } = positions[fromSide];

    gsap.set(item, {
      x: x,
      y: y,
      zIndex: Math.floor(Math.random() * draggable.items.length) + 1,
    });

    gsap.to(item, {
      duration: 1,
      x: gsap.utils.random(
        window.innerWidth * 0.5,
        window.innerWidth * 0.5 - itemWidth
      ),
      y: gsap.utils.random(
        window.innerHeight * 0.5,
        window.innerHeight * 0.5 - itemHeight
      ),
      delay: index * 0.2,
      ease: "power3.out",

      onComplete: () => {
        Draggable.create(item, {
          bounds: isBounded ? draggable.element : null,
        });
      },
    });
  });
};

init();

window.addEventListener("DOMContentLoaded", init);

import { slides } from "./slides.js";

document.addEventListener("DOMContentLoaded", () => {
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

  initMarqueeAnimation(initialSlide.querySelector(".marquee-container h3"));

  function updateProgressBars(progress) {
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar, index) => {
      const barProgress = Math.min(Math.max(progress * 4 - index, 0), 1);
      bar.style.setProperty("--progress", barProgress);
    });
  }

  function initMarqueeAnimation(h1Element) {
    const text = h1Element.textContent;
    h1Element.textContent = text + " " + text + " " + text;

    gsap.to(h1Element, {
      x: "-7%",
      duration: 20,
      ease: "linear",
      repeat: -1,
      rotation: 0.01,
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
        <img src="./Lab/work${index + 1}.jpg" alt="${slideData.alt}" />
      </div>
      <div class="slide-copy">
        <div class="slide-tag">
          <p>${slideData.tag}</p>
          <p>${slideData.type}</p>
          <p>${slideData.year}</p>
          <a href="${slideData.links}">${slideData.link}</a>
        </div>
        <div class="slide-marquee">
          <div class="marquee-container">
            <h3>${slideData.marquee}</h3>
          </div>
        </div>
      </div>`;

    initMarqueeAnimation(newSlide.querySelector(".marquee-container h3"));

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
        onInterrupt: () => {
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
        onInterrupt: () => {
          isAnimatingSlide = false;
        },
      });
    }
  }

  const scrollTrigger = ScrollTrigger.create({
    trigger: ".carousel",
    start: "top top",
    end: `+=${window.innerHeight * 3}px`,
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
      const targetSlideIndex = Math.min(Math.floor(progress * 4), 4);

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

// About
const splitText = new SplitType(".about-text h2", {
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
    gsap.to(".about-text h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
});

// Services
const services = document.querySelectorAll(".service-item");

services.forEach((service, index) => {
  service.addEventListener("mouseenter", () => {
    const serviceItemImages =
      services[index].querySelectorAll(".service-item-img img");

    gsap.to(serviceItemImages, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1,
      ease: "power4.out",
    });
  });

  service.addEventListener("mouseleave", () => {
    const serviceItemImages =
      services[index].querySelectorAll(".service-item-img img");

    gsap.to(serviceItemImages, {
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
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
      duration: .5,
      ease: "power4.out",
    });
  });

  insight.addEventListener("mouseleave", () => {
    gsap.to(read[index], {
      transform: "translateY(100%)",
      duration: .5,
      ease: "power4.out",
    });
  });
});
