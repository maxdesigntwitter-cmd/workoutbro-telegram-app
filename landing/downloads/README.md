# Downloads Folder

This folder contains files that users can download from your website.

## Current Setup:
- **English Version**: `Bigger-Arms-22-Day-Program-EN.pdf`
- **Russian Version**: `Bigger-Arms-22-Day-Program-RU.pdf`
- The correct file will be automatically downloaded based on user's language selection

## File Requirements:
- **English Filename**: `Bigger-Arms-22-Day-Program-EN.pdf` (exactly as specified)
- **Russian Filename**: `Bigger-Arms-22-Day-Program-RU.pdf` (exactly as specified)
- **Format**: PDF (recommended)
- **Size**: Keep under 10MB for better user experience

## Alternative Hosting Options:

### 1. Cloud Storage (Recommended for production):
- **Google Drive** - Get shareable link
- **Dropbox** - Get direct download link
- **AWS S3** - Professional hosting
- **Cloudinary** - Optimized for downloads

### 2. File Hosting Services:
- **GitHub Releases** - Free for public repos
- **MediaFire** - Simple file hosting
- **WeTransfer** - Temporary links

## To Update Download Links:
1. Change the filenames in `script.js` function `startDownload()`:
   ```javascript
   // For English version
   fileName = 'Bigger-Arms-22-Day-Program-EN.pdf';
   downloadPath = 'downloads/Bigger-Arms-22-Day-Program-EN.pdf';
   
   // For Russian version  
   fileName = 'Bigger-Arms-22-Day-Program-RU.pdf';
   downloadPath = 'downloads/Bigger-Arms-22-Day-Program-RU.pdf';
   ```

2. Or use external URLs:
   ```javascript
   // For English version
   downloadPath = 'https://your-cloud-storage.com/program-en.pdf';
   
   // For Russian version
   downloadPath = 'https://your-cloud-storage.com/program-ru.pdf';
   ```

## Language Detection:
- The system automatically detects user's language based on browser settings and location
- First-time visitors see a language confirmation modal
- Returning visitors use their saved language preference
- Downloads are served in the appropriate language automatically
