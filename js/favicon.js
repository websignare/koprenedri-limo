/**
 * Dynamic Favicon Theme Handler
 * Synchronizes browser favicon with light/dark section scrolling.
 */
(function () {
    /*
     * Updates the favicon href based on theme state ('light' or 'dark')
     * @param {string} theme - 'light' or 'dark'
     */
    function setFaviconTheme(theme) {
        const dynamicFavicon = document.getElementById('dynamicFavicon');

        if (dynamicFavicon) {
            dynamicFavicon.href = theme === 'light' ? 'assets/logomark-black.svg' : 'assets/logomark-white.svg';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const siteHeader = document.querySelector('.site-header');
        const whiteSections = document.querySelectorAll('#routes, #fleet, #how-it-works, #faq');

        if (!siteHeader) return;

        // Listen to scroll events to update favicon according to active section theme
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

            if (isOverWhiteSection) {
                setFaviconTheme('light');
            } else {
                setFaviconTheme('dark');
            }
        });
    });
})();
