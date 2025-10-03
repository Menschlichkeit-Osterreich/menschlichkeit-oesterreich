import { useState, useEffect } from 'react';
import { Menu, X, TreePine, Heart, UserPlus, LogIn, User, Shield, Lock, Settings, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';
import { motion, useScroll, useTransform } from 'motion/react';
import logoImage from 'figma:asset/c9f7e999815ef1162f13cea40237663e74f5240a.png';

interface NavigationProps {
  isAuthenticated: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'member' | 'moderator' | 'admin';
    membershipType: string;
  };
  onLogin: () => void;
  onProfile: () => void;
  onSecurity: () => void;
  onPrivacy: () => void;
  onLogout: () => void;
}

export function Navigation({ 
  isAuthenticated, 
  user, 
  onLogin, 
  onProfile, 
  onSecurity, 
  onPrivacy, 
  onLogout 
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  // Detect scroll for style changes
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Max 6 Hauptpunkte
  const navItems = [
    { href: '#home', label: 'Start' },
    { href: '#about', label: 'Über uns' },
    { href: '#democracy-hub', label: 'Democracy Games' },
    { href: '#forum', label: 'Forum' },
    { href: '#events', label: 'Events' },
    { href: '#contact', label: 'Kontakt' },
  ];

  // Admin access
  const toggleAdmin = () => {
    if (isAuthenticated && user?.role === 'admin') {
      setShowAdmin(!showAdmin);
      if (!showAdmin) {
        const adminSection = document.getElementById('admin-dashboard');
        if (adminSection) {
          adminSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      default: return 'Mitglied';
    }
  };

  return (
    <motion.nav
      style={{
        opacity: navOpacity,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass backdrop-blur-xl border-b border-border/40 shadow-lg' 
          : 'bg-background/80 backdrop-blur-md border-b border-border/20'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Kompakt & Modern */}
          <a 
            href="#home" 
            className="flex items-center gap-2 group"
            aria-label="Menschlichkeit Österreich - Zur Startseite"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all flex-shrink-0"
            >
              <img 
                src={logoImage} 
                alt="Menschlichkeit Österreich Logo" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-gradient">Menschlichkeit</span>
              <span className="text-xs text-brand-blue -mt-0.5">Österreich</span>
            </div>
          </a>

          {/* Command Palette (Desktop only) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <CommandPalette
              isAuthenticated={isAuthenticated}
              userRole={user?.role}
              onNavigate={(href) => {
                window.location.hash = href;
              }}
              onAction={(action) => {
                switch (action) {
                  case 'profile':
                    onProfile();
                    break;
                  case 'security':
                    onSecurity();
                    break;
                  case 'privacy':
                    onPrivacy();
                    break;
                  case 'logout':
                    onLogout();
                    break;
                  case 'toggle-theme':
                    // Theme toggle wird durch DarkModeToggle gehandhabt
                    break;
                }
              }}
            />
          </div>

          {/* Desktop Navigation - Max 6 Punkte */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground-muted hover:text-primary transition-colors duration-200 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gradient group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <div className="hidden md:block">
              <DarkModeToggle />
            </div>

            {/* Notification Center (only for logged-in users) */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <NotificationCenter userId={user?.email} />
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  {/* CTA 1: Mitmachen (Primary) */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <a href="#join">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Mitmachen
                    </a>
                  </Button>
                  
                  {/* CTA 2: Spenden (Prominent) */}
                  <Button 
                    size="sm" 
                    asChild 
                    className="btn-secondary-gradient shadow-md hover:shadow-lg"
                  >
                    <a href="#donate">
                      <Heart className="w-4 h-4 mr-2" />
                      Spenden
                    </a>
                  </Button>
                  
                  {/* Login */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogin}
                    className="hover:bg-primary/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Anmelden
                  </Button>
                </>
              ) : (
                <>
                  {/* CTA: Spenden (auch für eingeloggte User) */}
                  <Button 
                    size="sm" 
                    asChild 
                    className="btn-secondary-gradient shadow-md hover:shadow-lg"
                  >
                    <a href="#donate">
                      <Heart className="w-4 h-4 mr-2" />
                      Spenden
                    </a>
                  </Button>
                  
                  {/* Admin Button */}
                  {user?.role === 'admin' && (
                    <Button 
                      variant={showAdmin ? "default" : "ghost"} 
                      size="sm" 
                      onClick={toggleAdmin}
                      title="Admin-Bereich"
                      className="transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 hover:bg-primary/10"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden xl:inline text-sm">{user?.firstName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-3 py-2">
                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getRoleBadgeVariant(user?.role || 'member')} className="text-xs">
                            {getRoleLabel(user?.role || 'member')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user?.membershipType}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onProfile}>
                        <User className="w-4 h-4 mr-2" />
                        Mein Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onSecurity}>
                        <Shield className="w-4 h-4 mr-2" />
                        Sicherheit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onPrivacy}>
                        <Lock className="w-4 h-4 mr-2" />
                        Datenschutz
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                        <LogIn className="w-4 h-4 mr-2 rotate-180" />
                        Abmelden
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10"
                >
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className="w-full sm:w-[400px] p-0"
              >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
                      <TreePine className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-gradient">Menschlichkeit</span>
                      <span className="text-xs text-brand-blue -mt-0.5">Österreich</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DarkModeToggle />
                  </div>
                </div>

                {/* Mobile User Info (if logged in) */}
                {isAuthenticated && user && (
                  <div className="px-6 py-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            {getRoleLabel(user.role)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.membershipType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <nav className="px-4 py-6 space-y-1">
                  {navItems.map((item) => (
                    <SheetClose key={item.href} asChild>
                      <a
                        href={item.href}
                        className="flex items-center px-4 py-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors font-medium"
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                {/* Mobile CTAs */}
                <div className="px-6 py-4 border-t border-border space-y-3">
                  {!isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <Button 
                          variant="outline" 
                          asChild 
                          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <a href="#join">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Mitmachen
                          </a>
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button 
                          asChild 
                          className="w-full btn-secondary-gradient"
                        >
                          <a href="#donate">
                            <Heart className="w-4 h-4 mr-2" />
                            Spenden
                          </a>
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full" 
                          onClick={onLogin}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Anmelden
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button 
                          asChild 
                          className="w-full btn-secondary-gradient"
                        >
                          <a href="#donate">
                            <Heart className="w-4 h-4 mr-2" />
                            Spenden
                          </a>
                        </Button>
                      </SheetClose>
                      
                      {user?.role === 'admin' && (
                        <Button 
                          variant={showAdmin ? "default" : "outline"} 
                          className="w-full" 
                          onClick={() => {
                            toggleAdmin();
                            setIsOpen(false);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Admin-Bereich
                        </Button>
                      )}
                      
                      <div className="pt-3 border-t border-border space-y-2">
                        <SheetClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start" 
                            onClick={onProfile}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Mein Profil
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start" 
                            onClick={onSecurity}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Sicherheit
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start" 
                            onClick={onPrivacy}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Datenschutz
                          </Button>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={onLogout}
                          >
                            <LogIn className="w-4 h-4 mr-2 rotate-180" />
                            Abmelden
                          </Button>
                        </SheetClose>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;