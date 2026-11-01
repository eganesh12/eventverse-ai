import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "API Docs", href: "/docs" },
  ],
  "Event Types": [
    { label: "Weddings", href: "/events/wedding" },
    { label: "Corporate Events", href: "/events/corporate" },
    { label: "College Fests", href: "/events/college" },
    { label: "Birthday Parties", href: "/events/birthday" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">EventVerse AI</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Intelligent event planning powered by multi-agent AI. Plan any event, anywhere.
            </p>
            <div className="mt-4 flex gap-3">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {category}
              </div>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 EventVerse AI. All rights reserved. Built with ❤️ in India.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-slate-600">INR · English · India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
