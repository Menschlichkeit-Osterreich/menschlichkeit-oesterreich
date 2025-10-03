import { CheckCircle, Users, Calendar, MessageSquare, Crown, Star, Heart, RefreshCw, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { useAppState } from './AppStateManager';

export function Join() {
  const { state, openModal } = useAppState();
  const membershipTypes = [
    {
      title: 'Fördermitgliedschaft',
      price: '€10+',
      period: 'pro Monat',
      description: 'Unterstützung des Vereins mit flexiblem Beitrag',
      features: [
        'Flexibler Beitrag ab €10 monatlich',
        'Unterstützung des Vereins',
        'Newsletter und Updates',
        'Anpassbare Beitragshöhe',
        'SEPA-Lastschrift möglich'
      ],
      buttonText: 'Fördermitglied werden',
      popular: false,
      icon: Heart
    },
    {
      title: 'Ordentliche Mitgliedschaft',
      price: '€20-50',
      period: 'pro Monat',
      description: 'Vollzugriff nach Selbsteinschätzung',
      features: [
        'Beitrag €20-50 nach Selbsteinschätzung',
        'Vollzugriff auf alle Services',
        'Stimmrecht bei Entscheidungen',
        'Member-Dashboard Zugang',
        'SEPA-Lastschrift Integration',
        'Steuerliche Absetzbarkeit'
      ],
      buttonText: 'Mitglied werden',
      popular: true,
      icon: Crown
    },
    {
      title: 'Ehrenmitgliedschaft',
      price: 'Beitragsfrei',
      period: 'auf Lebenszeit',
      description: 'Für besondere Verdienste um den Verein',
      features: [
        'Beitragsfrei auf Lebenszeit',
        'Besondere Verdienste erforderlich',
        'Alle Rechte und Vorteile',
        'Exklusiver Status',
        'Persönliche Würdigung'
      ],
      buttonText: 'Auf Einladung',
      popular: false,
      icon: Star,
      disabled: true
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: 'SEPA-Integration',
      description: 'Automatische Beiträge für österreichische Banken',
      action: 'Payment System'
    },
    {
      icon: Calendar,
      title: 'Member-Dashboard',
      description: 'Vollständige Profilverwaltung und Übersicht',
      action: 'Digital Platform'
    },
    {
      icon: MessageSquare,
      title: 'DSGVO-konform',
      description: 'Rechtssichere Datenschutz-Implementierung',
      action: 'Privacy Protection'
    },
    {
      icon: Crown,
      title: 'Transparenz',
      description: '70% Hilfsprojekte, 20% Verwaltung, 10% Rücklagen',
      action: 'Financial Transparency'
    }
  ];

  return (
    <section id="join" className="py-20 bg-gradient-to-br from-primary/5 to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">Mitgliedschaft</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Werde Teil von Menschlichkeit Österreich und unterstütze unsere Mission. 
            Wähle die Mitgliedschaftsart, die zu deinen Möglichkeiten und Wünschen passt.
          </p>
        </motion.div>

        {/* Membership Types */}
        <div className="grid md:grid-3 gap-6 mb-16">
          {membershipTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full relative ${type.popular ? 'border-2 border-gradient-to-r from-orange-500 to-red-600 shadow-lg scale-105' : ''} ${type.disabled ? 'opacity-75' : ''}`}>
                {type.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                    ⭐ Empfohlen
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {type.icon && <type.icon className="w-6 h-6 text-white" />}
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{type.price}</span>
                      {type.period !== 'auf Lebenszeit' && type.period !== 'kostenlos' && (
                        <span className="text-muted-foreground">/{type.period.split(' ')[1]}</span>
                      )}
                    </div>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${type.popular ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' : ''}`}
                    variant={type.popular ? 'default' : 'outline'}
                    size="lg"
                    disabled={type.disabled}
                    onClick={() => {
                      if (state.isAuthenticated) {
                        openModal('sepa');
                      } else {
                        openModal('auth', 'register');
                      }
                    }}
                  >
                    {type.buttonText}
                  </Button>
                  
                  {!state.isAuthenticated && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      <span>SEPA-Lastschrift verfügbar</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Membership Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl text-center mb-8">Vorteile unserer Mitgliedschaft</h3>
          <div className="grid md:grid-2 lg:grid-4 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {benefit.action}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center space-y-6 bg-card rounded-2xl p-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl">Noch Fragen?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unser Team steht dir gerne zur Verfügung, um alle deine Fragen zu beantworten 
            und dir bei der Auswahl der passenden Mitgliedschaft zu helfen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <a href="#contact">Kontakt aufnehmen</a>
            </Button>
            <Button size="lg" asChild>
              <a href="#donate">Direkt spenden</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Join;