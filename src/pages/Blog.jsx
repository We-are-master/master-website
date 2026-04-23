import React from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import CTABlock from '../components/fixfy/CTABlock'
import { getAllPosts, formatDate, shortDate } from '../lib/blog'

export default function Blog() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://getfixfy.com/blog',
    name: 'Fixfy — Field notes',
    description: 'Field notes on commercial maintenance for British buildings.',
    url: 'https://getfixfy.com/blog',
    inLanguage: 'en-GB',
    publisher: {
      '@type': 'Organization',
      name: 'Fixfy',
      logo: { '@type': 'ImageObject', url: 'https://getfixfy.com/brand/fixfy-primary-white.png' },
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://getfixfy.com/blog/${p.slug}`,
      datePublished: p.date,
      author: { '@type': 'Organization', name: 'Fixfy', '@id': 'https://getfixfy.com#organization' },
    })),
  }

  return (
    <>
      <SEO
        title="Field notes — Fixfy"
        description="Practitioner writing on commercial maintenance, compliance and the UK facilities trade. Research, playbooks and essays from the Fixfy team."
        keywords="facilities management blog, UK commercial maintenance, fire door compliance, FM playbook, CAFM alternatives"
        structuredData={structuredData}
        canonical="https://getfixfy.com/blog"
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>Field notes</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            Field notes on running British buildings.
          </h1>
          <p className="fx-lede fx-mt-24">
            Research, playbooks and long-form writing for the people who keep the lights on.
            No growth-hacked listicles. No AI slop.
          </p>
        </Container>
      </Section>

      {featured && (
        <Section size="compact">
          <Container>
            <Eyebrow>Latest</Eyebrow>
            <Link to={`/blog/${featured.slug}`} className="fx-blog-feature fx-mt-32">
              <div className={`fx-blog-feature-cover ${featured.cover?.kind || ''}`}>
                <div className="fx-blog-feature-kicker">
                  {(featured.tags && featured.tags[0]) || 'Essay'} · {shortDate(featured.date)}
                </div>
                <h2 className="fx-blog-feature-title">{featured.title}</h2>
              </div>
              <div className="fx-blog-feature-body">
                <p className="fx-body">{featured.excerpt}</p>
                <div className="fx-blog-meta fx-mt-24">
                  <span>{featured.readMinutes} min read</span>
                  <span>·</span>
                  <span>{formatDate(featured.date)}</span>
                </div>
                <span className="fx-persona-link fx-mt-24" style={{ display: 'inline-block' }}>
                  Read →
                </span>
              </div>
            </Link>
          </Container>
        </Section>
      )}

      {rest.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>All posts</Eyebrow>
            <div className="fx-res-list fx-mt-32">
              {rest.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="fx-res-item">
                  <span className="fx-tag">{(p.tags && p.tags[0]) || 'Essay'}</span>
                  <span className="fx-title">{p.title}</span>
                  <span className="fx-date">{shortDate(p.date)}</span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTABlock />
    </>
  )
}
