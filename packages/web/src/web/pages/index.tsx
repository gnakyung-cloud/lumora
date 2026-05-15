import { useState, useEffect, useRef } from "react";

/* ─── Navbar ────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#c9a96e] flex items-center justify-center">
            <span className="text-[#0a0a0a] font-display font-bold text-sm">L</span>
          </div>
          <span className="font-display font-semibold text-white text-lg tracking-tight">
            Lumora
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Services", "How It Works", "Gallery", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#contact"
          className="bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#c9a96e] hover:text-white transition-all duration-200"
        >
          Book Now
        </a>
      </div>
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a96e]/5 blur-[120px]" />
      </div>

      {/* Eyebrow tag */}
      <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm bg-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
        <span className="text-white/60 text-xs tracking-widest uppercase font-medium">
          AI Photo Studio · Seoul
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-display font-extrabold text-white leading-[1.05] mb-6 max-w-3xl">
        <span className="block text-5xl md:text-7xl lg:text-8xl">Your Best Shot,</span>
        <span className="block text-5xl md:text-7xl lg:text-8xl text-gradient">No Studio Needed.</span>
      </h1>

      {/* Sub */}
      <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
        Professional AI portraits — headshots, hanbok, body profiles — delivered in minutes.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <a
          href="#contact"
          className="bg-[#c9a96e] text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#e8c98a] transition-all duration-200 text-sm"
        >
          Get Started
        </a>
        <a
          href="#services"
          className="border border-white/15 text-white/70 px-8 py-3.5 rounded-full hover:border-white/40 hover:text-white transition-all duration-200 text-sm"
        >
          See Services
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-10 bg-white/40 overflow-hidden relative">
          <div className="absolute w-full h-1/2 bg-white animate-[scrollLine_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}

/* ─── Services Bento Grid ────────────────────────────────────────────────── */
function Services() {
  const services = [
    {
      id: "passport",
      label: "Passport & ID",
      sub: "증명사진 / 여권사진",
      img: "/kmodel3.jpg",
      span: "md:col-span-1",
      tall: false,
    },
    {
      id: "headshot",
      label: "Corporate Headshot",
      sub: "비즈니스 프로필 사진",
      img: "/kmodel4.jpg",
      span: "md:col-span-1",
      tall: true,
    },
    {
      id: "hanbok",
      label: "Hanbok Portrait",
      sub: "한복 AI 포트레이트",
      img: "/hanbok_new.jpg",
      span: "md:col-span-2",
      tall: false,
    },
    {
      id: "body",
      label: "Body Profile",
      sub: "바디 프로필 사진",
      img: "/kmodel1.jpg",
      span: "md:col-span-1",
      tall: false,
    },
    {
      id: "linkedin",
      label: "LinkedIn & Social",
      sub: "링크드인 / SNS 프로필",
      img: "/kmodel2.jpg",
      span: "md:col-span-1",
      tall: false,
    },
  ];

  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-20">
      {/* Section header */}
      <div className="mb-10">
        <p className="text-[#c9a96e] text-xs tracking-widest uppercase font-medium mb-3">Services</p>
        <h2 className="font-display font-bold text-white text-4xl md:text-5xl leading-tight">
          What We Shoot
        </h2>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1: passport (tall left) + headshot (tall middle) + hanbok (wide right) */}
        <div className="group relative rounded-3xl overflow-hidden bg-[#161616] aspect-[3/4] cursor-pointer">
          <img
            src="/kmodel3.jpg"
            alt="Passport & ID"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-white font-display font-bold text-xl leading-tight">Passport & ID</p>
            <p className="text-white/50 text-xs mt-1">증명사진 / 여권사진</p>
          </div>
        </div>

        <div className="group relative rounded-3xl overflow-hidden bg-[#161616] aspect-[3/4] cursor-pointer">
          <img
            src="/kmodel4.jpg"
            alt="Corporate Headshot"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-white font-display font-bold text-xl leading-tight">Corporate Headshot</p>
            <p className="text-white/50 text-xs mt-1">비즈니스 프로필 사진</p>
          </div>
        </div>

        {/* Hanbok — stacked two cards */}
        <div className="flex flex-col gap-4">
          <div className="group relative rounded-3xl overflow-hidden bg-[#161616] aspect-video cursor-pointer flex-1">
            <img
              src="/hanbok_new.jpg"
              alt="Hanbok Portrait"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <p className="text-white font-display font-bold text-xl leading-tight">Hanbok Portrait</p>
              <p className="text-white/50 text-xs mt-1">한복 AI 포트레이트</p>
            </div>
          </div>

          <div className="group relative rounded-3xl overflow-hidden bg-[#161616] cursor-pointer" style={{ aspectRatio: "16/9" }}>
            <img
              src="/studio2.jpg"
              alt="Video Portrait"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <p className="text-white font-display font-bold text-xl leading-tight">Video Portrait</p>
              <p className="text-white/50 text-xs mt-1">AI 영상 포트레이트</p>
            </div>
          </div>
        </div>

        {/* Row 2: Body Profile + LinkedIn wide */}
        <div className="group relative rounded-3xl overflow-hidden bg-[#161616] cursor-pointer" style={{ aspectRatio: "3/4" }}>
          <img
            src="/kmodel1.jpg"
            alt="Body Profile"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-white font-display font-bold text-xl leading-tight">Body Profile</p>
            <p className="text-white/50 text-xs mt-1">바디 프로필 사진</p>
          </div>
        </div>

        <div className="md:col-span-2 group relative rounded-3xl overflow-hidden bg-[#161616] cursor-pointer" style={{ aspectRatio: "16/9" }}>
          <img
            src="/kmodel2.jpg"
            alt="LinkedIn & Social"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-white font-display font-bold text-xl leading-tight">LinkedIn & Social</p>
            <p className="text-white/50 text-xs mt-1">링크드인 / SNS 프로필</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats strip ────────────────────────────────────────────────────────── */
