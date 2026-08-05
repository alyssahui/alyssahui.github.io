document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth Infinite Carousel Logic ---
    const track = document.getElementById('projectTrack');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const isPortraitMobile = window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (track && scrollLeftBtn && scrollRightBtn && !isPortraitMobile) {

        let isAnimating = false;
        const realCards = Array.from(track.children);
        const transition = 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)';
        const bufferCount = Math.min(3, realCards.length);
        let currentIndex = bufferCount;

        const getStepWidth = () => {
            const card = track.querySelector('.project-card');
            if (!card) return 0;
            const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0');
            return card.offsetWidth + gap;
        };

        const setTransform = (value, animate) => {
            track.style.transition = animate ? transition : 'none';
            track.style.transform = `translate3d(${value}px, 0, 0)`;
        };

        const setupClones = () => {
            if (!realCards.length) return;

            const beforeClones = realCards.slice(-bufferCount).map(card => {
                const clone = card.cloneNode(true);
                clone.dataset.clone = 'true';
                return clone;
            });

            const afterClones = realCards.slice(0, bufferCount).map(card => {
                const clone = card.cloneNode(true);
                clone.dataset.clone = 'true';
                return clone;
            });

            beforeClones.forEach(clone => {
                track.insertBefore(clone, realCards[0]);
            });

            afterClones.forEach(clone => {
                track.appendChild(clone);
            });
        };

        const snapToIndex = (index) => {
            const step = getStepWidth();
            if (!step) return;
            currentIndex = index;
            setTransform(-(step * currentIndex), false);
            track.getBoundingClientRect();
        };

        setupClones();
        requestAnimationFrame(() => snapToIndex(bufferCount));

        scrollRightBtn.addEventListener('click', () => {
            if (isAnimating) return;
            const step = getStepWidth();
            if (!step) return;

            isAnimating = true;
            currentIndex += 1;
            setTransform(-(step * currentIndex), true);

            track.addEventListener('transitionend', function handleNext(event) {
                if (event.propertyName !== 'transform') return;
                track.removeEventListener('transitionend', handleNext);

                if (currentIndex === realCards.length + bufferCount) {
                    snapToIndex(bufferCount);
                }

                isAnimating = false;
            });
        });

        scrollLeftBtn.addEventListener('click', () => {
            if (isAnimating) return;
            const step = getStepWidth();
            if (!step) return;

            isAnimating = true;
            currentIndex -= 1;
            setTransform(-(step * currentIndex), true);

            track.addEventListener('transitionend', function handlePrev(event) {
                if (event.propertyName !== 'transform') return;
                track.removeEventListener('transitionend', handlePrev);

                if (currentIndex === 0) {
                    snapToIndex(realCards.length);
                }

                isAnimating = false;
            });
        });
    }

    // --- Image Swapping Logic ---
    const smallImages = document.querySelectorAll('.img-placeholder.small');
    const largeImage = document.querySelector('.img-placeholder.large');

    if (largeImage && !isMobile) {
        smallImages.forEach(smallImg => {
            smallImg.addEventListener('click', () => {
                // Swap src and alt attributes
                const currentLargeSrc = largeImage.src;
                const currentLargeAlt = largeImage.alt;

                largeImage.src = smallImg.src;
                largeImage.alt = smallImg.alt;

                smallImg.src = currentLargeSrc;
                smallImg.alt = currentLargeAlt;
            });
        });
    }

    // --- Modal Logic ---
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeModal');
    const modalImage = document.getElementById('modalProjectImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDates = document.getElementById('modalDates');
    const modalLink = document.getElementById('modalLink');
    const modalType = document.getElementById('modalType');
    const modalRole = document.getElementById('modalRole');
    const modalAccolade = document.getElementById('modalAccolade');
    const modalNote1 = document.getElementById('modalNote1');
    const modalNote2 = document.getElementById('modalNote2');

    if (modal) {
        const projectTrack = document.getElementById('projectTrack');

        const openModal = (projectCard) => {
            if (projectCard) {
                const projectImage = projectCard.querySelector('img');
                const getField = (fieldName) => projectCard.getAttribute(fieldName) || '';

                if (modalImage && projectImage) {
                    modalImage.src = projectImage.src;
                    modalImage.alt = projectImage.alt || 'Project photo';
                }

                if (modalTitle) {
                    modalTitle.textContent = getField('data-modal-title');
                }

                if (modalDates) {
                    modalDates.textContent = getField('data-modal-dates');
                }

                if (modalLink) {
                    const linkHref = getField('data-modal-link') || '#';
                    const linkText = getField('data-modal-link-text') || linkHref;
                    modalLink.href = linkHref;
                    modalLink.textContent = linkHref === '#' ? 'Project link coming soon' : linkText;
                }

                if (modalType) {
                    modalType.textContent = getField('data-modal-type');
                }

                if (modalRole) {
                    modalRole.textContent = getField('data-modal-role');
                }

                if (modalAccolade) {
                    modalAccolade.textContent = getField('data-modal-accolade');
                }

                if (modalNote1) {
                    modalNote1.textContent = getField('data-modal-note-1');
                }

                if (modalNote2) {
                    modalNote2.textContent = getField('data-modal-note-2');
                }
            }

            modal.style.display = 'flex';
        };

        if (projectTrack) {
            projectTrack.addEventListener('click', (event) => {
                const projectCard = event.target.closest('.project-card');
                if (!projectCard || !projectTrack.contains(projectCard)) return;

                openModal(projectCard);
            });
        }

        // Close modal via 'X' button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close modal when clicking outside content box
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});