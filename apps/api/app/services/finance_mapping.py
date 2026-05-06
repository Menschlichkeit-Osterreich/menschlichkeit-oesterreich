from __future__ import annotations

from dataclasses import dataclass

from ..secrets_provider import get_secret


def _env(name: str, default: str, *, bsm_key: str) -> str:
    return get_secret(name, default, bsm_key=bsm_key).strip() or default


@dataclass(frozen=True)
class FinanceMappingConfig:
    company: str
    cost_center_default: str
    customer_group: str
    supplier_group: str
    territory: str
    bank_account: str
    stripe_clearing_account: str
    sepa_clearing_account: str
    cash_account: str
    membership_item_code: str
    donation_item_code: str
    event_item_code: str
    membership_income_account: str
    donation_income_account: str
    event_income_account: str
    expense_account_default: str


def get_finance_mapping_config() -> FinanceMappingConfig:
    return FinanceMappingConfig(
        company=_env("ERP_COMPANY", "Menschlichkeit Österreich", bsm_key="api/ERP_COMPANY"),
        cost_center_default=_env("ERP_COST_CENTER_DEFAULT", "Hauptverein - MOE", bsm_key="api/ERP_COST_CENTER_DEFAULT"),
        customer_group=_env("ERP_CUSTOMER_GROUP", "All Customer Groups", bsm_key="api/ERP_CUSTOMER_GROUP"),
        supplier_group=_env("ERP_SUPPLIER_GROUP", "All Supplier Groups", bsm_key="api/ERP_SUPPLIER_GROUP"),
        territory=_env("ERP_TERRITORY", "All Territories", bsm_key="api/ERP_TERRITORY"),
        bank_account=_env("ERP_BANK_ACCOUNT", "1100 - Bank - MOE", bsm_key="api/ERP_BANK_ACCOUNT"),
        stripe_clearing_account=_env("ERP_STRIPE_CLEARING_ACCOUNT", "1360 - Stripe Clearing - MOE", bsm_key="api/ERP_STRIPE_CLEARING_ACCOUNT"),
        sepa_clearing_account=_env("ERP_SEPA_CLEARING_ACCOUNT", "1370 - SEPA Clearing - MOE", bsm_key="api/ERP_SEPA_CLEARING_ACCOUNT"),
        cash_account=_env("ERP_CASH_ACCOUNT", "1000 - Kassa - MOE", bsm_key="api/ERP_CASH_ACCOUNT"),
        membership_item_code=_env("ERP_MEMBERSHIP_ITEM_CODE", "MEMBERSHIP-FEE", bsm_key="api/ERP_MEMBERSHIP_ITEM_CODE"),
        donation_item_code=_env("ERP_DONATION_ITEM_CODE", "DONATION", bsm_key="api/ERP_DONATION_ITEM_CODE"),
        event_item_code=_env("ERP_EVENT_ITEM_CODE", "EVENT-INCOME", bsm_key="api/ERP_EVENT_ITEM_CODE"),
        membership_income_account=_env("ERP_MEMBERSHIP_INCOME_ACCOUNT", "4000 - Mitgliedsbeitraege - MOE", bsm_key="api/ERP_MEMBERSHIP_INCOME_ACCOUNT"),
        donation_income_account=_env("ERP_DONATION_INCOME_ACCOUNT", "4100 - Spenden - MOE", bsm_key="api/ERP_DONATION_INCOME_ACCOUNT"),
        event_income_account=_env("ERP_EVENT_INCOME_ACCOUNT", "4200 - Veranstaltungserloese - MOE", bsm_key="api/ERP_EVENT_INCOME_ACCOUNT"),
        expense_account_default=_env("ERP_EXPENSE_ACCOUNT_DEFAULT", "7300 - Sonstige Aufwendungen - MOE", bsm_key="api/ERP_EXPENSE_ACCOUNT_DEFAULT"),
    )


def resolve_income_mapping(financial_type: str) -> dict[str, str]:
    cfg = get_finance_mapping_config()
    normalized = (financial_type or "").strip().lower()
    if normalized in {"membership", "membership_fee", "mitgliedsbeitrag"}:
        return {
            "item_code": cfg.membership_item_code,
            "income_account": cfg.membership_income_account,
            "label": "Mitgliedsbeitrag",
        }
    if normalized in {"event", "event_income", "veranstaltung"}:
        return {
            "item_code": cfg.event_item_code,
            "income_account": cfg.event_income_account,
            "label": "Veranstaltungserlös",
        }
    return {
        "item_code": cfg.donation_item_code,
        "income_account": cfg.donation_income_account,
        "label": "Spende",
    }


def resolve_clearing_account(channel: str | None) -> str:
    cfg = get_finance_mapping_config()
    normalized = (channel or "").strip().lower()
    if normalized in {"stripe", "card", "visa", "mastercard", "amex", "apple_pay", "google_pay"}:
        return cfg.stripe_clearing_account
    if normalized in {"sepa", "bank_transfer", "bank", "eps", "sofort"}:
        return cfg.sepa_clearing_account
    if normalized in {"cash", "pos"}:
        return cfg.cash_account
    return cfg.bank_account


def finance_mapping_snapshot() -> dict[str, str]:
    cfg = get_finance_mapping_config()
    return {
        "company": cfg.company,
        "cost_center_default": cfg.cost_center_default,
        "customer_group": cfg.customer_group,
        "supplier_group": cfg.supplier_group,
        "territory": cfg.territory,
        "bank_account": cfg.bank_account,
        "stripe_clearing_account": cfg.stripe_clearing_account,
        "sepa_clearing_account": cfg.sepa_clearing_account,
        "cash_account": cfg.cash_account,
        "membership_income_account": cfg.membership_income_account,
        "donation_income_account": cfg.donation_income_account,
        "event_income_account": cfg.event_income_account,
        "expense_account_default": cfg.expense_account_default,
    }
