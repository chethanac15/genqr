/**
 * QR Code Generator - Main Application Logic
 * 
 * Features:
 * - Generate QR codes in PNG and SVG formats
 * - Customizable size, error correction, colors
 * - Optional center logo embedding
 * - Download and copy to clipboard functionality
 * - URL detection and preview
 */

/**
 * Load QRCode library with CDN + local fallbacks
 */
function loadQRCodeLibrary() {
    const remoteSources = [
        'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'
    ];
    const localSource = './vendor-qrcode.min.js';
    const sources = navigator.onLine ? [...remoteSources, localSource] : [localSource];
    
    function tryLoadSource(index) {
        if (index >= sources.length) {
            return Promise.reject(new Error('All QR code library sources failed to load (including local fallback).'));
        }
        
        const source = sources[index];
        const script = document.createElement('script');
        script.src = source;
        script.async = true;
        
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            let isResolved = false;
            
            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
            };
            
            const resolveOnce = () => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    resolve();
                }
            };
            
            const rejectOnce = (error) => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    reject(error);
                }
            };
            
            script.onload = () => {
                const checkInterval = setInterval(() => {
                    if (typeof window.qrcode !== 'undefined') {
                        clearInterval(checkInterval);
                        console.info(`QRCode library loaded from: ${source}`);
                        resolveOnce();
                    }
                }, 50);
                
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (typeof window.qrcode === 'undefined' && !isResolved) {
                        script.remove();
                        tryLoadSource(index + 1).then(resolveOnce).catch(rejectOnce);
                    }
                }, 2000);
            };
            
            script.onerror = () => {
                console.warn(`Failed to load QRCode library from ${source}, trying next source...`);
                script.remove();
                tryLoadSource(index + 1).then(resolveOnce).catch(rejectOnce);
            };
            
            timeoutId = setTimeout(() => {
                if (typeof window.qrcode === 'undefined' && !isResolved) {
                    script.remove();
                    script.onerror();
                }
            }, 5000);
            
            document.head.appendChild(script);
        });
    }
    
    return tryLoadSource(0);
}

// DOM Elements
const qrForm = document.getElementById('qr-form');
const qrInput = document.getElementById('qr-input');
const qrSize = document.getElementById('qr-size');
const errorCorrection = document.getElementById('error-correction');
const qrFormat = document.getElementById('qr-format');
const foregroundColor = document.getElementById('foreground-color');
const foregroundColorText = document.getElementById('foreground-color-text');
const backgroundColor = document.getElementById('background-color');
const backgroundColorText = document.getElementById('background-color-text');
const logoUpload = document.getElementById('logo-upload');
const logoRemove = document.getElementById('logo-remove');
const logoFilename = document.getElementById('logo-filename');
const generateBtn = document.getElementById('generate-btn');
const previewSection = document.getElementById('preview-section');
const loadingIndicator = document.getElementById('loading-indicator');
const qrPreview = document.getElementById('qr-preview');
const downloadBtn = document.getElementById('download-btn');
const copyClipboardBtn = document.getElementById('copy-clipboard-btn');
const urlPreview = document.getElementById('url-preview');
const urlHostname = document.getElementById('url-hostname');
const shortlinkToggleWrapper = document.getElementById('shortlink-toggle-wrapper');
const shortlinkToggle = document.getElementById('shortlink-toggle');

// State
let uploadedLogo = null;
let generatedQRData = null; // Stores the generated QR data (canvas or SVG string)
window.__qrReady = false;

/**
 * URL validation regex
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

/**
 * Initialize event listeners
 */
function init() {
    // Input validation
    qrInput.addEventListener('input', handleInputChange);
    qrInput.addEventListener('paste', () => setTimeout(handleInputChange, 10));
    
    // Form submission
    qrForm.addEventListener('submit', handleGenerate);
    
    // Color picker sync
    foregroundColor.addEventListener('input', () => {
        foregroundColorText.value = foregroundColor.value;
        if (generatedQRData) handleGenerate(new Event('submit'));
    });
    foregroundColorText.addEventListener('input', () => {
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(foregroundColorText.value)) {
            foregroundColor.value = normalizeHexColor(foregroundColorText.value);
            if (generatedQRData) handleGenerate(new Event('submit'));
        }
    });
    
    backgroundColor.addEventListener('input', () => {
        backgroundColorText.value = backgroundColor.value;
        if (generatedQRData) handleGenerate(new Event('submit'));
    });
    backgroundColorText.addEventListener('input', () => {
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(backgroundColorText.value)) {
            backgroundColor.value = normalizeHexColor(backgroundColorText.value);
            if (generatedQRData) handleGenerate(new Event('submit'));
        }
    });
    
    // Logo upload
    logoUpload.addEventListener('change', handleLogoUpload);
    logoRemove.addEventListener('click', handleLogoRemove);
    
    // Download and copy
    downloadBtn.addEventListener('click', handleDownload);
    copyClipboardBtn.addEventListener('click', handleCopyClipboard);
    
    // Format change triggers regeneration if QR already generated
    qrFormat.addEventListener('change', () => {
        if (generatedQRData) handleGenerate(new Event('submit'));
    });

    // Ensure initial button state reflects any pre-filled value
    handleInputChange();
}

