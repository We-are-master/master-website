import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What types of services do you cover?",
      answer: "We provide comprehensive property maintenance services including cleaning (end of tenancy, deep clean, regular maintenance), plumbing, electrical work, handyman services, carpentry, and more. You can submit requests directly via email, our portal, or connect your own system via API/Webhook for automation."
    },
    {
      question: "What's the average turnaround time?",
      answer: "Most quotes are approved within the same hour, and jobs are completed the same day whenever possible. For urgent requests, we can often provide same-day service."
    },
    {
      question: "Will the trade have insurance?",
      answer: "Yes - any trade you book will be insured. We offer comprehensive insurance coverage of up to £5 million, ensuring that in the rare event of accidental damage, you are fully protected. We've got great customer service, and our responsive support team are at hand to help if any issues come up during your booking."
    },
    {
      question: "Does Master offer customer support?",
      answer: "Yes! Our support team is available seven days a week to assist with any questions, booking changes, or concerns to ensure you have the best possible experience. You can reach us via phone, email, or through our online portal."
    },
    {
      question: "Are your professionals qualified and insured?",
      answer: "Yes. All professionals on the Master platform are vetted, trained, and fully insured. Every professional undergoes a thorough DBS (Disclosure and Barring Service) check, along with strict background verification and skill assessments, ensuring safety and peace of mind for every job."
    },
    {
      question: "Can we manage multiple sites?",
      answer: "Absolutely. Our portal is built for landlords, agencies, and multi-site businesses — everything in one dashboard. You can manage requests across all your properties from a single interface."
    },
    {
      question: "Will we have performance data?",
      answer: "Yes. Real-time dashboards and reports give you complete visibility of every request. You can track job progress, costs, and performance metrics to make informed decisions about your property maintenance."
    },
    {
      question: "Is there a minimum contract?",
      answer: "No, because we're sure you'll love the service! You can cancel or reschedule one or all your cleans in your online account any time until 12:00 the day before without incurring any charge. No long-term commitments required."
    },
    {
      question: "How does pricing work?",
      answer: "Our pricing is transparent and competitive. You'll receive detailed quotes for each job, and there are no hidden fees. We offer flexible pricing options to suit different business needs and budgets."
    },
    {
      question: "What areas do you cover?",
      answer: "We currently operate across London and surrounding areas. Our network of 240+ professionals ensures comprehensive coverage throughout the capital, with plans to expand to other major UK cities."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="section bg-light">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about us!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-8">
              Our support team is here to help. Get in touch and we'll answer any questions you have about our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn btn-primary text-lg px-8 py-4">
                Contact Support
              </a>
              <a href="tel:02033376168" className="btn btn-outline text-lg px-8 py-4">
                Call 020 3337 6168
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
