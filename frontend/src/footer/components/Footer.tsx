import React from "react";
import { Trans, useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-hosting">
          <Trans i18nKey="footer.hosting" components={{ strong: <strong /> }} />
        </span>
        <span className="footer-credits">{t("footer.credits")}</span>
      </div>
    </footer>
  );
};

export default Footer;
