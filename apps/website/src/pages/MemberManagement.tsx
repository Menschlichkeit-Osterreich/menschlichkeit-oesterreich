import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button, ButtonLink } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import {
  adminCrmApi,
  type AdminCrmContactDetail,
  type AdminCrmContactSummary,
  type AdminCrmContactUpdatePayload,
} from '../services/api/adminCrm';

const PAGE_SIZE = 20;

const MEMBERSHIP_OPTIONS = [
  { value: 'ordentlich', label: 'Ordentliche Mitgliedschaft' },
  { value: 'ermaessigt', label: 'Ermäßigte Mitgliedschaft' },
  { value: 'foerdernd', label: 'Fördermitgliedschaft' },
  { value: 'haertefall', label: 'Härtefall / manuell' },
];

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount?: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function badgeVariantForSync(state: AdminCrmContactSummary['syncState']) {
  if (state === 'attention') return 'warning';
  if (state === 'degraded') return 'error';
  return 'success';
}

function badgeVariantForNewsletter(status: string) {
  if (status === 'confirmed' || status === 'active' || status === 'subscribed') return 'success';
  if (status === 'pending_confirmation') return 'warning';
  if (status === 'unsubscribed') return 'secondary';
  return 'default';
}

function badgeVariantForMembership(status?: string | null) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('current') || normalized.includes('active') || normalized.includes('grace')) return 'success';
  if (normalized.includes('new') || normalized.includes('pending')) return 'warning';
  if (normalized.includes('expired') || normalized.includes('cancelled') || normalized.includes('inactive')) return 'secondary';
  return 'default';
}

function membershipLabel(detail: AdminCrmContactDetail) {
  return detail.profile.membershipType || detail.memberships[0]?.membershipType || 'Noch nicht zugeordnet';
}

