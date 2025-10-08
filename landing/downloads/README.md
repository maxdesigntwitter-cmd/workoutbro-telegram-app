# Downloads Folder

This folder contains files that users can download from your website.

## Current Setup:
- Place your PDF file here with the name: `Bigger-Arms-22-Day-Program.pdf`
- The file will be automatically downloaded when users complete the email form

## File Requirements:
- **Filename**: `Bigger-Arms-22-Day-Program.pdf` (exactly as specified)
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

## To Update Download Link:
1. Change the filename in `script.js` line 267:
   ```javascript
   link.href = 'downloads/YOUR-FILE-NAME.pdf';
   ```

2. Or use external URL:
   ```javascript
   link.href = 'https://your-cloud-storage.com/file.pdf';
   ```
