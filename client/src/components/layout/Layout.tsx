import { Outlet, useLocation } from "wouter";
import { Helmet } from "react-helmet";

export default function Layout() {
  const [location] = useLocation();
  const currentLocale = location.split('/')[1] || 'en';
  const canonicalUrl = `https://www.snagging.me${location}`;
  const alternateUrls = {
    en: `https://www.snagging.me${location.replace(`/${currentLocale}`, '')}`,
    fr: `https://www.snagging.me/fr${location.replace(`/${currentLocale}`, '')}`,
    ru: `https://www.snagging.me/ru${location.replace(`/${currentLocale}`, '')}`
  };

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={alternateUrls.en} />
        <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
        <link rel="alternate" hrefLang="fr" href={alternateUrls.fr} />
        <link rel="alternate" hrefLang="ru" href={alternateUrls.ru} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
      </Helmet>
      <Outlet />
    </>
  );
}