import React from 'react'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Property Management Ltd",
      role: "Operations Director",
      content: "Master has transformed how we manage our property maintenance. Their portal is incredibly user-friendly and the quality of work is consistently excellent. We've reduced our maintenance costs by 30% since partnering with them.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      company: "London Estates",
      role: "Facilities Manager",
      content: "The speed and reliability of Master's service is outstanding. We can request cleaning or repairs and have them completed the same day. Their professionals are always punctual and the work quality is top-notch.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emma Williams",
      company: "Retail Chain UK",
      role: "Store Operations Manager",
      content: "Managing maintenance across multiple sites used to be a nightmare. Master's platform makes it so simple - we can track all our requests, get instant updates, and access detailed reports. Highly recommended!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "David Thompson",
      company: "Construction Group",
      role: "Project Manager",
      content: "The flexibility and no-contract approach is exactly what we needed. We can scale up or down based on project requirements, and the quality remains consistent. Master understands business needs.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Lisa Rodriguez",
      company: "Hospitality Group",
      role: "Operations Director",
      content: "From end-of-tenancy cleaning to emergency repairs, Master handles everything seamlessly. Their 24/7 support and comprehensive insurance give us complete peace of mind. Excellent service!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "James Mitchell",
      company: "Real Estate Agency",
      role: "Managing Director",
      content: "Master has become an essential part of our business operations. Their professionals are reliable, skilled, and always deliver quality work. The reporting features help us track performance and costs effectively.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    }
  ]

  const companies = [
    "Property Management Ltd",
    "London Estates", 
    "Retail Chain UK",
    "Construction Group",
    "Hospitality Group",
    "Real Estate Agency"
  ]

  return (
    <section style={{padding: '5rem 0', backgroundColor: 'white'}}>
      <div className="container">
        {/* Chosen by industry leaders */}
        <div style={{textAlign: 'center', marginBottom: '4rem'}}>
          <h2 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#2d3748'}}>Chosen by Industry Leaders</h2>
          <p style={{fontSize: '1.2rem', color: '#718096', maxWidth: '600px', margin: '0 auto'}}>
            From estate agents to retail chains, dozens of businesses already partner with Master
          </p>
        </div>

        {/* Company logos/names */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '5rem'}}>
          {companies.map((company, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{fontSize: '1rem', fontWeight: '600', color: '#374151'}}>
                {company}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
          {testimonials.slice(0, 4).map((testimonial, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  loading="lazy"
                  width="48"
                  height="48"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '1rem'
                  }}
                />
                <div>
                  <h4 style={{fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0', fontSize: '1rem'}}>
                    {testimonial.name}
                  </h4>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0'}}>
                    {testimonial.role}
                  </p>
                  <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#2001AF', margin: 0}}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
              
              <div style={{display: 'flex', color: '#E94A02', marginBottom: '1rem'}}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{fill: 'currentColor'}} />
                ))}
              </div>
              
              <div style={{position: 'relative'}}>
                <Quote className="w-6 h-6" style={{
                  color: '#2001AF',
                  opacity: '0.2',
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '-0.5rem'
                }} />
                <p style={{
                  color: '#374151',
                  lineHeight: '1.625',
                  margin: '0 0 0 1.5rem',
                  fontSize: '0.875rem'
                }}>
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          backgroundColor: '#f7fafc',
          borderRadius: '1rem',
          padding: '3rem'
        }}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem'}}>
            <div>
              <div style={{fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2001AF'}}>4.8</div>
              <div style={{color: '#6b7280', fontWeight: '500'}}>Average Rating</div>
            </div>
            <div>
              <div style={{fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2001AF'}}>500+</div>
              <div style={{color: '#6b7280', fontWeight: '500'}}>Business Clients</div>
            </div>
            <div>
              <div style={{fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2001AF'}}>23K+</div>
              <div style={{color: '#6b7280', fontWeight: '500'}}>Jobs Completed</div>
            </div>
            <div>
              <div style={{fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2001AF'}}>98%</div>
              <div style={{color: '#6b7280', fontWeight: '500'}}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
