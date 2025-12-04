# QR Code Generator
https://genqr-faucsfcnl-chethanac15s-projects.vercel.app/index.html

A production-ready, single-page QR code generator web application. Generate customizable QR codes instantly with no build step required. Fully client-side, privacy-friendly, and ready to deploy.

## Features

- ✨ **Instant QR Generation** - Generate QR codes for URLs or text in real-time
- 🎨 **Customizable Options**:
  - Size options: 128px, 256px, 512px, 1024px
  - Error correction levels: L, M, Q, H
  - Custom foreground and background colors
  - Format selection: PNG or SVG
  - Optional center logo embedding
- 📥 **Multiple Export Options**:
  - Download as PNG or SVG
  - Copy to clipboard (PNG binary or SVG markup)
- 🔗 **URL Detection** - Automatically detects URLs and shows preview
- ♿ **Accessible** - WCAG AA compliant, keyboard navigable, screen reader friendly
- 📱 **Responsive** - Works beautifully on desktop and mobile devices
- 🚀 **Zero Dependencies** - No build step, works with vanilla HTML/CSS/JS

## Project Structure

```
genqr/
├── landing.html          # Marketing/landing page entry point
├── landing.css           # Landing page styles
├── contact.html          # Contact page (email + form)
├── contact.css           # Contact page styles
├── index.html            # QR generator interface
├── styles.css            # Generator styles
├── main.js               # Generator logic
├── vendor-qrcode.min.js  # Local QR library fallback
└── README.md
```

### Pages

- `landing.html` — overview + CTA (links into the generator)
- `index.html` — full QR generator UI

## Color Palette

- `#FAF3E1` - Soft cream (background)
- `#F5E7C6` - Warm sand (card background)
- `#FF6D1F` - Accent orange (buttons, active states)
- `#222222` - Deep charcoal (text color)

## Quick Start

1. **Clone or download** this repository
2. Open `landing.html` for the landing page (or link it as your `/` route)
3. Click “Contact” for `contact.html` (email + form) or “Launch App” for `index.html`
4. That's it! No build step, no installation required.

The app uses the QRCode library from CDN (jsdelivr or unpkg as fallback). A pre-bundled local copy (`vendor-qrcode.min.js`) is also shipped, so even if every CDN request fails the generator still works offline.

## Deployment

### Deploy to Netlify

#### Option 1: Drag and Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the entire `genqr` folder
3. Your site will be live instantly!

#### Option 2: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/` (or leave default)
6. Click "Deploy site"

#### Option 3: Netlify CLI

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Navigate to project directory
cd genqr

# Deploy
netlify deploy --prod
```

### Deploy to Vercel

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to project directory
cd genqr

# Deploy
vercel --prod
```

#### Option 2: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: `./`
6. Click "Deploy"

### Deploy to GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main` or `master`)
4. Select `/ (root)` as the directory
5. Click "Save"
6. Your site will be available at `https://[username].github.io/[repository-name]`

## Testing Plan

### Manual Testing Checklist

#### Basic Functionality

- [ ] **Input Validation**
  - Enter a URL (e.g., `https://example.com`)
  - Verify URL preview appears with hostname
  - Enter plain text (e.g., `Hello World`)
  - Verify generate button enables/disables correctly
  - Test with empty input (button should be disabled)

- [ ] **QR Code Generation**
  - Generate QR code with default settings
  - Verify preview appears after generation
  - Scan generated QR code with phone to verify content
  - Test with URL
  - Test with plain text

#### Size Options

- [ ] Generate QR codes at each size:
  - 128px
  - 256px (default)
  - 512px
  - 1024px
  - Verify size changes correctly in preview

#### Error Correction Levels

- [ ] Test each error correction level:
  - L (Low)
  - M (Medium) - default
  - Q (Quartile)
  - H (High)
  - Generate QR codes and verify they scan correctly

#### Format Selection

