import React from 'react'
import { 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Star, 
  CheckCircle, 
  Key,
  Settings,
  Phone,
  Award
} from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Convenient Booking",
      description: "Portal, Emails or Integrated Partner"
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Key Management",
      description: "Securely hold spare keys"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Customised Cleaning",
      description: "Tailor services to your preferences"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Flexible Changes",
      description: "Quickly adjust or cancel appointments"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "No Contracts",
      description: "No long-term commitments required"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Top Ratings",
      description: "4.8-star reviews"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trusted Cleaners",
      description: "Background-checked and experienced"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Reliable Service",
      description: "Consistent and dependable"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Support Around the Clock",
      description: "Available seven days a week"
    }
  ]

  const whyChooseUs = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Comprehensive Insurance",
      description: "We offer full coverage insurance of up to £5 million, ensuring that in the rare event of accidental damage, you are fully protected. Your safety and satisfaction are our top priorities.",
      highlight: "£5M Insurance Coverage"
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Reliable & High-Quality Service",
      description: "We take pride in maintaining exceptional service standards, with a team of experienced professionals dedicated to delivering consistent and top-rated results. Our client reviews and high satisfaction ratings speak for themselves.",
      highlight: "4.8 Star Rating"
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Fully Vetted Professionals",
      description: "Every professional in our network undergoes a thorough DBS (Disclosure and Barring Service) check, along with strict background verification and skill assessments. This guarantees that only qualified and trustworthy experts enter your home or business.",
      highlight: "DBS Checked"
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Flexible & Hassle-Free Booking",
      description: "No long-term contracts, no unnecessary paperwork. Simply book online, choose your preferred time, and let us handle the rest. Our process is designed for convenience and efficiency.",
      highlight: "No Contracts"
    }
  ]

  return (
    <section id="features" className="section">
      <div className="container">
        {/* Trustable - Simple - Swift */}
        <div className="text-center mb-16">
          <h2 className="section-title">Trustable - Simple - Swift</h2>
          <p className="section-subtitle">
            Your Reliable Solution for Hassle-Free Property Maintenance
          </p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '5rem'}}>
          {features.map((feature, index) => (
            <div key={index} style={{textAlign: 'center', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <div style={{color: '#2001AF', marginBottom: '1rem', display: 'flex', justifyContent: 'center'}}>
                {feature.icon}
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827'}}>
                {feature.title}
              </h3>
              <p style={{color: '#374151', fontSize: '0.875rem'}}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose Master */}
        <div style={{background: 'linear-gradient(135deg, #2001AF 0%, #020135 100%)', borderRadius: '1.5rem', padding: '3rem', color: 'white'}}>
          <div style={{textAlign: 'center', marginBottom: '3rem'}}>
            <h2 style={{fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem'}}>Why Choose Master?</h2>
            <p style={{fontSize: '1.25rem', opacity: '0.9', maxWidth: '48rem', margin: '0 auto'}}>
              We understand that trust, reliability, and quality service are essential when hiring professionals. 
              That's why we go above and beyond to ensure a seamless and secure experience for every customer.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            {whyChooseUs.map((item, index) => (
              <div key={index} style={{backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem'}}>
                <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '1rem'}}>
                  <div style={{color: '#E94A02', marginRight: '1rem'}}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white'}}>
                      {item.title}
                    </h3>
                    <div style={{backgroundColor: '#E94A02', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', display: 'inline-block'}}>
                      {item.highlight}
                    </div>
                  </div>
                </div>
                <p style={{color: 'white', opacity: '0.9', lineHeight: '1.625'}}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
