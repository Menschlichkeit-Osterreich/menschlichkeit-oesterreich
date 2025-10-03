import { useState } from 'react';
import { CreditCard, Heart, Shield, Gift, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { motion } from 'motion/react';
import { useAppState } from './AppStateManager';

export function Donate() {
  const { state, openModal } = useAppState();
  const [selectedAmount, setSelectedAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('once');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const presetAmounts = ['10', '25', '50', '100'];

  const impactExamples = [
    {
      amount: '€10',
      impact: 'Unterstützt eine österreichische Familie mit Lebensmitteln für eine Woche'
    },
    {
      amount: '€25',
      impact: 'Ermöglicht Beratung und Unterstützung für Familien in Notlagen'
    },
    {
      amount: '€50',
      impact: 'Finanziert Bildungs- und Integrationsprogramme in Österreich'
    },
    {
      amount: '€100',
      impact: 'Trägt zum Aufbau der solidarischen Gemeinschaft in Österreich bei'
    }
  ];

  const features = [
    'SEPA-Lastschrift verfügbar',
    'DSGVO-konform & SSL-sicher',
    'Steuerlich absetzbar',
    'Transparente Mittelverwendung'
  ];

  const currentAmount = customAmount || selectedAmount;

  return (
    <section id="donate" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl">Spenden</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unterstütze Menschlichkeit Österreich bei der wichtigen Arbeit für soziale Gerechtigkeit. 
            Mit SEPA-Integration und DSGVO-konformer Abwicklung für österreichische Spender.
          </p>
        </motion.div>

        <div className="grid lg:grid-2 gap-8 max-w-6xl mx-auto">
          {/* Donation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Deine Spende
                </CardTitle>
                <CardDescription>
                  Wähle deinen Spendenbetrag und die Art der Spende
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type */}
                <div className="space-y-3">
                  <Label>Art der Spende</Label>
                  <RadioGroup value={donationType} onValueChange={setDonationType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once" className="cursor-pointer">Einmalige Spende</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">
                        Monatliche Spende
                        <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                          Empfohlen
                        </Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label>Betrag auswählen</Label>
                  <div className="grid grid-2 gap-3">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount && !customAmount ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className="h-12"
                      >
                        €{amount}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Oder eigenen Betrag eingeben</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Eigener Betrag"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Zahlungsmethode</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sepa" id="sepa" />
                      <Label htmlFor="sepa" className="flex items-center gap-2 cursor-pointer">
                        <RefreshCw className="w-4 h-4" />
                        SEPA-Lastschrift (Empfohlen)
                        <Badge variant="secondary" className="text-xs">Sicher</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        Kreditkarte / Banküberweisung
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {paymentMethod === 'sepa' && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Mit SEPA-Lastschrift können Sie sicher und bequem spenden. 
                        {donationType === 'monthly' && ' Perfekt für wiederkehrende Spenden.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Newsletter Opt-in */}
                <div className="flex items-start space-x-2">
                  <Checkbox id="newsletter" />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="newsletter"
                      className="text-sm cursor-pointer leading-snug"
                    >
                      Ich möchte den Newsletter erhalten und über die Verwendung meiner Spende informiert werden.
                    </Label>
                  </div>
                </div>

                {/* Donate Button */}
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    if (paymentMethod === 'sepa') {
                      if (state.isAuthenticated) {
                        openModal('sepa');
                      } else {
                        openModal('auth', 'login');
                      }
                    } else {
                      // Handle other payment methods
                      console.log('Processing card/bank payment...');
                    }
                  }}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {paymentMethod === 'sepa' 
                    ? `SEPA-Lastschrift €${currentAmount || '0'}` 
                    : `Jetzt €${currentAmount || '0'} spenden`
                  }
                </Button>
                
                {paymentMethod === 'sepa' && !state.isAuthenticated && (
                  <p className="text-sm text-muted-foreground text-center">
                    Für SEPA-Lastschrift ist eine Anmeldung erforderlich
                  </p>
                )}

                {/* Security Features */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-2 gap-3 text-sm text-muted-foreground">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact Examples */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl">Deine Spende bewirkt</h3>
              <p className="text-muted-foreground">
                Sieh dir an, wie deine Spende konkret hilft und welchen Unterschied 
                sie im Leben anderer Menschen macht.
              </p>
            </div>

            <div className="space-y-4">
              {impactExamples.map((example, index) => (
                <motion.div
                  key={example.amount}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className={`transition-all duration-300 ${
                    currentAmount && parseInt(currentAmount) >= parseInt(example.amount.replace('€', ''))
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'hover:shadow-sm'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Badge variant="secondary" className="shrink-0">
                          {example.amount}
                        </Badge>
                        <p className="text-sm">{example.impact}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div 
              className="bg-card rounded-xl p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">100% Transparenz</h4>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Als österreichischer Verein arbeiten wir nach höchsten Transparenzstandards. 
                  Alle Mittel werden gemäß unserer Satzung verwendet: 70% für direkte Hilfsprojekte, 
                  20% für Vereinsverwaltung und 10% für Rücklagen.
                </p>
                <div className="grid grid-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-foreground">70%</span> Hilfsprojekte
                  </div>
                  <div>
                    <span className="font-medium text-foreground">20%</span> Verwaltung
                  </div>
                  <div>
                    <span className="font-medium text-foreground">10%</span> Rücklagen
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Donate;