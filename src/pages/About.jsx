import React from 'react'
import { Users, Shield, Star, Award, CheckCircle, Target, Zap } from 'lucide-react'

const About = () => {
  const stats = [
    { number: "240+", label: "Vetted Professionals" },
    { number: "23K+", label: "Jobs Completed" },
    { number: "500+", label: "Business Clients" },
    { number: "4.8", label: "Star Rating" }
  ]

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "Every professional undergoes thorough DBS checks and background verification. We're fully insured with £5M coverage for complete peace of mind."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Efficiency & Speed",
      description: "Our streamlined process ensures quick quotes and same-day service whenever possible. Technology-driven matching for optimal results."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Excellence",
      description: "We maintain exceptional service standards with experienced professionals dedicated to delivering consistent, top-rated results."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Partnership Approach",
      description: "We work as an extension of your team, understanding your business needs and providing tailored solutions for long-term success."
    }
  ]


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Master Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're revolutionising property maintenance for businesses across London. 
              Our mission is to make property management simple, efficient, and reliable 
              through technology and exceptional service.
            </p>
            <div className="grid grid-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Master Services was founded with a simple vision: to transform how businesses 
                  manage their property maintenance needs. We recognised that traditional 
                  maintenance services were fragmented, unreliable, and lacked transparency.
                </p>
                <p>
                  Starting with a small team of trusted professionals, we've grown to become 
                  London's leading property maintenance platform, serving over 500 businesses 
                  and completing more than 23,000 jobs with exceptional results.
                </p>
                <p>
                  Today, we combine cutting-edge technology with a network of 240+ vetted 
                  professionals to deliver seamless, reliable, and transparent property 
                  maintenance services that businesses can trust.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                To provide businesses with a smarter, more efficient way to manage 
                property maintenance through technology, quality service, and trusted partnerships.
              </p>
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the UK's most trusted property maintenance platform, 
                empowering businesses to focus on growth while we handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card">
                <div className="text-primary mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Awards */}
      <section className="section bg-primary text-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Certifications & Recognition</h2>
            <p className="text-xl opacity-90">
              Trusted by industry leaders and recognised for excellence
            </p>
          </div>

          <div className="grid grid-4 gap-8 text-center">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">DBS Certified</h3>
              <p className="text-sm opacity-90">All professionals background checked</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">£5M Insured</h3>
              <p className="text-sm opacity-90">Comprehensive coverage</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">4.8 Star Rating</h3>
              <p className="text-sm opacity-90">Verified by Trustindex</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ISO Certified</h3>
              <p className="text-sm opacity-90">Quality management systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Partner with Us?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses who trust Master for their property maintenance needs. 
              Let's discuss how we can help streamline your operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn btn-primary text-lg px-8 py-4">
                Get Started Today
              </a>
              <a href="tel:02033376168" className="btn btn-outline text-lg px-8 py-4">
                Call 020 3337 6168
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
