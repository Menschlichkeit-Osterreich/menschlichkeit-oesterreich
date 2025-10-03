# Component Usage Guide - Menschlichkeit Österreich Design System

## 📦 Component Library Import Patterns

Alle Components des Design Systems können über **Workspace-Imports** verwendet werden:

```tsx
import { Button, Card, Alert } from '@menschlichkeit/design-system';
```

---

## 🎨 shadcn/ui Components (48 verfügbar)

### Accordion

Zusammenklappbare Inhalts-Sections mit Animationen.

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@menschlichkeit/design-system';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Was ist Menschlichkeit Österreich?</AccordionTrigger>
    <AccordionContent>
      Ein gemeinnütziger Verein für soziale Gerechtigkeit und Menschenrechte.
    </AccordionContent>
  </AccordionItem>
</Accordion>;
```

---

### Alert & Alert Dialog

Wichtige Benachrichtigungen und modale Bestätigungsdialoge.

```tsx
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@menschlichkeit/design-system';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Fehler</AlertTitle>
  <AlertDescription>
    Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.
  </AlertDescription>
</Alert>;
```

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@menschlichkeit/design-system';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Konto löschen</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
      <AlertDialogDescription>
        Diese Aktion kann nicht rückgängig gemacht werden.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
      <AlertDialogAction>Löschen</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

---

### Avatar

Nutzer-Profilbilder mit Fallback-Initialen.

```tsx
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@menschlichkeit/design-system';

<Avatar>
  <AvatarImage src="/avatars/user.jpg" alt="Max Mustermann" />
  <AvatarFallback>MM</AvatarFallback>
</Avatar>;
```

---

### Badge

Kleine Labels für Status, Kategorien, Tags.

```tsx
import { Badge } from '@menschlichkeit/design-system';

<Badge variant="default">Austrian Red</Badge>
<Badge variant="secondary">Orange</Badge>
<Badge variant="destructive">Fehler</Badge>
<Badge variant="outline">Outline</Badge>
```

**Varianten**:

- `default` - Austrian Red Hintergrund (#c8102e)
- `secondary` - Orange/Red Gradient
- `destructive` - Rot für Fehler
- `outline` - Transparenter Hintergrund mit Border

---

### Button

Primäre Interaktionselemente in verschiedenen Varianten.

```tsx
import { Button } from '@menschlichkeit/design-system';

// Primär (Austrian Red)
<Button variant="default">Jetzt Mitglied werden</Button>

// Sekundär
<Button variant="secondary">Mehr erfahren</Button>

// Outline
<Button variant="outline">Details anzeigen</Button>

// Ghost (transparent)
<Button variant="ghost">Navigation</Button>

// Link-Style
<Button variant="link">Externer Link</Button>

// Destructive
<Button variant="destructive">Löschen</Button>

// Größen
<Button size="sm">Klein</Button>
<Button size="default">Standard</Button>
<Button size="lg">Groß</Button>
<Button size="icon"><Icon /></Button>
```

**Props**:

- `variant`: `default | secondary | destructive | outline | ghost | link`
- `size`: `default | sm | lg | icon`
- `asChild`: Rendert als Child-Element (für `<Link>` etc.)

---

### Card

Container für gruppierte Inhalte mit Header/Footer.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@menschlichkeit/design-system';

<Card>
  <CardHeader>
    <CardTitle>Mitgliedschaft</CardTitle>
    <CardDescription>Werde Teil unserer Bewegung</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Ab 5€ pro Monat unterstützen Sie unsere Arbeit.</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Details</Button>
    <Button>Jetzt beitreten</Button>
  </CardFooter>
</Card>;
```

**Styling Patterns**:

```tsx
// Mit Austrian Red Akzent
<Card className="border-l-4 border-l-primary">
  ...
</Card>

// Gradient Card
<Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
  ...
</Card>

// Hover Effect
<Card className="transition-all hover:shadow-lg hover:scale-105">
  ...
</Card>
```

---

### Checkbox

Mehrfachauswahl-Elemente.

```tsx
import { Checkbox } from '@menschlichkeit/design-system';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    Ich akzeptiere die Datenschutzerklärung
  </label>
</div>;
```

