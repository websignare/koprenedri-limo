document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 0. ENSURE PAGE STARTS AT THE TOP ON RELOAD
    // ==========================================
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ==========================================
    // 1. MOBILE MENU TOGGLE LOGIC
    // ==========================================
    const menuOverlay = document.getElementById('menuOverlay');
    const menuCloseBtn = document.getElementById('menuClose');
    const menuToggleBtn = document.getElementById('menuToggle');
    
    // MOBILE MENU LINKS: SCROLL & CLOSE
    const menuLinks = document.querySelectorAll('.overlay-nav a, .menu-overlay-footer a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu(); // Closes menu and restores scrolling when a section link is clicked
        });
    });

    // Helper function to close the menu cleanly and restore scroll
    const closeMenu = () => {
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restores body scrolling
    };

    // Helper function to open the menu and lock scroll
    const openMenu = () => {
        if (menuOverlay) menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Locks body scrolling
    };

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openMenu);
    }

    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', closeMenu);
    }

    // ==========================================
    // 2. POPULAR ROUTES EXPANSION LOGIC (Multi-lang safe)
    // ==========================================
    const routesSection = document.getElementById('routes');
    const routesGrid = document.getElementById('routesGrid');
    const routesFooter = document.getElementById('routesFooter');
    const toggleRoutesBtn = document.getElementById('toggleRoutesBtn');
    const toggleBtnText = document.getElementById('toggleBtnText');

    if (routesGrid && routesFooter && toggleRoutesBtn) {
        const allCards = routesGrid.querySelectorAll('.route-card');

        // Rule: If there are 3 or fewer route cards, hide the button completely
        if (allCards.length <= 3) {
            routesFooter.style.display = 'none';
        } else {
            let isExpanded = false;

            toggleRoutesBtn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                routesSection.classList.toggle('expanded', isExpanded);

                // Determine active language from your active lang button or default to 'sr'
                const activeLangBtn = document.querySelector('.lang-btn.active');
                const currentLang = activeLangBtn ? activeLangBtn.getAttribute('data-lang') : 'sr';
                const langData = window.translations ? window.translations[currentLang] : null;

                if (isExpanded) {
                    toggleBtnText.setAttribute('data-key', 'show_less_routes');
                    if (langData && langData['show_less_routes']) {
                        toggleBtnText.textContent = langData['show_less_routes'];
                    } else {
                        toggleBtnText.textContent = currentLang === 'fr' ? 'Voir moins de routes' : currentLang === 'ru' ? 'Скрыть маршруты' : 'Prikaži manje ruta';
                    }
                    
                    // Smooth scroll footer into view with extra offset
                    setTimeout(() => {
                        const footerRect = routesFooter.getBoundingClientRect();
                        const extraSpace = window.innerWidth >= 1024 ? 80 : 40;
                        const targetPosition = window.pageYOffset + footerRect.top - window.innerHeight + footerRect.height + extraSpace;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }, 200);
                } else {
                    toggleBtnText.setAttribute('data-key', 'view_all_routes');
                    if (langData && langData['view_all_routes']) {
                        toggleBtnText.textContent = langData['view_all_routes'];
                    } else {
                        toggleBtnText.textContent = currentLang === 'fr' ? 'Voir toutes les routes' : currentLang === 'ru' ? 'Посмотреть все маршруты' : 'Prikaži sve rute';
                    }
                    
                    routesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

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

    const revealElements = document.querySelectorAll(
        '.section-header, .route-card, .fleet-card, .step-card, .faq-item, .booking-form-box, .intro-text-content, .footer-cta-banner'
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


