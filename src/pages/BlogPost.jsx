import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import CTABlock from '../components/fixfy/CTABlock'
import { getPost, getAllPosts, formatDate } from '../lib/blog'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug)

  if (!post) return <Navigate to="/blog" replace />

  const canonical = `https://getfixfy.com/blog/${post.slug}`
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 3)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    description: post.seoDescription || post.excerpt,
    author: { '@type': 'Organization', name: 'Fixfy', '@id': 'https://getfixfy.com#organization' },
    publisher: {
      '@type': 'Organization',
      name: 'Fixfy',
      logo: { '@type': 'ImageObject', url: 'https://getfixfy.com/brand/fixfy-primary-white.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    inLanguage: 'en-GB',
    articleSection: post.tags?.[0],
    keywords: post.tags?.join(', '),
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://getfixfy.com/' },
      { '@type': 'ListItem', position: 2, name: 'Field notes', item: 'https://getfixfy.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  }

  return (
    <>
      <SEO
        title={`${post.title} — Fixfy`}
        description={post.seoDescription || post.excerpt}
        keywords={post.tags?.join(', ')}
        canonical={canonical}
        ogType="article"
        structuredData={[structuredData, breadcrumbs]}
        articleMeta={{
          publishedTime: post.date,
          section: post.tags?.[0],
          tags: post.tags,
        }}
      />

      <Section size="page-header">
        <Container narrow>
          <div className="fx-blog-breadcrumb">
            <Link to="/blog">Field notes</Link>
            <span>·</span>
            {post.tags?.[0] && <span>{post.tags[0]}</span>}
          </div>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '22ch' }}>{post.title}</h1>
          <div className="fx-blog-meta fx-mt-24">
            <span>{formatDate(post.date)}</span>
            <span className="fx-blog-meta-dot">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
        </Container>
      </Section>

      <Section size="compact">
        <Container narrow>
          <article
            className="fx-prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </Container>
      </Section>

      {related.length > 0 && (
        <Section>
          <Container>
            <Eyebrow>Keep reading</Eyebrow>
            <div className="fx-res-list fx-mt-32">
              {related.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="fx-res-item">
                  <span className="fx-tag">{(p.tags && p.tags[0]) || 'Essay'}</span>
                  <span className="fx-title">{p.title}</span>
                  <span className="fx-date">{p.readMinutes} min</span>
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
