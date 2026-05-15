
// =========================
// GLOBAL STATE
// =========================
let activeVideo = null;
const cards = document.querySelectorAll('.movie-card');


// =========================
// MOBILE MENU
// =========================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}


// =========================
// FIREBASE VIEW TRACKING (SAFE OPTIONAL)
// =========================
function trackView(videoId) {
  if (typeof firebase === "undefined") return;

  const db = firebase.database();

  db.ref(`views/${videoId}`).transaction(current => (current || 0) + 1);
}


// =========================
// STOP ALL OTHER VIDEOS
// =========================
function stopAllVideos(except = null) {
  cards.forEach(card => {
    const v = card.querySelector('video');
    if (v && v !== except) {
      v.pause();
      v.currentTime = 0;
      v.style.opacity = 0;
    }
  });
}


// =========================
// PLAY VIDEO CORE FUNCTION
// =========================
function playVideo(video, card) {
  if (!video) return;

  stopAllVideos(video);

  video.currentTime = 0;
  video.play().catch(() => {});
  video.style.opacity = 1;

  activeVideo = video;

  // Firebase tracking (optional)
  const id = card.dataset.id;
  if (id) trackView(id);
}


// =========================
// PAUSE VIDEO
// =========================
function pauseVideo(video) {
  if (!video) return;

  video.pause();
  video.currentTime = 0;
  video.style.opacity = 0;

  activeVideo = null;
}


// =========================
// CARD INTERACTIONS (DESKTOP + MOBILE)
// =========================
cards.forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;

  const handleTap = (e) => {
    e.preventDefault();

    const isPlaying = !video.paused;

    if (!isPlaying) {
      playVideo(video, card);
    } else {
      pauseVideo(video);
    }

    // Ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${e.offsetX}px`;
    ripple.style.top = `${e.offsetY}px`;

    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  };

  // Desktop hover preview
  card.addEventListener('mouseenter', () => playVideo(video, card));
  card.addEventListener('mouseleave', () => pauseVideo(video));

  // Mobile tap
  card.addEventListener('click', handleTap);
  card.addEventListener('touchstart', handleTap, { passive: true });
});


// =========================
// SCROLL-BASED AUTO PLAY (NETFLIX STYLE)
// =========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const card = entry.target;
    const video = card.querySelector('video');

    if (!video) return;

    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
      if (activeVideo && activeVideo !== video) {
        activeVideo.pause();
        activeVideo.currentTime = 0;
      }

      playVideo(video, card);
    } else {
      pauseVideo(video);
    }
  });
}, {
  threshold: 0.6
});

cards.forEach(card => observer.observe(card));


// =========================
// LAZY LOAD VIDEOS (PERFORMANCE BOOST)
// =========================
const lazyVideos = document.querySelectorAll('video[data-src]');

const lazyObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const video = entry.target;
    video.src = video.dataset.src;
    video.removeAttribute('data-src');

    obs.unobserve(video);
  });
});

lazyVideos.forEach(video => lazyObserver.observe(video));


// =========================
// DROPDOWN MENU (HOME ONLY)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("home-page")) return;

  const dropdown = document.querySelector(".dropdown");
  if (!dropdown) return;

  const toggle = dropdown.querySelector(".dropdown-toggle");

  if (toggle) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.classList.toggle("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});


// =========================
// FIREBASE LOGOUT
// =========================
function logout() {
  if (typeof firebase === "undefined") return;

  firebase.auth().signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Logout error:", err);
    });
}