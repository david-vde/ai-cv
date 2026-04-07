import React, {ReactNode, useState} from "react";
import ReactCountryFlag from "react-country-flag";
import Select, { StylesConfig } from "react-select";
import { useTranslation } from "react-i18next";

interface LanguageOption {
  value: string;
  label: string;
  code: string;
}

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language.split('-')[0]);

  const formatOptionLabel = ({ label, code }: LanguageOption): ReactNode => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <ReactCountryFlag countryCode={code} svg />
      <span>{label}</span>
    </div>
  );

  const options: LanguageOption[] = [
    { value: "fr", label: "Français", code: "FR" },
    { value: "en", label: "English", code: "GB" },
    { value: "nl", label: "Nederlands", code: "NL" },
  ];

  const selectedOption: LanguageOption | undefined = options.find(option => option.value === selectedLanguage);

  const customStyles: StylesConfig<LanguageOption, false> = {
    control: (base, state) => ({
      ...base,
      background: "#161b22",
      borderColor: state.isFocused ? "#00d9a6" : "#30363d",
      borderRadius: "6px",
      minHeight: "auto",
      cursor: "pointer",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#00d9a6",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#e6edf3",
      fontSize: "12px",
      fontFamily: "'DM Sans', sans-serif",
    }),
    input: (base) => ({
      ...base,
      color: "#8b949e",
      fontSize: "12px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#8b949e",
      fontSize: "12px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "26px",
    }),
    menu: (base) => ({
      ...base,
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "6px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "#30363d" : "#161b22",
      color: state.isFocused ? "#e6edf3" : "#8b949e",
      fontSize: "12px",
      cursor: "pointer",
      "&:active": {
        background: "#00d9a6",
      },
    }),
  };

  const onChangeLanguage = async (option: LanguageOption) => {
    setSelectedLanguage(option.value);
    await i18n.changeLanguage(option.value);
  }

  return (
     <Select
       styles={customStyles}
       options={options}
       formatOptionLabel={formatOptionLabel}
       className="nav-lang"
       value={selectedOption}
       onChange={onChangeLanguage}
       isSearchable={false}
     />
  );
};

export default LanguageSelector;
