import BaseFieldView from 'views/fields/base';
import adapters from 'ext-fields:helpers/id-adapters';

const flag = code => /^[A-Z]{2}$/.test(code || '')
    ? String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + 127397))
    : '';

export default class NationalNumberFieldView extends BaseFieldView {

    validations = ['required', 'valid'];

detailTemplateContent = `
    {{#if number}}
        <span class="national-number-value"
            {{#if isInvalid}}
                style="text-decoration: line-through;
                       text-decoration-thickness: 1px;"
                title="{{invalidTitle}}"
            {{/if}}
        >{{flag}} {{countryCode}} {{number}}</span>
    {{/if}}
`;


    listTemplateContent = this.detailTemplateContent;

    editTemplateContent = `
        <div class="national-number-field row">
            <div class="col-sm-3 col-xs-4">
                <select class="form-control" data-name="countryCode">
                    {{#each countries}}
                        <option value="{{code}}" {{#if selected}}selected{{/if}}>
                            {{flag}} {{code}}
                        </option>
                    {{/each}}
                </select>
            </div>
            <div class="col-sm-9 col-xs-8">
                <div style="position: relative;">
                    <input type="text" class="form-control" data-name="number"
                        value="{{number}}" autocomplete="off"
                        style="padding-right: 32px;">
                    <span data-name="validation"
                        style="display: none; position: absolute; right: 10px; top: 50%;
                               transform: translateY(-50%); pointer-events: none;"></span>
                </div>
            </div>
        </div>
    `;

    events = {
        ...this.events,
        'change [data-name="countryCode"]': function () { this.onCountryChange(); },
        'input [data-name="number"]': function () { this.showLiveState(); },
        'blur [data-name="number"]': function () { this.reformat(); },
    };

    setup() {
        super.setup();

        const suffix = this.name.charAt(0).toUpperCase() + this.name.slice(1);

        this.countryAttribute = 'countryCode' + suffix;   // ex. countryCodeCNN
        this.numberAttribute = 'number' + suffix;         // ex. numberCNN

        this.adapter = adapters[this.getParam('idType') || 'nationalId'];
    }

    /**
     * Lit un paramètre du champ : d'abord this.params, puis les définitions du modèle.
     */
    getParam(name) {
        const fromParams = this.params ? this.params[name] : undefined;

        if (fromParams !== undefined && fromParams !== null) {
            return fromParams;
        }

        return this.model.getFieldParam(this.name, name);
    }

    isInvalidAllowed() {
        return !!this.getParam('allowInvalid');
    }

    getAttributeList() {
        return [this.countryAttribute, this.numberAttribute];
    }

data() {
    const country = (this.model.get(this.countryAttribute) ||
        this.getParam('defaultCountry') || 'BE').toUpperCase();
    const stored = this.model.get(this.numberAttribute) || '';

    const isEdit = this.isEditMode();

    const isInvalid = !isEdit &&
        !!stored &&
        !this.adapter.validate(country, stored).valid;

    return {
        ...super.data(),
        countryCode: country,
        flag: flag(country),
        number: isEdit
            ? stored
            : (stored && this.adapter.format(country, stored)) || stored,
        isInvalid,
        invalidTitle: isInvalid
            ? this.translate('invalidIdNumber', 'messages', 'Global')
            : '',
        countries: this.adapter.countries.map(code => ({
            code, flag: flag(code), selected: code === country,
        })),
    };
}

    afterRender() {
        super.afterRender();

        if (!this.isEditMode()) {
            return;
        }

        this.$country = this.$el.find('[data-name="countryCode"]');
        this.$number = this.$el.find('[data-name="number"]');
        this.$validation = this.$el.find('[data-name="validation"]');

        this.applyMask();
        this.showLiveState();
    }

    applyMask() {
        const mask = this.adapter.mask(this.$country.val());

        if (mask) {
            this.$number.attr('placeholder', mask);
        } else {
            this.$number.removeAttr('placeholder');
        }
    }

    onCountryChange() {
        this.applyMask();
        this.reformat();
    }

    reformat() {
        const raw = this.$number.val().trim();

        if (raw) {
            const formatted = this.adapter.format(this.$country.val(), raw);

            if (formatted) {
                this.$number.val(formatted);
            }
        }

        this.showLiveState();
    }

    showLiveState() {
        const raw = this.$number.val().trim();

        this.$validation.hide().empty();

        if (!raw) {
            return;
        }

        const { valid } = this.adapter.validate(this.$country.val(), raw);

        let icon;

        if (valid) {
            icon = '<span class="fas fa-check text-success"></span>';
        } else if (this.isInvalidAllowed()) {
            icon = '<span class="fas fa-times" style="color: #f0ad4e;"></span>';
        } else {
            icon = '<span class="fas fa-times text-danger"></span>';
        }

        this.$validation.html(icon).show();
    }

    validateRequired() {
        if (!this.isRequired() || !this.$number || this.$number.val().trim()) {
            return false;
        }

        this.showValidationMessage(
            this.translate('fieldIsRequired', 'messages').replace('{field}', this.getLabelText()),
            '[data-name="number"]'
        );

        return true;
    }

    validateValid() {
        if (!this.$number || this.isInvalidAllowed()) {
            return false;
        }

        const raw = this.$number.val().trim();

        if (!raw) {
            return false;
        }

        if (this.adapter.validate(this.$country.val(), raw).valid) {
            return false;
        }

        this.showValidationMessage(
            this.translate('invalidIdNumber', 'messages', 'Global'),
            '[data-name="number"]'
        );

        return true;
    }

    fetch() {
        const raw = (this.$number.val() || '').trim();
        const country = (this.$country.val() || '').toUpperCase();

        if (!raw) {
            return { [this.countryAttribute]: null, [this.numberAttribute]: null };
        }

        return {
            [this.countryAttribute]: country,
            [this.numberAttribute]: this.adapter.normalize(country, raw),
        };
    }
}
