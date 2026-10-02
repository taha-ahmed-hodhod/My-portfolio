import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import type { Locale } from './types';
import { ui } from './i18n';
import { usePortfolio } from './lib/data';
import { LoadingScreen } from './components/LoadingScreen';
import { Portfolio } from './pages/Portfolio';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

function Site() {
  const { data } = usePortfolio();
  const [locale, setLocale] = useState<Locale>('en');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    const name = data ? (locale === 'ar' ? data.profile.name_ar : data.profile.name_en) : 'Taha Ahmed Hodhod';
    const role = data ? (locale === 'ar' ? data.profile.role_ar : data.profile.role_en) : 'Full Stack Developer';
    document.title = name + ' · ' + role;
    document.querySelector('meta[name="description"]')?.setAttribute('content', role);
  }, [locale, data]);

  return (
    <>
      {!loaded && (
        <LoadingScreen
          done={!!data}
          name={locale === 'ar' ? 'طه هدهد' : 'TAHA HODHOD'}
          tagline={ui[locale].loadingTag}
          onFinish={() => setLoaded(true)}
        />
      )}
      {data && (
        <div className={loaded ? 'site-reveal is-in' : 'site-reveal'}>
          <Portfolio data={data} locale={locale} setLocale={setLocale} />
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
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Site />} />
      </Routes>
    </HashRouter>
  );
}
