import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import type { Locale } from './types';
import { usePortfolio } from './lib/data';
import { PortfolioSkeleton } from './components/PortfolioSkeleton';
import { AdminDashboardSkeleton } from './components/admin/AdminDashboardSkeleton';

// Code-split routes so Chart.js and Admin tools don't bloat the public portfolio bundle
const Portfolio = lazy(() => import('./pages/Portfolio').then((m) => ({ default: m.Portfolio })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

function Site() {
  const { data } = usePortfolio();
  const [locale, setLocale] = useState<Locale>('en');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    const name = data ? (locale === 'ar' ? data.profile.name_ar : data.profile.name_en) : 'Taha Ahmed Hodhod';
    const role = data ? (locale === 'ar' ? data.profile.role_ar : data.profile.role_en) : 'Full Stack Developer';
    document.title = name + ' · ' + role;
    document.querySelector('meta[name="description"]')?.setAttribute('content', role);
  }, [locale, data]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setRevealed(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <>
      {(!data || !revealed) && (
        <PortfolioSkeleton locale={locale} />
      )}
      {data && (
        <div className={`site-reveal ${revealed ? 'is-in' : ''}`}>
          <Suspense fallback={<PortfolioSkeleton locale={locale} />}>
            <Portfolio data={data} locale={locale} setLocale={setLocale} />
          </Suspense>
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminDashboardSkeleton />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminDashboardSkeleton />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Suspense fallback={<AdminDashboardSkeleton />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin/dashboard/:tab"
          element={
            <Suspense fallback={<AdminDashboardSkeleton />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin/:tab"
          element={
            <Suspense fallback={<AdminDashboardSkeleton />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route path="*" element={<Site />} />
      </Routes>
    </HashRouter>
  );
}
