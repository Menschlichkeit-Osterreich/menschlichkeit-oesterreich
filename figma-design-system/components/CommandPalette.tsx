import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import {
  Home,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  Mail,
  Gamepad2,
  Crown,
  Settings,
  User,
  Shield,
  Lock,
  LogOut,
  Moon,
  Sun,
  Search
} from 'lucide-react';

interface CommandPaletteProps {
  isAuthenticated: boolean;
  userRole?: string;
  onNavigate: (href: string) => void;
  onAction: (action: string) => void;
}

export function CommandPalette({
  isAuthenticated,
  userRole,
  onNavigate,
  onAction
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      {/* Trigger Button (optional, für Discovery) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Suche...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Wonach suchst du?" />
        <CommandList>
          <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#home'))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Start</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#about'))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Über uns</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#democracy-hub'))}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              <span>Democracy Games</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#forum'))}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Forum</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#events'))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Events</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#contact'))}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Kontakt</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Aktionen">
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#join'))}
            >
              <Crown className="mr-2 h-4 w-4" />
              <span>Mitglied werden</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('#donate'))}
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>Spenden</span>
            </CommandItem>
          </CommandGroup>

          {isAuthenticated && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Mein Profil">
                <CommandItem
                  onSelect={() => handleSelect(() => onAction('profile'))}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil öffnen</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => onAction('security'))}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Sicherheit</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => onAction('privacy'))}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Datenschutz</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => onAction('logout'))}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Admin">
                <CommandItem
                  onSelect={() => handleSelect(() => onNavigate('#admin-dashboard'))}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin-Dashboard</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          <CommandGroup heading="Einstellungen">
            <CommandItem
              onSelect={() => handleSelect(() => onAction('toggle-theme'))}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Theme wechseln</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default CommandPalette;