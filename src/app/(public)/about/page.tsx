import Link from 'next/link'
import { ExternalLink, Link2, ArrowRight, Zap, Shield, Scale, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About the Creator — Nexus',
  description: 'Nexus was built by Sohaib to bridge the gap between student portfolios and structured recruiter interactions.',
}

export default function AboutPage() {
  const creatorQrToken = process.env.CREATOR_QR_TOKEN ?? null
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-6 py-24 md:py-32 max-w-4xl relative">
          <p className="text-primary text-sm font-extrabold uppercase tracking-widest mb-6">
            About the Creator
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.95]">
            Hi, I'm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Sohaib
            </span>
            .
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            I build systems that connect people more effectively. Nexus is my attempt to fix a real gap I kept seeing in university hiring events.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="font-bold gap-2 shadow-sm">
                <ExternalLink className="w-4 h-4" /> GitHub
              </Button>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="font-bold gap-2 shadow-sm">
                <Link2 className="w-4 h-4" /> LinkedIn
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-3 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">The Problem</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                Students put months into building strong Final Year Projects — but when it comes to presenting them to recruiters, everything collapses into rushed conversations, PDFs, or generic resumes that don't capture the actual depth of their work.
              </p>
              <p>
                At the same time, recruiters meet dozens of candidates in a short span, with no structured way to remember who stood out, who to follow up with, or what made someone a strong fit.
              </p>
              <p className="text-foreground font-semibold">
                Nexus is my attempt to fix that gap.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">What I focus on</p>
              {[
                'Building systems that connect people effectively',
                'Applying AI in practical, real-world workflows',
                'Designing for speed, clarity, and usability',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Nexus */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-6 py-20 max-w-4xl space-y-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">About Nexus</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              It turns every student profile into a live, scannable portfolio — and gives recruiters a lightweight CRM to track meaningful interactions in real time. Instead of exchanging resumes, conversations become structured, searchable, and actionable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Fast',
                desc: 'Server-first rendering and optimized queries keep every page under 2s TTFB.',
              },
              {
                icon: Shield,
                title: 'Secure',
                desc: 'RLS policies, role-based access, and hardened DB views — privacy enforced at every layer.',
              },
              {
                icon: Scale,
                title: 'Scalable',
                desc: 'Clean schema, no redundant data layers, and paginated queries ready for production scale.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-extrabold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">Built with</p>
            <div className="flex flex-wrap gap-3">
              {['Next.js (App Router)', 'Supabase Auth + Postgres + Realtime', 'Tailwind CSS + shadcn/ui', 'React Hook Form + Zod', 'Zustand'].map((tech) => (
                <span key={tech} className="px-3 py-1.5 bg-secondary border border-border text-secondary-foreground text-xs font-bold rounded-lg">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
          If you're a recruiter, builder, or just curious — feel free to explore the platform and reach out.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="font-bold px-8">Explore Nexus</Button>
          </Link>

          {creatorQrToken && (
            <Link href={`/student/${creatorQrToken}`}>
              <Button size="lg" variant="secondary" className="font-bold px-8 gap-2 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                View My Profile on Nexus
              </Button>
            </Link>
          )}

          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="font-bold px-8 gap-2">
              <Link2 className="w-4 h-4" /> Reach out
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
