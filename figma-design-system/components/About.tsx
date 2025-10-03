import { Heart, Users, TreePine, Shield, GraduationCap, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

export function About() {
  const activities = [
    {
      icon: Heart,
      title: 'Soziale Unterstützung',
      description: 'Direkte Hilfe für bedürftige Personen und Familien in ganz Österreich durch gezielte Unterstützungsmaßnahmen.',
      color: 'text-brand-red bg-brand-red/10'
    },
    {
      icon: GraduationCap,
      title: 'Bildung & Integration',
      description: 'Förderung von Bildungsangeboten und Integration für alle Gesellschaftsschichten mit nachhaltigen Programmen.',
      color: 'text-brand-blue bg-brand-blue/10'
    },
    {
      icon: Home,
      title: 'Familien in Notlagen',
      description: 'Unterstützung von Familien in schwierigen Lebenssituationen mit konkreten, schnellen Hilfsmaßnahmen.',
      color: 'text-brand-orange bg-brand-orange/10'
    },
    {
      icon: Users,
      title: 'Solidarische Gemeinschaft',
      description: 'Aufbau und Förderung einer solidarischen Gemeinschaft in ganz Österreich für nachhaltige Veränderung.',
      color: 'text-primary bg-primary/10'
    }
  ];

  return (
    <section id="about" className="section-padding bg-background-alt">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full">
            <Shield className="w-4 h-4" />
            <span className="small font-medium">Gemeinnützig & Transparent</span>
          </div>
          <h2 className="text-balance">
            Über <span className="text-gradient">Menschlichkeit Österreich</span>
          </h2>
          <p className="lead max-w-4xl mx-auto text-balance">
            Als gemeinnütziger Verein nach österreichischem Vereinsrecht fördern wir Menschlichkeit und soziale Gerechtigkeit 
            in ganz Österreich. Unser Ziel ist es, eine solidarische Gesellschaft aufzubauen, in der alle Menschen 
            die Unterstützung erhalten, die sie benötigen.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Enhanced Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative card-modern overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1697665387559-253e7a645e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzdXBwb3J0JTIwaGVscGluZyUyMGhhbmRzJTIwc29saWRhcml0eXxlbnwxfHx8fDE3NTg1NjI1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Gemeinschaftsunterstützung helfende Hände Solidarität"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Floating stats */}
              <motion.div 
                className="absolute bottom-6 left-6 glass rounded-xl p-4 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <div className="font-semibold">Seit 2024 aktiv</div>
                    <div className="text-xs opacity-90">Österreichweit vernetzt</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <h3 className="mb-4">Unser <span className="text-gradient">Vereinszweck</span></h3>
              <div className="space-y-4">
                <p>
                  Menschlichkeit Österreich wurde mit dem klaren Ziel gegründet, die Förderung der 
                  Menschlichkeit und sozialen Gerechtigkeit in Österreich voranzutreiben. Als 
                  eingetragener Verein nach österreichischem Vereinsrecht arbeiten wir systematisch 
                  an der Unterstützung bedürftiger Personen und dem Aufbau einer solidarischen Gemeinschaft.
                </p>
                <p>
                  Unser digitales System ermöglicht es uns, effizient zu arbeiten: Mit DSGVO-konformer 
                  Datenschutz-Implementierung, modernem Member-Dashboard und SEPA-Integration für 
                  österreichische Banken schaffen wir einen nachhaltigen Vereinsbetrieb.
                </p>
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
              <h4 className="text-primary mb-4 flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Unsere Ziele für 2025
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>500+ aktive Mitglieder bis Jahresende</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-orange rounded-full" />
                  <span>€50.000+ Spendenziel für Hilfsprojekte</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-red rounded-full" />
                  <span>25+ regelmäßige Hilfsprojekte österreichweit</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>100% Digitalisierung aller Vereinsprozesse</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Activities Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center mb-16">
            <h3 className="mb-4">Unsere <span className="text-gradient">Aktivitäten</span></h3>
            <p className="lead max-w-2xl mx-auto">
              Von sozialer Unterstützung bis hin zu Bildungsförderung - wir sind in verschiedenen 
              Bereichen aktiv, um nachhaltige positive Veränderungen zu bewirken.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="h-full card-modern group-hover:scale-105 transition-all duration-300">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className={`w-16 h-16 ${activity.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${activity.color.split(' ')[0]}`} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg">{activity.title}</h4>
                        <p className="text-foreground-muted leading-relaxed">{activity.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}