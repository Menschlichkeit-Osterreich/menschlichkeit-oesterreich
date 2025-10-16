#!/bin/bash
# Manual setup trigger for troubleshooting
# Use this if automatic setup failed or needs to be re-run

echo "🔧 Manual Codespace Setup Trigger"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Ask for confirmation
echo "This will re-run the Codespace setup scripts."
echo ""
echo "What would you like to do?"
echo "  1. Run full setup (bash + PowerShell)"
echo "  2. Run only bash setup (faster, skip PowerShell)"
echo "  3. Run only PowerShell setup"
echo "  4. Test current setup (no changes)"
echo "  5. Cancel"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Running full setup..."
        echo ""
        bash .devcontainer/setup.sh
        echo ""
        echo "⏳ Starting PowerShell setup..."
        pwsh .devcontainer/setup-powershell.ps1
        echo ""
        echo "🧪 Testing setup..."
        bash .devcontainer/test-setup.sh
        ;;
    2)
        echo ""
        echo "🚀 Running bash setup only..."
        bash .devcontainer/setup.sh
        echo ""
        echo "🧪 Testing setup..."
        bash .devcontainer/test-setup.sh
        ;;
    3)
        echo ""
        echo "⏳ Running PowerShell setup only..."
        pwsh .devcontainer/setup-powershell.ps1
        ;;
    4)
        echo ""
        echo "🧪 Testing current setup..."
        bash .devcontainer/test-setup.sh
        ;;
    5)
        echo ""
        echo "❌ Cancelled"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "📝 Next steps:"
echo "  - If tests passed: npm run dev:all"
echo "  - If tests failed: Check ..dokum/CODESPACE-TROUBLESHOOTING.md"
echo "  - For help: bash .devcontainer/manual-setup.sh"
