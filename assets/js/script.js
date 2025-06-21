// Shayri Collection Data
const shayriCollection = [
    "यह बात और है कोई भी दावा नहीं करते,\nहम उनसे दोस्ती करते हैं दिखावा नहीं\nकरते...!",
    
    "वो लोग जिंदगी को बहुत खुबसूरत बना\nजाते है, जो दोस्त बाहर रह कर सालों बाद\nघर आते हैं...!",
    
    "प्यार मोहब्बत हम भी करते हैं मगर अपने\nजिंदी यार से...!",
    
    "दोस्ती में कोई शर्त नहीं होती,\nबस एक सच्चा दिल होता है।",
    
    "जिंदगी में कुछ लोग इतने खास होते हैं,\nकि उनके बिना सब कुछ अधूरा लगता है।",
    
    "सच्चे दोस्त वो होते हैं जो आपकी\nखुशी में खुश और गम में गमगीन हो जाते हैं।",
    
    "मोहब्बत सिर्फ चेहरे से नहीं,\nदिल की सफाई से होती है।",
    
    "जो लोग हमारे साथ मुश्किल वक्त में खड़े रहते हैं,\nवही हमारे सच्चे साथी होते हैं।",
    
    "खुशियों का मतलब यह नहीं कि गम न हो,\nखुशियों का मतलब यह है कि गम को\nसहने की हिम्मत हो।",
    
    "जिंदगी में सबसे बड़ी खुशी यह है कि\nआपके पास कोई है जो आपको समझता है।"
];

// Current state
let currentShayriIndex = 0;
let isApiMode = false;

// DOM Elements
const shayriText = document.getElementById('shayri-text');
const copyBtn = document.getElementById('copy-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentShayriSpan = document.getElementById('current-shayri');
const totalShayriSpan = document.getElementById('total-shayri');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Social media buttons
const facebookBtn = document.getElementById('share-facebook');
const whatsappBtn = document.getElementById('share-whatsapp');
const twitterBtn = document.getElementById('share-twitter');
const telegramBtn = document.getElementById('share-telegram');

// Initialize the website
function init() {
    displayShayri();
    updateCounter();
    updateNavigationButtons();
    attachEventListeners();
}

// Display current shayri
function displayShayri() {
    const shayri = shayriCollection[currentShayriIndex];
    shayriText.innerHTML = shayri.replace(/\n/g, '<br>');
    shayriText.classList.add('fade-in');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        shayriText.classList.remove('fade-in');
    }, 500);
}

// Update counter display
function updateCounter() {
    currentShayriSpan.textContent = currentShayriIndex + 1;
    totalShayriSpan.textContent = isApiMode ? '∞' : shayriCollection.length;
}

// Update navigation buttons state
function updateNavigationButtons() {
    prevBtn.disabled = currentShayriIndex === 0 && !isApiMode;
    
    // Next button is always enabled in API mode
    if (isApiMode) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = currentShayriIndex === shayriCollection.length - 1;
    }
}

