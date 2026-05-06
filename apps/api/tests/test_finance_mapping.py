from app.services.finance_mapping import resolve_clearing_account, resolve_income_mapping


def test_resolve_income_mapping_for_membership():
    mapping = resolve_income_mapping("membership_fee")
    assert mapping["item_code"] == "MEMBERSHIP-FEE"
    assert "Mitglied" in mapping["label"]


def test_resolve_income_mapping_for_donation_default():
    mapping = resolve_income_mapping("donation")
    assert mapping["item_code"] == "DONATION"
    assert mapping["income_account"].startswith("4100")


def test_resolve_clearing_account_for_stripe():
    account = resolve_clearing_account("stripe")
    assert "Stripe" in account


def test_resolve_clearing_account_for_sepa():
    account = resolve_clearing_account("sepa")
    assert "SEPA" in account
