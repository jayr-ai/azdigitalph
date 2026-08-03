// ===== Smooth Scroll Navigation =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Three.js 3D Visualization =====
function initThreeScene() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    camera.position.z = 5;

    // Create rotating cube made of data points
    const geometry = new THREE.BoxGeometry(3, 3, 3);

    // Create gradient material
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 256;
    canvas2d.height = 256;
    const ctx = canvas2d.getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#0066ff');
    gradient.addColorStop(0.5, '#00d9ff');
    gradient.addColorStop(1, '#ff0055');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add some visual noise/pattern
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.fillRect(
            Math.random() * 256,
            Math.random() * 256,
            Math.random() * 20,
            Math.random() * 20
        );
    }

    const texture = new THREE.CanvasTexture(canvas2d);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    // Add lighting
    const light1 = new THREE.DirectionalLight(0x0066ff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x00d9ff, 0.8);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.003;
        cube.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// ===== Chart.js Revenue Visualization =====
function initRevenueChart() {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#0066ff',
                    backgroundColor: 'rgba(0, 102, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#00d9ff',
                    pointBorderColor: '#0066ff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                },
                {
                    label: 'Conversions',
                    data: [8, 12, 10, 15, 14, 18],
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1',
                    pointRadius: 6,
                    pointBackgroundColor: '#ff0055',
                    pointBorderColor: '#ff0055',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                        },
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                filler: {
                    propagate: true
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: "'Inter', sans-serif",
                        }
                    },
                    grid: {
                        color: 'rgba(45, 55, 72, 0.2)',
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: "'Inter', sans-serif",
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                x: {
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            family: "'Inter', sans-serif",
                        }
                    },
                    grid: {
                        color: 'rgba(45, 55, 72, 0.2)',
                    }
                }
            }
        }
    });
}

// ===== Scroll Animation Observer =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all scroll-fade elements
    document.querySelectorAll('.scroll-fade').forEach(el => {
        observer.observe(el);
    });

    // Also observe section titles
    document.querySelectorAll('.section-title').forEach(el => {
        observer.observe(el);
    });
}

// ===== Parallax Effect on Scroll =====
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // Parallax for about cards
        document.querySelectorAll('.parallax-card').forEach((card, index) => {
            const offset = scrolled * (0.5 + index * 0.1);
            card.style.transform = `translateY(${offset * 0.1}px)`;
        });
    });
}

// ===== Form Handling =====
function initFormHandling() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: form.querySelector('input[placeholder="Your Name"]').value,
            email: form.querySelector('input[placeholder="Your Email"]').value,
            phone: form.querySelector('input[placeholder="Phone Number"]').value,
            company: form.querySelector('input[placeholder="Your Company"]').value,
            message: form.querySelector('textarea').value,
        };

        // Log the data (for now, since email isn't set up)
        console.log('Form submitted:', data);

        // Store in localStorage for later retrieval
        const submissions = JSON.parse(localStorage.getItem('auditRequests') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('auditRequests', JSON.stringify(submissions));

        // Show success message
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✓ Request Received! I\'ll contact you soon.';
        submitBtn.style.background = 'linear-gradient(135deg, #00d084, #00aa66)';

        form.reset();

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 5000);

        // Optional: Send email via email service (replace with your service)
        // Example with EmailJS or similar service
        // await sendEmail(data);
    });
}

// ===== Mouse Follow Effect =====
function initMouseFollowEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        const canvas = document.getElementById('canvas3d');
        if (canvas) {
            canvas.style.transform = `perspective(1000px) rotateX(${y * 0.1}deg) rotateY(${x * 0.1}deg)`;
        }
    });
}

// ===== Active Nav Link =====
function initActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link:not(.cta-link)');

    window.addEventListener('scroll', () => {
        let current = '';

        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href').slice(1) === current) {
                link.style.color = 'var(--primary-color)';
            }
        });
    });
}

// ===== Initialize All =====
document.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    initRevenueChart();
    initScrollAnimations();
    initParallaxEffect();
    initFormHandling();
    initMouseFollowEffect();
    initActiveNavLink();

    // Add initial scroll fade classes
    document.querySelectorAll('.about-card, .service-card, .client-type, .contact-subtitle, .contact-form').forEach(el => {
        el.classList.add('scroll-fade');
    });
});

// Handle visibility change to restart animations if needed
document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    // Reinitialize on tab focus
    initThreeScene();
});
