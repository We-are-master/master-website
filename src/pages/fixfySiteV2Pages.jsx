import { useLayoutEffect } from 'react'
import { PageHome } from '../fixfy-site-v2/page-home-v2.js'
import { PageFixfyPro } from '../fixfy-site-v2/page-fixfypro.js'
import {
  PageRealEstate,
  PageFranchises,
  PageEnterprise,
  PageServicePlatforms,
} from '../fixfy-site-v2/page-solutions-v2.js'
import { PagePlatform } from '../fixfy-site-v2/page-platform-v2.js'
import { PageAbout, PageContact } from '../fixfy-site-v2/page-about-contact.js'
import {
  htmlPageStub,
  initInfraModules,
  initHeroScenes,
  initPlatformReveal,
  initContactForm,
  initTour,
} from '../fixfy-site-v2/v2Effects.js'

export function HomeV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    const cleanupInfra = initInfraModules()
    return () => {
      document.body.removeAttribute('data-tone')
      cleanupInfra?.()
    }
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageHome() }} />
}

export function FixfyProV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    const cleanupTour = initTour()
    return () => {
      document.body.removeAttribute('data-tone')
      cleanupTour?.()
    }
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageFixfyPro() }} />
}

export function PlatformV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'black')
    const cleanupHero = initHeroScenes()
    const cleanupReveal = initPlatformReveal()
    return () => {
      document.body.removeAttribute('data-tone')
      cleanupHero?.()
      cleanupReveal?.()
    }
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PagePlatform() }} />
}

export function SolutionRealEstateV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageRealEstate() }} />
}

export function SolutionFranchisesV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageFranchises() }} />
}

export function SolutionEnterpriseV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageEnterprise() }} />
}

export function SolutionServicePlatformsV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageServicePlatforms() }} />
}

export function AboutV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageAbout() }} />
}

export function ContactV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    const cleanupForm = initContactForm()
    return () => {
      document.body.removeAttribute('data-tone')
      cleanupForm?.()
    }
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: PageContact() }} />
}

export function CareersStubV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return (
    <main dangerouslySetInnerHTML={{ __html: htmlPageStub('Careers', 'We’re hiring across engineering, operations and design.') }} />
  )
}

export function PrivacyStubV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: htmlPageStub('Privacy', 'Privacy policy.') }} />
}

export function TermsStubV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return <main dangerouslySetInnerHTML={{ __html: htmlPageStub('Terms', 'Terms of service.') }} />
}

export function SecurityStubV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return (
    <main dangerouslySetInnerHTML={{ __html: htmlPageStub('Security', 'Security and infrastructure.') }} />
  )
}

export function DpaStubV2() {
  useLayoutEffect(() => {
    document.body.setAttribute('data-tone', 'navy')
    return () => document.body.removeAttribute('data-tone')
  }, [])
  return (
    <main dangerouslySetInnerHTML={{ __html: htmlPageStub('DPA', 'Data processing addendum.') }} />
  )
}