export default function MemberManagementPage() {
  const { token, hasBackofficeAccess } = useAuth();
  const [contacts, setContacts] = useState<AdminCrmContactSummary[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminCrmContactDetail | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [crmWarnings, setCrmWarnings] = useState<string[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membershipBusy, setMembershipBusy] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageNotice, setPageNotice] = useState<string | null>(null);
  const [membershipKey, setMembershipKey] = useState('ordentlich');
  const [form, setForm] = useState<AdminCrmContactUpdatePayload>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    postal_code: '',
    city: '',
    newsletter_status: 'not_subscribed',
  });

  async function loadContacts(nextPage = page, nextSearch = search) {
    if (!token || !hasBackofficeAccess) return;
    setListLoading(true);
    setPageError(null);
    try {
      const response = await adminCrmApi.listContacts(token, {
        page: nextPage,
        pageSize: PAGE_SIZE,
        search: nextSearch,
      });
      const payload = response.data;
      setContacts(payload.items);
      setTotal(payload.pagination.total);
      setCrmWarnings(payload.meta.warnings || []);

      if (!payload.items.length) {
        setSelectedContactId(null);
        setDetail(null);
        return;
      }

      const stillVisible = selectedContactId && payload.items.some((item) => item.contactId === selectedContactId);
      if (!stillVisible) {
        setSelectedContactId(payload.items[0].contactId);
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Kontakte konnten nicht geladen werden.');
    } finally {
      setListLoading(false);
    }
  }

  async function loadDetail(contactId: number) {
    if (!token || !hasBackofficeAccess) return;
    setDetailLoading(true);
    setPageError(null);
    try {
      const response = await adminCrmApi.getContact(contactId, token);
      setDetail(response.data);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Kontakt konnte nicht geladen werden.');
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !hasBackofficeAccess) return;
    const handle = window.setTimeout(() => {
      void loadContacts(page, search);
    }, 220);
    return () => window.clearTimeout(handle);
  }, [token, hasBackofficeAccess, page, search]);

  useEffect(() => {
    if (!selectedContactId || !token || !hasBackofficeAccess) return;
    void loadDetail(selectedContactId);
  }, [selectedContactId, token, hasBackofficeAccess]);

  useEffect(() => {
    if (!detail) return;
    setForm({
      first_name: detail.profile.firstName || '',
      last_name: detail.profile.lastName || '',
      email: detail.profile.email || '',
      phone: detail.profile.phone || '',
      street_address: detail.profile.streetAddress || '',
      postal_code: detail.profile.postalCode || '',
      city: detail.profile.city || '',
      newsletter_status: detail.newsletter.status || 'not_subscribed',
    });
    setMembershipKey(detail.profile.membershipType || 'ordentlich');
  }, [detail]);

  const selectedSummary = useMemo(
    () => contacts.find((contact) => contact.contactId === selectedContactId) || null,
    [contacts, selectedContactId]
  );

  async function handleSave() {
    if (!token || !detail) return;
    setSaving(true);
    setPageError(null);
    setPageNotice(null);
    try {
      const response = await adminCrmApi.updateContact(detail.profile.contactId, form, token);
      setDetail(response.data);
      await loadContacts(page, search);
      setPageNotice(response.message || 'Kontakt wurde aktualisiert.');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Kontakt konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateMembership() {
    if (!token || !detail) return;
    setMembershipBusy(true);
    setPageError(null);
    setPageNotice(null);
    try {
      const response = await adminCrmApi.createMembership(detail.profile.contactId, membershipKey, token);
      setPageNotice(response.message || 'Mitgliedschaft wurde angelegt.');
      await loadDetail(detail.profile.contactId);
      await loadContacts(page, search);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Mitgliedschaft konnte nicht angelegt werden.');
    } finally {
      setMembershipBusy(false);
    }
  }

  if (!token || !hasBackofficeAccess) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <Alert variant="error" title="Kein Zugriff">
          Das CRM-Cockpit ist nur für interne Admin- und Staff-Konten verfügbar.
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 space-y-4">
      <PageHeader
        title="CRM-Cockpit"
        description="Interne Plattformansicht für Kontakte, Mitgliedschaften, Beiträge, Rechnungen, Consent und Eventbezug. CiviCRM bleibt im Hintergrund, die Oberfläche zeigt stabile Plattformdaten."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Backoffice', href: '/admin/dashboard' },
              { label: 'CRM & Mitglieder' },
            ]}
          />
        }
        actions={
          <Button variant="secondary" onClick={() => void loadContacts(page, search)} disabled={listLoading}>
            {listLoading ? 'Aktualisiere…' : 'Neu laden'}
          </Button>
        }
      />

      {pageError && (
        <Alert variant="error" title="Fehler" role="alert">
          {pageError}
        </Alert>
      )}

      {pageNotice && (
        <Alert variant="success" title="Gespeichert">
          {pageNotice}
        </Alert>
      )}

      {crmWarnings.length > 0 && (
        <Alert variant="warning" title="CiviCRM eingeschränkt erreichbar">
          {crmWarnings.join(' ')}
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-800" htmlFor="crm-search">
              Kontakte und Mitglieder suchen
            </label>
            <Input
              id="crm-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Name, E-Mail, Telefon oder Ort"
            />
            <p className="text-xs text-secondary-600">
              {total} Kontakte im Cockpit. Die Liste kombiniert CiviCRM mit lokalen Plattformdaten.
            </p>
          </div>

          <div className="space-y-3">
            {listLoading && contacts.length === 0 && (
              <div className="text-sm text-secondary-600">Kontakte werden geladen…</div>
            )}

            {!listLoading && contacts.length === 0 && (
              <div className="rounded-lg border border-dashed border-secondary-300 p-4 text-sm text-secondary-600">
                Keine Kontakte für diese Suche gefunden.
              </div>
            )}

            {contacts.map((contact) => {
              const selected = selectedContactId === contact.contactId;
              return (
                <Card
                  key={contact.contactId}
                  onClick={() => setSelectedContactId(contact.contactId)}
                  className={[
                    'p-4 transition-all',
                    selected ? 'border-primary-300 bg-primary-50 shadow-md' : 'hover:border-secondary-300 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-secondary-900 truncate">{contact.displayName}</div>
                      <div className="text-sm text-secondary-700 truncate">{contact.email || 'Keine E-Mail hinterlegt'}</div>
                      <div className="mt-1 text-xs text-secondary-500">
                        {[contact.postalCode, contact.city].filter(Boolean).join(' ')}
                      </div>
                    </div>
                    <Badge variant={badgeVariantForSync(contact.syncState)}>{contact.syncState}</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={badgeVariantForMembership(contact.memberStatus)}>{contact.membershipType || 'Kein Mitgliedsstatus'}</Badge>
                    <Badge variant={badgeVariantForNewsletter(contact.newsletterStatus)}>{contact.newsletterStatus}</Badge>
                    {contact.openIssuesCount > 0 && <Badge variant="warning">{contact.openIssuesCount} offene Hinweise</Badge>}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-secondary-700">
                    <div className="rounded-md bg-white/80 p-2">
                      <div className="text-secondary-500">Spenden</div>
                      <div className="font-semibold">{formatCurrency(contact.totalDonations)}</div>
                    </div>
                    <div className="rounded-md bg-white/80 p-2">
                      <div className="text-secondary-500">Offene Rechnungen</div>
                      <div className="font-semibold">{contact.openInvoices}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-secondary-200 pt-3 text-sm text-secondary-700">
            <Button
              variant="secondary"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || listLoading}
            >
              Zurück
            </Button>
            <span>Seite {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
            <Button
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={listLoading || page * PAGE_SIZE >= total}
            >
              Weiter
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {detailLoading && (
            <Card className="p-6 text-secondary-700">Kontaktprofil wird geladen…</Card>
          )}

          {!detailLoading && !detail && (
            <Card className="p-8 text-center text-secondary-600">
              Wählen Sie links einen Kontakt aus, um Profil, Beiträge, Rechnungen, Consent und Eventbezug zu sehen.
            </Card>
          )}

          {!detailLoading && detail && (
            <>
              <Card className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-secondary-900">{detail.profile.displayName}</h2>
                      <Badge variant={badgeVariantForSync(detail.sync.state)}>{detail.sync.state}</Badge>
                      {selectedSummary?.newsletterStatus && (
                        <Badge variant={badgeVariantForNewsletter(selectedSummary.newsletterStatus)}>
                          {selectedSummary.newsletterStatus}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-secondary-700">{detail.profile.email || 'Keine E-Mail hinterlegt'}</p>
                    <p className="mt-1 text-sm text-secondary-600">
                      {detail.profile.phone || 'Kein Telefon'} · {detail.profile.memberRole || 'ohne Plattformrolle'} · {membershipLabel(detail)}
                    </p>
                    {detail.profile.memberId && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Verknüpftes Plattformkonto: {detail.profile.memberId}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {detail.profile.openInCiviUrl && (
                      <ButtonLink
                        variant="secondary"
                        href={detail.profile.openInCiviUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        In CiviCRM öffnen
                      </ButtonLink>
                    )}
                    <Button variant="secondary" onClick={() => void loadDetail(detail.profile.contactId)} disabled={detailLoading}>
                      Profil neu laden
                    </Button>
                  </div>
                </div>

                {detail.sync.warnings.length > 0 && (
                  <div className="mt-4">
                    <Alert variant="warning" title="Synchronisationshinweis">
                      {detail.sync.warnings.join(' ')}
                    </Alert>
                  </div>
                )}
              </Card>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">Kontaktprofil</h3>
                      <p className="text-sm text-secondary-600">
                        Änderungen laufen über die Plattform-API und bleiben serverseitig auditierbar.
                      </p>
                    </div>
                    <Button onClick={() => void handleSave()} disabled={saving}>
                      {saving ? 'Speichere…' : 'Änderungen speichern'}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Vorname</label>
                      <Input value={form.first_name || ''} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Nachname</label>
                      <Input value={form.last_name || ''} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">E-Mail</label>
                      <Input type="email" value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Telefon</label>
                      <Input value={form.phone || ''} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Straße und Hausnummer</label>
                      <Input value={form.street_address || ''} onChange={(event) => setForm((current) => ({ ...current, street_address: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">PLZ</label>
                      <Input value={form.postal_code || ''} onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Ort</label>
                      <Input value={form.city || ''} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Newsletter-Status</label>
                      <select
                        className="w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        value={form.newsletter_status || 'not_subscribed'}
                        onChange={(event) => setForm((current) => ({ ...current, newsletter_status: event.target.value }))}
                      >
                        <option value="confirmed">Aktiv bestätigt</option>
                        <option value="unsubscribed">Abgemeldet</option>
                        <option value="not_subscribed">Nicht angemeldet</option>
                      </select>
                      <p className="mt-1 text-xs text-secondary-500">
                        Das Cockpit korrigiert den technischen Status. Consent-Nachweise bleiben separat dokumentiert.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="p-5">
                    <h3 className="text-lg font-semibold text-secondary-900">Cockpit-Status</h3>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-lg bg-secondary-50 p-3">
                        <div className="text-xs uppercase tracking-wide text-secondary-500">Verknüpfung</div>
                        <div className="mt-1 font-semibold text-secondary-900">
                          {detail.sync.hasLinkedMember ? 'Mit Plattformkonto verknüpft' : 'Nur CRM-Kontakt'}
                        </div>
                      </div>
                      <div className="rounded-lg bg-secondary-50 p-3">
                        <div className="text-xs uppercase tracking-wide text-secondary-500">Offene Integrationshinweise</div>
                        <div className="mt-1 font-semibold text-secondary-900">{detail.sync.openIssuesCount}</div>
                      </div>
                      <div className="rounded-lg bg-secondary-50 p-3">
                        <div className="text-xs uppercase tracking-wide text-secondary-500">Letzte lokale Änderung</div>
                        <div className="mt-1 font-semibold text-secondary-900">{formatDate(detail.sync.lastLocalUpdateAt)}</div>
                      </div>
                      <div className="rounded-lg bg-secondary-50 p-3">
                        <div className="text-xs uppercase tracking-wide text-secondary-500">Newsletter</div>
                        <div className="mt-1 font-semibold text-secondary-900">{detail.newsletter.status}</div>
                        <div className="text-xs text-secondary-500">
                          Bestätigt: {formatDate(detail.newsletter.confirmedAt)}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">Mitgliedschaft</h3>
                        <p className="text-sm text-secondary-600">
                          Aktuelle Zuordnung und direkte Anlage über die API-zu-CiviCRM-Schicht.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        className="w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        value={membershipKey}
                        onChange={(event) => setMembershipKey(event.target.value)}
                      >
                        {MEMBERSHIP_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Button onClick={() => void handleCreateMembership()} disabled={membershipBusy}>
                        {membershipBusy ? 'Lege an…' : 'Mitgliedschaft anlegen'}
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {detail.memberships.length === 0 && (
                        <div className="rounded-lg border border-dashed border-secondary-300 p-3 text-sm text-secondary-600">
                          In CiviCRM wurde noch keine Mitgliedschaft gefunden.
                        </div>
                      )}
                      {detail.memberships.map((membership) => (
                        <div key={String(membership.id)} className="rounded-lg border border-secondary-200 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-medium text-secondary-900">{membership.membershipType || 'Unbekannter Typ'}</div>
                            <Badge variant={badgeVariantForMembership(membership.status)}>{membership.status || 'ohne Status'}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-secondary-600">
                            Beitritt {formatDate(membership.joinDate)} · Laufzeit {formatDate(membership.startDate)} bis {formatDate(membership.endDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="p-5">
                <h3 className="text-lg font-semibold text-secondary-900">Beiträge und Spenden</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-secondary-200 text-left text-secondary-600">
                      <tr>
                        <th className="px-2 py-2">Datum</th>
                        <th className="px-2 py-2">Art</th>
                        <th className="px-2 py-2">Quelle</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2 text-right">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.contributions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-2 py-4 text-secondary-600">Noch keine Beiträge oder Spenden gefunden.</td>
                        </tr>
                      )}
                      {detail.contributions.map((item) => (
                        <tr key={`${item.sourceSystem}-${item.id}`} className="border-b border-secondary-100">
                          <td className="px-2 py-2">{formatDate(item.date)}</td>
                          <td className="px-2 py-2">{item.kind || 'Beitrag'}</td>
                          <td className="px-2 py-2">{item.sourceSystem}</td>
                          <td className="px-2 py-2">{item.status || 'offen'}</td>
                          <td className="px-2 py-2 text-right font-medium">{formatCurrency(item.amount, item.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-secondary-900">Rechnungen und Zahlungsstatus</h3>
                  <div className="mt-4 space-y-3">
                    {detail.invoices.length === 0 && (
                      <div className="rounded-lg border border-dashed border-secondary-300 p-3 text-sm text-secondary-600">
                        Keine lokalen Rechnungen vorhanden.
                      </div>
                    )}
                    {detail.invoices.map((invoice) => (
                      <div key={invoice.id} className="rounded-lg border border-secondary-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-secondary-900">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-secondary-600">
                              {invoice.invoiceType} · Ausgestellt {formatDate(invoice.issueDate)} · Fällig {formatDate(invoice.dueDate)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-secondary-900">{formatCurrency(invoice.totalAmount, invoice.currency)}</div>
                            <div className="text-xs text-secondary-600">{invoice.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-secondary-900">Consent und Newsletter-Nachweise</h3>
                  <div className="mt-4 space-y-3">
                    {detail.consents.length === 0 && (
                      <div className="rounded-lg border border-dashed border-secondary-300 p-3 text-sm text-secondary-600">
                        Keine dokumentierten Consent-Einträge vorhanden.
                      </div>
                    )}
                    {detail.consents.map((consent) => (
                      <div key={consent.id} className="rounded-lg border border-secondary-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-secondary-900">{consent.consent_type}</div>
                            <div className="text-sm text-secondary-600">
                              Version {consent.version} · Quelle {consent.source} · {consent.legal_basis}
                            </div>
                          </div>
                          <Badge variant={consent.status === 'granted' ? 'success' : 'secondary'}>
                            {consent.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-secondary-500">Erfasst am {formatDate(consent.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="text-lg font-semibold text-secondary-900">Veranstaltungen und Aktivitäten</h3>
                <div className="mt-4 space-y-3">
                  {detail.events.length === 0 && (
                    <div className="rounded-lg border border-dashed border-secondary-300 p-3 text-sm text-secondary-600">
                      Kein Eventbezug gefunden.
                    </div>
                  )}
                  {detail.events.map((event) => (
                    <div key={`${event.sourceSystem}-${event.id}`} className="rounded-lg border border-secondary-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-secondary-900">{event.title || 'Unbenannte Veranstaltung'}</div>
                          <div className="text-sm text-secondary-600">
                            {event.category || 'Allgemein'} · {event.location || 'Ort offen'} · {formatDate(event.startDate)}
                          </div>
                        </div>
                        <div className="text-right text-sm text-secondary-600">
                          <div>{event.status || 'offen'}</div>
                          <div className="text-xs uppercase tracking-wide">{event.sourceSystem}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