/**
 * Normalize hex color to 6-digit format
 */
function normalizeHexColor(color) {
    if (color.length === 4) {
        // Convert #RGB to #RRGGBB
        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color;
}

/**
 * Handle input changes - validate and show URL preview
 */
function handleInputChange() {
    const value = qrInput.value.trim();
    const isValid = value.length > 0;
    
    // Enable/disable generate button
    generateBtn.disabled = !isValid;
    
    // Check if input is a URL
    if (isValid && URL_REGEX.test(value)) {
        try {
            const url = new URL(value.startsWith('http') ? value : `https://${value}`);
            urlHostname.textContent = url.hostname;
            urlPreview.hidden = false;
            
            // Show shortlink toggle (UI-only for MVP)
            // OPTIONAL: Uncomment to enable shortlink functionality
            // shortlinkToggleWrapper.hidden = false;
        } catch (e) {
            urlPreview.hidden = true;
        }
    } else {
        urlPreview.hidden = true;
    }
}

/**
 * Handle logo upload
 */
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        showStatus('Please upload a PNG or JPEG image.', 'error');
        logoUpload.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showStatus('Logo file must be smaller than 2MB.', 'error');
        logoUpload.value = '';
        return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedLogo = {
            dataUrl: e.target.result,
            file: file
        };
        logoFilename.textContent = file.name;
        logoFilename.hidden = false;
        logoRemove.hidden = false;
    };
    reader.onerror = () => {
        showStatus('Error reading logo file.', 'error');
        logoUpload.value = '';
    };
    reader.readAsDataURL(file);
}

/**
 * Handle logo removal
 */
function handleLogoRemove() {
    uploadedLogo = null;
    logoUpload.value = '';
    logoFilename.hidden = true;
    logoRemove.hidden = true;
    if (generatedQRData) {
        handleGenerate(new Event('submit'));
    }
}

/**
 * Generate QR code
 */
async function handleGenerate(event) {
    event.preventDefault();
    
    const inputValue = qrInput.value.trim();
    if (!inputValue) {
        showStatus('Please enter a URL or text.', 'error');
        return;
    }
    
    // Determine target URL (handle shortlink toggle if implemented)
    let targetUrl = inputValue;
    if (shortlinkToggle && shortlinkToggle.checked && URL_REGEX.test(inputValue)) {
        // OPTIONAL: Generate shortlink via serverless function
        // targetUrl = await generateShortLink(inputValue);
        // For MVP, we'll skip this and use the original URL
    }
    
    // Show loading state
    previewSection.hidden = false;
    loadingIndicator.hidden = false;
    qrPreview.innerHTML = '';
    downloadBtn.disabled = true;
    copyClipboardBtn.disabled = true;
    
    try {
        // Get options
        const size = parseInt(qrSize.value, 10);
        const errorCorrectionLevel = errorCorrection.value;
        const format = qrFormat.value;
        const fgColor = normalizeHexColor(foregroundColor.value);
        const bgColor = normalizeHexColor(backgroundColor.value);
        
        // Generate QR code
        if (format === 'svg') {
            await generateQRCodeSVG(targetUrl, size, errorCorrectionLevel, fgColor, bgColor);
        } else {
            await generateQRCodePNG(targetUrl, size, errorCorrectionLevel, fgColor, bgColor);
        }
        
        // Hide loading, show preview
        loadingIndicator.hidden = true;
        downloadBtn.disabled = false;
        copyClipboardBtn.disabled = false;
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showStatus('Failed to generate QR code. Please try again.', 'error');
        loadingIndicator.hidden = true;
    }
}

/**
 * Generate QR code as PNG (canvas-based)
 */
