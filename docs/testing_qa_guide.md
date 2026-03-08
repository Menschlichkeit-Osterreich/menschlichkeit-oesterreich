# Testing und Quality Assurance für Menschlichkeit Österreich

## 1. Frontend Testing-Strategie

### 1.1 Unit Tests mit React Testing Library
```typescript
// apps/website/src/components/__tests__/JoinForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinForm } from '../JoinForm';

describe('JoinForm Component', () => {
  it('renders form fields correctly', () => {
    render(<JoinForm />);
    
    expect(screen.getByLabelText(/vorname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nachname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<JoinForm />);
    
    const submitButton = screen.getByRole('button', { name: /antrag senden/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/erforderlich/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    
    render(<JoinForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText(/vorname/i), 'Max');
    await user.type(screen.getByLabelText(/nachname/i), 'Mustermann');
    await user.type(screen.getByLabelText(/e-mail/i), 'max@example.com');
    
    const submitButton = screen.getByRole('button', { name: /antrag senden/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it('displays error messages on API failure', async () => {
    const user = userEvent.setup();
    const mockError = new Error('API Error');
    
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);
    
    render(<JoinForm />);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/vorname/i), 'Max');
    await user.type(screen.getByLabelText(/nachname/i), 'Mustermann');
    await user.type(screen.getByLabelText(/e-mail/i), 'max@example.com');
    
    const submitButton = screen.getByRole('button', { name: /antrag senden/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/fehler/i)).toBeInTheDocument();
    });
  });
});
```

### 1.2 Integration Tests
```typescript
// apps/website/src/__tests__/integration/auth-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../App';
import { server } from '../../mocks/server';
import { rest } from 'msw';

describe('Authentication Flow', () => {
  it('completes login flow successfully', async () => {
    const user = userEvent.setup();
    
    // Mock API response
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.json({
            success: true,
            data: {
              token: 'test-token',
              user: {
                id: '1',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
              },
            },
          })
        );
      })
    );
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Navigate to login
    const loginLink = screen.getByRole('link', { name: /login/i });
    await user.click(loginLink);
    
    // Fill login form
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/passwort/i), 'password123');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    await user.click(submitButton);
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
```

### 1.3 E2E Tests mit Playwright
```typescript
// apps/website/e2e/join-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Member Join Flow', () => {
  test('should complete membership application', async ({ page }) => {
    // Navigate to join page
    await page.goto('/mitglied-werden');
    
    // Fill form
    await page.fill('input[name="firstName"]', 'Max');
    await page.fill('input[name="lastName"]', 'Mustermann');
    await page.fill('input[name="email"]', 'max@example.com');
    await page.fill('input[name="phone"]', '+43 1 234 567');
    
    // Select membership type
    await page.click('input[value="ordentlich"]');
    
    // Select fee category
    await page.selectOption('select[name="category"]', 'standard');
    
    // Accept terms
    await page.click('input[name="agreeStatuten"]');
    await page.click('input[name="agreeDSGVO"]');
    await page.click('input[name="agreeBeitragsordnung"]');
    
    // Submit
    await page.click('button:has-text("Antrag senden")');
    
    // Verify success
    await expect(page).toHaveURL('/erfolg');
    await expect(page.locator('text=Danke für deine Anmeldung')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/mitglied-werden');
    
    // Try to submit empty form
    await page.click('button:has-text("Antrag senden")');
    
    // Verify error messages
    await expect(page.locator('text=erforderlich')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/mitglied-werden');
    
    // Fill form with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button:has-text("Antrag senden")');
    
    // Verify error
    await expect(page.locator('text=ungültige E-Mail')).toBeVisible();
  });
});
```

## 2. Backend Testing-Strategie

### 2.1 Unit Tests mit Pytest
```python
# apps/api/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth.rbac import Role

client = TestClient(app)

class TestAuthentication:
    def test_login_success(self):
        """Test successful login"""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == "test@example.com"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
    
    def test_login_missing_email(self):
        """Test login with missing email"""
        response = client.post(
            "/auth/login",
            json={"password": "password123"}
        )
        
        assert response.status_code == 422
    
    def test_token_validation(self):
        """Test JWT token validation"""
        # Login first
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        token = login_response.json()["data"]["token"]
        
        # Use token to access protected endpoint
        response = client.get(
            "/member/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
    
    def test_expired_token(self):
        """Test access with expired token"""
        response = client.get(
            "/member/profile",
            headers={"Authorization": "Bearer expired.token.here"}
        )
        
        assert response.status_code == 401
```

