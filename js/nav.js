import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";

const navToggler = document.querySelector('.nav-toggler');
const navBgs = document.querySelectorAll('.nav-bg');
const navContent = document.querySelector('.nav-content');

let isMenuOpen = false;
let isAnimating = false;

// ✅ 1. Inisialisasi Splitting & Force Create Line Elements
const results = Splitting({
  target: '.nav-items a',
  by: 'lines',
});

// Splitting.js secara default tidak membuat elemen .line. 
// Kita harus membungkus kata-kata ke dalam span .line secara manual agar bisa di-masking.
results.forEach((result) => {
  const lines = result.lines;
  result.el.innerHTML = ''; // Bersihkan isi asli link

  lines.forEach((line) => {
    const lineSpan = document.createElement('span');
    lineSpan.classList.add('line');
    lineSpan.style.display = 'block'; // Wajib block agar transform y jalan
    
    line.forEach((word) => {
      lineSpan.appendChild(word);
      lineSpan.appendChild(document.createTextNode(' ')); 
    });
    
    result.el.appendChild(lineSpan);
  });
});

// ✅ 2. Selector target animasi
const linkBlocks = [
  '.nav-socials .line',
  '.nav-legal .line',
  '.nav-primary-links .line',
  '.nav-secondary-links .line',
];

// ✅ 3. Timeline Utama (Background & Container)
const tl = gsap.timeline({
  paused: true,
  onStart: () => {
    navContent.style.pointerEvents = 'auto';
  },
  onComplete: () => {
    isAnimating = false;
  },
  onReverseComplete: () => {
    gsap.set(linkBlocks.join(", "), { y: '100%' });
    navContent.style.pointerEvents = 'none';
    isAnimating = false;
  },
});

tl.to(navBgs, {
  scaleY: 1,
  duration: 0.75,
  stagger: 0.1,
  ease: 'power3.inOut',
});

tl.to('.nav-items', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  duration: 0.75,
  ease: 'power3.inOut',
}, '-=0.6');

// ✅ 4. Fungsi Animasi Link (Parallel)
function animateLinksIn() {
  linkBlocks.forEach((selector) => {
    gsap.fromTo(
      selector,
      { y: '100%' },
      {
        y: '0%',
        duration: 0.75,
        stagger: 0.05,
        ease: 'power4.out', // Lebih snappy untuk teks
        delay: 0.85, 
      }
    );
  });
}

// ✅ 5. Event Listener
navToggler.addEventListener('click', () => {
  if (isAnimating) return;
  isAnimating = true;

  const openText = navToggler.querySelector('.open');
  const closeText = navToggler.querySelector('.close');

  if (!isMenuOpen) {
    // KLIK PERTAMA: Buka Nav (Teks naik ke atas)
    tl.play();
    animateLinksIn();

    // Animasi Teks Toggler
    gsap.to(openText, { y: '-100%', duration: .6, ease: 'power3.inOut' });
    gsap.to(closeText, { startAt: { y: '100%' }, y: '0%', duration: .6, ease: 'power3.inOut' });

  } else {
    // KLIK KEDUA: Tutup Nav (Teks turun ke bawah)
    tl.reverse();
    gsap.to(linkBlocks.join(", "), {
      y: '100%',
      duration: 0.5,
      ease: 'power3.in',
    });

    // Animasi Teks Toggler
    gsap.to(openText, { y: '0%', duration: .6, ease: 'power3.inOut' });
    gsap.to(closeText, { y: '100%', duration: .6, ease: 'power3.inOut' });
  }

  isMenuOpen = !isMenuOpen;
});