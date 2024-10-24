// Navbar visibility
let lastScrollY = 0;
const navbar = document.getElementById('navbar');

function updateNavbar() {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        navbar.classList.remove('opacity-0', '-translate-y-full');
        navbar.classList.add('opacity-100', 'translate-y-0');
    } else {
        navbar.classList.add('opacity-0', '-translate-y-full');
        navbar.classList.remove('opacity-100', 'translate-y-0');
    }
    
    lastScrollY = scrollY;
}

// Smooth scroll to services
function scrollToServices() {
    document.getElementById('services').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Event listeners
window.addEventListener('scroll', () => {
    requestAnimationFrame(updateNavbar);
});

document.addEventListener('mousemove', (e) => {
    if (e.clientY <= 60) {
        navbar.classList.remove('opacity-0', '-translate-y-full');
        navbar.classList.add('opacity-100', 'translate-y-0');
    } else if (window.scrollY <= 100) {
        navbar.classList.add('opacity-0', '-translate-y-full');
        navbar.classList.remove('opacity-100', 'translate-y-0');
    }
});