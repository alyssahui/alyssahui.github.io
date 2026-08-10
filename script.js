document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth Infinite Carousel Logic ---
    const track = document.getElementById('projectTrack');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (track && scrollLeftBtn && scrollRightBtn && !isMobile) {

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

    // --- Mobile: simple scroll handlers for touch devices ---
    const viewport = document.querySelector('.carousel-viewport');

    if (isMobile && viewport && scrollLeftBtn && scrollRightBtn) {
        const getMobileStep = () => {
            const card = track ? track.querySelector('.project-card') : null;
            if (card) {
                const gap = parseFloat(window.getComputedStyle(track).gap || '0');
                return card.offsetWidth + gap;
            }
            return Math.round(viewport.offsetWidth * 0.7);
        };

        scrollLeftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const step = getMobileStep();
            viewport.scrollBy({ left: -step, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const step = getMobileStep();
            viewport.scrollBy({ left: step, behavior: 'smooth' });
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

    const setNoteContent = (element, text, linkHref, linkText) => {
        if (!element) {
            return;
        }

        element.textContent = '';

        if (text) {
            element.appendChild(document.createTextNode(text));
        }

        if (linkHref) {
            if (text) {
                element.appendChild(document.createTextNode(' '));
            }

            const link = document.createElement('a');
            link.href = linkHref;
            link.textContent = linkText || linkHref;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'modal-inline-link';
            element.appendChild(link);
        }
    };

    if (modal) {
        const projectTrack = document.getElementById('projectTrack');

        const openModal = (projectCard) => {
            if (projectCard) {
                const projectImage = projectCard.querySelector('img');
                const getField = (fieldName) => projectCard.getAttribute(fieldName) || '';

                const linkHref = getField('data-modal-link') || '#';

                if (modalImage && projectImage) {
                    modalImage.src = projectImage.src;
                    modalImage.alt = projectImage.alt || 'Project photo';
                    
                    // --- NEW: Make image clickable if a valid link exists ---
                    if (linkHref.startsWith('http')) {
                        modalImage.style.cursor = 'pointer';
                        modalImage.onclick = () => window.open(linkHref, '_blank');
                    } else {
                        modalImage.style.cursor = 'default';
                        modalImage.onclick = null;
                    }
                }

                if (modalTitle) {
                    modalTitle.textContent = getField('data-modal-title');
                }

                if (modalDates) {
                    modalDates.textContent = getField('data-modal-dates');
                }

                if (modalLink) {
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
                    setNoteContent(
                        modalNote1,
                        getField('data-modal-note-1'),
                        getField('data-modal-note-1-link-href'),
                        getField('data-modal-note-1-link-text')
                    );
                }

                if (modalNote2) {
                    setNoteContent(
                        modalNote2,
                        getField('data-modal-note-2'),
                        getField('data-modal-note-2-link-href'),
                        getField('data-modal-note-2-link-text')
                    );
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
    // --- Digital Project Diary Fetch Logic ---
    const diaryContainer = document.getElementById('diaryContainer');
    
    if (diaryContainer) {
        // Fetch the index.html file to scrape the project data
        fetch('index.html')
            .then(response => {
                if (!response.ok) throw new Error('Could not fetch projects');
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find all project cards in the fetched HTML
                const projectCards = doc.querySelectorAll('.project-card');
                
                if (projectCards.length === 0) {
                    diaryContainer.innerHTML = '<p class="loading-text">No projects found.</p>';
                    return;
                }

                // Clear the "Loading..." text
                diaryContainer.innerHTML = ''; 

                // Loop through each card, extract data, and build the review layout
                projectCards.forEach(card => {
                    const tags = (card.getAttribute('data-modal-tags') || '')
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean);
                    const title = card.getAttribute('data-modal-title') || 'Untitled';
                    const dates = card.getAttribute('data-modal-dates') || '';
                    const linkHref = card.getAttribute('data-modal-link') || '#';
                    const linkText = card.getAttribute('data-modal-link-text') || linkHref;
                    const type = card.getAttribute('data-modal-type') || '';
                    const role = card.getAttribute('data-modal-role') || '';
                    const accolade = card.getAttribute('data-modal-accolade') || '';
                    
                    const note1 = card.getAttribute('data-modal-note-1') || '';
                    const note1Href = card.getAttribute('data-modal-note-1-link-href') || '';
                    const note1Text = card.getAttribute('data-modal-note-1-link-text') || '';
                    
                    const note2 = card.getAttribute('data-modal-note-2') || '';
                    const note2Href = card.getAttribute('data-modal-note-2-link-href') || '';
                    const note2Text = card.getAttribute('data-modal-note-2-link-text') || '';

                    const img = card.querySelector('img');
                    const imgSrc = img ? img.getAttribute('src') : '';
                    const imgAlt = img ? img.getAttribute('alt') : title;

                    const entry = document.createElement('div');
                    entry.className = 'diary-entry';
                    entry.dataset.tags = tags.join(',');

                    const formatNote = (text, href, lText) => {
                        if (!text) return '';
                        if (href) {
                            return `<li>${text} <a href="${href}" target="_blank" rel="noopener noreferrer" class="modal-inline-link">${lText || href}</a></li>`;
                        }
                        return `<li>${text}</li>`;
                    };

                    const notesHTML = (note1 || note2) ? `
                        <ul class="diary-notes">
                            ${formatNote(note1, note1Href, note1Text)}
                            ${formatNote(note2, note2Href, note2Text)}
                        </ul>
                    ` : '';

                    // Determine if the project has a valid link for the image to use
                    const isClickable = linkHref.startsWith('http');
                    const imgHTML = isClickable 
                        ? `<img src="${imgSrc}" alt="${imgAlt}" style="cursor: pointer;" onclick="window.open('${linkHref}', '_blank')" class="clickable-diary-img">`
                        : `<img src="${imgSrc}" alt="${imgAlt}">`;

                    // Construct the HTML for this specific diary entry
                    entry.innerHTML = `
                        <div class="diary-img-container">
                            ${imgHTML}
                        </div>
                        <div class="diary-content">
                            <div class="diary-header">
                                <h3>${title}</h3>
                                <span class="diary-dates">${dates}</span>
                            </div>
                            <a href="${linkHref}" target="_blank" rel="noopener noreferrer" class="diary-link">${linkHref === '#' ? 'Project link coming soon' : linkText}</a>
                            <div class="diary-details">
                                ${type ? `<p>${type}</p>` : ''}
                                ${role ? `<p>${role}</p>` : ''}
                                ${accolade ? `<p>${accolade}</p>` : ''}
                            </div>
                            ${notesHTML}
                        </div>
                    `;

                    diaryContainer.appendChild(entry);
                });

                // --- Tag Filter Logic ---
                const tagFilterBar = document.getElementById('tagFilterBar');
                if (tagFilterBar) {
                    const tagPills = tagFilterBar.querySelectorAll('.tag-pill');
                    const allEntries = Array.from(diaryContainer.querySelectorAll('.diary-entry'));

                    tagPills.forEach(pill => {
                        pill.addEventListener('click', () => {
                            const selectedTag = pill.getAttribute('data-tag');

                            // Update active pill styling
                            tagPills.forEach(p => p.classList.remove('active'));
                            pill.classList.add('active');

                            // Show/hide entries based on selected tag
                            allEntries.forEach(entry => {
                                const entryTags = (entry.dataset.tags || '').split(',').filter(Boolean);
                                const shouldShow = selectedTag === 'all' || entryTags.includes(selectedTag);
                                entry.style.display = shouldShow ? '' : 'none';
                            });
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                diaryContainer.innerHTML = '<p class="loading-text">Sorry, there was an error loading the project diary.</p>';
            });
    }
    const substackContainer = document.getElementById('substack-feed');

if (substackContainer) {
    // Replace 'YOUR_SUBSTACK_NAME' with your actual substack username
    const substackUrl = 'https://alypy.substack.com/feed';
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackUrl)}`;

    fetch(rss2jsonUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                substackContainer.innerHTML = ''; // Clear loading text
                
                // Pull ALL articles for the archive
                const articles = data.items; 

                // --- NEW: Pastel Color Dictionary ---
                // Add your own Substack tags here (must be lowercase) and pick their hex colors!
                const pastelPalette = {
                    'philosophy': '#e3f2fd', /* Soft Blue */
                    'fiction': '#f3e5f5',    /* Soft Purple */
                    'design': '#e8f5e9',     /* Soft Green */
                    'technology': '#fff9c4', /* Soft Yellow */
                    'diary': '#fce4ec',      /* Soft Pink */
                    'poetry': '#ffe0b2'      /* Soft Peach */
                };
                
                // Backup pastels for tags you haven't manually mapped above
                const backupPastels = ['#fce4ec', '#e3f2fd', '#e8f5e9', '#fff9c4', '#f3e5f5', '#ffe0b2'];

                articles.forEach(article => {
                    const articleEl = document.createElement('div');
                    articleEl.className = 'substack-article';
                    
                    // --- NEW: Tag Logic ---
                    let bookColor = '#ffffff'; // Default to white if there are no tags at all
                    
                    // Check if the article has any tags attached from Substack
                    if (article.categories && article.categories.length > 0) {
                        const mainTag = article.categories[0].toLowerCase();
                        
                        if (pastelPalette[mainTag]) {
                            // If the tag matches our dictionary, use that color
                            bookColor = pastelPalette[mainTag];
                        } else {
                            // If the tag is unknown, assign a consistent backup pastel
                            // (Using the tag's string length ensures the same tag always gets the same color)
                            bookColor = backupPastels[mainTag.length % backupPastels.length];
                        }
                    }
                    
                    // Apply the color directly to the book cover background
                    articleEl.style.setProperty('--book-bg', bookColor);
                    
                    // Format the date
                    const pubDate = new Date(article.pubDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    });

                    articleEl.innerHTML = `
                        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="substack-link">
                            <h3 class="substack-title">${article.title}</h3>
                            <p class="substack-date">${pubDate}</p>
                        </a>
                    `;
                    substackContainer.appendChild(articleEl);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching Substack:', error);
            substackContainer.innerHTML = '<p class="loading-text">Could not load archive at this time.</p>';
        });
}
});