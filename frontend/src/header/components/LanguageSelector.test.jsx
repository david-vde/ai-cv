import {render, screen, fireEvent, act} from '@testing-library/react';
import { vi } from 'vitest';
import LanguageSelector from './LanguageSelector';

let capturedOnChange = null;
let mockI18n = {
  language: 'fr',
  changeLanguage: vi.fn(async function(lang) {
    mockI18n.language = lang;
  })
};

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({ i18n: mockI18n })
  };
});

vi.mock('react-country-flag', () => ({
  default: ({ countryCode }) => <span data-testid="flag">{countryCode}</span>
}));

vi.mock('react-select', () => ({
  default: (props) => {
    capturedOnChange = props.onChange;
    return (
      <div
        data-testid="mock-select"
        data-options={JSON.stringify(props.options)}
        data-value={JSON.stringify(props.value)}
        data-classname={props.className}
        data-has-formatoptionlabel={typeof props.formatOptionLabel === 'function'}
      >
        ReactSelect
      </div>
    );
  }
}));

describe('LanguageSelector - rendering', () => {
  beforeEach(() => {
    mockI18n.language = 'fr';
    mockI18n.changeLanguage.mockClear();
  });

  it('renders Select with correct props when language is fr', () => {
    render(<LanguageSelector />);
    const select = screen.getByTestId('mock-select');
    expect(JSON.parse(select.getAttribute('data-options'))).toEqual([
      { value: 'fr', label: 'Français', code: 'FR' },
      { value: 'en', label: 'English', code: 'GB' },
      { value: 'nl', label: 'Nederlands', code: 'NL' },
    ]);
    expect(JSON.parse(select.getAttribute('data-value'))).toEqual({ value: 'fr', label: 'Français', code: 'FR' });
    expect(select.getAttribute('data-classname')).toBe('nav-lang');
    expect(select.getAttribute('data-has-formatoptionlabel')).toBe('true');
  });
});

describe('LanguageSelector - onChangeLanguage', () => {
  beforeEach(() => {
    mockI18n.language = 'fr';
    mockI18n.changeLanguage.mockClear();
    capturedOnChange = null;
  });

  it('calls onChangeLanguage and changes language when Select onChange is triggered', async () => {
    render(<LanguageSelector />);
    expect(typeof capturedOnChange).toBe('function');
    await act(() => capturedOnChange({value: 'en', label: 'English', code: 'GB'}));
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
    expect(mockI18n.language).toBe('en');
  });
});
