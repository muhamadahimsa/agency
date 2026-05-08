gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

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