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

function setFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const errorElement = form.querySelector(`[data-field-error-for="${fieldName}"]`);
    const formGroup = field?.closest('.form-group');

    if (field) {
        field.setAttribute('aria-invalid', 'true');
    }

    if (formGroup) {
        formGroup.classList.add('is-invalid');
    }

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(form, fieldName) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const errorElement = form.querySelector(`[data-field-error-for="${fieldName}"]`);
    const formGroup = field?.closest('.form-group');

    if (field) {
        field.removeAttribute('aria-invalid');
    }

    if (formGroup) {
        formGroup.classList.remove('is-invalid');
    }

    if (errorElement) {
        errorElement.textContent = '';
    }
}

function validateContactFormField(form, fieldName) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const value = field?.value.trim() || '';

    if (!field) return true;

    switch (fieldName) {
        case 'name':
            if (!value) {
                setFieldError(form, fieldName, 'Please enter your full name.');
                return false;
            }
            break;
        case 'email': {
            if (!value) {
                setFieldError(form, fieldName, 'Please enter your email address.');
                return false;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                setFieldError(form, fieldName, 'Please enter a valid email address.');
                return false;
            }
            break;
        }
        case 'service':
            if (!value) {
                setFieldError(form, fieldName, 'Please select a service.');
                return false;
            }
            break;
        case 'message':
            if (!value) {
                setFieldError(form, fieldName, 'Please enter a short project brief.');
                return false;
            }
            if (value.length < 20) {
                setFieldError(form, fieldName, 'Please provide a bit more detail (at least 20 characters).');
                return false;
            }
            break;
        default:
            break;
    }

    clearFieldError(form, fieldName);
    return true;
}

function validateContactForm(form) {
    const fieldsToValidate = ['name', 'email', 'service', 'message'];
    return fieldsToValidate.every((fieldName) => validateContactFormField(form, fieldName));
}

function setFormNote(formNote, message, type) {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.className = `form-note ${type ? `is-${type}` : ''}`.trim();
}

function setSubmitState(submitButton, isSubmitting) {
    if (!submitButton) return;

    if (!submitButton.dataset.defaultText) {
        submitButton.dataset.defaultText = submitButton.textContent;
    }

    submitButton.disabled = isSubmitting;
    submitButton.classList.toggle('is-loading', isSubmitting);
    submitButton.textContent = isSubmitting ? 'Sending Message...' : submitButton.dataset.defaultText;
}

function getContactFormPayload(form) {
    return {
        name: form.querySelector('[name="name"]')?.value.trim() || '',
        email: form.querySelector('[name="email"]')?.value.trim() || '',
        service: form.querySelector('[name="service"]')?.value.trim() || '',
        message: form.querySelector('[name="message"]')?.value.trim() || ''
    };
}

async function submitContactFormData(payload) {
    // TODO: Replace this temporary logic with a backend API request when your endpoint is ready.
    // Example:
    // const response = await fetch(YOUR_BACKEND_ENDPOINT, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload)
    // });
    // return { ok: response.ok };

    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { ok: Boolean(payload.name && payload.email && payload.service && payload.message) };
}

function initializeContactForm(form) {
    const formNote = form.querySelector('[data-form-note]');
    const submitButton = form.querySelector('[data-submit-btn]');
    const fieldsToValidate = ['name', 'email', 'service', 'message'];

    fieldsToValidate.forEach((fieldName) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        field.addEventListener('blur', () => {
            validateContactFormField(form, fieldName);
        });

        field.addEventListener('input', () => {
            if (field.getAttribute('aria-invalid') === 'true') {
                validateContactFormField(form, fieldName);
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        setFormNote(formNote, '', '');

        const isValid = validateContactForm(form);
        if (!isValid) {
            setFormNote(formNote, 'Please review the highlighted fields and try again.', 'error');
            return;
        }

        setSubmitState(submitButton, true);

        try {
            const payload = getContactFormPayload(form);
            const result = await submitContactFormData(payload);

            if (!result?.ok) {
                throw new Error('Submission failed');
            }

            setFormNote(
                formNote,
                'Thank you for contacting us. Your message has been received successfully. Our team will get back to you as soon as possible.',
                'success'
            );
            form.reset();
            fieldsToValidate.forEach((fieldName) => clearFieldError(form, fieldName));
        } catch (error) {
            setFormNote(
                formNote,
                'Sorry, we could not send your message right now. Please try again in a moment.',
                'error'
            );
        } finally {
            setSubmitState(submitButton, false);
        }
    });
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
    initializeContactForm(contactForm);
}

window.addEventListener('scroll', handleHeaderState);
window.addEventListener('load', () => {
    handleHeaderState();
    setActiveNavLink();
});