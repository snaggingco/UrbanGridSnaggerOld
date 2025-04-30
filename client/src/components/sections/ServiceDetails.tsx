
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export function ServiceMetaTags({ service }) {
  const { t } = useTranslation();
  
  return (
    <Helmet>
      <title>{t(`services.${service}.title`)} | Snagging.me</title>
      <meta name="description" content={t(`services.${service}.description`)} />
      <meta property="og:title" content={t(`services.${service}.title`)} />
      <meta property="og:description" content={t(`services.${service}.description`)} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`/images/services/${service}.jpg`} />
    </Helmet>
  );
}