function Stats() {
  const stats = [
    { num: "50,000+", label: "Photos Generated" },
    { num: "4.9★", label: "Average Rating" },
    { num: "15 min", label: "Average Delivery" },
    { num: "99%", label: "Satisfaction Rate" },
  ];
  return (
    <section className="border-y border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.num}>
            <p className="font-display font-bold text-3xl text-white mb-1">{s.num}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Upload Your Photos",
      desc: "Send us 10–20 casual selfies. Any phone camera works fine.",
      ko: "일상 셀피 10–20장을 업로드하세요",
    },
    {
      n: "02",
      title: "Choose Your Style",
      desc: "Pick from passport, headshot, hanbok, body profile, or social.",
      ko: "원하는 스타일을 선택하세요",
    },
    {
      n: "03",
      title: "AI Does the Work",
      desc: "Our model trains on your face and generates studio-quality results.",
      ko: "AI가 스튜디오 수준의 사진을 만들어드립니다",
    },
    {
      n: "04",
      title: "Download & Use",
      desc: "Receive your photos within 15 minutes. Ready to use anywhere.",
      ko: "15분 이내에 완성된 사진을 다운로드하세요",
    },
  ];

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="text-[#c9a96e] text-xs tracking-widest uppercase font-medium mb-3">Process</p>
        <h2 className="font-display font-bold text-white text-4xl md:text-5xl">How It Works</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="bg-[#161616] border border-white/5 rounded-3xl p-6 flex flex-col gap-4"
          >
            <span className="text-[#c9a96e]/40 font-display font-bold text-5xl leading-none">{s.n}</span>
            <div>
              <p className="text-white font-semibold text-lg leading-snug mb-2">{s.title}</p>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
            <p className="text-white/20 text-xs mt-auto">{s.ko}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Marquee ────────────────────────────────────────────────────────────── */