async function generateQRCodePNG(text, size, errorCorrectionLevel, fgColor, bgColor) {
    return new Promise(async (resolve, reject) => {
        try {
            const qr = createQRCodeMatrix(text, errorCorrectionLevel);
            const canvas = renderQRCodeCanvas(qr, size, fgColor, bgColor);
            
            if (uploadedLogo) {
                try {
                    await embedLogoInCanvas(canvas, uploadedLogo.dataUrl);
                } catch (logoError) {
                    console.warn('Failed to embed logo:', logoError);
                }
            }
            
            qrPreview.innerHTML = '';
            qrPreview.appendChild(canvas);
            generatedQRData = { type: 'png', canvas, text };
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate QR code as SVG
 */
async function generateQRCodeSVG(text, size, errorCorrectionLevel, fgColor, bgColor) {
    return new Promise(async (resolve, reject) => {
        try {
            const qr = createQRCodeMatrix(text, errorCorrectionLevel);
            const svgString = renderQRCodeSVG(qr, size, fgColor, bgColor);
            
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            
            if (uploadedLogo) {
                try {
                    await embedLogoInSVG(svgElement, uploadedLogo.dataUrl, size);
                } catch (logoError) {
                    console.warn('Failed to embed logo:', logoError);
                }
            }
            
            qrPreview.innerHTML = '';
            qrPreview.appendChild(svgElement);
            generatedQRData = { type: 'svg', element: svgElement, text, svgString: svgElement.outerHTML };
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Create QR matrix using qrcode-generator
 */
function createQRCodeMatrix(text, errorCorrectionLevel) {
    if (typeof window.qrcode === 'undefined') {
        throw new Error('QR library is not available.');
    }
    const level = (errorCorrectionLevel || 'M').toUpperCase();
    const qr = window.qrcode(0, level); // typeNumber 0 = auto
    qr.addData(text);
    qr.make();
    return qr;
}

/**
 * Render QR matrix onto canvas
 */
function renderQRCodeCanvas(qr, size, fgColor, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    const moduleCount = qr.getModuleCount();
    const margin = Math.max(4, Math.floor(size * 0.05));
    const drawableSize = size - margin * 2;
    const moduleSize = drawableSize / moduleCount;
    ctx.fillStyle = fgColor;
    
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                const x = Math.round(margin + col * moduleSize);
                const y = Math.round(margin + row * moduleSize);
                const w = Math.ceil(margin + (col + 1) * moduleSize) - x;
                const h = Math.ceil(margin + (row + 1) * moduleSize) - y;
                ctx.fillRect(x, y, w, h);
            }
        }
    }
    return canvas;
}

/**
 * Render QR matrix into SVG markup
 */
function renderQRCodeSVG(qr, size, fgColor, bgColor) {
    const moduleCount = qr.getModuleCount();
    const margin = Math.max(4, Math.floor(size * 0.05));
    const drawableSize = size - margin * 2;
    const moduleSize = drawableSize / moduleCount;
    let rects = '';
    
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                const x = Math.round(margin + col * moduleSize);
                const y = Math.round(margin + row * moduleSize);
                const w = Math.ceil(margin + (col + 1) * moduleSize) - x;
                const h = Math.ceil(margin + (row + 1) * moduleSize) - y;
                rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fgColor}" />`;
            }
        }
    }
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Generated QR code">
            <rect width="100%" height="100%" fill="${bgColor}"></rect>
            ${rects}
        </svg>
    `.trim();
}

/**
 * Embed logo in canvas-based QR code
 */
async function embedLogoInCanvas(canvas, logoDataUrl) {
    return new Promise((resolve, reject) => {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const qrSize = canvas.width;
            const logoSize = Math.floor(qrSize * 0.2); // Logo is 20% of QR size
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            
            // Draw white background for logo
            const padding = Math.floor(logoSize * 0.1);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
                logoX - padding,
                logoY - padding,
                logoSize + padding * 2,
                logoSize + padding * 2
            );
            
            // Draw logo
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
            
            resolve();
        };
        
        img.onerror = reject;
        img.src = logoDataUrl;
    });
}

/**
 * Embed logo in SVG QR code
 */
async function embedLogoInSVG(svgElement, logoDataUrl, qrSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const logoSize = Math.floor(qrSize * 0.2); // Logo is 20% of QR size
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            const padding = Math.floor(logoSize * 0.1);
            
            // Create white background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', logoX - padding);
            bgRect.setAttribute('y', logoY - padding);
            bgRect.setAttribute('width', logoSize + padding * 2);
            bgRect.setAttribute('height', logoSize + padding * 2);
            bgRect.setAttribute('fill', '#FFFFFF');
            
            // Create image element for logo
            const logoImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            logoImg.setAttribute('href', logoDataUrl);
            logoImg.setAttribute('x', logoX);
            logoImg.setAttribute('y', logoY);
            logoImg.setAttribute('width', logoSize);
            logoImg.setAttribute('height', logoSize);
            
            // Append to SVG
            svgElement.appendChild(bgRect);
            svgElement.appendChild(logoImg);
            
            resolve();
        };
        
        img.onerror = reject;
        img.src = logoDataUrl;
    });
}

/**
 * Handle download
 */
async function handleDownload() {
    if (!generatedQRData) return;
    
    try {
        const format = qrFormat.value;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `qr-${timestamp}.${format}`;
        
        if (format === 'png') {
            // Convert canvas to blob and download
            generatedQRData.canvas.toBlob((blob) => {
                if (!blob) {
                    showStatus('Failed to generate PNG file.', 'error');
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showStatus('QR code downloaded successfully!', 'success');
            }, 'image/png');
        } else {
            // Download SVG
            const svgString = generatedQRData.svgString || generatedQRData.element.outerHTML;
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('QR code downloaded successfully!', 'success');
        }
    } catch (error) {
        console.error('Download error:', error);
        showStatus('Failed to download QR code.', 'error');
    }
}

/**
 * Handle copy to clipboard
 */
async function handleCopyClipboard() {
    if (!generatedQRData) return;
    
    try {
        const format = qrFormat.value;
        
        if (format === 'png') {
            // Copy PNG to clipboard
            generatedQRData.canvas.toBlob(async (blob) => {
                if (!blob) {
                    showStatus('Failed to copy image to clipboard.', 'error');
                    return;
                }
                
                try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    showStatus('QR code copied to clipboard!', 'success');
                } catch (clipboardError) {
                    // Fallback: copy as data URL
                    const dataUrl = generatedQRData.canvas.toDataURL('image/png');
                    await navigator.clipboard.writeText(dataUrl);
                    showStatus('QR code data URL copied to clipboard!', 'success');
                }
            }, 'image/png');
        } else {
            // Copy SVG markup to clipboard
            const svgString = generatedQRData.svgString || generatedQRData.element.outerHTML;
            await navigator.clipboard.writeText(svgString);
            showStatus('QR code SVG copied to clipboard!', 'success');
        }
    } catch (error) {
        console.error('Copy error:', error);
        showStatus('Failed to copy to clipboard. Please try downloading instead.', 'error');
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.hidden = false;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusEl.hidden = true;
    }, 3000);
}

/**
 * Show prominent error message for library load failure
 */
function showLibraryLoadError(errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:#fff;padding:1.5rem;text-align:center;z-index:10000;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
        <strong style="font-size:1.1rem;display:block;margin-bottom:0.5rem;">Failed to load QR code library</strong>
        <p style="margin:0.5rem 0;font-size:0.95rem;line-height:1.6;">
            ${errorMessage || 'Please check your internet connection and refresh the page.'}
        </p>
        <p style="margin:1rem 0 0 0;font-size:0.85rem;opacity:0.9;">
            <strong>Troubleshooting:</strong><br>
            • Check your internet connection<br>
            • Disable ad blockers or privacy extensions<br>
            • Try refreshing the page<br>
            • Check if CDN access is blocked by your network<br>
            • Local fallback: ensure <code>vendor-qrcode.min.js</code> is present
        </p>
    `;
    document.body.appendChild(errorDiv);
    
    // Also disable the form
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Library failed to load';
    }
    if (qrInput) {
        qrInput.disabled = true;
        qrInput.placeholder = 'Library loading failed. Please refresh the page.';
    }
}