---

### Dialog & Drawer

Modale Dialoge und Drawer für mobile/desktop.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@menschlichkeit/design-system';

<Dialog>
  <DialogTrigger asChild>
    <Button>Profil bearbeiten</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Profil bearbeiten</DialogTitle>
      <DialogDescription>
        Ändern Sie Ihre Profilinformationen.
      </DialogDescription>
    </DialogHeader>
    {/* Form Content */}
    <DialogFooter>
      <Button type="submit">Speichern</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@menschlichkeit/design-system';

// Mobile-optimiert (von unten)
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Menü öffnen</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Navigation</DrawerTitle>
    </DrawerHeader>
    {/* Menu Items */}
    <DrawerFooter>
      <DrawerClose>
        <Button variant="outline">Schließen</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>;
```

---

### Dropdown Menu

Kontextmenüs für Aktionen.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@menschlichkeit/design-system';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Optionen</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Konto</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Profil</DropdownMenuItem>
      <DropdownMenuItem>Einstellungen</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">Abmelden</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

---

### Form (React Hook Form Integration)

Formulare mit Validierung und Fehlerbehandlung.

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@menschlichkeit/design-system';
import { Input } from '@menschlichkeit/design-system';
import { Button } from '@menschlichkeit/design-system';

const formSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
});

function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', name: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Max Mustermann" {...field} />
              </FormControl>
              <FormDescription>Ihr vollständiger Name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="max@beispiel.at" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Absenden</Button>
      </form>
    </Form>
  );
}
```

---

### Input & Textarea

Text-Eingabefelder.

```tsx
import { Input } from '@menschlichkeit/design-system';
import { Textarea } from '@menschlichkeit/design-system';

<div className="space-y-4">
  <Input
    type="text"
    placeholder="Name"
    className="border-primary focus:ring-primary"
  />

  <Input type="email" placeholder="E-Mail" />

  <Textarea placeholder="Ihre Nachricht..." rows={5} />
</div>;
```

---

### Select

Dropdown-Auswahl.

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@menschlichkeit/design-system';

<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Land auswählen" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Europa</SelectLabel>
      <SelectItem value="at">Österreich</SelectItem>
      <SelectItem value="de">Deutschland</SelectItem>
      <SelectItem value="ch">Schweiz</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>;
```

---

### Table

Daten-Tabellen mit Sortierung/Paginierung.

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@menschlichkeit/design-system';

<Table>
  <TableCaption>Liste aller Mitglieder</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>E-Mail</TableHead>
      <TableHead className="text-right">Beitritt</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Max Mustermann</TableCell>
      <TableCell>max@beispiel.at</TableCell>
      <TableCell className="text-right">01.01.2025</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

---

### Tabs

Tab-Navigation für Content-Sections.

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@menschlichkeit/design-system';

<Tabs defaultValue="about">
  <TabsList>
    <TabsTrigger value="about">Über uns</TabsTrigger>
    <TabsTrigger value="events">Veranstaltungen</TabsTrigger>
    <TabsTrigger value="contact">Kontakt</TabsTrigger>
  </TabsList>
  <TabsContent value="about">
    <p>Informationen über den Verein...</p>
  </TabsContent>
  <TabsContent value="events">
    <p>Kommende Events...</p>
  </TabsContent>
  <TabsContent value="contact">
    <p>Kontaktinformationen...</p>
  </TabsContent>
</Tabs>;
```

---

### Toast & Sonner

Benachrichtigungen und Toasts.

```tsx
import { useToast } from '@menschlichkeit/design-system';
import { Button } from '@menschlichkeit/design-system';

function ToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: 'Erfolg',
          description: 'Ihre Nachricht wurde gesendet.',
          variant: 'default',
        });
      }}
    >
      Toast anzeigen
    </Button>
  );
}
```

```tsx
import { toast } from 'sonner';

// Success Toast
toast.success('Erfolgreich gespeichert!');

// Error Toast
toast.error('Ein Fehler ist aufgetreten.');

// Info Toast
toast.info('Neue Nachricht erhalten.');

// Custom Toast
toast.custom(t => (
  <div className="bg-primary text-white p-4 rounded-md">
    Austrian Red Custom Toast
  </div>
));
```

