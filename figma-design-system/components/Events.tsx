import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

export function Events() {
  const events = [
    {
      id: 1,
      title: 'Menschenrechte-Workshop',
      description: 'Interaktiver Workshop über Grundrechte und wie wir sie schützen können',
      date: '2025-02-15',
      time: '14:00 - 17:00',
      location: 'Tormenta Zentrum, Wien',
      participants: 25,
      maxParticipants: 30,
      type: 'Workshop',
      price: 'Kostenlos',
      featured: true,
      image: 'https://images.unsplash.com/photo-1560220604-1985ebfe28b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBvcmdhbml6YXRpb24lMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc1ODU2MTM4NXww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 2,
      title: 'Solidarität in der Praxis',
      description: 'Praktische Ansätze für gesellschaftliche Solidarität und Gemeinschaftsbildung',
      date: '2025-02-22',
      time: '18:30 - 20:30',
      location: 'Online (Zoom)',
      participants: 45,
      maxParticipants: 50,
      type: 'Webinar',
      price: 'Kostenlos',
      featured: false,
      image: 'https://images.unsplash.com/photo-1722252799088-4781aabc3d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBldmVudCUyMGdhdGhlcmluZ3xlbnwxfHx8fDE3NTg1NjEzODV8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 3,
      title: 'Fundraising Gala 2025',
      description: 'Jährliche Benefizveranstaltung mit Dinner, Auktion und Live-Musik',
      date: '2025-03-08',
      time: '19:00 - 23:00',
      location: 'Palais Ferstel, Wien',
      participants: 150,
      maxParticipants: 200,
      type: 'Gala',
      price: '€125',
      featured: true,
      image: 'https://images.unsplash.com/photo-1637866482875-55ef85ca771d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZHMlMjBzb2xpZGFyaXR5fGVufDF8fHx8MTc1ODU2MTM4Nnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 4,
      title: 'Umweltgerechtigkeit Diskussion',
      description: 'Podiumsdiskussion über Klimawandel und soziale Gerechtigkeit',
      date: '2025-03-15',
      time: '19:00 - 21:00',
      location: 'Universität Wien',
      participants: 80,
      maxParticipants: 120,
      type: 'Diskussion',
      price: 'Kostenlos',
      featured: false,
      image: 'https://images.unsplash.com/photo-1758511718377-e23d0652e531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBqdXN0aWNlJTIwYWN0aXZpc218ZW58MXx8fHwxNzU4NTYxMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Webinar':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Gala':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Diskussion':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section id="events" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">Events & Veranstaltungen</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Besuche unsere Workshops, Diskussionen und Veranstaltungen. 
            Lerne neue Menschen kennen und werde Teil der Community.
          </p>
        </motion.div>

        <div className="grid lg:grid-2 gap-8 mb-12">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full overflow-hidden hover:shadow-lg transition-all duration-300 ${
                event.featured ? 'border-primary shadow-md' : ''
              }`}>
                {event.featured && (
                  <Badge className="absolute top-4 right-4 z-10 bg-yellow-100 text-yellow-800 border-yellow-200">
                    ⭐ Empfohlen
                  </Badge>
                )}
                
                <div className="relative">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <span className="font-semibold text-primary">{event.price}</span>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.participants}/{event.maxParticipants} Teilnehmer</span>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Button className="w-full group">
                    Anmelden
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center space-y-6 bg-gradient-to-br from-primary/5 to-muted/30 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl">Verpasse keine Events mehr</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Abonniere unseren Newsletter und erhalte rechtzeitig Informationen 
            über alle kommenden Veranstaltungen, Workshops und Events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Newsletter abonnieren</Button>
            <Button variant="outline" size="lg">Alle Events anzeigen</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Events;