// Show toast notification
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.className = `toast ${isError ? 'error' : ''} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Copy shayri to clipboard
async function copyShayri() {
    try {
        const shayriTextContent = shayriCollection[currentShayriIndex];
        await navigator.clipboard.writeText(shayriTextContent);
        showToast('शायरी कॉपी हो गई!');
        
        // Add visual feedback
        copyBtn.innerHTML = '<i class="fas fa-check"></i><span>कॉपी हो गई!</span>';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>कॉपी करें</span>';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shayriCollection[currentShayriIndex];
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('शायरी कॉपी हो गई!');
    }
}

// Navigate to previous shayri
function previousShayri() {
    if (currentShayriIndex > 0) {
        currentShayriIndex--;
        displayShayri();
        updateCounter();
        updateNavigationButtons();
    }
}

// Navigate to next shayri
function nextShayri() {
    if (!isApiMode && currentShayriIndex < shayriCollection.length - 1) {
        currentShayriIndex++;
        displayShayri();
        updateCounter();
        updateNavigationButtons();
    } else if (!isApiMode && currentShayriIndex === shayriCollection.length - 1) {
        // Switch to API mode when reaching the end
        enableApiMode();
    } else if (isApiMode) {
        // Load new shayri from API
        loadShayriFromApi();
    }
}

// Enable API mode
function enableApiMode() {
    isApiMode = true;
    showToast('अब नई शायरियां API से लोड होंगी!');
    updateCounter();
    updateNavigationButtons();
    
    // Update next button text
    nextBtn.innerHTML = 'नई शायरी <i class="fas fa-download"></i>';
}

// Load shayri from API
async function loadShayriFromApi() {
    try {
        // Show loading state
        nextBtn.innerHTML = '<div class="loading"></div> लोड हो रही है...';
        nextBtn.disabled = true;
        
        // Try to fetch from multiple API sources
        let newShayri = null;
        
        // Option 1: Try Hindi Quotes API
        try {
            const response = await fetch('https://hindi-quotes-api.vercel.app/random');
            if (response.ok) {
                const data = await response.json();
                newShayri = data.quote || data.text || data.shayri;
            }
        } catch (error) {
            console.log('API 1 failed:', error);
        }
        
        // Option 2: Try another API or fallback
        if (!newShayri) {
            try {
                // Fallback to a different API or service
                const response = await fetch('https://api.quotegarden.com/api/v3/quotes/random');
                if (response.ok) {
                    const data = await response.json();
                    // Translate English quote to Hindi style (simplified)
                    newShayri = data.data?.quoteText || null;
                }
            } catch (error) {
                console.log('API 2 failed:', error);
            }
        }
        
        // Option 3: Use local API endpoint (if available)
        if (!newShayri) {
            try {
                const response = await fetch('/api/shayri/random');
                if (response.ok) {
                    const data = await response.json();
                    newShayri = data.shayri || data.text;
                }
            } catch (error) {
                console.log('Local API failed:', error);
            }
        }
        
        // Option 4: Fallback to predefined additional shayris
        if (!newShayri) {
            const additionalShayris = [
                "दिल की बात कहने के लिए\nशब्दों की जरूरत नहीं होती,\nआंखों का इशारा काफी होता है।",
                
                "वक्त के साथ सब कुछ बदल जाता है,\nबस यादों का सिलसिला बाकी रह जाता है।",
                
                "खुशी वो नहीं जो हमें मिल जाए,\nखुशी वो है जो हम बांट सकें।",
                
                "सच्चा प्यार वो है जो बिना शर्त के हो,\nजो सिर्फ देना जानता हो, लेना नहीं।",
                
                "जिंदगी एक सफर है सुहाना,\nयहां कल क्या हो किसने जाना।",
                
                "दोस्ती का मतलब यह नहीं कि हम साथ हैं,\nदोस्ती का मतलब यह है कि हम एक दूसरे के साथ हैं।",
                
                "मोहब्बत में सब कुछ जायज है,\nबस धोखा देना गुनाह है।",
                
                "हंसना सीखो जिंदगी से,\nक्योंकि जिंदगी भी हंसती है उन पर जो हंसते हैं।",
                
                "सपने वो नहीं जो हम सोते वक्त देखते हैं,\nसपने वो हैं जो हमें सोने नहीं देते।",
                
                "अच्छे लोगों की पहचान यह है कि\nवे बुरे वक्त में भी अच्छे रहते हैं।"
            ];
            
            const randomIndex = Math.floor(Math.random() * additionalShayris.length);
            newShayri = additionalShayris[randomIndex];
        }
        
        // Add new shayri to collection
        if (newShayri) {
            shayriCollection.push(newShayri);
            currentShayriIndex = shayriCollection.length - 1;
            
            displayShayri();
            updateCounter();
            showToast('नई शायरी लोड हो गई!');
        } else {
            throw new Error('No shayri available');
        }
        
    } catch (error) {
        console.error('Error loading shayri:', error);
        showToast('शायरी लोड करने में समस्या हुई! कृपया बाद में कोशिश करें।', true);
    } finally {
        // Restore button state
        nextBtn.innerHTML = 'नई शायरी <i class="fas fa-download"></i>';
        nextBtn.disabled = false;
    }
}

// Share on social media
function shareOnSocialMedia(platform) {
    const shayriTextContent = shayriCollection[currentShayriIndex];
    const encodedText = encodeURIComponent(shayriTextContent);
    const websiteUrl = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${websiteUrl}&quote=${encodedText}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedText}%0A%0A${websiteUrl}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${websiteUrl}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${websiteUrl}&text=${encodedText}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showToast(`${platform} पर शेयर किया गया!`);
    }
}

// Attach event listeners
function attachEventListeners() {
    // Copy button
    copyBtn.addEventListener('click', copyShayri);
    
    // Navigation buttons
    prevBtn.addEventListener('click', previousShayri);
    nextBtn.addEventListener('click', nextShayri);
    
    // Social media buttons
    facebookBtn.addEventListener('click', () => shareOnSocialMedia('facebook'));
    whatsappBtn.addEventListener('click', () => shareOnSocialMedia('whatsapp'));
    twitterBtn.addEventListener('click', () => shareOnSocialMedia('twitter'));
    telegramBtn.addEventListener('click', () => shareOnSocialMedia('telegram'));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                if (!prevBtn.disabled) previousShayri();
                break;
            case 'ArrowRight':
                if (!nextBtn.disabled) nextShayri();
                break;
            case 'c':
            case 'C':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    copyShayri();
                }
                break;
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    shayriText.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    shayriText.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && !nextBtn.disabled) {
                // Swipe left - next shayri
                nextShayri();
            } else if (diff < 0 && !prevBtn.disabled) {
                // Swipe right - previous shayri
                previousShayri();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some utility functions for better UX
function addShayriToCollection(newShayri) {
    shayriCollection.push(newShayri);
}

function getCurrentShayri() {
    return shayriCollection[currentShayriIndex];
}

function getTotalShayris() {
    return shayriCollection.length;
}

// Export functions for potential API integration
window.ShayriApp = {
    addShayriToCollection,
    getCurrentShayri,
    getTotalShayris,
    loadShayriFromApi
};

