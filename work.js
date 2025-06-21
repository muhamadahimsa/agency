gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const works = document.querySelectorAll('.work');
const workImage = document.querySelector('.work-img');
const overlay = document.querySelectorAll('.overlay')

works.forEach(function(work){
  work.addEventListener('mouseenter', function(){
    const bgimg = work.getAttribute('data-img')
    workImage.style.backgroundImage = `url(${bgimg})`

    gsap.to(workImage, {
      opacity: 1,
      duration: .1,
    })
  })

  work.addEventListener('mouseleave', function(){
    gsap.to(workImage, {
      opacity: 0,
      duration: .1,
    })
  })
})

works.forEach((work, index) => {
  work.addEventListener('mouseenter', () => {
    gsap.to(overlay[index], {
      opacity: 1,
      duration: .2,
    })
  })

  work.addEventListener('mouseleave', () => {
    gsap.to(overlay[index], {
      opacity: 0,
      delay: .2,
      duration: .2,
    })
  })
})