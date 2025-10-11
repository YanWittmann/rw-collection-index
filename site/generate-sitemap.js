const fs = require('fs');
const path = require('path');

// Read the parsed dialogues JSON file
const dialogueDataPath = path.join(__dirname, 'src/generated/parsed-dialogues.json');
const dialogueData = JSON.parse(fs.readFileSync(dialogueDataPath, 'utf8'));

// Extract IDs following the same logic as the application's pearlIdToUrlId function
// when a transcriber is selected (which happens by default)
let uniqueIds = new Set();

dialogueData.forEach(item => {
    // When a pearl is selected, the application automatically selects the last transcriber
    // So we need to simulate the same logic as pearlIdToUrlId with the last transcriber selected
    
    // Get the last transcriber (this is what the app does by default)
    const lastTranscriber = item.transcribers && item.transcribers.length > 0 
        ? item.transcribers[item.transcribers.length - 1] 
        : null;
        
    // If there's a last transcriber with internalId, use that (as the app would)
    if (lastTranscriber && lastTranscriber.metadata && lastTranscriber.metadata.internalId) {
        uniqueIds.add(lastTranscriber.metadata.internalId);
    }
    // Otherwise, if the item has an internalId, use that
    else if (item.metadata && item.metadata.internalId) {
        uniqueIds.add(item.metadata.internalId);
    }
    // Otherwise, use the item's ID
    else {
        uniqueIds.add(item.id);
    }
});

// Convert to array
uniqueIds = [...uniqueIds];

// Generate sitemap XML
const generateSitemap = (baseUrl, ids) => {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
  const urlsetStart = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const urlsetEnd = `</urlset>`;
  
  const urls = ids.map(id => {
    const urlEncodedId = encodeURIComponent(id);

    return `  <url>
    <loc>${baseUrl}?item=${urlEncodedId}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  }).join('\n');
  
  return `${xmlHeader}\n${urlsetStart}\n  <url>
    <loc>${baseUrl}</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>\n${urls}\n${urlsetEnd}`;
};

// Generate sitemap content
const baseUrl = 'https://yanwittmann.github.io/rw-collection-index/';
const sitemapContent = generateSitemap(baseUrl, uniqueIds);

// Write sitemap to build directory
const sitemapPath = path.join(__dirname, 'build', 'sitemap.xml');
fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
fs.writeFileSync(sitemapPath, sitemapContent);

console.log(`Sitemap generated successfully with ${uniqueIds.length + 1} URLs (including homepage)`);
console.log(`Sitemap written to: ${sitemapPath}`);
console.log(`Unique IDs in sitemap: ${uniqueIds.length}`);

// Create robots.txt to reference the sitemap
const robotsContent = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

Sitemap: ${baseUrl}sitemap.xml`;

const robotsPath = path.join(__dirname, 'build', 'robots.txt');
fs.writeFileSync(robotsPath, robotsContent);

console.log(`robots.txt generated successfully`);
console.log(`robots.txt written to: ${robotsPath}`);

// Create a script to insert canonical tags into the index.html
console.log('Now adding canonical tag functionality to index.html...');

// Read the build index.html
const indexPath = path.join(__dirname, 'build', 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Insert canonical tag logic in the <head> section
  const canonicalTagScript = `
    <script>
      // Canonical tag logic
      function updateCanonicalTag() {
        // Remove existing canonical tag if present
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
          existingCanonical.remove();
        }
        
        // Build canonical URL based on current parameters
        const params = new URLSearchParams(window.location.search);
        let canonicalUrl = window.location.origin + window.location.pathname;
        
        // Normalize parameters to match how the application handles them
        // Only keep the 'item' parameter for canonical URLs, as this is the primary identifier
        const itemParam = params.get('item');
        if (itemParam) {
          const normalizedParams = new URLSearchParams();
          normalizedParams.set('item', itemParam);
          canonicalUrl += '?' + normalizedParams.toString();
        }
        
        // Create and append new canonical tag
        const canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }
      
      // Run on initial load
      updateCanonicalTag();
      
      // Listen for URL changes if using history API
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        updateCanonicalTag();
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        updateCanonicalTag();
      };
      
      // Handle back/forward buttons
      window.addEventListener('popstate', updateCanonicalTag);
    </script>`;
  
  // Find the closing </head> tag and insert the canonical script before it
  if (indexContent.includes('</head>')) {
    indexContent = indexContent.replace('</head>', canonicalTagScript + '\n</head>');
  } else {
    // If no </head> tag found, try to insert near the beginning with a new head tag
    const headTag = '<head>';
    if (indexContent.includes(headTag)) {
      indexContent = indexContent.replace(headTag, headTag + '\n' + canonicalTagScript);
    } else {
      // Insert head and canonical tag if no head tag exists
      const htmlTag = '<html';
      if (indexContent.includes(htmlTag)) {
        indexContent = indexContent.replace(htmlTag, '<html>\n<head>' + canonicalTagScript + '</head>\n' + htmlTag);
      }
    }
  }
  
  // Write the updated index.html
  fs.writeFileSync(indexPath, indexContent);
  console.log('Canonical tag script added to index.html');
} else {
  console.log('Build index.html not found. Make sure to run build step first.');
}

// Also add canonical tag logic to the public index.html template for future builds
const publicIndexPath = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(publicIndexPath)) {
  let publicIndexContent = fs.readFileSync(publicIndexPath, 'utf8');
  
  // Check if canonical script is already present
  if (!publicIndexContent.includes('updateCanonicalTag')) {
    const canonicalTagScript = `
    <script>
      // Canonical tag logic
      function updateCanonicalTag() {
        // Remove existing canonical tag if present
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
          existingCanonical.remove();
        }
        
        // Build canonical URL based on current parameters
        const params = new URLSearchParams(window.location.search);
        let canonicalUrl = window.location.origin + window.location.pathname;
        
        // Normalize parameters to match how the application handles them
        // Only keep the 'item' parameter for canonical URLs, as this is the primary identifier
        const itemParam = params.get('item');
        if (itemParam) {
          const normalizedParams = new URLSearchParams();
          normalizedParams.set('item', itemParam);
          canonicalUrl += '?' + normalizedParams.toString();
        }
        
        // Create and append new canonical tag
        const canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }
      
      // Run on initial load
      updateCanonicalTag();
      
      // Listen for URL changes if using history API
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        updateCanonicalTag();
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        updateCanonicalTag();
      };
      
      // Handle back/forward buttons
      window.addEventListener('popstate', updateCanonicalTag);
    </script>`;
    
    // Find the closing </head> tag and insert the canonical script before it
    if (publicIndexContent.includes('</head>')) {
      publicIndexContent = publicIndexContent.replace('</head>', canonicalTagScript + '\n</head>');
    } else {
      // If no </head> tag found, try to insert near the beginning with a new head tag
      const headTag = '<head>';
      if (publicIndexContent.includes(headTag)) {
        publicIndexContent = publicIndexContent.replace(headTag, headTag + '\n' + canonicalTagScript);
      } else {
        // Insert head and canonical tag if no head tag exists
        const htmlTag = '<html';
        if (publicIndexContent.includes(htmlTag)) {
          publicIndexContent = publicIndexContent.replace(htmlTag, '<html>\n<head>' + canonicalTagScript + '</head>\n' + htmlTag);
        }
      }
    }
    
    // Write the updated public/index.html
    fs.writeFileSync(publicIndexPath, publicIndexContent);
    console.log('Canonical tag script added to public/index.html template');
  }
}