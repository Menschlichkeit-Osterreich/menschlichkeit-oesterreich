# GitHub Codespace Setup - Menschlichkeit Österreich

## 🚀 Quick Start

When your Codespace starts, it will automatically:

1. Install Node.js dependencies
2. Attempt to install Python dependencies for the API service (with timeout protection)
3. Set up environment files from examples
4. Configure development ports
5. **NEW:** PowerShell setup runs in background (optional, non-blocking)

**Setup Improvements (2025-10-12):**
- ✅ Timeout protection for all long-running operations
- ✅ PowerShell setup is now optional and doesn't block Codespace startup
- ✅ Better error handling - setup continues even if individual steps fail
- ✅ Resource monitoring - shows available memory, disk, and CPU

## 🧪 Verify Setup

After Codespace starts, verify everything is working:

```bash
# Run automated tests
bash .devcontainer/test-setup.sh

# Expected output: "✅ All critical tests passed!"
```

## 🌐 Development Servers

After setup, you can start the development environment:

```bash
# Start all services
npm run dev:all

# Or start individual services:
npm run dev:frontend    # Frontend (React) - http://localhost:5173
npm run dev:api        # API (FastAPI) - http://localhost:8001
npm run dev:crm        # CRM (PHP) - http://localhost:8000
npm run dev:games      # Games (Python) - http://localhost:3000
```

## 🔧 Troubleshooting

### Common Issues (Updated 2025-10-12)

**Setup hangs or times out:**
- ✅ The setup now has automatic timeout protection (120-180 seconds per operation)
- ✅ PowerShell module installation is optional and won't block the setup
- Check the terminal output for specific error messages

### Python Dependencies Issue

If the API service fails to start due to missing dependencies:

```bash
cd api.menschlichkeit-oesterreich.at
# With timeout protection (recommended)
timeout 120 pip install --user fastapi uvicorn python-dotenv
# OR for full requirements:
timeout 180 pip install --user -r requirements.txt
# OR for minimal setup:
pip install --user -r requirements-minimal.txt
```

### PowerShell Setup Issues

PowerShell setup is now optional and runs in the background:

```bash
# PowerShell setup runs automatically but won't block Codespace startup
# To manually retry if needed:
pwsh .devcontainer/setup-powershell.ps1

# Codespace works fine without PowerShell modules
```

### Network/Timeout Issues

If pip installation times out during setup:

```bash
cd api.menschlichkeit-oesterreich.at
# The setup script now uses timeout automatically
timeout 300 pip install --user --timeout 300 -r requirements.txt
# OR install essentials only:
pip install --user -r requirements-minimal.txt
```

### Environment Configuration

The setup automatically creates `.env` files from examples. To customize:

1. **API Configuration**: Edit `api.menschlichkeit-oesterreich.at/.env`
2. **Frontend Configuration**: Edit `frontend/.env`
3. **CRM Configuration**: Edit `crm.menschlichkeit-oesterreich.at/.env`

## 📊 Quality & Testing

```bash
# Run quality gates
npm run quality:gates

# Run linting
npm run lint:all

# Run tests
npm run test:all
```

## 🐳 Docker Services

For advanced features requiring Docker:

```bash
# Start n8n automation
npm run n8n:start

# View n8n logs
npm run n8n:logs
```

## 🆘 Getting Help

If services won't start:

1. Check the terminal output for specific error messages
2. Verify prerequisites: `node --version`, `python3 --version`, `php --version`
3. Try restarting individual services
4. Check the `.env` files are properly configured

## 📁 Project Structure

- `frontend/` - React/TypeScript frontend
- `api.menschlichkeit-oesterreich.at/` - FastAPI Python backend
- `crm.menschlichkeit-oesterreich.at/` - CiviCRM PHP application
- `web/` - Educational games
- `automation/n8n/` - Workflow automation
- `scripts/` - Development and deployment scripts
