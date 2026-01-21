import React from 'react'
import { 
  Send, 
  Users, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Zap
} from 'lucide-react'

const Process = () => {
  const steps = [
    {
      icon: <Send className="w-12 h-12" />,
      title: "Submit Your Request",
      description: "Use our portal to request a job from cleaning to repairs. Fast & simple",
      stat: "+1.1K Requests Weekly",
      color: "#E94A02",
      bgColor: "rgba(233, 74, 2, 0.1)"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Get Matched Instantly",
      description: "Our team will use our workforce of 240+ pros to assigns the right vetted professional",
      stat: "+120 Vetted Professionals",
      color: "#2001AF",
      bgColor: "rgba(32, 1, 175, 0.1)"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Get it Sorted",
      description: "Follow progress, receive updates, and access reports, all in one place, fully automated",
      stat: "Instant Job Reports",
      color: "#020135",
      bgColor: "rgba(2, 1, 53, 0.1)"
    }
  ]

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Same Day Service",
      description: "Most jobs completed within 24 hours"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Fully Insured",
      description: "£5M coverage for complete peace of mind"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Quotes",
      description: "Get approved quotes within the same hour"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quality Guaranteed",
      description: "All work backed by our satisfaction guarantee"
    }
  ]

  return (
    <section id="process" style={{padding: '5rem 0', backgroundColor: '#f7fafc'}}>
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '4rem'}}>
          <h2 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#2d3748'}}>How It Works</h2>
          <p style={{fontSize: '1.2rem', color: '#718096', maxWidth: '600px', margin: '0 auto'}}>
            Simple, efficient, and designed for your business needs
          </p>
        </div>

        {/* Process Steps */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem'}}>
          {steps.map((step, index) => (
            <div key={index} style={{textAlign: 'center', position: 'relative'}}>
              <div style={{
                backgroundColor: step.bgColor,
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                position: 'relative',
                border: `3px solid ${step.color}`
              }}>
                <div style={{color: step.color}}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    right: '-2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'none'
                  }} className="lg:block">
                    <ArrowRight className="w-6 h-6" style={{color: '#9ca3af'}} />
                  </div>
                )}
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827'}}>
                {step.title}
              </h3>
              <p style={{color: '#4b5563', marginBottom: '1rem', lineHeight: '1.625'}}>
                {step.description}
              </p>
              <div style={{
                backgroundColor: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: step.color,
                border: `2px solid ${step.color}`,
                display: 'inline-block'
              }}>
                {step.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem'}}>
          {benefits.map((benefit, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{color: '#2001AF', marginBottom: '1rem', display: 'flex', justifyContent: 'center'}}>
                {benefit.icon}
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827'}}>
                {benefit.title}
              </h3>
              <p style={{color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.5'}}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #020135 0%, #2001AF 100%)',
          borderRadius: '1.5rem',
          padding: '4rem 3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '300px',
            height: '300px',
            background: 'rgba(233, 74, 2, 0.1)',
            borderRadius: '50%',
            zIndex: 1
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '200px',
            height: '200px',
            background: 'rgba(233, 74, 2, 0.05)',
            borderRadius: '50%',
            zIndex: 1
          }}></div>
          
          <div style={{position: 'relative', zIndex: 2}}>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Ready to Get Started?
            </h3>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2.5rem',
              maxWidth: '42rem',
              margin: '0 auto 2.5rem'
            }}>
              Join hundreds of businesses who trust Master for their property maintenance needs. 
              Get your first quote in minutes.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <a href="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#E94A02',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233, 74, 2, 0.3)',
                width: '100%',
                justifyContent: 'center'
              }}>
                Get Your Quote Now
                <ArrowRight className="w-5 h-5" style={{marginLeft: '0.5rem'}} />
              </a>
              <a href="tel:+447983182332" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                width: '100%',
                justifyContent: 'center'
              }}>
                Call +44 7983 182332
              </a>
            </div>
            
            {/* Trust indicators */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{display: 'flex', color: '#E94A02'}}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{fontSize: '1rem'}}>★</span>
                  ))}
                </div>
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>4.8 Rating</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#E94A02',
                  borderRadius: '50%'
                }}></div>
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>500+ Businesses</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#E94A02',
                  borderRadius: '50%'
                }}></div>
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>23K+ Jobs Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Process