/**
 * Initialize app when DOM is ready and QRCode library is loaded
 */
async function initializeApp() {
    // Wait for DOM
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // Show loading indicator
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Loading library...';
    }
    
    // Load QRCode library with fallback CDNs
    try {
        await loadQRCodeLibrary();
        if (generateBtn) {
            generateBtn.textContent = 'Generate QR Code';
        }
        init();
        window.__qrReady = true;
    } catch (error) {
        console.error('QRCode library failed to load:', error);
        showLibraryLoadError(error.message);
    }
}

initializeApp();

/**
 * OPTIONAL: Generate short link via serverless function
 * 
 * Uncomment and implement if you want to add shortlink functionality.
 * You'll need to create a serverless function endpoint (Netlify Function or Vercel API route).
 * 
 * Example implementation:
 * 
 * async function generateShortLink(targetUrl) {
 *     try {
 *         const response = await fetch('/.netlify/functions/shortlink', {
 *             method: 'POST',
 *             headers: { 'Content-Type': 'application/json' },
 *             body: JSON.stringify({ targetUrl })
 *         });
 *         const data = await response.json();
 *         return data.shortUrl;
 *     } catch (error) {
 *         console.error('Shortlink generation failed:', error);
 *         return targetUrl; // Fallback to original URL
 *     }
 * }
 * 
 * NOTE: For production, you'll need persistent storage (database, S3, etc.)
 * The example serverless function should not be used in production without
 * proper storage and security measures.
 */
