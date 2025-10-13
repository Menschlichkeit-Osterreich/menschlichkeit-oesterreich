#!/bin/bash
# Figma MCP Integration Validation Script

echo "🔍 Validating Figma MCP Integration..."
echo ""

# Check if components exist
echo "📦 Checking generated components..."
COMPONENTS=(
    "frontend/src/components/figma/HeaderNavigation.tsx"
    "frontend/src/components/figma/HeroSection.tsx"
    "frontend/src/components/figma/FeaturesGrid.tsx"
    "frontend/src/components/figma/CtaSection.tsx"
    "frontend/src/components/figma/Footer.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "  ✅ $component"
    else
        echo "  ❌ Missing: $component"
        exit 1
    fi
done

# Check stories
echo ""
echo "📖 Checking Storybook stories..."
STORIES=(
    "frontend/src/components/figma/stories/HeaderNavigation.stories.tsx"
    "frontend/src/components/figma/stories/HeroSection.stories.tsx"
    "frontend/src/components/figma/stories/FeaturesGrid.stories.tsx"
    "frontend/src/components/figma/stories/CtaSection.stories.tsx"
    "frontend/src/components/figma/stories/Footer.stories.tsx"
)

for story in "${STORIES[@]}"; do
    if [ -f "$story" ]; then
        echo "  ✅ $story"
    else
        echo "  ❌ Missing: $story"
        exit 1
    fi
done

# Check documentation
echo ""
echo "📚 Checking documentation..."
DOCS=(
    "frontend/src/components/figma/README.md"
    "docs/FIGMA-MCP-INTEGRATION.md"
    "docs/FIGMA-COMPONENT-MAPPING.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc"
    else
        echo "  ❌ Missing: $doc"
        exit 1
    fi
done

# Check utilities
echo ""
echo "🔧 Checking utility files..."
if [ -f "frontend/src/lib/utils.ts" ]; then
    echo "  ✅ frontend/src/lib/utils.ts"
else
    echo "  ❌ Missing: frontend/src/lib/utils.ts"
    exit 1
fi

# Check scripts
echo ""
echo "⚙️ Checking integration script..."
if [ -f "scripts/figma-mcp-integration.mjs" ]; then
    echo "  ✅ scripts/figma-mcp-integration.mjs"
else
    echo "  ❌ Missing: scripts/figma-mcp-integration.mjs"
    exit 1
fi

# Check package.json scripts
echo ""
echo "📝 Checking npm scripts..."
if grep -q "figma:integrate" package.json; then
    echo "  ✅ figma:integrate script found"
else
    echo "  ❌ Missing: figma:integrate script"
    exit 1
fi

if grep -q "figma:components" package.json; then
    echo "  ✅ figma:components script found"
else
    echo "  ❌ Missing: figma:components script"
    exit 1
fi

echo ""
echo "✅ All validation checks passed!"
echo ""
echo "📊 Summary:"
echo "  - 5 components generated"
echo "  - 5 Storybook stories created"
echo "  - 3 documentation files created"
echo "  - Integration script ready"
echo "  - npm scripts configured"
echo ""
echo "🚀 Ready to use! Run:"
echo "  npm run figma:integrate  # Regenerate components"
echo "  npm run storybook        # View components"