---

## 🎯 Feature Components (Auswahl)

### Hero

Landing Page Hero Section.

```tsx
import { Hero } from '@menschlichkeit/design-system';

<Hero
  title="Menschlichkeit Österreich"
  subtitle="Gemeinsam für soziale Gerechtigkeit und Menschenrechte"
  ctaText="Jetzt Mitglied werden"
  ctaLink="/join"
/>;
```

---

### Navigation

Header Navigation mit Austrian Red Branding.

```tsx
import { Navigation } from '@menschlichkeit/design-system';

<Navigation />;
```

---

### Footer

Footer mit Links und Social Media.

```tsx
import { Footer } from '@menschlichkeit/design-system';

<Footer />;
```

---

### Contact

Kontaktformular Component.

```tsx
import { Contact } from '@menschlichkeit/design-system';

<Contact />;
```

---

### DemocracyGameHub

Spiele-Dashboard für Educational Games.

```tsx
import { DemocracyGameHub } from '@menschlichkeit/design-system';

<DemocracyGameHub />;
```

---

### UserProfile

Nutzer-Profil Component.

```tsx
import { UserProfile } from '@menschlichkeit/design-system';

<UserProfile userId={userId} />;
```

---

## 🎨 Design Tokens

### Importieren und Verwenden

```tsx
import {
  designTokens,
  tailwindTheme,
} from '@menschlichkeit/design-system/tokens';

// Farben
console.log(designTokens.colors.brand['austria-red']); // #c8102e
console.log(designTokens.colors.primary[600]); // #c8102e

// Typography
console.log(designTokens.typography.fontFamily.sans); // Inter, system-ui, sans-serif

// Spacing
console.log(designTokens.spacing[4]); // 16px

// In Tailwind Config verwenden
export default {
  theme: {
    extend: tailwindTheme,
  },
};
```

---

## 🎨 Styling Best Practices

### Austrian Red Branding

```tsx
// Primärfarbe für CTAs
<Button className="bg-primary hover:bg-primary/90">Action</Button>

// Austrian Red Akzente
<h1 className="text-4xl font-bold text-primary">Headline</h1>

// Border Akzent
<Card className="border-l-4 border-l-primary">...</Card>

// Gradient Background
<div className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
  Austrian Red Gradient
</div>
```

---

### Responsive Design

```tsx
// Mobile First
<div className="
  p-4 sm:p-6 md:p-8 lg:p-12
  text-base sm:text-lg md:text-xl
">
  Responsive Content
</div>

// Breakpoint-spezifische Layouts
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
  {/* Cards */}
</div>
```

---

### Dark Mode

```tsx
// Dark Mode Support (automatisch via CSS Variables)
<div className="bg-background text-foreground">
  Automatischer Dark Mode Support
</div>;

// Manueller Dark Mode Toggle
import { DarkModeToggle } from '@menschlichkeit/design-system';

<DarkModeToggle />;
```

---

### Accessibility

```tsx
// ARIA Labels
<Button aria-label="Navigation öffnen">
  <MenuIcon />
</Button>

// Fokus-Indikatoren
<Button className="focus:ring-2 focus:ring-primary">
  Accessible Button
</Button>

// Skip Links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## 🔧 TypeScript Support

Alle Components sind vollständig typisiert:

```tsx
import { Button, type ButtonProps } from '@menschlichkeit/design-system';

// Props sind vollständig typisiert
const MyButton: React.FC<ButtonProps> = ({ variant, size, children }) => {
  return (
    <Button variant={variant} size={size}>
      {children}
    </Button>
  );
};
```

---

## 📚 Weitere Ressourcen

- **Brand Guidelines**: `/figma-design-system/BRAND-GUIDELINES.md`
- **Design System Docs**: `/figma-design-system/*.md`
- **Tailwind Config**: `/tailwind.config.js`
- **Component Source**: `/figma-design-system/components/`

---

**Version**: 4.1.0
**Letzte Aktualisierung**: Januar 2025
