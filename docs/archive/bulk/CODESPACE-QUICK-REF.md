# Codespace Setup - Quick Reference

## ✅ Automatic Setup (No Action Needed)

When Codespace starts:
1. ✅ npm install (dependencies)
2. ✅ bash .devcontainer/setup.sh (critical setup)
3. ✅ pwsh .devcontainer/setup-powershell.ps1 (optional, background)

**All with timeout protection and error handling!**

## 🧪 Verify Setup

```bash
bash .devcontainer/test-setup.sh
```

Expected: `✅ All critical tests passed!`

## 🔧 Manual Setup (If Needed)

```bash
# Interactive menu
bash .devcontainer/manual-setup.sh

# Or run directly:
bash .devcontainer/setup.sh                    # Bash setup
pwsh .devcontainer/setup-powershell.ps1        # PowerShell setup (optional)
```

## 🚀 Start Development

```bash
# All services
npm run dev:all

# Individual services
npm run dev:frontend    # http://localhost:5173
npm run dev:api        # http://localhost:8001
npm run dev:crm        # http://localhost:8000
npm run dev:games      # http://localhost:3000
```

## 🐛 Troubleshooting

### API won't start
```bash
cd api.menschlichkeit-oesterreich.at
timeout 120 pip install --user fastapi uvicorn python-dotenv
```

### PowerShell issues
```bash
# PowerShell is optional - Codespace works without it
# To retry:
pwsh .devcontainer/setup-powershell.ps1
```

### Full reset
```bash
# Stop all services
pkill -f "node\|python\|php\|uvicorn" || true

# Re-run setup
bash .devcontainer/setup.sh

# Test
bash .devcontainer/test-setup.sh
```

## 📚 Documentation

- Full troubleshooting: `..dokum/CODESPACE-TROUBLESHOOTING.md`
- Fix summary: `..dokum/CODESPACE-FIX-SUMMARY-2025-10-12.md`
- PowerShell guide: `.devcontainer/POWERSHELL.md`
- Setup README: `.devcontainer/README.md`

## 🎯 Key Improvements (2025-10-12)

✅ **Timeout Protection**
- pip install: 120-180 seconds
- composer install: 180 seconds
- PowerShell modules: 30 seconds each

✅ **Error Handling**
- Setup continues on individual failures
- PowerShell is optional (non-blocking)
- Clear error messages with solutions

✅ **Resource Monitoring**
- Shows memory, disk, CPU at end of setup
- Helps identify resource constraints

✅ **Automated Testing**
- test-setup.sh validates installation
- Color-coded results
- Non-blocking optional tests

## 🔢 Quick Commands

| Command | Purpose |
|---------|---------|
| `bash .devcontainer/test-setup.sh` | Verify setup |
| `bash .devcontainer/manual-setup.sh` | Interactive setup |
| `bash .devcontainer/setup.sh` | Run bash setup |
| `pwsh .devcontainer/setup-powershell.ps1` | Run PowerShell setup |
| `npm run dev:all` | Start all services |
| `free -h` | Check memory |
| `df -h /` | Check disk space |

---

**Updated**: 2025-10-12
**Status**: ✅ Production Ready
