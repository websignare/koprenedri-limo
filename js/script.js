document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 0. ENSURE PAGE STARTS AT THE TOP ON RELOAD
    // ==========================================
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ==========================================
    // SANITY API CONFIGURATION & BUFFERS
    // ==========================================
    const SANITY_PROJECT_ID = 'b3mwp543';
    const DATASET = 'production';
    const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=`;

    // Global in-memory buffers to store raw fetched Sanity data
    let globalFleetData = [];
    let globalRoutesData = [];

    // Helper: Safely get current active language (defaults to 'sr')
    const getActiveLang = () => {
        return window.currentLang || 'sr';
    };

    // Helper: Safely trigger translation update from lang.js if available
    const refreshTranslations = (container) => {
        if (typeof window.applyTranslations === 'function') {
            window.applyTranslations(container);
        }
    };

    // Scroll reveal observer setup
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const observeDynamicCards = (container) => {
        if (!container) return;
        container.querySelectorAll('.route-card, .fleet-card').forEach(el => {
            el.classList.add('reveal-on-scroll');
            scrollObserver.observe(el);
        });
    };

    // ==========================================
    // 1. RENDER & FETCH FLEET VEHICLES
    // ==========================================
    const renderFleet = () => {
        const grid = document.getElementById('fleetGrid');
        if (!grid || !globalFleetData.length) return;

        const lang = getActiveLang();

        grid.innerHTML = globalFleetData.map(car => {
            // Pick language-specific field or fallback to Serbian/English/default
            const name = car[`name_${lang}`] || car.name_sr || car.name_en || car.name || '';
            const desc = car[`description_${lang}`] || car.description_sr || car.description_en || car.description || 'Wi-Fi • Klima';
            const pax = car[`passengerCapacity_${lang}`] || car.passengerCapacity_sr || car.passengerCapacity_en || car.passengerCapacity || '';
            const luggage = car[`luggageCapacity_${lang}`] || car.luggageCapacity_sr || car.luggageCapacity_en || car.luggageCapacity || '';

            return `
                <div class="fleet-card">
                    <div class="fleet-content">
                        <h3>${name}</h3>
                        <div class="vehicle-specs">
                            <div class="spec-item">
                                <img src="assets/user.svg" alt="Passengers" class="spec-icon">
                                <span>${pax}</span>
                            </div>
                            <div class="spec-item">
                                <img src="assets/bag.svg" alt="Luggage" class="spec-icon">
                                <span>${luggage}</span>
                            </div>
                        </div>
                        <div class="vehicle-features">${desc}</div>
                    </div>
                    <div class="fleet-img-wrapper">
                        ${car.imageUrl ? `<img src="${car.imageUrl}" alt="${name}">` : ''}
                    </div>
                </div>
            `;
        }).join('');

        refreshTranslations(grid);
        observeDynamicCards(grid);
    };

    const fetchFleet = async () => {
        const query = encodeURIComponent(`*[_type == "fleet"]{
            name, name_sr, name_en, name_ru, name_fr,
            passengerCapacity, passengerCapacity_sr, passengerCapacity_en, passengerCapacity_ru, passengerCapacity_fr,
            luggageCapacity, luggageCapacity_sr, luggageCapacity_en, luggageCapacity_ru, luggageCapacity_fr,
            description, description_sr, description_en, description_ru, description_fr,
            "imageUrl": image.asset->url
        }`);
        try {
            const res = await fetch(API_URL + query);
            const { result } = await res.json();

            if (result && result.length > 0) {
                globalFleetData = result;
                renderFleet();
            }
        } catch (err) {
            console.error("Error fetching fleet from Sanity:", err);
        }
    };

    // ==========================================
    // 2. RENDER & FETCH POPULAR ROUTES
    // ==========================================
    const renderRoutes = () => {
        const grid = document.getElementById('routesGrid');
        const routesSection = document.getElementById('routes');
        const routesFooter = document.getElementById('routesFooter');
        const toggleBtnText = document.getElementById('toggleBtnText');

        if (!grid || !globalRoutesData.length) return;

        const lang = getActiveLang();
        const langData = (window.translations && window.translations[lang]) ? window.translations[lang] : {};

        // Dynamic language strings from dictionary with fallback defaults
        const fromPrefixText = langData.route_from_prefix || 'Iz';
        const oneWayText = langData.route_oneway || '(u jednom pravcu)';
        const bookRouteText = langData.route_book || 'Rezerviši rutu';

        grid.innerHTML = globalRoutesData.map((route, index) => {
            // Select language-specific field or fallback to Serbian/English
            const destination = route[`destination_${lang}`] || route.destination_sr || route.destination_en || route.destination || '';
            const departure = route[`departure_${lang}`] || route.departure_sr || route.departure_en || route.departure || '';

            return `
                <div class="route-card ${index >= 3 ? 'extra-route' : ''}">
                    <div class="route-top">
                        <div class="route-info">
                            <h3>${destination}</h3>
                            <span class="route-from">
                                <span data-key="route_from_prefix">${fromPrefixText}</span> ${departure}
                            </span>
                            <div class="route-details-row">
                                <div class="route-price">
                                    € ${route.price} <span data-key="route_oneway">${oneWayText}</span>
                                </div>
                                <div class="route-time"><span class="clock-icon">⏱</span> ~ ${route.duration}</div>
                            </div>
                        </div>
                        <a href="#booking" class="route-arrow-btn mobile-arrow" aria-label="Book Route">
                            <img src="assets/arrow-yellow.svg" alt="Arrow" class="rotated-arrow">
                        </a>
                    </div>
                    <div class="route-bottom">
                        <a href="#booking" class="book-route-link" data-key="route_book">${bookRouteText}</a>
                        <a href="#booking" class="route-arrow-btn desktop-arrow" aria-label="Book Route">
                            <img src="assets/arrow-yellow.svg" alt="Arrow" class="rotated-arrow">
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Manage "View all routes" button visibility (> 3 cards) and multi-lang text
        if (routesFooter) {
            if (globalRoutesData.length <= 3) {
                routesFooter.style.display = 'none';
            } else {
                routesFooter.style.display = 'flex';
                const isExpanded = routesSection ? routesSection.classList.contains('expanded') : false;
                if (toggleBtnText) {
                    const key = isExpanded ? 'show_less_routes' : 'view_all_routes';
                    toggleBtnText.setAttribute('data-key', key);
                    toggleBtnText.textContent = langData[key] || (isExpanded ? 'Prikaži manje ruta' : 'Prikaži sve rute');
                }
            }
        }

        refreshTranslations(grid);
        observeDynamicCards(grid);
    };

    const fetchRoutes = async () => {
        const query = encodeURIComponent(`*[_type == "route"]{
            destination, destination_sr, destination_en, destination_ru, destination_fr,
            departure, departure_sr, departure_en, departure_ru, departure_fr,
            price, duration
        }`);
        try {
            const res = await fetch(API_URL + query);
            const { result } = await res.json();

            if (result && result.length > 0) {
                globalRoutesData = result;
                renderRoutes();
            }
        } catch (err) {
            console.error("Error fetching routes from Sanity:", err);
        }
    };

    // Expose global re-render function for lang.js to call when language buttons are clicked
    window.refreshDynamicContent = () => {
        renderFleet();
        renderRoutes();
    };

    // Execute initial fetch calls
    fetchFleet();
    fetchRoutes();
    
    // ==========================================
    // 3. WHATSAPP BOOKING FORM HANDLER & RELOAD RESET
    // ==========================================
    const bookingForm = document.getElementById('whatsappBookingForm');

    if (bookingForm) {
        // Automatically reset form fields on page load/reload
        bookingForm.reset();

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pickup = document.getElementById('pickup').value;
            const destination = document.getElementById('destination').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const passengers = document.getElementById('passengers').value;
            const luggage = document.getElementById('luggage').value;
            const flight = document.getElementById('flight').value || 'N/A';
            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;

            const message = 
                `*New Transfer Inquiry* %0a%0a` +
                `📍 *From:* ${pickup}%0a` +
                `🏁 *To:* ${destination}%0a` +
                `📅 *Date:* ${date}%0a` +
                `⏰ *Time:* ${time}%0a` +
                `👥 *Passengers:* ${passengers}%0a` +
                `🧳 *Luggage:* ${luggage}%0a` +
                `✈️ *Flight No:* ${flight}%0a` +
                `👤 *Name:* ${clientName}%0a` +
                `📞 *Phone:* ${clientPhone}`;

            const whatsappNumber = '381616545225';
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    
    // ==========================================
    // 4. FAQ ACCORDION & SCROLL-AWAY RESET LOGIC
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSection = document.getElementById('faq');

    const closeAllFaqs = () => {
        faqItems.forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.faq-icon');
            const btn = item.querySelector('.faq-question');
            if (icon) icon.textContent = '+';
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    };

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const icon = item.querySelector('.faq-icon');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            closeAllFaqs();

            if (!isActive) {
                item.classList.add('active');
                icon.textContent = '-';
                questionBtn.setAttribute('aria-expanded', 'true');

                requestAnimationFrame(() => {
                    faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        });
    });

    if (faqSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    closeAllFaqs();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(faqSection);
    }

    // ==========================================
    // 5. COPY PHONE NUMBER WITH FLOATING TOOLTIP
    // ==========================================
    const phoneLinks = document.querySelectorAll('.copy-phone');
    const copyTooltip = document.getElementById('copyTooltip');

    phoneLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const phoneNumber = link.getAttribute('data-phone') || link.textContent.trim();

            navigator.clipboard.writeText(phoneNumber).then(() => {
                if (copyTooltip) {
                    copyTooltip.classList.add('show');
                    setTimeout(() => {
                        copyTooltip.classList.remove('show');
                    }, 1500);
                }
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });

    // ==========================================
    // 6. LUXURY SCROLL REVEAL OBSERVER
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.section-header, .step-card, .faq-item, .booking-form-box, .intro-text-content, .footer-cta-banner'
    );
    
    revealElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        scrollObserver.observe(el);
    });

    // ==========================================
    // 7. NAV COLOR SWITCHING ON SCROLL
    // ==========================================
    const siteHeader = document.querySelector('.site-header');
    const logoImg = siteHeader ? siteHeader.querySelector('.logo-icon') : null;

    const whiteSections = document.querySelectorAll('#routes, #fleet, #how-it-works, #faq');

    if (siteHeader && logoImg) {
        window.addEventListener('scroll', () => {
            const headerRect = siteHeader.getBoundingClientRect();
            const headerBottom = headerRect.bottom;

            let isOverWhiteSection = false;

            whiteSections.forEach(section => {
                const secRect = section.getBoundingClientRect();
                if (headerBottom >= secRect.top && headerRect.top < secRect.bottom) {
                    isOverWhiteSection = true;
                }
            });

            if (window.scrollY > 50) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }

            if (isOverWhiteSection) {
                siteHeader.classList.add('light-theme');
                logoImg.src = 'assets/koprenedriLimo-black.svg';
            } else {
                siteHeader.classList.remove('light-theme');
                logoImg.src = 'assets/koprenedriLimo.svg';
            }
        });
    }

    // ==========================================
    // 8. SCROLL TO TOP BUTTON (FOOTER TRIGGER)
    // ==========================================
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const footerSection = document.getElementById('footer');

    if (scrollToTopBtn && footerSection) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.remove('show');
                }
            });
        }, {
            threshold: 0.1
        });

        footerObserver.observe(footerSection);

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
