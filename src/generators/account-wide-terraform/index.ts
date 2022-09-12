import { BaseGenerator, languages, shortCode } from '../../common';

class AccountWideTerraform extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this._input('project', { type: 'input', validate: shortCode, store: true });
        this._input('region', { type: 'list', choices: ['eu-west-2'], store: true });
        this._input('state_bucket', { type: 'input', default: 'terraform-state' });
        this._input('state_lock_table', { type: 'input', default: 'terraform-lock' });
        this._input('account_id', { type: 'input' });
        this._input('account_cli_alias', { type: 'input', default: 'mgmt' });
        this._input('account_role_name', { type: 'input' });
        this._input('dev_account_id', {
            type: 'input',
            message: 'dev account id (multi-account only)',
            store: true
        });
        this._input('dev_terraform_role', {
            type: 'input',
            message: 'role used by terraform in dev account (multi-account only)',
            default: 'terraform'
        });
        this._input('assume_dev_role', {
            type: 'input',
            message: 'assume role for dev account (multi-account only)',
            default: 'NHSDAdminRole'
        });
        this._input('test_account_id', {
            type: 'input',
            message: 'test account id (multi-account only)',
            store: true
        });
        this._input('test_terraform_role', {
            type: 'input',
            message: 'role used by terraform in test account (multi-account only)',
            default: 'terraform'
        });
        this._input('assume_test_role', {
            type: 'input',
            message: 'assume role for test account (multi-account only)',
            default: 'NHSDAdminRole'
        });
        this._input('prod_account_id', {
            type: 'input',
            message: 'prod account id (multi-account only)',
            store: true
        });
        this._input('prod_terraform_role', {
            type: 'input',
            message: 'role used by terraform in prod account (multi-account only)',
            default: 'terraform'
        });
        this._input('assume_prod_role', {
            type: 'input',
            message: 'assume role for prod account (multi-account only)',
            default: 'NHSDAdminRole'
        });
    }

    async generate() {
        const results = await this._prompt();

        this.fs.copyTpl(
            this.templatePath('**/*.ejs'),
            this.destinationRoot(),
            results,
            {},
            { globOptions: { dot: true } }
        );
    }
}

module.exports = AccountWideTerraform;
