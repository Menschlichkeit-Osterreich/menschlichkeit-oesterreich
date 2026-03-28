import type { Metadata } from 'next';
import { Nunito_Sans, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const nunitoSans = Nunito_Sans({
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '600', '700', '800'],
	variable: '--font-nunito-sans',
	display: 'swap',
});

const sourceSans3 = Source_Sans_3({
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '600', '700'],
	variable: '--font-source-sans-3',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'Menschlichkeit Österreich',
	description:
		'Verein Menschlichkeit Österreich — Demokratie, Menschenrechte, soziale Gerechtigkeit und gesellschaftlicher Zusammenhalt.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="de-AT" className={`${nunitoSans.variable} ${sourceSans3.variable}`}>
			<body>{children}</body>
		</html>
	);
}
