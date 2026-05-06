// SEPA Management System - Sprint 1 Critical Component
import React, { useState, useEffect } from 'react';

// TypeScript Interfaces for SEPA
interface SepaMandate {
  id: string;
  mandateReference: string;
  creditorId: string;
  debtorName: string;
  debtorIban: string;
  debtorBic?: string;
  debtorAddress: Address;
  amount: number;
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  purpose: string;
  signatureDate: Date;
  status: 'pending' | 'signed' | 'active' | 'cancelled' | 'expired';
  pdfUrl?: string;
}

interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

interface BankDetails {
  iban: string;
  bic?: string;
  bankName?: string;
  isValid: boolean;
}

interface SepaFormData {
  // Personal Data
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Address
  address: Address;

  // Bank Details
  iban: string;
  bic?: string;

  // Mandate Details
  amount: number;
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  purpose: string;
  startDate?: Date;

  // Agreements
  agreeToSepaTerms: boolean;
  agreeToDataProcessing: boolean;
}

// IBAN Validation (Austrian focus)
const validateIban = (iban: string): { isValid: boolean; country?: string; bankCode?: string } => {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();

  // Basic format check
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleanIban)) {
    return { isValid: false };
  }

  // Austrian IBAN format: AT + 2 digits + 16 digits
  if (cleanIban.startsWith('AT')) {
    if (cleanIban.length !== 20) {
      return { isValid: false };
    }

    // Extract bank code (first 5 digits after AT##)
    const bankCode = cleanIban.substring(4, 9);

    return {
      isValid: true,
      country: 'Austria',
      bankCode,
    };
  }

  // Basic MOD-97 checksum validation
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  const numericString = rearranged.replace(/[A-Z]/g, char => (char.charCodeAt(0) - 55).toString());

  // Process in chunks to avoid number overflow
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = String(remainder) + numericString.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  return {
    isValid: remainder === 1,
    country: cleanIban.substring(0, 2),
  };
};

