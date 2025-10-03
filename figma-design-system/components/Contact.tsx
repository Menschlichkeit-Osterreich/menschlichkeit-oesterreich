import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    reason: ''
  });

  const contactReasons = [
    { value: 'general', label: 'Allgemeine Anfrage' },
    { value: 'volunteer', label: 'Ehrenamtliche Mitarbeit' },
    { value: 'partnership', label: 'Kooperationen & Partnerschaften' },
    { value: 'press', label: 'Presse & Medien' },
    { value: 'support', label: 'Hilfe & Unterstützung' },
    { value: 'donation', label: 'Spenden & Förderung' },
    { value: 'event', label: 'Event & Veranstaltung' }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'E-Mail',
      details: 'kontakt@tormenta.at',
      description: 'Schreibe uns für allgemeine Anfragen',
      action: 'E-Mail senden'
    },
    {
      icon: Phone,
      title: 'Telefon',
      details: '+43 1 234 5678',
      description: 'Mo-Fr 9:00-17:00 Uhr',
      action: 'Anrufen'
    },
    {
      icon: MapPin,
      title: 'Büro Wien',
      details: 'Musterstraße 123, 1010 Wien',
      description: 'Termine nach Vereinbarung',
      action: 'Route planen'
    }
  ];

  const quickActions = [
    {
      icon: Users,
      title: 'Mitglied werden',
      description: 'Werde Teil unserer Community',
      action: 'Zur Anmeldung',
      href: '#join'
    },
    {
      icon: MessageSquare,
      title: 'Support erhalten',
      description: 'Benötigst du Hilfe oder Beratung?',
      action: 'Hilfe anfragen',
      href: '#support'
    },
    {
      icon: Calendar,
      title: 'Termin buchen',
      description: 'Persönliches Beratungsgespräch',
      action: 'Termin vereinbaren',
      href: '#appointment'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">Kontakt</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hast du Fragen, Ideen oder möchtest du mit uns zusammenarbeiten? 
            Wir freuen uns von dir zu hören und helfen gerne weiter.
          </p>
        </motion.div>

        <div className="grid lg:grid-2 gap-12 mb-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Nachricht senden
                </CardTitle>
                <CardDescription>
                  Fülle das Formular aus und wir melden uns schnellstmöglich bei dir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Dein vollständiger Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="deine@email.at"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Grund der Anfrage</Label>
                    <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle eine Kategorie..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contactReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Worum geht es in deiner Nachricht?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Beschreibe dein Anliegen..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Nachricht senden
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Wir antworten normalerweise innerhalb von 24 Stunden
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl">Weitere Kontaktmöglichkeiten</h3>
            
            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{method.title}</h4>
                            <p className="text-foreground font-medium">{method.details}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            {method.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 pt-6">
              <h4 className="font-semibold">Schnelle Aktionen</h4>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm text-muted-foreground">{action.description}</div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={action.href}>{action.action}</a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Office Hours & Info */}
        <motion.div 
          className="grid md:grid-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Bürozeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Montag - Donnerstag</span>
                <span>9:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>Freitag</span>
                <span>9:00 - 15:00</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Samstag - Sonntag</span>
                <span>Geschlossen</span>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                Termine außerhalb der Bürozeiten nach Vereinbarung möglich
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Notfallkontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                Für dringende Angelegenheiten außerhalb der Bürozeiten:
              </p>
              <div className="space-y-1">
                <div className="font-medium">+43 664 123 4567</div>
                <div className="text-sm text-muted-foreground">24/7 Notfallhotline</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">notfall@tormenta.at</div>
                <div className="text-sm text-muted-foreground">Antwort innerhalb von 2 Stunden</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default Contact;