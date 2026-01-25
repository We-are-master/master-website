import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Default SEO configuration
const defaultSEO = {
  title: 'Master Services - Professional Property Maintenance Services',
  description: 'Master Services - The smarter way to manage maintenance across your business. Professional cleaning, trades services, and property maintenance across London.',
  keywords: 'business cleaning, trades services, property maintenance, London, professional services, property management',
  image: '/favicon.png',
  url: 'https://wearemaster.com',
  type: 'website',
  siteName: 'Master Services',
  locale: 'en_GB'
}

// Page-specific SEO configurations
const pageSEO = {
  '/': {
    title: 'Master Services - Professional Property Maintenance & Cleaning Services in London',
    description: 'Professional property maintenance and cleaning services in London. Trusted by 500+ businesses. Same-day service, vetted professionals, fully insured. Book your service today!',
    keywords: 'property maintenance London, cleaning services London, professional cleaning, trades services, property management, same-day service, vetted professionals',
    type: 'website'
  },
  '/b2c': {
    title: 'Master Services - Professional Property Maintenance & Cleaning Services in London',
    description: 'Professional property maintenance and cleaning services in London. Trusted by 500+ businesses. Same-day service, vetted professionals, fully insured. Book your service today!',
    keywords: 'property maintenance London, cleaning services London, professional cleaning, trades services, property management, same-day service, vetted professionals',
    type: 'website'
  },
  '/about': {
    title: 'About Us - Master Services | Property Maintenance Experts',
    description: 'Learn about Master Services - London\'s leading property maintenance platform. 240+ vetted professionals, 23K+ jobs completed, serving 500+ businesses. Trusted, efficient, and reliable.',
    keywords: 'about Master Services, property maintenance company, London maintenance services, trusted professionals, DBS certified',
    type: 'website'
  },
  '/contact': {
    title: 'Contact Us - Master Services | Get in Touch Today',
    description: 'Contact Master Services for your property maintenance needs. Call +44 7983 182332 or email hello@wearemaster.com. Quick response promise - we respond within 2 hours.',
    keywords: 'contact Master Services, property maintenance contact, London maintenance services contact, customer support',
    type: 'website'
  },
  '/b2b': {
    title: 'B2B Property Maintenance Services - Master Services',
    description: 'Enterprise property maintenance solutions for businesses. Streamlined operations, technology-driven matching, and exceptional service standards. Trusted by 500+ businesses.',
    keywords: 'B2B property maintenance, business maintenance services, enterprise maintenance solutions, commercial property management',
    type: 'website'
  },
  '/booking': {
    title: 'Book a Service - Master Services',
    description: 'Book your property maintenance or cleaning service with Master Services. Easy online booking, same-day service available, vetted professionals.',
    keywords: 'book property maintenance, book cleaning service, online booking, same-day service booking',
    type: 'website'
  },
  '/cleaning-booking': {
    title: 'Book Cleaning Service - Master Services',
    description: 'Book professional cleaning services in London. Same-day service available. Vetted professionals, fully insured, trusted by 500+ businesses.',
    keywords: 'book cleaning service, professional cleaning London, same-day cleaning, house cleaning, office cleaning',
    type: 'website'
  }
}

export function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  noindex = false,
  structuredData
}) {
  const location = useLocation()
  const currentPath = location.pathname
  
  // Get page-specific SEO or use provided props or defaults
  const pageConfig = pageSEO[currentPath] || {}
  const finalTitle = title || pageConfig.title || defaultSEO.title
  const finalDescription = description || pageConfig.description || defaultSEO.description
  const finalKeywords = keywords || pageConfig.keywords || defaultSEO.keywords
  const finalImage = image || pageConfig.image || defaultSEO.image
  const finalType = type || pageConfig.type || defaultSEO.type
  const canonicalUrl = `${defaultSEO.url}${currentPath === '/' ? '' : currentPath}`

  useEffect(() => {
    // Update document title
    document.title = finalTitle

    // Helper function to update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const selector = isProperty 
        ? `meta[property="${property}"]` 
        : `meta[name="${property}"]`
      
      let meta = document.querySelector(selector)
      
      if (!meta) {
        meta = document.createElement('meta')
        if (isProperty) {
          meta.setAttribute('property', property)
        } else {
          meta.setAttribute('name', property)
        }
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', finalDescription)
    updateMetaTag('keywords', finalKeywords)
    
    // Robots meta
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    }

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true)
    updateMetaTag('og:description', finalDescription, true)
    updateMetaTag('og:image', finalImage.startsWith('http') ? finalImage : `${defaultSEO.url}${finalImage}`, true)
    updateMetaTag('og:url', canonicalUrl, true)
    updateMetaTag('og:type', finalType, true)
    updateMetaTag('og:site_name', defaultSEO.siteName, true)
    updateMetaTag('og:locale', defaultSEO.locale, true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', finalTitle)
    updateMetaTag('twitter:description', finalDescription)
    updateMetaTag('twitter:image', finalImage.startsWith('http') ? finalImage : `${defaultSEO.url}${finalImage}`)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // Language
    const html = document.documentElement
    html.setAttribute('lang', 'en-GB')

    // Structured Data (JSON-LD)
    let structuredDataScript = document.getElementById('structured-data')
    if (structuredDataScript) {
      structuredDataScript.remove()
    }

    if (structuredData) {
      structuredDataScript = document.createElement('script')
      structuredDataScript.id = 'structured-data'
      structuredDataScript.type = 'application/ld+json'
      structuredDataScript.textContent = JSON.stringify(structuredData)
      document.head.appendChild(structuredDataScript)
    } else if (currentPath === '/' || currentPath === '/b2c') {
      // Default structured data for homepage
      const defaultStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Master Services',
        image: `${defaultSEO.url}/favicon.png`,
        '@id': defaultSEO.url,
        url: defaultSEO.url,
        telephone: '+447983182332',
        email: 'hello@wearemaster.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '124 City Rd',
          addressLocality: 'London',
          postalCode: 'EC1V 2NX',
          addressCountry: 'GB'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '51.5275',
          longitude: '-0.0876'
        },
        priceRange: '$$',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday', 'Sunday'],
            opens: '08:00',
            closes: '17:00'
          }
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '500'
        },
        sameAs: [
          'https://www.facebook.com/wearemaster',
          'https://www.linkedin.com/company/wearemaster'
        ]
      }
      
      structuredDataScript = document.createElement('script')
      structuredDataScript.id = 'structured-data'
      structuredDataScript.type = 'application/ld+json'
      structuredDataScript.textContent = JSON.stringify(defaultStructuredData)
      document.head.appendChild(structuredDataScript)
    }

    // Cleanup function
    return () => {
      // Meta tags will persist, which is fine for SEO
    }
  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalType, canonicalUrl, noindex, structuredData, currentPath])

  return null
}
