import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('factory_projects')
    .select('product_name, tagline, description, features, pricing, architecture, target_user, landing_page_html')
    .eq('id', projectId)
    .single()

  if (!project) {
    return new NextResponse('Project not found', { status: 404 })
  }

  // If we have stored HTML, serve it directly (preview === deployed)
  if (project.landing_page_html) {
    return new NextResponse(project.landing_page_html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const name = project.product_name || 'MyApp'
  const tagline = project.tagline || 'The best tool for your needs'
  const desc = project.description || ''
  const features = Array.isArray(project.features) ? project.features : project.features?.features || []
  const pricing = project.pricing || project.features?.monetization || {}
  const price = pricing.suggestedPrice || '$9/mo'
  const tables = project.architecture?.database?.tables || []
  const routes = project.architecture?.apiRoutes || []

  // Generate a hash-based color from the product name
  const hash = name.split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  const hue = Math.abs(hash) % 360
  const h2 = (hue + 40) % 360

  const featureCards = features.slice(0, 6).map((f: any, i: number) => {
    const icons = ['⚡', '📊', '🔒', '🚀', '💡', '🎯']
    return `<div class="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
      <div class="text-3xl mb-3">${icons[i % icons.length]}</div>
      <h3 class="text-base font-bold text-gray-900 mb-1">${f.name || 'Feature'}</h3>
      <p class="text-sm text-gray-500">${(f.description || '').slice(0, 100)}</p>
    </div>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${tagline}</title>
  <meta name="description" content="${desc.replace(/"/g, '&quot;').slice(0, 160)}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;}</style>
</head>
<body class="bg-white text-gray-900 antialiased">
  <!-- NAV -->
  <nav class="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style="background:hsl(${hue},70%,50%)">⚡</div>
        <span class="text-lg font-bold">${name}</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#features" class="text-sm text-gray-600 hover:text-gray-900">Features</a>
        <a href="#pricing" class="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
        <button class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:hsl(${hue},70%,50%)">Get Started Free</button>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="relative overflow-hidden" style="background:linear-gradient(135deg,hsl(${hue},70%,15%),hsl(${h2},60%,10%))">
    <div class="absolute top-10 left-1/4 w-96 h-96 rounded-full opacity-20" style="background:radial-gradient(circle,hsl(${hue},70%,50%),transparent)"></div>
    <div class="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-15" style="background:radial-gradient(circle,hsl(${h2},70%,50%),transparent)"></div>
    <div class="relative max-w-4xl mx-auto px-6 py-24 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 mb-8">
        <span class="h-2 w-2 rounded-full animate-pulse" style="background:hsl(${hue},70%,50%)"></span> Now available
      </div>
      <h1 class="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">${tagline}</h1>
      <p class="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">${desc || name + ' helps you work smarter. Start free, upgrade when you need more.'}</p>
      <div class="flex gap-3 justify-center mb-8">
        <button class="px-8 py-3.5 text-white font-semibold rounded-xl text-lg shadow-lg" style="background:hsl(${hue},70%,50%);box-shadow:0 4px 20px hsla(${hue},70%,50%,0.4)">Get Started Free →</button>
        <button class="px-8 py-3.5 border border-white/20 text-white/70 font-medium rounded-xl text-lg">See Demo</button>
      </div>
      <div class="flex justify-center gap-6 text-sm text-white/40">
        <span>1,000+ users</span><span>·</span><span>Free to start</span><span>·</span><span>No credit card</span>
      </div>
    </div>
  </section>

  <!-- SOCIAL PROOF -->
  <div class="py-8 border-b border-gray-100">
    <p class="text-xs text-gray-400 text-center mb-4 tracking-wider uppercase">Trusted by teams at</p>
    <div class="flex justify-center gap-10 opacity-30">
      <span class="text-sm font-bold tracking-wider">ACME CORP</span>
      <span class="text-sm font-bold tracking-wider">TECHFLOW</span>
      <span class="text-sm font-bold tracking-wider">DATASYNC</span>
      <span class="text-sm font-bold tracking-wider">CLOUDBASE</span>
      <span class="text-sm font-bold tracking-wider">NEXGEN</span>
    </div>
  </div>

  <!-- FEATURES -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-20">
    <p class="text-center text-sm font-semibold uppercase tracking-wider mb-2" style="color:hsl(${hue},70%,50%)">Features</p>
    <h2 class="text-3xl font-bold text-center mb-12">Everything you need</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${featureCards || '<div class="col-span-3 text-center text-gray-400">Features coming soon</div>'}
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="bg-gray-50 py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-2xl font-bold text-center mb-10">Loved by users</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${['Sarah K.||Product Manager||This tool transformed how our team works.', 'Mike R.||CTO, StartupX||Best investment we made this year.', 'Lisa M.||Founder||Finally something that just works.'].map((t, i) => {
          const [n, r, q] = t.split('||')
          return `<div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div class="flex gap-0.5 mb-3">${'★★★★★'.split('').map(() => '<span class="text-yellow-400">★</span>').join('')}</div>
            <p class="text-gray-600 italic mb-4">"${q}"</p>
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background:hsl(${(hue + i * 60) % 360},50%,50%)">${n[0]}</div>
              <div><p class="font-medium text-sm">${n}</p><p class="text-xs text-gray-400">${r}</p></div>
            </div>
          </div>`
        }).join('\n')}
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section id="pricing" class="max-w-4xl mx-auto px-6 py-20">
    <p class="text-center text-sm font-semibold uppercase tracking-wider mb-2" style="color:hsl(${hue},70%,50%)">Pricing</p>
    <h2 class="text-3xl font-bold text-center mb-4">Start free, scale as you grow</h2>
    <p class="text-gray-500 text-center mb-10">No credit card required</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <div class="rounded-2xl border-2 border-gray-200 p-8">
        <h3 class="text-lg font-bold">Free</h3>
        <div class="text-4xl font-bold mt-2">$0<span class="text-base font-normal text-gray-500">/month</span></div>
        <ul class="mt-6 space-y-3 text-sm text-gray-600">
          <li class="flex gap-2"><span class="text-green-500">✓</span> Basic features</li>
          <li class="flex gap-2"><span class="text-green-500">✓</span> Up to 3 projects</li>
          <li class="flex gap-2"><span class="text-green-500">✓</span> Community support</li>
        </ul>
        <button class="w-full mt-8 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Get Started</button>
      </div>
      <div class="rounded-2xl p-8 text-white relative" style="background:linear-gradient(135deg,hsl(${hue},70%,50%),hsl(${h2},70%,50%))">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-xs font-bold px-3 py-1 rounded-full shadow" style="color:hsl(${hue},70%,50%)">POPULAR</div>
        <h3 class="text-lg font-bold text-white/90">Pro</h3>
        <div class="text-4xl font-bold mt-2">${price.replace('/mo', '')}<span class="text-base font-normal text-white/60">/month</span></div>
        <ul class="mt-6 space-y-3 text-sm text-white/80">
          <li class="flex gap-2"><span>✓</span> Everything in Free</li>
          <li class="flex gap-2"><span>✓</span> Unlimited projects</li>
          <li class="flex gap-2"><span>✓</span> Priority support</li>
          <li class="flex gap-2"><span>✓</span> Advanced features</li>
          <li class="flex gap-2"><span>✓</span> Custom integrations</li>
        </ul>
        <button class="w-full mt-8 py-3 bg-white rounded-xl font-semibold" style="color:hsl(${hue},70%,40%)">Start Free Trial</button>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20" style="background:linear-gradient(135deg,hsl(${hue},70%,15%),hsl(${h2},60%,10%))">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
      <p class="text-white/50 mb-8">Join thousands of users already using ${name}</p>
      <div class="flex gap-3 justify-center max-w-md mx-auto">
        <input class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm" placeholder="Enter your email">
        <button class="px-6 py-3 rounded-xl text-white font-semibold" style="background:hsl(${hue},70%,50%)">Start Free</button>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-gray-100 py-10">
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
      <span>© 2026 ${name}. All rights reserved.</span>
      <div class="flex gap-6"><a href="#" class="hover:text-gray-600">Privacy</a><a href="#" class="hover:text-gray-600">Terms</a><a href="#" class="hover:text-gray-600">Contact</a></div>
    </div>
  </footer>

  <!-- Built with Vaxario badge -->
  <div class="fixed bottom-4 right-4 px-3 py-1.5 bg-black/80 text-white/60 text-xs rounded-full backdrop-blur-sm">
    Built with <a href="https://www.vaxario.com" class="text-white/90 font-medium hover:text-white">Vaxario</a>
  </div>
</body>
</html>`

  // Save generated HTML so preview === deployed version
  await supabase.from('factory_projects').update({ landing_page_html: html }).eq('id', projectId)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
