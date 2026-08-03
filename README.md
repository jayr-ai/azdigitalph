# AZ Digital - Premium Portfolio Website

A stunning, interactive 3D landing page for AZ Digital analytics portfolio. Features smooth animations, interactive visualizations, and professional design.

## Features

- ✨ Smooth scroll animations with parallax effects
- 🎨 3D rotating data cube visualization (Three.js)
- 📊 Interactive revenue chart demo (Chart.js)
- 💼 Fully responsive design
- ⚡ Performance optimized
- 🎯 Conversion-focused CTA
- 📧 Email capture form (ready for MailerLite integration)

## Project Structure

```
azdigitalph/
├── index.html          # Main landing page
├── css/
│   └── style.css       # All styles and animations
├── js/
│   └── main.js         # Interactive features (3D, charts, forms)
├── assets/
│   ├── logo.png        # Add your logo here
│   ├── hero-bg.jpg     # Hero background
│   └── [1-4].jpg       # Brand mockup images
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages auto-deploy
```

## Quick Start

### Local Development

```bash
# Start local server
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

### Adding Your Brand Assets

1. Download your branding files from Google Drive
2. Place them in the `assets/` folder:
   - `logo.png` - Your logo (recommended: 200x50px)
   - `hero-bg.jpg` - Hero section background
   - `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg` - Brand mockup images

3. Update image references in `index.html` if needed

## GitHub Pages Deployment

### Initial Setup

```bash
# Initialize and push to GitHub
cd azdigitalph
git add .
git commit -m "Initial commit: AZ Digital portfolio"
git remote add origin https://github.com/jayr-ai/azdigitalph.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to your GitHub repo: https://github.com/jayr-ai/azdigitalph
2. Settings → Pages
3. Select "main" branch as source
4. Save

Your site will be live at: `https://jayr-ai.github.io/azdigitalph`

### Connect Custom Domain (azdigitalph.com)

1. In GitHub Pages settings, add "azdigitalph.com" as custom domain
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Add DNS records:
   - Type: A
   - Name: @
   - Value: 185.199.108.153
   - Also add: 185.199.109.153, 185.199.110.153, 185.199.111.153
4. Or add CNAME if using www:
   - Type: CNAME
   - Name: www
   - Value: jayr-ai.github.io

## Email Form Integration

The contact form currently stores submissions in browser's localStorage. To set up email notifications:

### Option 1: MailerLite (Recommended)
```javascript
// In js/main.js, replace email sending with:
// Get MailerLite API key from https://app.mailerlite.com/integrations/api
const mailerliteKey = 'YOUR_API_KEY';
// Send to your form
```

### Option 2: Formspree
1. Go to https://formspree.io
2. Create new form for azdigitalph.com
3. Replace form action in index.html:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Option 3: Sendgrid / Email Service
Update the contact form handler in `js/main.js`

## Customization

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #0066ff;      /* Blue */
    --secondary-color: #ff0055;    /* Pink */
    --accent-color: #00d9ff;       /* Cyan */
    --bg-dark: #0a0e27;           /* Dark background */
    /* ... */
}
```

### Text Content
Edit copy in `index.html` directly. All content is in HTML, easy to update.

### 3D Animation
The Three.js scene in `js/main.js` creates a rotating cube. To customize:
- Change cube size: `new THREE.BoxGeometry(3, 3, 3)` → adjust the numbers
- Change rotation speed: `cube.rotation.x += 0.003` → increase for faster spin
- Change colors: Modify the `canvas2d` gradient colors

## Performance Notes

- Uses CDN libraries (Three.js, Chart.js) - no build step needed
- Static HTML/CSS/JS - serves instantly
- Optimized animations - 60fps on all devices
- Lazy-loads visualizations on scroll

## Analytics & Tracking

Add Google Analytics, Hotjar, or similar by adding to `index.html` head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (responsive design)

## Troubleshooting

**3D cube not showing?**
- Check Three.js CDN is loading (check browser console)
- Ensure WebGL is supported in your browser

**Chart not displaying?**
- Verify Chart.js CDN is loaded
- Check console for any errors

**Forms not submitting?**
- Check browser console for errors
- Ensure email service is configured

## Next Steps

1. ✅ Add your logo and brand images to `assets/`
2. ✅ Push to GitHub and enable GitHub Pages
3. ✅ Connect azdigitalph.com domain
4. ✅ Set up email form integration
5. ✅ Add Google Analytics
6. ✅ Customize colors to match your brand

## Support

For issues or customizations, contact: jayveerespeto.ai@gmail.com

---

**Built with ❤️ by AZ Digital**
