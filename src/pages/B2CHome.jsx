import React from 'react';
import HeroB2C from '../components/b2c/HeroB2C';
import PopularServicesB2C from '../components/b2c/PopularServicesB2C';
import TestimonialsB2C from '../components/b2c/TestimonialsB2C';
import HowItWorksB2C from '../components/b2c/HowItWorksB2C';
import WhyChooseB2C from '../components/b2c/WhyChooseB2C';
import FooterB2C from '../components/b2c/FooterB2C';

const B2CHome = () => {
  return (
    <div style={{ 
      backgroundColor: '#ffffff',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <HeroB2C />
      <PopularServicesB2C />
      <TestimonialsB2C />
      <HowItWorksB2C />
      <WhyChooseB2C />
      <FooterB2C />
    </div>
  );
};

export default B2CHome;
