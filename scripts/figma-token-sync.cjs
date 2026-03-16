#!/usr/bin/env node
/**
 * 🎨 FIGMA DESIGN TOKEN SYNC PIPELINE
 * Synchronisiert Design Tokens zwischen Figma und lokalem Design System
 */

const fs = require('fs').promises;
const path = require('path');

class FigmaTokenSync {
    constructor(config = {}) {
        this.figmaFileKey = config.figmaFileKey || process.env.FIGMA_FILE_KEY;
        this.figmaToken = config.figmaToken || process.env.FIGMA_ACCESS_TOKEN;
        this.designSystemPath = config.designSystemPath || './figma-design-system';
        this.tokensFile = path.join(this.designSystemPath, '00_design-tokens.json');
        this.tailwindConfigFile = './tailwind.config.js';
    }

    /**
     * Fetch Design Tokens from Figma API
     */
    async fetchFigmaTokens() {
        console.log('🔍 Fetching tokens from Figma...');
        
        if (!this.figmaFileKey || !this.figmaToken) {
            console.warn('⚠️  Figma API credentials not configured. Using local tokens.');
            return await this.loadLocalTokens();
        }

        try {
            const response = await fetch(`https://api.figma.com/v1/files/${this.figmaFileKey}`, {
                headers: {
                    'X-Figma-Token': this.figmaToken
                }
            });

            if (!response.ok) {
                throw new Error(`Figma API error: ${response.status}`);
            }

            const data = await response.json();
            return this.extractTokensFromFigmaFile(data);
        } catch (error) {
            console.error('❌ Figma API fetch failed:', error.message);
            console.log('📋 Falling back to local tokens...');
            return await this.loadLocalTokens();
        }
    }

    /**
     * Extract Design Tokens from Figma file structure
     */
    extractTokensFromFigmaFile(figmaData) {
        // This would parse the Figma file structure
        // For now, we'll use the existing token structure
        console.log('🔄 Extracting tokens from Figma file...');
        
        // In a real implementation, this would parse:
        // - Color styles from figmaData.document.styles
        // - Text styles from figmaData.document.textStyles  
        // - Effect styles (shadows) from figmaData.document.effects
        
        return {
            colors: this.extractColorTokens(figmaData),
            typography: this.extractTypographyTokens(figmaData), 
            spacing: this.extractSpacingTokens(figmaData),
            effects: this.extractEffectTokens(figmaData)
        };
    }

    /**
     * Load existing local tokens
     */
    async loadLocalTokens() {
        try {
            const tokensContent = await fs.readFile(this.tokensFile, 'utf-8');
            const tokens = JSON.parse(tokensContent);
            console.log('✅ Local design tokens loaded');
            return tokens.designTokens;
        } catch (error) {
            console.error('❌ Failed to load local tokens:', error.message);
            return {};
        }
    }

    /**
     * Update Tailwind CSS configuration with new tokens
     */
    async updateTailwindConfig(tokens) {
        console.log('🎨 Updating Tailwind CSS configuration...');
        
        const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './figma-design-system/**/*.{ts,tsx,md}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: ${JSON.stringify(tokens.colors || {}, null, 8)},
      fontFamily: ${JSON.stringify(tokens.typography?.fontFamily || {}, null, 8)}, 
      fontSize: ${JSON.stringify(tokens.typography?.fontSize || {}, null, 8)},
      spacing: ${JSON.stringify(tokens.spacing || {}, null, 8)},
      borderRadius: ${JSON.stringify(tokens.borderRadius || {}, null, 8)},
      boxShadow: ${JSON.stringify(tokens.shadows || {}, null, 8)},
    },
  },
  plugins: [],
}`;

        try {
            await fs.writeFile(this.tailwindConfigFile, tailwindConfig);
            console.log('✅ Tailwind config updated');
        } catch (error) {
            console.error('❌ Failed to update Tailwind config:', error.message);
        }
    }

    /**
     * Update CSS custom properties
     */
    async updateCSSVariables(tokens) {
        console.log('📝 Updating CSS variables...');
        
        const cssVars = this.generateCSSVariables(tokens);
        const cssFile = path.join(this.designSystemPath, 'styles', 'design-tokens.css');
        
        const cssContent = `
/* 🎨 Auto-generated Design Tokens CSS Variables */
/* Generated on: ${new Date().toISOString()} */

:root {
${cssVars}
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode overrides would go here */
  }
}

