import React from 'react'
import { 
  Sparkles, 
  Wrench, 
  Zap, 
  Shield, 
  Hammer, 
  Droplets,
  CheckCircle,
  Star
} from 'lucide-react'

const Services = () => {
  const services = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Cleaning",
      description: "From End of Tenancy to Deep Clean, teams fully trained & equipped moving across London.",
      features: ["End of Tenancy Cleaning", "Deep Cleaning", "Regular Maintenance", "Commercial Cleaning"]
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Plumbing",
      description: "We offer reliable plumbing services to address any issues swiftly.",
      features: ["Emergency Repairs", "Installations", "Maintenance", "Leak Detection"]
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Handyman",
      description: "Our skilled handymen are here to help with a wide range of maintenance tasks.",
      features: ["General Repairs", "Assembly", "Installation", "Maintenance"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Electrician",
      description: "Our certified electricians provide safe and efficient electrical services.",
      features: ["Electrical Repairs", "Installations", "Safety Checks", "Emergency Service"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Certified & Compliant",
      description: "Our experienced cleaners offer comprehensive cleaning services to keep your indoor spaces beautiful and healthy.",
      features: ["DBS Checked", "Fully Insured", "Certified Professionals", "Quality Guaranteed"]
    },
    {
      icon: <Hammer className="w-8 h-8" />,
      title: "Carpenter",
      description: "Our talented carpenters provide quality woodworking services. Whether it's furniture repairs or custom builds.",
      features: ["Furniture Repair", "Custom Builds", "Installations", "Restoration"]
    }
  ]

  return (
    <section id="services" className="section bg-light">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="section-title">How Master can help you?</h2>
          <p className="section-subtitle">
            Master provides a variety of essential services tailored to meet your needs.
          </p>
        </div>

        <div className="grid grid-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="card group">
              <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">240+</div>
              <div className="text-gray-600">Vetted Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">23K+</div>
              <div className="text-gray-600">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8</div>
              <div className="text-gray-600">Star Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Business Clients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
