// ext-fields:helpers/id-adapters
import {
    validateNationalId, formatId, normalizeId, getInputMask,
} from 'idnumbers';

const COUNTRIES = ['AT','AU','BA','BE','BG','BR','CA','CH','CN','CY','CZ','DE','DK',
    'EE','EG','ES','FI','FR','GB','GR','HK','HR','HU','IE','IL','IN','IS','IT','JP','LU',
    'MX','NL','NO','NZ','PL','PT','RO','RS','RU','SE','SI','SK','TR','TW','UA','US','ZA']
    .filter(code => getInputMask(code));

const nationalId = {
    countries: COUNTRIES,
    mask: c => getInputMask(c)?.masks?.[0] ?? null,
    normalize: (c, v) => normalizeId(c, v) ?? v.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
    format: (c, v) => formatId(c, v),
    validate: (c, v) => {
        // USA / KOR exigent les séparateurs : on valide la forme formatée
        const result = validateNationalId(c, formatId(c, v) ?? v);
        return { valid: result.isValid, reason: result.reason };
    },
};

export default { nationalId /*, iban, vat, companyNumber */ };