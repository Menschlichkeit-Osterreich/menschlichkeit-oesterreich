import { Scale, Home, Briefcase, GraduationCap, TreePine, Users2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';

export function Themes() {
  const themes = [
    {
      icon: Home,
      title: 'Familien in Notlagen',
      description: 'Unterstützung österreichischer Familien in schwierigen Lebenssituationen',
      topics: ['Finanzielle Hilfe', 'Beratung', 'Notfallunterstützung'],
      color: 'bg-red-100 text-red-800 border-red-200',
      priority: 'hoch'
    },
    {
      icon: GraduationCap,
      title: 'Bildung & Integration',
      description: 'Förderung von Bildungsangeboten und Integration in Österreich',
      topics: ['Deutschkurse', 'Bildungsprogramme', 'Integrationshilfe'],
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      priority: 'hoch'
    },
    {
      icon: Users2,
      title: 'Solidarische Gemeinschaft',
      description: 'Aufbau einer solidarischen Gemeinschaft in ganz Österreich',
      topics: ['Community Building', 'Nachbarschaftshilfe', 'Ehrenamt'],
      color: 'bg-green-100 text-green-800 border-green-200',
      priority: 'hoch'
    },
    {
      icon: Scale,
      title: 'Soziale Gerechtigkeit',
      description: 'Förderung sozialer Gerechtigkeit nach österreichischem Recht',
      topics: ['Rechtshilfe', 'Beratung', 'Advocacy'],
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      priority: 'mittel'
    },
    {
      icon: Briefcase,
      title: 'Digitale Vereinsarbeit',
      description: 'Moderne, digitale Vereinsführung mit DSGVO-Konformität',
      topics: ['Member-Dashboard', 'SEPA-Integration', 'Datenschutz'],
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      priority: 'mittel'
    },
    {
      icon: TreePine,
      title: 'Österreichweite Präsenz',
      description: 'Aufbau einer österreichweiten Präsenz und Partnerschaften',
      topics: ['Regionale Gruppen', 'Partnerschaften', 'Netzwerk'],
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      priority: 'mittel'
    }
  ];

  return (
    <section id="themes" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">Unsere Arbeitsbereiche</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Als Verein nach österreichischem Recht konzentrieren wir uns auf konkrete 
            Hilfsprojekte und den Aufbau einer solidarischen Gemeinschaft in ganz Österreich.
          </p>
        </motion.div>

        <div className="grid md:grid-2 lg:grid-3 gap-6 mb-12">
          {themes.map((theme, index) => {
            const Icon = theme.icon;
            return (
              <motion.div
                key={theme.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={theme.priority === 'hoch' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                      >
                        {theme.priority === 'hoch' ? '🔥 Priorität' : 'Aktiv'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{theme.title}</CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {theme.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className={theme.color}>
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full group">
                        Mehr erfahren
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center space-y-6 bg-muted/50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl">Gemeinsam für Menschlichkeit in Österreich</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unsere Arbeitsbereiche zeigen, wie vielfältig die Möglichkeiten sind, 
            Menschlichkeit zu fördern. Werde Mitglied und unterstütze unsere Mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <a href="#join">Mitglied werden</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#contact">Mehr Informationen</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}