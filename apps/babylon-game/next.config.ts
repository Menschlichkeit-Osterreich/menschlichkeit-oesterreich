import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,

	turbopack: {
		rules: {
			"*.{fx}": {
				loaders: ["raw-loader"],
				as: "*.js",
			},
		},
	},

	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve = config.resolve ?? {};
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
			};
		}
		return config;
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
					},
				],
			},
			{
				source: "/scene/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
};

export default nextConfig;
