import {
    isValidIBAN,
    electronicFormatIBAN,
    friendlyFormatIBAN,
    getCountrySpecifications,
} from 'ibantools';

export const countries = Object.keys(getCountrySpecifications()).sort();

export const normalize = value => electronicFormatIBAN(value) || '';

export const format = value => friendlyFormatIBAN(normalize(value)) || '';

/**
 * Valide l'IBAN et vérifie que son préfixe correspond au pays choisi.
 */
export const validate = (country, value) => {
    const iban = normalize(value);

    return {
        valid: !!iban &&
            iban.slice(0, 2) === (country || '').toUpperCase() &&
            isValidIBAN(iban),
    };
};

/**
 * Code pays déduit du début de la saisie, ou null s'il n'est pas reconnu.
 */
export const countryFromInput = value => {
    const code = normalize(value).slice(0, 2);

    return countries.includes(code) ? code : null;
};