function Marquee() {
  const items = [
    "Passport Photo",
    "증명사진",
    "Headshot",
    "비즈니스 사진",
    "Hanbok",
    "한복",
    "Body Profile",
    "바디 프로필",
    "LinkedIn",
    "링크드인",
    "AI Portrait",
    "AI 포트레이트",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="border-y border-white/5 py-5 overflow-hidden">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: "marquee 25s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-white/20 text-sm font-medium flex items-center gap-8">
            {item}
            <span className="text-[#c9a96e]/30 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Gallery ────────────────────────────────────────────────────────────── */
function Gallery() {
  const photos = [
    { src: "/kmodel1.jpg", label: "Body Profile" },
    { src: "/kmodel2.jpg", label: "LinkedIn" },
    { src: "/kmodel3.jpg", label: "Passport" },
    { src: "/kmodel4.jpg", label: "Headshot" },
    { src: "/hanbok_new.jpg", label: "Hanbok" },
    { src: "/studio2.jpg", label: "Portrait" },
  ];

  return (
    <section id="gallery" className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-10">
        <p className="text-[#c9a96e] text-xs tracking-widest uppercase font-medium mb-3">Gallery</p>
        <h2 className="font-display font-bold text-white text-4xl md:text-5xl">Recent Work</h2>
      </div>

      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {photos.map((p) => (
          <div
            key={p.src}
            className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-[#161616] cursor-pointer"
          >
            <img
              src={p.src}
              alt={p.label}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-white text-sm font-semibold">{p.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "₩29,000",
      desc: "Perfect for a single use case",
      features: ["1 style", "30 photos", "15 min delivery", "High-res download"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₩59,000",
      desc: "Most popular for professionals",
      features: ["3 styles", "100 photos", "Priority delivery", "Commercial license", "Retouch included"],
      highlight: true,
    },
    {
      name: "Studio",
      price: "₩99,000",
      desc: "For teams and agencies",
      features: ["All styles", "Unlimited photos", "Dedicated support", "API access", "White-label option"],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12 text-center">
        <p className="text-[#c9a96e] text-xs tracking-widest uppercase font-medium mb-3">Pricing</p>
        <h2 className="font-display font-bold text-white text-4xl md:text-5xl mb-4">Simple Pricing</h2>
        <p className="text-white/40 text-lg">No hidden fees. No subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl p-7 flex flex-col gap-6 border ${
              p.highlight
                ? "bg-[#c9a96e] border-[#c9a96e]"
                : "bg-[#161616] border-white/5"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#0a0a0a] text-xs font-bold px-4 py-1 rounded-full">
                POPULAR
              </div>
            )}
            <div>
              <p className={`font-semibold text-sm mb-1 ${p.highlight ? "text-[#0a0a0a]/60" : "text-white/40"}`}>
                {p.name}
              </p>
              <p className={`font-display font-bold text-4xl ${p.highlight ? "text-[#0a0a0a]" : "text-white"}`}>
                {p.price}
              </p>
              <p className={`text-sm mt-1 ${p.highlight ? "text-[#0a0a0a]/60" : "text-white/40"}`}>
                {p.desc}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${p.highlight ? "bg-[#0a0a0a]/15 text-[#0a0a0a]" : "bg-white/10 text-white/60"}`}>
                    ✓
                  </span>
                  <span className={`text-sm ${p.highlight ? "text-[#0a0a0a]" : "text-white/70"}`}>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className={`mt-auto text-center py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                p.highlight
                  ? "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              Get Started
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section id="contact" className="max-w-6xl mx-auto px-6 py-10 pb-20">
      <div className="relative rounded-3xl overflow-hidden bg-[#161616] border border-white/5 px-8 py-16 text-center">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#c9a96e]/8 blur-[80px]" />
        </div>

        <p className="text-[#c9a96e] text-xs tracking-widest uppercase font-medium mb-4">Get Started Today</p>
        <h2 className="font-display font-bold text-white text-4xl md:text-6xl leading-tight mb-4">
          Your Perfect Photo<br />Awaits.
        </h2>
        <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
          오늘 바로 시작하세요 — 15분 안에 완성됩니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="https://pf.kakao.com/_lumora"
            className="bg-[#FEE500] text-[#000000] font-bold px-8 py-4 rounded-2xl hover:bg-[#FFD700] transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>💬</span> KakaoTalk 문의
          </a>
          <a
            href="mailto:hello@lumora.ai"
            className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200 text-sm"
          >
            Email Us
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#c9a96e] flex items-center justify-center">
            <span className="text-[#0a0a0a] font-bold text-xs">L</span>
          </div>
          <span className="text-white/30 text-sm">Lumora AI Studio · Seoul</span>
        </div>

        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Instagram", "KakaoTalk"].map((item) => (
            <a key={item} href="#" className="text-white/20 hover:text-white/60 text-xs transition-colors">
              {item}
            </a>
          ))}
        </div>

        <p className="text-white/15 text-xs">© 2025 Lumora. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function IndexPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Marquee />
      <Services />
      <Stats />
      <HowItWorks />
      <Gallery />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