// Format IBAN with spaces
const formatIban = (iban: string): string => {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

// Austrian Bank Code to BIC mapping (sample)
const AUSTRIAN_BANK_CODES: Record<string, { bic: string; name: string }> = {
  '12000': { bic: 'BKAUATWW', name: 'Bank Austria' },
  '20111': { bic: 'GIBAATWWXXX', name: 'Erste Bank' },
  '32000': { bic: 'RLNWATWW', name: 'Raiffeisen Bank' },
  '14000': { bic: 'BAWAATWW', name: 'BAWAG P.S.K.' },
  '19043': { bic: 'VBOEATWW', name: 'Volksbank' },
};

// SEPA Step 1: Personal Information
const PersonalInfoStep: React.FC<{
  data: SepaFormData;
  onChange: (data: Partial<SepaFormData>) => void;
  onNext: () => void;
}> = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!data.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!data.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Ungültige E-Mail-Adresse';

    if (!data.address.street.trim()) newErrors.street = 'Straße ist erforderlich';
    if (!data.address.houseNumber.trim()) newErrors.houseNumber = 'Hausnummer ist erforderlich';
    if (!data.address.postalCode.trim()) newErrors.postalCode = 'PLZ ist erforderlich';
    if (!data.address.city.trim()) newErrors.city = 'Stadt ist erforderlich';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center">
          <i className="bi bi-person" aria-hidden="true"></i>
        </div>
        <h2 className="text-xl font-bold">Persönliche Angaben</h2>
        <p className="text-muted">Bitte geben Sie Ihre persönlichen Daten ein</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">Vorname *</label>
          <input
            type="text"
            className={`input w-full ${errors.firstName ? 'border-destructive' : ''}`}
            value={data.firstName}
            onChange={e => onChange({ firstName: e.target.value })}
            placeholder="Max"
          />
          {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-2">Nachname *</label>
          <input
            type="text"
            className={`input w-full ${errors.lastName ? 'border-destructive' : ''}`}
            value={data.lastName}
            onChange={e => onChange({ lastName: e.target.value })}
            placeholder="Mustermann"
          />
          {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">E-Mail-Adresse *</label>
        <input
          type="email"
          className={`input w-full ${errors.email ? 'border-destructive' : ''}`}
          value={data.email}
          onChange={e => onChange({ email: e.target.value })}
          placeholder="max.mustermann@beispiel.at"
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">Telefon (optional)</label>
        <input
          type="tel"
          className="input w-full"
          value={data.phone || ''}
          onChange={e => onChange({ phone: e.target.value })}
          placeholder="+43 1 234 5678"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Adresse</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text mb-2">Straße *</label>
            <input
              type="text"
              className={`input w-full ${errors.street ? 'border-destructive' : ''}`}
              value={data.address.street}
              onChange={e =>
                onChange({
                  address: { ...data.address, street: e.target.value },
                })
              }
              placeholder="Musterstraße"
            />
            {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">Hausnummer *</label>
            <input
              type="text"
              className={`input w-full ${errors.houseNumber ? 'border-destructive' : ''}`}
              value={data.address.houseNumber}
              onChange={e =>
                onChange({
                  address: { ...data.address, houseNumber: e.target.value },
                })
              }
              placeholder="123"
            />
            {errors.houseNumber && (
              <p className="text-xs text-destructive mt-1">{errors.houseNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">PLZ *</label>
            <input
              type="text"
              className={`input w-full ${errors.postalCode ? 'border-destructive' : ''}`}
              value={data.address.postalCode}
              onChange={e =>
                onChange({
                  address: { ...data.address, postalCode: e.target.value },
                })
              }
              placeholder="1010"
              maxLength={5}
            />
            {errors.postalCode && (
              <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text mb-2">Stadt *</label>
            <input
              type="text"
              className={`input w-full ${errors.city ? 'border-destructive' : ''}`}
              value={data.address.city}
              onChange={e =>
                onChange({
                  address: { ...data.address, city: e.target.value },
                })
              }
              placeholder="Wien"
            />
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
          </div>
        </div>
      </div>

      <button onClick={handleNext} className="btn btn-primary w-full mt-8">
        Weiter zu Bankdaten
        <i className="bi bi-arrow-right ml-2" aria-hidden="true"></i>
      </button>
    </div>
  );
};

// SEPA Step 2: Bank Details
const BankDetailsStep: React.FC<{
  data: SepaFormData;
  onChange: (data: Partial<SepaFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ data, onChange, onNext, onPrevious }) => {
  const [ibanValidation, setIbanValidation] = useState<{
    isValid: boolean;
    country?: string;
    bankCode?: string;
  }>({ isValid: false });
  const [bankInfo, setBankInfo] = useState<{ bic?: string; name?: string } | null>(null);

  useEffect(() => {
    if (data.iban) {
      const validation = validateIban(data.iban);
      setIbanValidation(validation);

      if (validation.isValid && validation.bankCode && AUSTRIAN_BANK_CODES[validation.bankCode]) {
        const bank = AUSTRIAN_BANK_CODES[validation.bankCode];
        setBankInfo(bank);
        onChange({ bic: bank.bic });
      } else {
        setBankInfo(null);
        onChange({ bic: '' });
      }
    }
  }, [data.iban, onChange]);

  const handleIbanChange = (value: string) => {
    const formatted = formatIban(value);
    onChange({ iban: formatted });
  };

  const validate = () => {
    return ibanValidation.isValid && data.iban.trim() !== '';
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center">
          <i className="bi bi-bank" aria-hidden="true"></i>
        </div>
        <h2 className="text-xl font-bold">Bankverbindung</h2>
        <p className="text-muted">
          Geben Sie Ihre Bankverbindung für das SEPA-Lastschriftverfahren an
        </p>
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="bi bi-info-circle text-info mt-0.5" aria-hidden="true"></i>
          <div>
            <h3 className="font-semibold text-info mb-1">SEPA-Lastschriftverfahren</h3>
            <p className="text-sm text-info/80">
              Mit der SEPA-Lastschrift erteilen Sie uns die Berechtigung, fällige Beträge von Ihrem
              Konto einzuziehen. Sie können der Abbuchung bis zu 8 Wochen nach Belastung
              widersprechen.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          IBAN (International Bank Account Number) *
        </label>
        <input
          type="text"
          className={`input w-full font-mono text-base ${
            data.iban && !ibanValidation.isValid
              ? 'border-destructive'
              : data.iban && ibanValidation.isValid
                ? 'border-success'
                : ''
          }`}
          value={data.iban}
          onChange={e => handleIbanChange(e.target.value)}
          placeholder="AT61 1904 3002 3457 3201"
          maxLength={34}
        />

        {data.iban && ibanValidation.isValid && (
          <div className="mt-2 flex items-center gap-2 text-sm text-success">
            <i className="bi bi-check-circle" aria-hidden="true"></i>
            <span>Gültige IBAN aus {ibanValidation.country}</span>
          </div>
        )}

        {data.iban && !ibanValidation.isValid && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <i className="bi bi-x-circle" aria-hidden="true"></i>
            <span>Ungültige IBAN-Prüfsumme</span>
          </div>
        )}

        {bankInfo && (
          <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-success">
              <i className="bi bi-bank2" aria-hidden="true"></i>
              <span className="font-semibold">{bankInfo.name}</span>
            </div>
            <p className="text-xs text-success/80 mt-1">
              BIC: {bankInfo.bic} (automatisch erkannt)
            </p>
          </div>
        )}
      </div>

      {!bankInfo && data.iban && ibanValidation.isValid && (
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            BIC (Bank Identifier Code)
          </label>
          <input
            type="text"
            className="input w-full font-mono"
            value={data.bic || ''}
            onChange={e => onChange({ bic: e.target.value.toUpperCase() })}
            placeholder="BKAUATWW"
            maxLength={11}
          />
          <p className="text-xs text-muted mt-1">
            Falls Ihre Bank nicht automatisch erkannt wurde, geben Sie die BIC manuell ein.
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button onClick={onPrevious} className="btn btn-ghost flex-1">
          <i className="bi bi-arrow-left mr-2" aria-hidden="true"></i>
          Zurück
        </button>

        <button onClick={handleNext} disabled={!validate()} className="btn btn-primary flex-1">
          Weiter zu Mandatsdetails
          <i className="bi bi-arrow-right ml-2" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};

// SEPA Step 3: Mandate Details & Confirmation
const MandateConfirmationStep: React.FC<{
  data: SepaFormData;
  onChange: (data: Partial<SepaFormData>) => void;
  onComplete: () => void;
  onPrevious: () => void;
}> = ({ data, onChange, onComplete, onPrevious }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateMandateReference = (): string => {
    const timestamp = Date.now().toString();
    return `MENSCHL-${timestamp.slice(-8)}`;
  };

  const handleComplete = async () => {
    if (!data.agreeToSepaTerms || !data.agreeToDataProcessing) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to create mandate
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    onComplete();
  };

  const mandateReference = generateMandateReference();
  const creditorId = 'AT02ZZZ00000000001'; // Official Austrian creditor ID format

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center">
          <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
        </div>
        <h2 className="text-xl font-bold">SEPA-Lastschriftmandat</h2>
        <p className="text-muted">Bestätigung der Lastschrift-Ermächtigung</p>
      </div>

      <div className="bg-surface border rounded-lg p-6 space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-4">Zusammenfassung</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">Zahlungsempfänger:</span>
              <p className="font-semibold">Verein Menschlichkeit Österreich</p>
            </div>
            <div>
              <span className="text-muted">Gläubiger-ID:</span>
              <p className="font-mono">{creditorId}</p>
            </div>
            <div>
              <span className="text-muted">Mandatsreferenz:</span>
              <p className="font-mono">{mandateReference}</p>
            </div>
            <div>
              <span className="text-muted">Betrag:</span>
              <p className="font-semibold">
                €{data.amount.toFixed(2)} (
                {data.frequency === 'once'
                  ? 'einmalig'
                  : data.frequency === 'monthly'
                    ? 'monatlich'
                    : data.frequency === 'quarterly'
                      ? 'vierteljährlich'
                      : 'jährlich'}
                )
              </p>
            </div>
            <div>
              <span className="text-muted">Zahlungspflichtige/r:</span>
              <p>
                {data.firstName} {data.lastName}
              </p>
            </div>
            <div>
              <span className="text-muted">IBAN:</span>
              <p className="font-mono">{data.iban}</p>
            </div>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="bi bi-exclamation-triangle text-warning mt-0.5" aria-hidden="true"></i>
            <div>
              <h4 className="font-semibold text-warning mb-1">Wichtige Hinweise</h4>
              <ul className="text-sm text-warning/80 space-y-1">
                <li>
                  • Sie können der Abbuchung bis zu 8 Wochen nach Belastung bei Ihrer Bank
                  widersprechen
                </li>
                <li>• Sie werden mindestens 5 Tage vor dem ersten Einzug per E-Mail informiert</li>
                <li>• Das Mandat können Sie jederzeit schriftlich widerrufen</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={data.agreeToSepaTerms}
              onChange={e => onChange({ agreeToSepaTerms: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-border rounded mt-0.5"
              required
            />
            <span className="text-sm">
              Ich erteile dem Verein Menschlichkeit Österreich (Gläubiger-ID: {creditorId}) für die
              oben genannten Zahlungen ein SEPA-Lastschriftmandat. Zugleich weise ich mein
              Kreditinstitut an, die vom Verein Menschlichkeit Österreich auf mein Konto gezogenen
              Lastschriften einzulösen. *
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={data.agreeToDataProcessing}
              onChange={e => onChange({ agreeToDataProcessing: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-border rounded mt-0.5"
              required
            />
            <span className="text-sm">
              Ich stimme der Verarbeitung meiner Daten für die Abwicklung der SEPA-Lastschrift gemäß
              der{' '}
              <a href="/datenschutz" target="_blank" className="text-primary-500 underline">
                Datenschutzerklärung
              </a>{' '}
              zu. *
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={onPrevious} className="btn btn-ghost flex-1" disabled={isSubmitting}>
          <i className="bi bi-arrow-left mr-2" aria-hidden="true"></i>
          Zurück
        </button>

        <button
          onClick={handleComplete}
          disabled={!data.agreeToSepaTerms || !data.agreeToDataProcessing || isSubmitting}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Mandat wird erstellt...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle mr-2" aria-hidden="true"></i>
              SEPA-Mandat erteilen
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Main SEPA Management Component
export const SepaManagement: React.FC<{
  initialAmount?: number;
  initialFrequency?: 'once' | 'monthly' | 'quarterly' | 'yearly';
  initialPurpose?: string;
  onComplete?: (mandate: SepaMandate) => void;
  onCancel?: () => void;
}> = ({
  initialAmount = 5,
  initialFrequency = 'monthly',
  initialPurpose = 'Mitgliedsbeitrag',
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SepaFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Austria',
    },
    iban: '',
    bic: '',
    amount: initialAmount,
    frequency: initialFrequency,
    purpose: initialPurpose,
    agreeToSepaTerms: false,
    agreeToDataProcessing: false,
  });

  const updateFormData = (updates: Partial<SepaFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    // Create mandate object
    const mandate: SepaMandate = {
      id: Date.now().toString(),
      mandateReference: `MENSCHL-${Date.now().toString().slice(-8)}`,
      creditorId: 'AT02ZZZ00000000001',
      debtorName: `${formData.firstName} ${formData.lastName}`,
      debtorIban: formData.iban,
      debtorBic: formData.bic,
      debtorAddress: formData.address,
      amount: formData.amount,
      frequency: formData.frequency,
      purpose: formData.purpose,
      signatureDate: new Date(),
      status: 'signed',
    };

    onComplete?.(mandate);
  };

  const steps = [
    { number: 1, title: 'Persönliche Daten', icon: 'person' },
    { number: 2, title: 'Bankverbindung', icon: 'bank' },
    { number: 3, title: 'Bestätigung', icon: 'check-circle' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                ${
                  currentStep >= step.number
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }
              `}
              >
                {currentStep > step.number ? (
                  <i className="bi bi-check" aria-hidden="true"></i>
                ) : (
                  step.number
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                  w-20 h-0.5 mx-4 transition-colors
                  ${currentStep > step.number ? 'bg-primary-500' : 'bg-neutral-200'}
                `}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2">
          {steps.map(step => (
            <div key={step.number} className="text-center">
              <p
                className={`text-xs font-medium ${
                  currentStep >= step.number ? 'text-primary-500' : 'text-neutral-500'
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-modern p-8">
        {currentStep === 1 && (
          <PersonalInfoStep
            data={formData}
            onChange={updateFormData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <BankDetailsStep
            data={formData}
            onChange={updateFormData}
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <MandateConfirmationStep
            data={formData}
            onChange={updateFormData}
            onComplete={handleComplete}
            onPrevious={() => setCurrentStep(2)}
          />
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="text-center mt-6">
          <button
            onClick={onCancel}
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
};

// Export types for use in other components
export type { SepaMandate, SepaFormData, BankDetails };
export { validateIban, formatIban };
