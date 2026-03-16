/**
 * AppRoutes — shared route tree used by both the CSR hydration and SSR prerender.
 *
 * IMPORTANT: All public-facing page imports here are EAGER (no React.lazy) so that
 * ReactDOMServer.renderToString can resolve them synchronously during SSG prerendering.
 *
 * The App.tsx client entry uses its own lazy-loaded variant for code-splitting.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';

// Public pages — eager imports for SSR compatibility
import Home from './pages/Home';
import UeberUns from './pages/UeberUns';
import Statuten from './pages/Statuten';
import Beitragsordnung from './pages/Beitragsordnung';
import Veranstaltungen from './pages/Veranstaltungen';
import Bildung from './pages/Bildung';
import Materialien from './pages/Materialien';
import JoinPage from './pages/Join';
import DonatePage from './pages/Donate';
import SuccessPage from './pages/Success';
import KontaktPage from './pages/Kontakt';
import ImpressumPage from './pages/Impressum';
import DatenschutzPage from './pages/Datenschutz';
import SpielPage from './pages/Spiel';
import ForumPage from './pages/ForumPage';
import ForumThread from './pages/ForumThread';
import BlogPage from './pages/BlogPage';
import BlogArticle from './pages/BlogArticle';
import NotFoundPage from './pages/NotFound';

// New SEO/IA pages
import TeamPage from './pages/Team';
import TransparenzPage from './pages/Transparenz';
import PressePage from './pages/Presse';
import ThemenIndex from './pages/themen/ThemenIndex';
import DemokratiePage from './pages/themen/Demokratie';
import MenschenrechtePage from './pages/themen/Menschenrechte';
import SozialeGerechtigkeitPage from './pages/themen/SozialeGerechtigkeit';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/ueber-uns" element={<UeberUns />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/transparenz" element={<TransparenzPage />} />
        <Route path="/presse" element={<PressePage />} />
        <Route path="/statuten" element={<Statuten />} />
        <Route path="/beitragsordnung" element={<Beitragsordnung />} />
        <Route path="/themen" element={<ThemenIndex />} />
        <Route path="/themen/demokratie" element={<DemokratiePage />} />
        <Route path="/themen/menschenrechte" element={<MenschenrechtePage />} />
        <Route path="/themen/soziale-gerechtigkeit" element={<SozialeGerechtigkeitPage />} />
        <Route path="/veranstaltungen" element={<Veranstaltungen />} />
        <Route path="/bildung" element={<Bildung />} />
        <Route path="/materialien" element={<Materialien />} />
        <Route path="/mitglied-werden" element={<JoinPage />} />
        <Route path="/spenden" element={<DonatePage />} />
        <Route path="/erfolg" element={<SuccessPage />} />
        <Route path="/spiel" element={<SpielPage />} />
        <Route path="/kontakt" element={<KontaktPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:threadId" element={<ForumThread />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<BlogArticle />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
