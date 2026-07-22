class ImageViewer {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.viewer = null;
        this.init();
    }

    init() {
        // Create viewer HTML
        this.createViewer();
        
        // Find all images and make them clickable
        this.findImages();
        
        // Add event listeners
        this.addEventListeners();
    }

    createViewer() {
        const viewerHTML = `
            <div class="image-viewer" id="image-viewer" role="dialog" aria-modal="true" aria-label="Image viewer" aria-hidden="true">
                <button class="close-btn" id="close-viewer" aria-label="Close image viewer">
                    <span aria-hidden="true">×</span>
                </button>
                <button class="nav-btn prev-btn" id="prev-image" aria-label="Previous image">
                    <span aria-hidden="true">‹</span>
                </button>
                <button class="nav-btn next-btn" id="next-image" aria-label="Next image">
                    <span aria-hidden="true">›</span>
                </button>
                <div class="image-counter" id="image-counter"></div>
                <img id="viewer-image" src="" alt="">
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', viewerHTML);
        this.viewer = document.getElementById('image-viewer');
    }

    findImages() {
        // Clear existing images array
        this.images = [];
        
        // Find all images in the content area
        const contentImages = document.querySelectorAll('main img, article img');
        
        let processedIndex = 0; // Use separate counter for processed images
        
        contentImages.forEach((img) => {
            if (img.hasAttribute('data-no-viewer')) return;
            // Skip only actual icons/favicons, not small images
            if (img.src.includes('favicon') ||
                img.src.includes('icon') ||
                img.src.includes('logo')) {
                return;
            }

            // Add clickable class and store image data
            img.classList.add('clickable-image');
            img.dataset.imageIndex = processedIndex; // Use processed index, not original index
            this.images.push({
                src: img.src,
                alt: img.alt || 'Image',
                element: img
            });
            
            processedIndex++;
        });
        
        // Add single delegated event listener to handle all image clicks
        this.setupImageClickHandler();
    }

    setupImageClickHandler() {
        // Remove any existing delegated listener
        if (this.boundClickHandler) {
            document.removeEventListener('click', this.boundClickHandler);
        }
        
        // Create bound handler for delegation
        this.boundClickHandler = this.handleDelegatedClick.bind(this);
        document.addEventListener('click', this.boundClickHandler, true); // Use capture phase
    }

    handleDelegatedClick(e) {
        // Case 1: Direct click on any image with responsive-img class
        if (e.target.tagName === 'IMG' && e.target.classList.contains('responsive-img')) {
            const imgSrc = e.target.src;
            const imageIndex = this.images.findIndex(img => img.src === imgSrc);
            
            if (imageIndex !== -1) {
                e.preventDefault();
                e.stopPropagation();
                this.openViewer(imageIndex);
                return;
            }
        }
        
        // Case 2: Click on anchor tag that contains an image
        if (e.target.tagName === 'A') {
            const img = e.target.querySelector('img');
            if (img && img.classList.contains('responsive-img')) {
                const imgSrc = img.src;
                const imageIndex = this.images.findIndex(img => img.src === imgSrc);
                
                if (imageIndex !== -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openViewer(imageIndex);
                    return;
                }
            }
        }
        
        // Case 3: Click on any element that has a clickable-image class
        const clickedImg = e.target.closest('.clickable-image');
        if (clickedImg && clickedImg.dataset.imageIndex !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(clickedImg.dataset.imageIndex);
            this.openViewer(index);
            return;
        }
        
        // Case 4: Click on anchor that contains clickable-image
        const clickedAnchor = e.target.closest('a');
        if (clickedAnchor && clickedAnchor.querySelector('.clickable-image')) {
            const img = clickedAnchor.querySelector('.clickable-image');
            if (img && img.dataset.imageIndex !== undefined) {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(img.dataset.imageIndex);
                this.openViewer(index);
                return;
            }
        }
        
        // Case 5: Ultimate fallback - any image click
        if (e.target.tagName === 'IMG') {
            const imgSrc = e.target.src;
            const imageIndex = this.images.findIndex(img => img.src === imgSrc);
            
            if (imageIndex !== -1) {
                e.preventDefault();
                e.stopPropagation();
                this.openViewer(imageIndex);
                return;
            }
        }
    }

    addEventListeners() {
        // Close button
        document.getElementById('close-viewer').addEventListener('click', () => {
            this.closeViewer();
        });

        // Navigation buttons
        document.getElementById('prev-image').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPrevious();
        });

        document.getElementById('next-image').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showNext();
        });

        // Close on background click
        this.viewer.addEventListener('click', (e) => {
            if (e.target === this.viewer) {
                this.closeViewer();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.viewer.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    this.closeViewer();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
                    this.showNext();
                    break;
                case 'Tab': {
                    const controls = [...this.viewer.querySelectorAll('button:not([hidden])')];
                    const first = controls[0];
                    const last = controls[controls.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                    break;
                }
            }
        });
    }

    openViewer(index) {
        this.previouslyFocused = document.activeElement;
        this.currentIndex = index;
        this.updateImage();
        this.viewer.classList.add('active');
        this.viewer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('viewer-open');
        document.getElementById('close-viewer').focus();
    }

    closeViewer() {
        this.viewer.classList.remove('active');
        this.viewer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('viewer-open');
        this.previouslyFocused?.focus();
    }

    showPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    showNext() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const image = this.images[this.currentIndex];
        const viewerImage = document.getElementById('viewer-image');
        const counter = document.getElementById('image-counter');

        viewerImage.src = image.src;
        viewerImage.alt = image.alt;
        counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        // Update navigation button visibility
        const prevBtn = document.getElementById('prev-image');
        const nextBtn = document.getElementById('next-image');
        
        const hasMultipleImages = this.images.length > 1;
        prevBtn.hidden = !hasMultipleImages;
        nextBtn.hidden = !hasMultipleImages;
        counter.hidden = !hasMultipleImages;
    }
}

// Initialize image viewer when DOM is loaded
let imageViewer;

document.addEventListener('DOMContentLoaded', () => {
    imageViewer = new ImageViewer();
});

// Export for potential use in other scripts
window.ImageViewer = ImageViewer;
