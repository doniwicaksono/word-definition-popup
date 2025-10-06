# 📖 Smart Word Definition Popup

A lightweight userscript that automatically displays word definitions when you select text on any webpage. Features adaptive theming that intelligently matches your website's color scheme.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🎯 Instant Definitions** - Select any word to instantly see its definition
- **🎨 Adaptive Theming** - Automatically matches the website's background and text colors
- **🪶 Lightweight** - Minimal performance impact with optimized code
- **🎭 Smart Positioning** - Popup intelligently adjusts based on viewport boundaries
- **⌨️ IBM Plex Mono** - Clean, professional monospace typography
- **🔇 No Close Button** - Minimal UI that auto-hides when needed
- **🌐 Works Everywhere** - Compatible with all websites
- **🆓 Free API** - Uses Free Dictionary API (no API key required)

## 🚀 Installation

### Prerequisites
You need a userscript manager extension installed in your browser:

- **Chrome/Edge/Brave**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Violentmonkey](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdaq)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- **Safari**: [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)

### Steps

1. **Install a userscript manager** (see links above)
2. **Click here to install**: [word-definition-popup.user.js](https://github.com/doniwicaksono/word-definition-popup/raw/refs/heads/main/word-definition-popup.user.js)
3. **Confirm installation** in the userscript manager popup
4. **Done!** Start selecting words on any webpage

## 📖 Usage

1. **Select any word** on any webpage
2. **Wait 300ms** (debounce delay)
3. **See the definition** appear near your cursor

### Supported Word Types
- Single English words (1-30 characters)
- Words with hyphens (e.g., "self-aware")
- Words with apostrophes (e.g., "don't")

### Hiding the Popup
The popup automatically hides when you:
- Click anywhere outside the popup
- Start scrolling
- Press the **ESC** key
- Select new text

## 🎨 Adaptive Theming

The popup intelligently adapts to your website's design:

### Background Color Detection
- Traverses DOM tree to find first non-transparent background
- Falls back to body/html background if needed
- Slightly adjusts color for better popup visibility

### Text Color Adaptation
- Uses the same text color from the selected text
- Inherits the website's typography colors
- Ensures perfect readability across all themes

### Smart Positioning
- Appears near your cursor
- Auto-adjusts when near viewport edges
- Never clips off-screen

## 🛠️ Configuration

The script works out-of-the-box, but you can customize it by editing these values:

```javascript
// Debounce delay (ms)
debounceTimer = setTimeout(() => {}, 300); // Change 300 to your preference

// Max word length
text.length < 30 // Change 30 to allow longer words

// Popup max width
max-width: 320px; // Edit in CSS

// Number of definitions shown
const meanings = entry.meanings.slice(0, 3); // Change 3 to show more/less
```

## 🔧 Technical Details

### API
Uses the [Free Dictionary API](https://dictionaryapi.dev/) for word definitions:
- **Endpoint**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **No authentication required**
- **No rate limiting** (reasonable usage)

### Color Detection Algorithm
1. Parse element's computed background and text colors
2. Calculate luminance using WCAG formula
3. Determine if background is dark or light
4. Adjust popup colors accordingly

### Performance Optimizations
- **Debouncing**: 300ms delay prevents excessive API calls
- **Caching**: Same word won't trigger new API call
- **Minimal DOM**: Single popup element reused
- **Event delegation**: Efficient event handling
- **Lazy loading**: Font loaded asynchronously

## 🐛 Troubleshooting

### Popup not appearing?
- Ensure the word is 2-30 characters long
- Check that it contains only English letters, hyphens, or apostrophes
- Verify userscript manager is enabled

### Wrong colors?
- The script inherits colors from the webpage
- Some websites use complex color schemes
- Try selecting text from different page elements

### Definition not found?
- Not all words are in the dictionary
- Try singular form (e.g., "book" instead of "books")
- Slang and very new words may not be available

### Popup position issues?
- Clear browser cache and reload
- Check browser zoom level (100% recommended)
- Report edge cases as GitHub issues

## 📝 Changelog

### v1.2.0 (2025-10-06)
- ✨ Added adaptive text color matching selected text
- 🎨 Improved theme detection algorithm
- 🔧 Added userscript icon
- 📚 Created comprehensive README

### v1.1.0 (2025-10-06)
- ❌ Removed close button for minimal UI
- 🎨 Implemented auto-theme based on background color
- 🔍 Smart color detection from DOM tree

### v1.0.0 (2025-10-06)
- 🎉 Initial release
- ⚡ Core functionality with IBM Plex Mono font
- 📱 Smart viewport positioning

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Clone the repo
git clone https://github.com/doniwicaksono/word-definition-popup.git

# Edit the .user.js file
# Test in your browser with userscript manager
```

## 📄 License

This project is licensed under the MIT License - see below:

```
MIT License

Copyright (c) 2025 doniwicaksono

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- [Free Dictionary API](https://dictionaryapi.dev/) for providing the word definitions
- [IBM Plex](https://www.ibm.com/plex/) for the beautiful monospace font
- [Icons8](https://icons8.com/) for the userscript icon

---

<p align="center">Made with ❤️ for better reading experience</p>
