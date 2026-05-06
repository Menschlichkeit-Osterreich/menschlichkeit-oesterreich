// Lighthouse CI Configuration for Menschlichkeit Österreich
// Performance budgets and accessibility requirements

const config = {
  ci: {
    collect: {
      startServerCommand: 'npm run dev:frontend',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2'] // Skip HTTP/2 in development
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Austrian NGO specific requirements
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'meta-description': ['error', { minScore: 1 }],

        // Resource budgets (aligned with Enterprise requirements)
        'resource-summary:script:size': ['error', { maxNumericValue: 307200 }], // 300KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 153600 }], // 150KB
        'resource-summary:total:size': ['error', { maxNumericValue: 2048000 }], // 2MB

        // Security
        'is-on-https': ['warn', { minScore: 1 }],
        'uses-http2': ['off'] // Skip in development
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: 'quality-reports/lighthouse',
      reportFilenamePattern: 'lighthouse-%%DATETIME%%-%%PATHNAME%%.%%EXTENSION%%'
    },
    server: {
      port: 9009,
      storage: 'quality-reports/lighthouse/lhci-storage'
    }
  },

  // Budget definitions for different page types
  budgets: [
    {
      path: '/*',
      timings: [
        {
          metric: 'first-contentful-paint',
          budget: 2000
        },
        {
          metric: 'largest-contentful-paint',
          budget: 4000
        },
        {
          metric: 'speed-index',
          budget: 3000
        },
        {
          metric: 'interactive',
          budget: 5000
        }
      ],
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 300
        },
        {
          resourceType: 'stylesheet',
          budget: 150
        },
        {
          resourceType: 'image',
          budget: 500
        },
        {
          resourceType: 'media',
          budget: 200
        },
        {
          resourceType: 'font',
          budget: 100
        }
      ],
      resourceCounts: [
        {
          resourceType: 'third-party',
          budget: 10
        }
      ]
    }
  ]
};

module.exports = config;
