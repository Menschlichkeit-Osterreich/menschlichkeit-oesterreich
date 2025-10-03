import { Calendar, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

export function News() {
  const newsItems = [
    {
      id: 1,
      title: 'Erfolgreiche Petition für bezahlbares Wohnen',
      excerpt: 'Unsere Kampagne für mehr Sozialwohnungen erreicht über 50.000 Unterschriften. Die Politik reagiert.',
      content: 'Nach monatelangem Engagement haben wir einen wichtigen Meilenstein erreicht...',
      date: '2025-01-15',
      readTime: '3 Min.',
      category: 'Erfolg',
      image: 'https://images.unsplash.com/photo-1560220604-1985ebfe28b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBvcmdhbml6YXRpb24lMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc1ODU2MTM4NXww&ixlib=rb-4.1.0&q=80&w=1080',
      featured: true
    },
    {
      id: 2,
      title: 'Neues Bildungsprogramm für Jugendliche',
      excerpt: 'Wir starten ein innovatives Mentoring-Programm für benachteiligte Jugendliche in Wien.',
      content: 'Das Programm wird jungen Menschen zwischen 14 und 20 Jahren helfen...',
      date: '2025-01-10',
      readTime: '2 Min.',
      category: 'Programm',
      image: 'https://images.unsplash.com/photo-1722252799088-4781aabc3d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBldmVudCUyMGdhdGhlcmluZ3xlbnwxfHx8fDE3NTg1NjEzODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      featured: false
    },
    {
      id: 3,
      title: 'Internationale Auszeichnung erhalten',
      excerpt: 'Tormenta wird von der UN für herausragende Menschenrechtsarbeit ausgezeichnet.',
      content: 'Diese Anerkennung bestätigt unsere konsequente Arbeit für Menschenrechte...',
      date: '2025-01-08',
      readTime: '4 Min.',
      category: 'Auszeichnung',
      image: 'https://images.unsplash.com/photo-1758511718377-e23d0652e531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBqdXN0aWNlJTIwYWN0aXZpc218ZW58MXx8fHwxNzU4NTYxMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      featured: false
    },
    {
      id: 4,
      title: 'Klimagerechtigkeit: Neue Initiative',
      excerpt: 'Gemeinsam mit anderen Organisationen starten wir eine Initiative für Klimagerechtigkeit.',
      content: 'Der Klimawandel trifft die Ärmsten am härtesten. Unsere neue Initiative...',
      date: '2025-01-05',
      readTime: '5 Min.',
      category: 'Initiative',
      image: 'https://images.unsplash.com/photo-1637866482875-55ef85ca771d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZHMlMjBzb2xpZGFyaXR5fGVufDF8fHx8MTc1ODU2MTM4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      featured: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-AT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Erfolg':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Programm':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Auszeichnung':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Initiative':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  return (
    <section id="news" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">News & Updates</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bleibe auf dem Laufenden über unsere aktuellen Projekte, Erfolge und Aktivitäten. 
            Hier erfährst du, was wir bewegen.
          </p>
        </motion.div>

        {/* Featured News */}
        {featuredNews && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden border-primary shadow-lg">
              <div className="grid lg:grid-2 gap-0">
                <div className="relative">
                  <ImageWithFallback
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 border-yellow-200">
                    ⭐ Featured
                  </Badge>
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline" className={getCategoryColor(featuredNews.category)}>
                        {featuredNews.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredNews.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredNews.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl">{featuredNews.title}</h3>
                    
                    <p className="text-muted-foreground text-lg">{featuredNews.excerpt}</p>
                    
                    <Button size="lg" className="group w-fit">
                      Weiterlesen
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Regular News Grid */}
        <div className="grid md:grid-2 lg:grid-3 gap-6 mb-12">
          {regularNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.excerpt}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.date)}
                  </div>

                  <Button variant="outline" className="w-full group">
                    Weiterlesen
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div 
          className="text-center space-y-6 bg-card rounded-2xl p-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl">Immer informiert bleiben</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verpasse keine wichtigen Updates! Abonniere unseren Newsletter und 
            erfahre als Erste*r von neuen Projekten, Erfolgen und Events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Deine E-Mail Adresse"
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button>Newsletter abonnieren</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Wir respektieren deine Privatsphäre. Jederzeit abmeldbar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default News;