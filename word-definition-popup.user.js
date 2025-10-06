// ==UserScript==
// @name         Smart Word Definition Popup
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Automatically define selected words with adaptive theming
// @author       doniwicaksono
// @match        *://*/*
// @icon         https://img.icons8.com/?size=100&id=lAy38mU19x00&format=png&color=000000
// @grant        GM_xmlhttpRequest
// @connect      api.dictionaryapi.dev
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Inject IBM Plex Mono font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Inject minimal CSS
    const style = document.createElement('style');
    style.textContent = `
        #word-definition-popup {
            position: absolute;
            border-radius: 4px;
            padding: 12px 16px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 13px;
            line-height: 1.5;
            max-width: 320px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 999999;
            display: none;
            opacity: 0;
            transition: opacity 0.15s ease;
        }
        #word-definition-popup.show {
            display: block;
            opacity: 1;
        }
        #word-definition-popup .word-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
        }
        #word-definition-popup .word-phonetic {
            font-size: 11px;
            opacity: 0.7;
            margin-bottom: 8px;
        }
        #word-definition-popup .word-meaning {
            font-size: 12px;
            margin-bottom: 6px;
        }
        #word-definition-popup .word-pos {
            font-style: italic;
            opacity: 0.6;
            font-size: 11px;
            margin-right: 4px;
        }
        #word-definition-popup .word-definition {
            opacity: 0.9;
        }
        #word-definition-popup .loading {
            opacity: 0.7;
            font-size: 12px;
        }
        #word-definition-popup .error {
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);

    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'word-definition-popup';
    document.body.appendChild(popup);

    let debounceTimer = null;
    let currentWord = '';

    // Convert RGB to Hex
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Parse color string to RGB
    function parseColor(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computed = window.getComputedStyle(div).color;
        document.body.removeChild(div);

        const match = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        return null;
    }

    // Calculate luminance
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    // Get text color from selected element
    function getTextColor(element) {
        let el = element;
        let depth = 0;
        const maxDepth = 10;

        while (el && depth < maxDepth) {
            const textColor = window.getComputedStyle(el).color;

            if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
                return textColor;
            }

            el = el.parentElement;
            depth++;
        }

        return 'rgb(0, 0, 0)'; // Default fallback
    }

    // Smart background color detection
    function getSmartBackgroundColor(element) {
        let el = element;
        let depth = 0;
        const maxDepth = 10;

        while (el && depth < maxDepth) {
            const bgColor = window.getComputedStyle(el).backgroundColor;

            // Check if background is not transparent
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                const rgb = parseColor(bgColor);
                if (rgb) {
                    return rgbToHex(rgb.r, rgb.g, rgb.b);
                }
            }

            el = el.parentElement;
            depth++;
        }

        // Fallback to body or html background
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
            const rgb = parseColor(bodyBg);
            if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
        }

        // Default fallback
        return '#ffffff';
    }

    // Adjust color lightness for popup background
    function adjustColorForPopup(hexColor, isDark) {
        const rgb = parseColor(hexColor);
        if (!rgb) return hexColor;

        if (isDark) {
            // Lighten slightly for dark backgrounds
            return `rgb(${Math.min(rgb.r + 15, 255)}, ${Math.min(rgb.g + 15, 255)}, ${Math.min(rgb.b + 15, 255)})`;
        } else {
            // Slightly darken or keep same for light backgrounds
            return `rgb(${Math.max(rgb.r - 5, 0)}, ${Math.max(rgb.g - 5, 0)}, ${Math.max(rgb.b - 5, 0)})`;
        }
    }

    // Get contrasting border color
    function getBorderColor(bgColor, isDark) {
        const rgb = parseColor(bgColor);
        if (!rgb) return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

        return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    }

    // Apply theme to popup
    function applyTheme(element) {
        const bgColor = getSmartBackgroundColor(element);
        const textColor = getTextColor(element);
        const bgRgb = parseColor(bgColor);

        if (!bgRgb) return;

        const isDark = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b) < 0.5;
        const popupBg = adjustColorForPopup(bgColor, isDark);
        const borderColor = getBorderColor(popupBg, isDark);
        const shadowColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)';

        popup.style.background = popupBg;
        popup.style.color = textColor;
        popup.style.borderColor = borderColor;
        popup.style.border = `1px solid ${borderColor}`;
        popup.style.boxShadow = `0 4px 12px ${shadowColor}`;
    }

    // Position popup smartly relative to cursor and viewport
    function positionPopup(x, y) {
        const rect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x + 10;
        let top = y + 10;

        // Adjust horizontal position
        if (left + rect.width > viewportWidth - 20) {
            left = x - rect.width - 10;
        }
        if (left < 20) {
            left = 20;
        }

        // Adjust vertical position
        if (top + rect.height > viewportHeight - 20) {
            top = y - rect.height - 10;
        }
        if (top < 20) {
            top = 20;
        }

        popup.style.left = left + window.scrollX + 'px';
        popup.style.top = top + window.scrollY + 'px';
    }

    // Fetch definition from Free Dictionary API
    function fetchDefinition(word, x, y, targetElement) {
        popup.innerHTML = '<div class="loading">Loading...</div>';
        popup.classList.add('show');
        applyTheme(targetElement);
        positionPopup(x, y);

        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const data = JSON.parse(response.responseText);
                        displayDefinition(data, word);
                        positionPopup(x, y);
                    } catch (e) {
                        showError('Failed to parse definition');
                    }
                } else {
                    showError('No definition found');
                }
            },
            onerror: function() {
                showError('Network error');
            }
        });
    }

    // Display definition in popup
    function displayDefinition(data, word) {
        if (!data || data.length === 0) {
            showError('No definition found');
            return;
        }

        const entry = data[0];
        const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || '';

        let html = `<div class="word-title">${word}</div>`;

        if (phonetic) {
            html += `<div class="word-phonetic">${phonetic}</div>`;
        }

        // Get first 3 meanings
        const meanings = entry.meanings.slice(0, 3);
        meanings.forEach(meaning => {
            const def = meaning.definitions[0];
            html += `<div class="word-meaning">`;
            html += `<span class="word-pos">${meaning.partOfSpeech}</span>`;
            html += `<span class="word-definition">${def.definition}</span>`;
            html += `</div>`;
        });

        popup.innerHTML = html;
    }

    // Show error message
    function showError(message) {
        popup.innerHTML = `<div class="error">${message}</div>`;
    }

    // Hide popup
    function hidePopup() {
        popup.classList.remove('show');
        currentWord = '';
    }

    // Handle text selection
    document.addEventListener('mouseup', function(e) {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            // Check if text is selected and is a single word
            if (text && text.length > 1 && text.length < 30 && /^[a-zA-Z\-']+$/.test(text)) {
                const word = text.toLowerCase();

                // Only fetch if it's a different word
                if (word !== currentWord) {
                    currentWord = word;
                    fetchDefinition(word, e.clientX, e.clientY, e.target);
                }
            } else if (!text) {
                hidePopup();
            }
        }, 300);
    });

    // Hide popup when clicking outside
    document.addEventListener('mousedown', function(e) {
        if (!popup.contains(e.target)) {
            hidePopup();
        }
    });

    // Hide popup on scroll
    let scrollTimer = null;
    document.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (popup.classList.contains('show')) {
                hidePopup();
            }
        }, 100);
    }, true);

    // Hide popup on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('show')) {
            hidePopup();
        }
    });

})();
