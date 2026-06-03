const header = document.querySelector('#header');
const menuBtn = document.querySelector('#menu-btn');
const navList = document.querySelector('.navlist');

// ── Dark mode ──
(function () {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
})();

function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon();
    updateHeroPoster();
}

function updateThemeIcon() {
    const btn = document.querySelector('#theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function updateHeroPoster() {
    const heroVideo = document.querySelector('.hero-video-bg');
    if (!heroVideo) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextPoster = isDark ? heroVideo.dataset.posterDark : heroVideo.dataset.posterLight;

    if (nextPoster) {
        heroVideo.setAttribute('poster', nextPoster);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('#theme-toggle');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

    updateHeroPoster();
});

function handleHeaderState() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.navlist a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = href.split('/').pop();
        link.classList.toggle('active', linkPath === currentPath);
    });
}

if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
        navList.classList.toggle('open');
        const expanded = navList.classList.contains('open');
        menuBtn.setAttribute('aria-expanded', String(expanded));
        menuBtn.innerHTML = expanded
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    document.querySelectorAll('.navlist a').forEach((link) => {
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}

function animateCounter(counter) {
    const target = Number(counter.dataset.target || 0);
    const duration = 2200;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(easedProgress * target);
        counter.textContent = `${value}${progress === 1 ? '+' : ''}`;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

const counters = document.querySelectorAll('.counter');
if (counters.length > 0) {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const counter = entry.target;
                if (counter.dataset.animated === 'true') return;

                counter.dataset.animated = 'true';
                animateCounter(counter);
                obs.unobserve(counter);
            });
        },
        { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

const demoForm = document.querySelector('[data-demo-form]');
const formNote = document.querySelector('[data-form-note]');
if (demoForm) {
    demoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = demoForm.querySelector('#name')?.value.trim();
        const email = demoForm.querySelector('#email')?.value.trim();
        const service = demoForm.querySelector('#service')?.value.trim();
        const message = demoForm.querySelector('#message')?.value.trim();

        if (!name || !email || !service || !message) {
            if (formNote) {
                formNote.textContent = 'Please complete every field before sending your message.';
                formNote.className = 'form-note is-error';
            }
            return;
        }

        if (formNote) {
            formNote.textContent = 'Thanks. Your message has been captured in this demo UI. Connect this form to your email service or backend next.';
            formNote.className = 'form-note is-success';
        }
        demoForm.reset();
    });
}

window.addEventListener('scroll', handleHeaderState);
window.addEventListener('load', () => {
    handleHeaderState();
    setActiveNavLink();
});