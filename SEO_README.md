# SEO Implementation Guide for EdgeTX Blackbox Visualization

This document outlines the SEO implementation for the EdgeTX Blackbox Visualization project.

## Current SEO Features ✅

### 1. Static Meta Tags (index.html)

- Title tag with descriptive content
- Meta description with compelling copy
- Keywords meta tag
- Open Graph tags for social media sharing
- Twitter Card meta tags
- Proper viewport and charset meta tags

### 2. Dynamic SEO Component

- `SEO.tsx` - Main SEO component that updates meta tags dynamically
- `LandingPageSEO.tsx` - Page-specific SEO for landing page
- `MainPageSEO.tsx` - Page-specific SEO for analysis page

### 3. Technical SEO

- Sitemap.xml for search engine indexing
- Robots.txt with sitemap reference
- PWA configuration for better mobile experience
- Structured data (JSON-LD) for rich snippets

## How to Use SEO Components

### Basic Usage

```tsx
import SEO from '@/components/SEO'

// Use with default values
<SEO />

// Or customize for specific pages
<SEO
  title="Custom Page Title"
  description="Custom page description"
  keywords="custom, keywords"
  image="/custom-image.jpg"
/>
```

### Page-Specific SEO

```tsx
import LandingPageSEO from '@/components/SEO/LandingPageSEO'
import MainPageSEO from '@/components/SEO/MainPageSEO'

// In LandingPage component
<LandingPageSEO />

// In MainPage component
<MainPageSEO />
```

## SEO Best Practices Implemented

### 1. Meta Tags

- **Title**: Descriptive, under 60 characters
- **Description**: Compelling, under 160 characters
- **Keywords**: Relevant to RC flying and EdgeTX
- **Open Graph**: Optimized for social media sharing
- **Twitter Cards**: Enhanced Twitter sharing experience

### 2. Structured Data

- JSON-LD format for better search engine understanding
- WebApplication schema for app-like websites
- Price and availability information

### 3. Technical SEO

- Sitemap for search engine crawling
- Robots.txt for crawler guidance
- PWA features for mobile optimization
- Fast loading with Vite build system

## Customization

### Adding New Pages

1. Create a new SEO component in `src/components/SEO/`
2. Import and use it in your page component
3. Update sitemap.xml if needed

### Updating Meta Tags

1. Modify the SEO component props
2. Update the default values in `SEO.tsx`
3. Ensure consistency across all pages

### Adding Structured Data

1. Modify the `updateStructuredData` function in `SEO.tsx`
2. Add new schema.org types as needed
3. Test with Google's Rich Results Test

## Performance Considerations

- SEO component only runs on mount/update
- Meta tags are updated efficiently
- No unnecessary re-renders
- Lightweight implementation

## Future Enhancements

- Add more page-specific SEO components
- Implement dynamic meta tags based on log data
- Add breadcrumb navigation
- Implement canonical URLs
- Add more structured data types

## Testing

Use these tools to verify SEO implementation:

- Google Search Console
- Google Rich Results Test
- Facebook Sharing Debugger
- Twitter Card Validator
- Lighthouse SEO audit

## Notes

- Replace `https://your-domain.com` with actual domain in sitemap and robots.txt
- Update lastmod dates in sitemap.xml regularly
- Monitor search console for SEO performance
- Keep meta descriptions unique and compelling
