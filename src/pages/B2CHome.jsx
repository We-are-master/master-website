import React, { lazy, Suspense } from 'react';
import HeroB2C from '../components/b2c/HeroB2C';
import { SEO } from '../components/SEO';

// Lazy load components below the fold for better initial load performance
const PopularServicesB2C = lazy(() => import('../components/b2c/PopularServicesB2C'));
const HowItWorksB2C = lazy(() => import('../components/b2c/HowItWorksB2C'));
const WhyChooseB2C = lazy(() => import('../components/b2c/WhyChooseB2C'));
const MasterClubB2C = lazy(() => import('../components/b2c/MasterClubB2C'));
const TestimonialsB2C = lazy(() => import('../components/b2c/TestimonialsB2C'));

// Loading placeholder component
  const SectionPlaceholder = () => (
  <div style={{ 
    minHeight: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#020034'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#E94A02',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const B2CHome = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Master Services',
    image: 'https://wearemaster.com/favicon.png',
    '@id': 'https://wearemaster.com',
    url: 'https://wearemaster.com',
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
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Property Maintenance Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Professional Cleaning Services',
            description: 'Professional cleaning services for homes and businesses in London'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Property Maintenance',
            description: 'Comprehensive property maintenance and repair services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Trades Services',
            description: 'Professional trades services including plumbing, electrical, and more'
          }
        }
      ]
    }
  };

  return (
    <>
      <SEO 
        structuredData={structuredData}
      />
    <div style={{ 
      backgroundColor: '#020034',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }}>
      <HeroB2C />
      <Suspense fallback={<SectionPlaceholder />}>
        <HowItWorksB2C />
      </Suspense>
      <Suspense fallback={<SectionPlaceholder />}>
        <PopularServicesB2C />
      </Suspense>
      <Suspense fallback={<SectionPlaceholder />}>
        <WhyChooseB2C />
      </Suspense>
      <Suspense fallback={<SectionPlaceholder />}>
        <MasterClubB2C />
      </Suspense>
      <Suspense fallback={<SectionPlaceholder />}>
        <TestimonialsB2C />
      </Suspense>
    </div>
    </>
  );
};

export default B2CHome;