### 2.2 Integration Tests
```python
# apps/api/tests/test_membership_flow.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.main import app
from src.models import Contact, Membership

client = TestClient(app)

@pytest.fixture
def auth_token(db: Session):
    """Create test user and return auth token"""
    # Create test contact
    contact = Contact(
        email="test@example.com",
        first_name="Test",
        last_name="User"
    )
    db.add(contact)
    db.commit()
    
    # Login and get token
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    return response.json()["data"]["token"]

class TestMembershipFlow:
    def test_create_membership(self, auth_token, db: Session):
        """Test membership creation"""
        response = client.post(
            "/memberships/create",
            json={
                "contact_id": 1,
                "membership_type_id": 1,
                "start_date": "2025-01-01"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify in database
        membership = db.query(Membership).filter_by(contact_id=1).first()
        assert membership is not None
        assert membership.status == "pending"
    
    def test_get_member_metrics(self, auth_token):
        """Test fetching member metrics"""
        response = client.get(
            "/metrics/members",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "total" in data["data"]
        assert "active" in data["data"]
```

### 2.3 API Tests mit Pytest-BDD
```python
# apps/api/tests/features/membership.feature
Feature: Membership Management
  Scenario: Create new membership
    Given a user is logged in
    When the user creates a membership
    Then the membership should be created with pending status
    And the user should receive a confirmation email

  Scenario: Update membership status
    Given a membership exists with pending status
    When an admin approves the membership
    Then the membership status should be active
    And the user should receive an approval email
```

## 3. Performance Testing

### 3.1 Load Testing mit Locust
```python
# apps/api/tests/load_test.py
from locust import HttpUser, task, between
import random

class MenschlichkeitUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login before starting tasks"""
        response = self.client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        self.token = response.json()["data"]["token"]
    
    @task(3)
    def get_metrics(self):
        """Get member metrics"""
        self.client.get(
            "/metrics/members",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(2)
    def get_finance_metrics(self):
        """Get finance metrics"""
        self.client.get(
            "/metrics/finance",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def create_contact(self):
        """Create new contact"""
        self.client.post(
            "/contacts/create",
            json={
                "email": f"user{random.randint(1, 10000)}@example.com",
                "first_name": "Test",
                "last_name": "User"
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

### 3.2 Lighthouse Performance Testing
```bash
#!/bin/bash
# scripts/lighthouse-audit.sh

# Install lighthouse
npm install -g @lhci/cli@latest lighthouse

# Run audit
lhci autorun --config=./lighthouserc.json
```

```json
{
  "ci": {
    "collect": {
      "url": ["https://localhost:3000"],
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--headless --no-sandbox"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

## 4. Security Testing

### 4.1 OWASP Security Testing
```bash
#!/bin/bash
# scripts/security-test.sh

# Install OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://localhost:8000 \
  -r security-report.html
```

### 4.2 Dependency Vulnerability Scanning
```bash
# Check for vulnerable dependencies
npm audit
pip audit

# Fix vulnerabilities
npm audit fix
pip install --upgrade pip-audit
pip-audit --fix
```

## 5. Accessibility Testing

### 5.1 Automated Accessibility Testing
```typescript
// apps/website/src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Home } from '../pages/Home';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Home page should not have accessibility violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('JoinForm should not have accessibility violations', async () => {
    const { container } = render(<JoinForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5.2 Manual WCAG Testing Checklist
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility (NVDA, JAWS)
- [ ] Color contrast ratios (WCAG AA minimum 4.5:1)
- [ ] Form labels and error messages
- [ ] Focus indicators visible
- [ ] Alternative text for images
- [ ] Video captions and transcripts
- [ ] Semantic HTML structure

## 6. Testing Coverage Goals

| Component | Target Coverage | Current |
|-----------|-----------------|---------|
| Frontend Components | 80% | - |
| Frontend Utilities | 90% | - |
| Backend Routes | 85% | - |
| Backend Services | 90% | - |
| Backend Utils | 95% | - |
| Overall | 85% | - |

## 7. CI/CD Testing Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test --coverage
      - run: pnpm run test:e2e

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pytest --cov=src --cov-report=xml
      - run: pytest tests/load_test.py

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: pip audit
```

## 8. Testing Checkliste

- [ ] Unit Tests für Frontend schreiben (80% Coverage)
- [ ] Integration Tests für Frontend schreiben
- [ ] E2E Tests mit Playwright einrichten
- [ ] Unit Tests für Backend schreiben (90% Coverage)
- [ ] Integration Tests für Backend schreiben
- [ ] Load Tests mit Locust durchführen
- [ ] Lighthouse Performance Audit durchführen
- [ ] OWASP Security Testing durchführen
- [ ] Accessibility Testing durchführen
- [ ] Dependency Vulnerability Scanning einrichten
- [ ] CI/CD Test Integration konfigurieren
- [ ] Test Coverage Reports generieren
- [ ] Performance Baselines festlegen
- [ ] Security Baselines festlegen
