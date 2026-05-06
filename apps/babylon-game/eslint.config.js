import nextConfig from "eslint-config-next";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...nextConfig,
	...nextTypescript,
	{
		ignores: [
			".next/",
			"out/",
			"node_modules/",
			"menschlichkeit-oesterreich-development/",
			"_live-deploy-head/",
			"public/",
		],
	},
];
