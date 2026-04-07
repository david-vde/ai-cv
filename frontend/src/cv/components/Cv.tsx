import React from "react";
import {useTranslation} from "react-i18next";
import {useConfig} from "../../configs/context/ConfigContext.tsx";
import _ from "lodash";

const Cv: React.FC = () => {
  const { t } = useTranslation();
  const { configs } = useConfig();
  const pdfUrl: string|undefined = _.get(configs, ['contact.cv_url']);

  return (
    <div className="cv">
      <div className="download">
        <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" className="link">
          ⬇ {t("cv.downloadMyPdfCV")}
        </a>
      </div>

      <embed
        src={`${pdfUrl}#toolbar=0&navpanes=0`}
        type="application/pdf"
        width="80%"
        height="100%"
      />
    </div>
  );
}

export default Cv;