- [ ] **PNG Format**
  - Generate QR code as PNG
  - Verify canvas element appears in preview
  - Download PNG file
  - Verify downloaded file opens correctly
  - Copy PNG to clipboard (if supported by browser)
  - Paste in image editor to verify

- [ ] **SVG Format**
  - Switch to SVG format
  - Generate QR code
  - Verify SVG element appears in preview
  - Download SVG file
  - Verify downloaded file opens correctly in browser/editor
  - Copy SVG to clipboard
  - Paste SVG markup in text editor to verify

#### Color Customization

- [ ] **Foreground Color**
  - Change foreground color using color picker
  - Change foreground color using hex input
  - Verify QR code regenerates with new color
  - Test with light colors (verify contrast)

- [ ] **Background Color**
  - Change background color using color picker
  - Change background color using hex input
  - Verify background changes in preview
  - Test with transparent-like colors

#### Logo Upload

- [ ] **Upload Logo**
  - Upload a small PNG logo (e.g., 64x64px)
  - Verify filename appears
  - Generate QR code
  - Verify logo appears centered in QR code
  - Test with JPEG format
  - Test with larger images (should still work)

- [ ] **Remove Logo**
  - Upload a logo
  - Click "Remove Logo"
  - Verify logo is removed
  - Generate QR code to verify logo is gone

- [ ] **Logo Validation**
  - Try uploading non-image file (should show error)
  - Try uploading file larger than 2MB (should show error)

#### Download Functionality

- [ ] **PNG Download**
  - Generate PNG QR code
  - Click Download button
  - Verify file downloads with correct name (`qr-[timestamp].png`)
  - Open downloaded file to verify it's valid

- [ ] **SVG Download**
  - Generate SVG QR code
  - Click Download button
  - Verify file downloads with correct name (`qr-[timestamp].svg`)
  - Open downloaded file to verify it's valid SVG

#### Copy to Clipboard

- [ ] **PNG Copy**
  - Generate PNG QR code
  - Click "Copy to Clipboard"
  - Verify success message appears
  - Paste in image editor to verify

- [ ] **SVG Copy**
  - Generate SVG QR code
  - Click "Copy to Clipboard"
  - Verify success message appears
  - Paste in text editor to verify SVG markup

#### Keyboard Navigation

- [ ] **Tab Navigation**
  - Press Tab to navigate through all interactive elements
  - Verify focus indicators appear (orange outline)
  - Verify all buttons are keyboard accessible

- [ ] **Form Submission**
  - Fill in input field
  - Press Enter to submit form
  - Verify QR code generates

- [ ] **Select Dropdowns**
  - Use keyboard to navigate dropdowns
  - Use arrow keys to select options
  - Press Enter to confirm selection

#### Accessibility

- [ ] **Screen Reader Testing**
  - Use screen reader (NVDA, JAWS, VoiceOver)
  - Navigate through the page
  - Verify all labels and ARIA attributes are announced correctly

- [ ] **Color Contrast**
  - Verify text meets WCAG AA contrast requirements
  - Test with different color combinations

- [ ] **Focus Indicators**
  - Verify all interactive elements have visible focus indicators
  - Test with keyboard navigation

#### Responsive Design

- [ ] **Mobile View**
  - Resize browser to mobile width (< 640px)
  - Verify layout adapts correctly
  - Test all functionality on mobile
  - Test on actual mobile device

- [ ] **Tablet View**
  - Test at tablet breakpoints
  - Verify layout is usable

#### Error Handling

- [ ] **CDN Failure**
  - Disconnect from internet
  - Reload page
  - Verify error message appears if QRCode library fails to load

- [ ] **Invalid Input**
  - Test edge cases (very long text, special characters)
  - Verify app handles gracefully

#### Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Optional Features (Not Implemented)

### Shortlink Functionality

The codebase includes UI elements for shortlink functionality, but it's not implemented. To add this:

