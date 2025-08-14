import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

const SEO: React.FC<SEOProps> = ({
  title = 'EdgeTX Blackbox Visualization - RC Flight Data Analysis Tool',
  description = 'Professional EdgeTX blackbox log visualization and analysis tool. Upload CSV flight logs to visualize flight paths, analyze telemetry data, and improve your RC flying performance.',
  keywords = 'EdgeTX, blackbox, flight log, RC, telemetry, visualization, analysis, CSV, flight data, RC flying, drone, aircraft',
  image = '/preview.webp',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}) => {
  useEffect(() => {
    document.title = title

    updateMetaTag('name', 'description', description)
    updateMetaTag('name', 'keywords', keywords)
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:type', type)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:image', image)
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:image', image)

    if (author) {
      updateMetaTag('name', 'author', author)
    }
    if (publishedTime) {
      updateMetaTag('property', 'article:published_time', publishedTime)
    }
    if (modifiedTime) {
      updateMetaTag('property', 'article:modified_time', modifiedTime)
    }
    if (section) {
      updateMetaTag('property', 'article:section', section)
    }
    if (tags.length > 0) {
      tags.forEach((tag) => {
        updateMetaTag('property', 'article:tag', tag)
      })
    }

    updateStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      description: description,
      url: url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })
  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
  ])

  const updateMetaTag = (attribute: string, value: string, content: string) => {
    let meta = document.querySelector(
      `meta[${attribute}="${value}"]`,
    ) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, value)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  const updateStructuredData = (data: any) => {
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]',
    )
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
  }

  return null
}

export default SEO
