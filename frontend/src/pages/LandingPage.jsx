import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Gift,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Users,
  BarChart3,
  Fingerprint,
  Scan,
} from "lucide-react";

// --- Custom Magnetic Interaction Component ---
const Magnetic = ({ children, className }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Custom Scanner Background Component ---
const ScannerBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      {/* 1. Subtle Engineering Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "4vw 4vw",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 80%)",
        }}
      />

      {/* 2. Sweeping "Scanner" Laser Line */}
      <motion.div
        animate={{ y: ["-60vh", "60vh", "-60vh"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute w-[200vw] h-[1px] bg-white opacity-30 shadow-[0_0_30px_3px_rgba(255,255,255,0.8)] z-0"
      />

      {/* 3. Center Viewfinder (Mobile & Desktop scaling) */}
      <div className="absolute w-[80vw] h-[50vh] md:w-[40vw] md:h-[60vh] opacity-20 relative flex items-center justify-center">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-[1px] border-l-[1px] border-white" />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-12 h-12 border-t-[1px] border-r-[1px] border-white" />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[1px] border-l-[1px] border-white" />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[1px] border-r-[1px] border-white" />

        {/* Subtle Central Target */}
        <Scan className="w-16 h-16 text-white opacity-10 animate-pulse" />
      </div>
    </div>
  );
};

// --- Custom Easing ---
const customEase = [0.16, 1, 0.3, 1];

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Parallax calculations
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleCTA = useTransform(scrollYProgress, [0.8, 1], [0.8, 1]);

  const brandLogos = [
    { src: "src/assets/brands/1.png", alt: "Babal", code: "Fashion" },
    { src: "src/assets/brands/2.png", alt: "Kafemandu", code: "Franchise" },
    { src: "src/assets/brands/3.png", alt: "Himalayan Java", code: "Cafe" },
    { src: "src/assets/brands/4.png", alt: "Donut Drool", code: "Food" },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-[#E5E5E5] font-sans selection:bg-white selection:text-black overflow-hidden"
    >
      {/* --- Ultra-Minimal Nav --- */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: customEase }}
        className="fixed top-0 w-full z-[100] px-4 md:px-6 py-4 md:py-6 mix-blend-difference flex justify-between items-center"
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-white p-1.5 rounded-full group-hover:scale-110 transition-transform duration-500">
            <Gift className="h-4 w-4 md:h-5 md:w-5 text-black" />
          </div>
          <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
            GiftVault
          </span>
        </div>

        <div className="hidden md:flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em]">
          <a
            href="#platform"
            className="hover:text-white text-[#888] transition-colors"
          >
            Platform
          </a>
          <a
            href="#vendors"
            className="hover:text-white text-[#888] transition-colors"
          >
            Vendors
          </a>
        </div>

        <Magnetic>
          <a
            href="/auth"
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/10 hover:bg-white hover:text-black backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-full transition-all duration-500 border border-white/10"
          >
            Sign In{" "}
            <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 hidden sm:block" />
          </a>
        </Magnetic>
      </motion.nav>

      <main>
        {/* --- Hero: Kinetic Typography & Scanner BG --- */}
        <section className="relative h-[100svh] flex flex-col justify-end pb-12 md:pb-20 px-4 md:px-12 z-10 overflow-hidden">
          {/* Inject the Scanner Background Here */}
          <ScannerBackground />

          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="max-w-[1400px] mx-auto w-full relative z-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-8 md:mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-mono text-[#888] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  <span>Secure Voucher Distribution</span>
                </div>
                <h1 className="text-[18vw] md:text-[9vw] font-black tracking-tighter leading-[0.85] uppercase">
                  Smart <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#444]">
                    Vouchers.
                  </span>
                </h1>
              </div>

              <div className="max-w-sm w-full">
                <p className="text-[#888] text-xs md:text-base leading-relaxed font-medium mb-6 md:mb-8">
                  The premium infrastructure for brands to create, distribute,
                  and track digital gift cards securely. Zero fraud, absolute
                  control.
                </p>
                <Magnetic>
                  <a
                    href="/register"
                    className="group flex items-center justify-between w-full border border-white/20 rounded-full p-1.5 pr-5 hover:border-white transition-colors duration-500 bg-black/40 backdrop-blur-md"
                  >
                    <div className="bg-white text-black rounded-full p-3 md:p-4 group-hover:scale-95 transition-transform duration-500">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:-rotate-45 transition-transform duration-500" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white">
                      Start Issuing
                    </span>
                  </a>
                </Magnetic>
              </div>
            </div>

            {/* Architectural Bottom Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: customEase, delay: 0.5 }}
              className="w-full h-[1px] bg-gradient-to-r from-white via-white/20 to-transparent origin-left"
            />
          </motion.div>
        </section>

        {/* --- Architecture: High-End Bento Grid --- */}
        <section
          id="platform"
          className="py-24 md:py-32 px-4 md:px-12 relative z-10 bg-[#050505]"
        >
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-[10px] font-mono text-[#888] uppercase tracking-[0.4em] mb-8 md:mb-12">
              Core Capabilities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              {/* Massive Feature */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: customEase }}
                className="md:col-span-8 group relative bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 overflow-hidden hover:border-white/30 transition-colors duration-700 h-[350px] md:h-[500px] flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-white mb-8" />
                <div className="relative z-10">
                  <h3 className="text-3xl md:text-6xl font-black tracking-tighter mb-3 md:mb-4 uppercase">
                    Fraud-Proof <br />
                    Redemption
                  </h3>
                  <p className="text-[#888] text-xs md:text-lg max-w-md">
                    Bank-grade AES-256 encryption guarantees every voucher is
                    unique. Real-time verification prevents duplication at the
                    point of sale.
                  </p>
                </div>
              </motion.div>

              {/* Data Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
                className="md:col-span-4 bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 text-black flex flex-col justify-between h-[300px] md:h-[500px] group"
              >
                <Zap className="w-8 h-8 md:w-10 md:h-10 opacity-50 group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                <div>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    Instant <br />
                    Delivery
                  </h3>
                  <p className="font-bold uppercase tracking-widest text-[9px] md:text-[10px] border-t border-black/20 pt-3 md:pt-4 mt-3 md:mt-4 text-[#444]">
                    Generate & Send via SMS/Email
                  </p>
                </div>
              </motion.div>

              {/* Wide System Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: customEase, delay: 0.2 }}
                className="md:col-span-12 bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-white/30 transition-colors duration-700 gap-6"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="bg-[#111] border border-white/10 p-3 md:p-4 rounded-2xl group-hover:bg-white group-hover:text-black transition-colors duration-500">
                    <Users className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
                      Multi-Vendor Ecosystem
                    </h3>
                    <p className="text-[#888] text-xs md:text-sm">
                      Dedicated portals for Admins, Managers, and Customers.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-white font-bold tracking-widest uppercase text-xs">
                      Analytics Tracking
                    </span>
                    <span className="text-[#666] text-[10px] uppercase tracking-widest">
                      Real-time reports
                    </span>
                  </div>
                  <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-[#555]" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Network: Hover-Reveal Brands --- */}
        <section
          id="vendors"
          className="py-24 md:py-32 px-4 md:px-12 bg-[#0A0A0A]"
        >
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-12 md:mb-20 leading-none">
              Trusted by <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#444]">
                Premium Brands.
              </span>
            </h2>

            <div className="border-t border-white/10">
              {brandLogos.map((brand, i) => (
                <div
                  key={i}
                  className="group border-b border-white/10 py-6 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white hover:text-black transition-colors duration-500 px-4 md:px-6 cursor-pointer gap-4 md:gap-0"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full md:w-auto">
                    <span className="text-[#666] group-hover:text-[#999] font-mono text-xs md:text-sm transition-colors">
                      {brand.code}
                    </span>
                    <h3 className="text-2xl md:text-5xl font-black uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500 ease-out">
                      {brand.alt}
                    </h3>
                  </div>

                  {/* Hidden Image that reveals and scales on hover */}
                  <div className="overflow-hidden rounded-xl h-16 w-32 md:h-20 md:w-40 flex items-center justify-start md:justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 md:group-hover:-translate-x-4">
                    <img
                      src={brand.src}
                      alt={brand.alt}
                      className="object-contain h-full w-full filter brightness-100 md:brightness-0 md:scale-125 md:group-hover:scale-100 transition-transform duration-700 ease-out"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA: Parallax Scale --- */}
        <section className="py-24 md:py-32 px-4 md:px-12 overflow-hidden bg-[#050505]">
          <motion.div
            style={{ scale: scaleCTA }}
            className="max-w-[1400px] mx-auto bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-32 text-center text-black flex flex-col items-center justify-center relative origin-bottom"
          >
            <Gift className="w-10 h-10 md:w-16 md:h-16 mb-6 md:mb-8" />
            <h2 className="text-4xl md:text-[7vw] font-black tracking-tighter uppercase leading-[0.9] md:leading-[0.85] mb-8 md:mb-12">
              Modernize Your <br /> Gifting.
            </h2>
            <Magnetic>
              <a
                href="/register"
                className="inline-flex items-center justify-center bg-black text-white h-16 md:h-20 px-10 md:px-16 rounded-full text-sm md:text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-500 active:scale-95 shadow-2xl"
              >
                Create Your Vault
              </a>
            </Magnetic>
          </motion.div>
        </section>
      </main>

      {/* --- Brutalist Footer --- */}
      <footer className="border-t border-white/10 pt-16 md:pt-20 pb-8 md:pb-10 px-4 md:px-12 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-4 md:mb-6 flex items-center gap-3">
              <Gift className="w-6 h-6 md:w-8 md:h-8" /> GiftVault
            </h3>
            <p className="text-[#666] text-xs md:text-sm max-w-xs font-medium">
              Kathmandu, Bagmati Province, Nepal.
              <br />
              Secure Digital Vouchers.
            </p>
          </div>

          <div className="flex gap-12 md:gap-16 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]">
            <div className="flex flex-col gap-3 md:gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Platform
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Vendors
              </a>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto mt-16 md:mt-20 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[9px] md:text-[10px] font-mono text-[#555]">
          <p>© {new Date().getFullYear()} GIFTVAULT. ALL RIGHTS RESERVED.</p>
          <p>
            SYSTEM STATUS: <span className="text-white">OPERATIONAL</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
