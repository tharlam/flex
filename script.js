// DON'T REMOVE ANYTHING // Initialize AOS (Animate On Scroll) library
// --- Scroll-to-top button functionality (with optional debounce) ---
const scrollTopBtn = document.getElementById("scrollTopBtn");
let scrollTimeout;

if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            scrollTopBtn.classList.toggle("show", document.documentElement.scrollTop > 100);
        }, 50); // Adjust debounce time as needed (e.g., 50ms)
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// --- Mobile Menu Toggle functionality ---
const menuToggle = document.getElementById("menuToggle");
const navControlsContainer = document.getElementById("navLinks"); // The element with id="navLinks"

if (menuToggle && navControlsContainer) {
    menuToggle.addEventListener('click', function () {
        const isExpanded = this.getAttribute("aria-expanded") === "true";
        navControlsContainer.classList.toggle("show"); // Toggles the mobile menu visibility
        this.classList.toggle("active"); // Toggles the hamburger icon animation
        this.setAttribute("aria-expanded", String(!isExpanded)); // Convert boolean to string for aria-expanded

        // Toggle no-scroll class on body to prevent background scrolling
        document.body.classList.toggle('no-scroll', !isExpanded);
    });
}

// --- Dropdown Menu Toggle functionality ---
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior for dropdown toggles
        e.stopPropagation(); // Stop propagation to prevent document click from closing immediately

        const parentDropdown = this.closest('.dropdown');
        const isActive = parentDropdown.classList.contains('show');

        // Close all other open dropdowns
        document.querySelectorAll('.dropdown.show').forEach(openDropdown => {
            if (openDropdown !== parentDropdown) {
                openDropdown.classList.remove('show');
                openDropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle the clicked dropdown
        parentDropdown.classList.toggle('show', !isActive);
        this.setAttribute('aria-expanded', String(!isActive)); // Convert boolean to string
    });
});

// --- Close Dropdowns/Mobile Menu when clicking outside ---
document.addEventListener('click', e => {
    // Close dropdowns if click is outside any dropdown
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.show').forEach(drop => {
            drop.classList.remove('show');
            drop.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
    }

    // Close mobile menu if click is outside the menu and toggle button
    const isMobileMenuOpen = navControlsContainer && navControlsContainer.classList.contains('show');
    const clickedInsideMenu = navControlsContainer && navControlsContainer.contains(e.target);
    const clickedToggle = menuToggle && menuToggle.contains(e.target);

    if (isMobileMenuOpen && !clickedInsideMenu && !clickedToggle) {
        navControlsContainer.classList.remove('show');
        if (menuToggle) menuToggle.classList.remove('active'); // Ensure menuToggle exists before manipulating
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll'); // Re-enable scroll
    }
});

// --- Navigation Link Smooth Scroll with Offset (UPDATED) ---
document.querySelectorAll('.nav-links-list a').forEach(link => { // Target all links in the main nav list
    link.addEventListener('click', function (event) {
        // Do not close if it's a dropdown toggle (handled by its own logic)
        if (this.classList.contains('dropdown-toggle')) {
            return;
        }

        const href = this.getAttribute('href');

        // Check if the link is an internal anchor link (starts with # and is not just '#')
        if (href && href.startsWith('#') && href.length > 1) {
            const targetId = href.substring(1); // Get the ID without the '#'
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                event.preventDefault(); // Prevent default instant jump for smooth scroll

                // Get the height of your fixed header.
                const headerHeight = document.querySelector('.main-header').offsetHeight;

                // Calculate the target scroll position with a reduced offset.
                // Changed from +10 to +0. You can adjust this number (e.g., +5, +2)
                // if you want a tiny bit of space, or even a negative number if you
                // want the section to scroll slightly *under* the header.
                const offset = headerHeight + 0;

                const targetPosition = targetElement.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        }

        // Close mobile menu if currently open, regardless of link type (after potential scroll)
        const isMobileMenuOpen = navControlsContainer && navControlsContainer.classList.contains('show');
        if (isMobileMenuOpen) {
            navControlsContainer.classList.remove('show');
            if (menuToggle) menuToggle.classList.remove('active');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll'); // Re-enable scroll
        }
        // Close any open dropdowns
        document.querySelectorAll('.dropdown.show').forEach(drop => {
            drop.classList.remove('show');
            drop.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
    });
});

// --- START: Internationalization (i18n) Logic ---

// This object will hold our loaded translations
let translations = {};

// Get saved language from localStorage, or default to English 'en'
let currentLanguage = localStorage.getItem('lang') || 'en';

// Function to fetch and load translation files
async function loadTranslations(lang) {
    try {
        const response = await fetch(`./${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${lang}: ${response.statusText}`);
        }
        translations = await response.json();
        applyTranslations();

        // This line saves the language to localStorage for persistence
        localStorage.setItem('lang', lang);

        // Update the HTML lang attribute
        document.documentElement.lang = lang;

        // Update the language selector's value
        const langSelect = document.getElementById('lang');
        if (langSelect && langSelect.value !== lang) {
            langSelect.value = lang;
        }
    } catch (error) {
        console.error("Error loading translations:", error);
    }
}

// Function to apply translations to elements
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key] !== undefined) {
            if (element.querySelector('.highlight-blue') || key.includes('section_title') || key.includes('main_heading')) {
                element.innerHTML = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key] !== undefined) {
            element.setAttribute('placeholder', translations[key]);
        }
    });

    document.querySelectorAll('[data-i18n-arialabel]').forEach(element => {
        const key = element.getAttribute('data-i18n-arialabel');
        if (translations[key] !== undefined) {
            element.setAttribute('aria-label', translations[key]);
        }
    });
}

// --- Language selector functionality ---
const langSelect = document.getElementById('lang');
if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', function () {
        currentLanguage = this.value;
        loadTranslations(currentLanguage);
    });
}

// Load the correct language on every page load
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(currentLanguage);
});

// --- END: Internationalization (i18n) Logic ---