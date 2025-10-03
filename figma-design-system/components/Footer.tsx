import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import logoImage from 'figma:asset/c9f7e999815ef1162f13cea40237663e74f5240a.png';

export function Footer() {
  const footerSections = [
    {
      title: 'Organisation',
      links: [
        { label: 'Über uns', href: '#about' },
        { label: 'Unsere Mission', href: '#mission' },
        { label: 'Team', href: '#team' },
        { label: 'Jahresberichte', href: '#reports' },
        { label: 'Transparenz', href: '#transparency' }
      ]
    },
    {
      title: 'Mitmachen',
      links: [
        { label: 'Mitglied werden', href: '#join' },
        { label: 'Spenden', href: '#donate' },
        { label: 'Ehrenamt', href: '#volunteer' },
        { label: 'Partnerschaften', href: '#partnerships' },
        { label: 'Veranstaltungen', href: '#events' }
      ]
    },
    {
      title: 'Themen',
      links: [
        { label: 'Menschenrechte', href: '#human-rights' },
        { label: 'Soziale Gerechtigkeit', href: '#social-justice' },
        { label: 'Bildung & Integration', href: '#education' },
        { label: 'Umwelt & Klima', href: '#environment' },
        { label: 'Alle Projekte', href: '#projects' }
      ]
    },
    {
      title: 'Service',
      links: [
        { label: 'Hilfe & Support', href: '#support' },
        { label: 'Beratung', href: '#counseling' },
        { label: 'Rechtshilfe', href: '#legal-aid' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Downloads', href: '#downloads' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/tormenta', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/tormenta', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/tormenta', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tormenta', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/tormenta', label: 'YouTube' }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-5 gap-8">
            {/* Brand & Newsletter */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                  <img 
                    src={logoImage} 
                    alt="Verein Menschlichkeit Österreich" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xl font-bold">Menschlichkeit</div>
                  <div className="text-sm opacity-80">Österreich</div>
                </div>
              </div>
              
              <p className="text-primary-foreground/80 max-w-sm">
                Gemeinnütziger Verein für soziale Gerechtigkeit, Menschenrechte 
                und demokratische Bildung in Österreich. Gemeinsam für eine menschlichere Gesellschaft.
              </p>

              {/* Newsletter Signup */}
              <div className="space-y-3">
                <h4 className="font-medium">Newsletter abonnieren</h4>
                <div className="flex gap-2 max-w-sm">
                  <Input
                    type="email"
                    placeholder="E-Mail Adresse"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  />
                  <Button variant="secondary" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-primary-foreground/60">
                  Monatliche Updates zu unserer Arbeit. Jederzeit abmeldbar.
                </p>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Contact Info */}
        <div className="py-8">
          <div className="grid md:grid-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-foreground/60" />
              <div>
                <div className="font-medium">Tormenta Österreich</div>
                <div className="text-sm text-primary-foreground/80">Musterstraße 123, 1010 Wien</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-foreground/60" />
              <div>
                <div className="font-medium">+43 1 234 5678</div>
                <div className="text-sm text-primary-foreground/80">Mo-Fr 9:00-17:00 Uhr</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-foreground/60" />
              <div>
                <div className="font-medium">kontakt@tormenta.at</div>
                <div className="text-sm text-primary-foreground/80">Antwort in 24h</div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-primary-foreground/80 text-center md:text-left">
              © 2025 Tormenta - Verein für Menschenrechte und soziale Gerechtigkeit. 
              Alle Rechte vorbehalten.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-xs text-primary-foreground/60">
            <a href="#impressum" className="hover:text-primary-foreground transition-colors">
              Impressum
            </a>
            <a href="#datenschutz" className="hover:text-primary-foreground transition-colors">
              Datenschutz
            </a>
            <a href="#agb" className="hover:text-primary-foreground transition-colors">
              AGB
            </a>
            <a href="#cookies" className="hover:text-primary-foreground transition-colors">
              Cookie-Einstellungen
            </a>
            <a href="#barrierefreiheit" className="hover:text-primary-foreground transition-colors">
              Barrierefreiheit
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}