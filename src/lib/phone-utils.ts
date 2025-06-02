// Create this file: src/lib/phone-utils.ts

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countries: Country[] = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲" },
];

/**
 * Validates a phone number based on basic patterns
 * @param phoneNumber - The phone number to validate (without country code)
 * @param countryCode - The country code (e.g., "US", "BD")
 * @returns boolean indicating if the phone number is valid
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): boolean {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  if (!cleanNumber) return false;

  // Basic validation patterns for different countries
  const patterns: Record<string, RegExp> = {
    US: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US: 10 digits, area code starts with 2-9
    BD: /^\d{8,11}$/, // Bangladesh: 8-11 digits
    IN: /^\d{10}$/, // India: 10 digits
    GB: /^\d{10,11}$/, // UK: 10-11 digits
    CA: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/, // Canada: same as US
    AU: /^\d{8,9}$/, // Australia: 8-9 digits
    DE: /^\d{10,12}$/, // Germany: 10-12 digits
    FR: /^\d{9,10}$/, // France: 9-10 digits
    JP: /^\d{10,11}$/, // Japan: 10-11 digits
    CN: /^\d{11}$/, // China: 11 digits
    SG: /^\d{8}$/, // Singapore: 8 digits
    AE: /^\d{8,9}$/, // UAE: 8-9 digits
    SA: /^\d{8,9}$/, // Saudi Arabia: 8-9 digits
    QA: /^\d{8}$/, // Qatar: 8 digits
    KW: /^\d{8}$/, // Kuwait: 8 digits
    MY: /^\d{8,10}$/, // Malaysia: 8-10 digits
    TH: /^\d{8,9}$/, // Thailand: 8-9 digits
    PH: /^\d{10}$/, // Philippines: 10 digits
    ID: /^\d{8,12}$/, // Indonesia: 8-12 digits
    VN: /^\d{8,10}$/, // Vietnam: 8-10 digits
    KR: /^\d{8,11}$/, // South Korea: 8-11 digits
    PK: /^\d{10}$/, // Pakistan: 10 digits
    LK: /^\d{9}$/, // Sri Lanka: 9 digits
    NP: /^\d{8,10}$/, // Nepal: 8-10 digits
    MM: /^\d{7,10}$/, // Myanmar: 7-10 digits
  };

  const pattern = patterns[countryCode];
  if (!pattern) {
    // Default validation for unknown countries: 6-15 digits
    return /^\d{6,15}$/.test(cleanNumber);
  }

  return pattern.test(cleanNumber);
}

/**
 * Formats a phone number for display
 * @param phoneNumber - The phone number to format
 * @param countryCode - The country code
 * @returns formatted phone number string
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  if (!cleanNumber) return "";

  // Format based on country
  switch (countryCode) {
    case "US":
    case "CA":
      if (cleanNumber.length === 10) {
        return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(
          3,
          6
        )}-${cleanNumber.slice(6)}`;
      }
      break;
    case "BD":
      if (cleanNumber.length >= 8) {
        return cleanNumber.replace(/(\d{4})(\d{3})(\d{3,4})/, "$1-$2-$3");
      }
      break;
    case "IN":
      if (cleanNumber.length === 10) {
        return cleanNumber.replace(/(\d{5})(\d{5})/, "$1 $2");
      }
      break;
    case "GB":
      if (cleanNumber.length === 11) {
        return cleanNumber.replace(/(\d{5})(\d{6})/, "$1 $2");
      }
      break;
    default:
      // Default formatting: add spaces every 3-4 digits
      return cleanNumber.replace(/(\d{3,4})(?=\d)/g, "$1 ");
  }

  return cleanNumber;
}

/**
 * Combines country dial code with phone number
 * @param phoneNumber - The phone number
 * @param dialCode - The country dial code (e.g., "+1", "+880")
 * @returns complete international phone number
 */
export function getFullPhoneNumber(
  phoneNumber: string,
  dialCode: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (!cleanNumber) return "";
  return `${dialCode} ${cleanNumber}`;
}

/**
 * Gets country by dial code
 * @param dialCode - The dial code to search for
 * @returns Country object or undefined
 */
export function getCountryByDialCode(dialCode: string): Country | undefined {
  return countries.find((country) => country.dialCode === dialCode);
}

/**
 * Gets country by country code
 * @param code - The country code to search for
 * @returns Country object or undefined
 */
export function getCountryByCode(code: string): Country | undefined {
  return countries.find((country) => country.code === code);
}