1. **Create a Serverless Function**:

   **For Netlify** (`netlify/functions/shortlink.js`):
   ```javascript
   exports.handler = async (event) => {
     if (event.httpMethod !== 'POST') {
       return { statusCode: 405, body: 'Method Not Allowed' };
     }
     
     const { targetUrl } = JSON.parse(event.body);
     const shortId = generateShortId(); // Implement ID generation
     
     // TODO: Store mapping in database (not in-memory for production!)
     // const db = await connectToDatabase();
     // await db.save({ shortId, targetUrl });
     
     return {
       statusCode: 200,
       body: JSON.stringify({ 
         shortUrl: `${event.headers.host}/${shortId}` 
       })
     };
   };
   ```

   **For Vercel** (`api/shortlink.js`):
   ```javascript
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method Not Allowed' });
     }
     
     const { targetUrl } = req.body;
     const shortId = generateShortId();
     
     // TODO: Store in database
     
     res.status(200).json({ 
       shortUrl: `${req.headers.host}/${shortId}` 
     });
   }
   ```

2. **Uncomment the shortlink code** in `main.js` (see comments marked `OPTIONAL`)

3. **WARNING**: The example serverless functions above use in-memory storage which will not persist. For production:
   - Use a database (PostgreSQL, MongoDB, DynamoDB, etc.)
   - Implement proper error handling
   - Add rate limiting
   - Add authentication if needed
   - Implement redirect endpoint (`/api/redirect/[shortId]`)

### Image Storage Integration

To save generated QR codes to cloud storage (S3, Cloudinary, etc.):

1. **Create upload endpoint** in your serverless function
2. **Implement signed upload URLs** for security
3. **Update download functionality** to optionally save to cloud

Example S3 integration (serverless function):
```javascript
// Example: Netlify Function
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // Generate signed upload URL
  const params = {
    Bucket: 'your-bucket',
    Key: `qr-codes/${Date.now()}.png`,
    ContentType: 'image/png',
    Expires: 300 // 5 minutes
  };
  
  const uploadUrl = s3.getSignedUrl('putObject', params);
  return { statusCode: 200, body: JSON.stringify({ uploadUrl }) };
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is open source and available for personal and commercial use.

## Credits

- QR Code generation powered by [qrcode.js](https://github.com/soldair/node-qrcode)
- Color palette designed for accessibility and modern aesthetics

## Troubleshooting

### "Failed to load QR code library" Error

If you see this error message, it means the QR code library couldn't be loaded from the CDN. Here are steps to resolve:

1. **Check Internet Connection**
   - Ensure you have an active internet connection
   - The app requires internet access to load the QR code library from CDN

2. **CDN Blocking**
   - Some networks or firewalls block CDN access
   - Try using a different network (mobile hotspot, VPN, etc.)
   - The app automatically tries multiple CDN sources (jsdelivr, unpkg)

3. **Browser Extensions**
   - Disable ad blockers or privacy extensions temporarily
   - Some extensions block CDN requests

4. **Browser Console**
   - Open browser developer tools (F12)
   - Check the Console tab for specific error messages
   - Check the Network tab to see if CDN requests are failing

5. **Refresh the Page**
   - Sometimes a simple refresh resolves temporary network issues

6. **Use Local Copy (Advanced)**
   If CDNs are consistently blocked, you can use a local copy:
   
   ```bash
   # Download the library file
   curl -o qrcode.min.js https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
   ```
   
   Then update `main.js` to load from local file instead of CDN (modify the `cdnSources` array).

### Other Issues

- **QR Code Not Generating**: Ensure you've entered text/URL and clicked "Generate QR Code"
- **Download Not Working**: Check browser download permissions and popup blockers
- **Copy to Clipboard Failing**: Ensure your browser supports the Clipboard API (modern browsers)

## Support

For issues or questions, please open an issue on the repository or contact the maintainer.
