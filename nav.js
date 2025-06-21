// Nav
const navBtn = document.querySelector(".nav-btn");
const navClose = document.querySelector(".close");
const navItems = document.querySelectorAll(".nav-item");

navBtn.addEventListener("click", () => {
  gsap.to(navItems, {
    left: "0%",
    duration: 1,
    stagger: 0.075,
    ease: "power4.out",
  });

  gsap.to(navBtn, {
    left: "-100%",
    duration: 1,
    ease: "power4.out",
  });
});

navClose.addEventListener("click", () => {
  gsap.to(navItems, {
    left: "100%",
    duration: 1,
    stagger: 0.075,
    ease: "power4.out",
  });

  gsap.to(navBtn, {
    left: "0%",
    duration: 1,
    ease: "power4.out",
  });
});
