import { ArrowRight, Play, Heart, Users, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/c9f7e999815ef1162f13cea40237663e74f5240a.png';

export function Hero() {
  return (
    <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
      {/* Enhanced background with Austria-inspired gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-secondary-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/80 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-gradient opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Content */}
          <motion.div 
            className="space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-4">
                  🇦🇹 Gemeinnütziger Verein nach österreichischem Recht
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl tracking-tight leading-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="block">Menschlichkeit</span>
                <span className="block text-gradient bg-brand-gradient bg-clip-text text-transparent">in Österreich</span>
                <span className="block">leben</span>
              </motion.h1>
              
              <motion.p 
                className="lead text-foreground-muted max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Unser Verein fördert soziale Gerechtigkeit und Menschlichkeit in ganz Österreich. 
                Gemeinsam unterstützen wir bedürftige Personen, stärken den gesellschaftlichen Zusammenhalt 
                und bauen eine solidarische Gemeinschaft für alle auf.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button size="lg" asChild className="btn-secondary-gradient group">
                <a href="#join">
                  <Heart className="mr-2 w-5 h-5" />
                  Jetzt Mitglied werden
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <a href="#about">
                  <Play className="mr-2 w-4 h-4" />
                  Unsere Mission erfahren
                </a>
              </Button>
            </motion.div>

            {/* Enhanced Stats with icons */}
            <motion.div 
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Users className="w-5 h-5 text-brand-blue" />
                  <div className="text-3xl font-bold text-gradient">500+</div>
                </div>
                <div className="small">Mitglieder bis 2025</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Heart className="w-5 h-5 text-brand-orange" />
                  <div className="text-3xl font-bold text-gradient">25+</div>
                </div>
                <div className="small">Hilfsprojekte geplant</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Award className="w-5 h-5 text-brand-red" />
                  <div className="text-3xl font-bold text-gradient">€50k+</div>
                </div>
                <div className="small">Spendenziel 2025</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Logo & Image Section */}
          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo Card */}
            <motion.div 
              className="card-elevated p-8 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="relative inline-block">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <img 
                    src={logoImage} 
                    alt="Verein Menschlichkeit Österreich Logo" 
                    className="w-48 h-48 mx-auto rounded-2xl shadow-brand-lg hover:shadow-brand transition-shadow"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
                </motion.div>
                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="bg-success text-success-foreground shadow-success">
                    Gemeinnützig
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Badge className="bg-brand-blue text-white">
                    🇦🇹 Österreich
                  </Badge>
                </motion.div>
              </div>
            </motion.div>

            <div className="relative card-modern overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1741715952535-27855fe398e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXN0cmlhJTIwdmllbm5hJTIwbGFuZHNjYXBlJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc1ODU2MjU1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Österreich Wien - Solidarität und Menschlichkeit"
                className="w-full h-[400px] object-cover"
              />
              
              {/* Enhanced overlay with Austria flag inspiration */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-2 austria-border" />
              
              {/* Floating badges */}
              <motion.div 
                className="absolute top-6 left-6 glass rounded-xl p-4 text-white"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <div className="font-semibold">Österreichweit aktiv</div>
                    <div className="text-xs opacity-90">Wien, Graz, Linz, Salzburg</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-6 right-6 glass rounded-xl p-4 text-white"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="font-semibold">Hilfe die ankommt</div>
                    <div className="text-xs opacity-90">Transparent & direkt</div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-20 h-20">
                <div className="absolute inset-0 bg-brand-gradient opacity-20 transform rotate-45 translate-x-10 -translate-y-10" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}