.dark {
  /* Dark mode class overrides would go here */  
}`;

        try {
            await fs.writeFile(cssFile, cssContent);
            console.log('✅ CSS variables updated');
        } catch (error) {
            console.error('❌ Failed to update CSS variables:', error.message);
        }
    }

    /**
     * Generate CSS custom properties from tokens
     */
    generateCSSVariables(tokens) {
        let cssVars = '';
        
        // Colors
        if (tokens.colors) {
            cssVars += '  /* Colors */\n';
            Object.entries(tokens.colors).forEach(([colorName, colorValue]) => {
                if (typeof colorValue === 'object') {
                    Object.entries(colorValue).forEach(([shade, hex]) => {
                        cssVars += `  --color-${colorName}-${shade}: ${hex};\n`;
                    });
                } else {
                    cssVars += `  --color-${colorName}: ${colorValue};\n`;
                }
            });
            cssVars += '\n';
        }

        // Typography
        if (tokens.typography?.fontSize) {
            cssVars += '  /* Typography */\n';
            Object.entries(tokens.typography.fontSize).forEach(([size, value]) => {
                cssVars += `  --font-size-${size}: ${value};\n`;
            });
            cssVars += '\n';
        }

        // Spacing  
        if (tokens.spacing) {
            cssVars += '  /* Spacing */\n';
            Object.entries(tokens.spacing).forEach(([key, value]) => {
                cssVars += `  --spacing-${key}: ${value};\n`;
            });
            cssVars += '\n';
        }

        return cssVars;
    }

    /**
     * Update component documentation
     */
    async updateComponentDocs(tokens) {
        console.log('📚 Updating component documentation...');
        
        const docsPath = path.join(this.designSystemPath, 'TOKEN-REFERENCE.md');
        const docsContent = `
# 🎨 Design Token Reference
*Auto-generated on: ${new Date().toISOString()}*

## Color Palette
${this.generateColorDocs(tokens.colors)}

## Typography Scale  
${this.generateTypographyDocs(tokens.typography)}

## Spacing System
${this.generateSpacingDocs(tokens.spacing)}

## Usage Examples

### CSS Variables
\`\`\`css
.primary-button {
  background-color: var(--color-primary-500);
  color: var(--color-primary-foreground);
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-base);
}
\`\`\`

### Tailwind Classes
\`\`\`html
<button class="bg-primary-500 text-white px-6 py-4 text-base">
  Primary Button
</button>
\`\`\`

### React Components
\`\`\`tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Click me
</Button>
\`\`\`
`;

        try {
            await fs.writeFile(docsPath, docsContent);
            console.log('✅ Documentation updated');
        } catch (error) {
            console.error('❌ Failed to update documentation:', error.message);
        }
    }

    /**
     * Generate color documentation
     */
    generateColorDocs(colors) {
        if (!colors) return 'No color tokens defined.';
        
        let docs = '';
        Object.entries(colors).forEach(([name, palette]) => {
            docs += `\n### ${name.charAt(0).toUpperCase() + name.slice(1)}\n`;
            if (typeof palette === 'object') {
                Object.entries(palette).forEach(([shade, hex]) => {
                    docs += `- **${shade}**: \`${hex}\`\n`;
                });
            } else {
                docs += `- **Value**: \`${palette}\`\n`;
            }
        });
        return docs;
    }

    /**
     * Generate typography documentation  
     */
    generateTypographyDocs(typography) {
        if (!typography?.fontSize) return 'No typography tokens defined.';
        
        let docs = '\n';
        Object.entries(typography.fontSize).forEach(([size, value]) => {
            docs += `- **${size}**: \`${value}\`\n`;
        });
        return docs;
    }

    /**
     * Generate spacing documentation
     */
    generateSpacingDocs(spacing) {
        if (!spacing) return 'No spacing tokens defined.';
        
        let docs = '\n';
        Object.entries(spacing).forEach(([key, value]) => {
            docs += `- **${key}**: \`${value}\`\n`;
        });
        return docs;
    }

    /**
     * Main sync function
     */
    async sync() {
        console.log('🚀 Starting Figma Design Token Sync...');
        
        try {
            // 1. Fetch tokens from Figma
            const tokens = await this.fetchFigmaTokens();
            
            // 2. Update local token file
            const updatedTokenFile = {
                designTokens: tokens,
                lastSync: new Date().toISOString(),
                source: this.figmaFileKey ? 'figma' : 'local'
            };
            
            await fs.writeFile(this.tokensFile, JSON.stringify(updatedTokenFile, null, 2));
            console.log('✅ Token file updated');
            
            // 3. Update Tailwind configuration
            await this.updateTailwindConfig(tokens);
            
            // 4. Update CSS variables
            await this.updateCSSVariables(tokens);
            
            // 5. Update documentation
            await this.updateComponentDocs(tokens);
            
            console.log('🎉 Figma sync completed successfully!');
            
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            process.exit(1);
        }
    }

    // Placeholder methods for Figma API parsing
    extractColorTokens(_figmaData) { return {}; }
    extractTypographyTokens(_figmaData) { return {}; }
    extractSpacingTokens(_figmaData) { return {}; }
    extractEffectTokens(_figmaData) { return {}; }
}

// CLI Usage
if (require.main === module) {
    const sync = new FigmaTokenSync({
        figmaFileKey: process.env.FIGMA_FILE_KEY,
        figmaToken: process.env.FIGMA_ACCESS_TOKEN,
        designSystemPath: './figma-design-system'
    });
    
    sync.sync().catch(console.error);
}

module.exports = FigmaTokenSync;