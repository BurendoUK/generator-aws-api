import { BaseGenerator, shortCode } from '../../common';

class AppGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('project', { type: 'input', validate: shortCode, store: true });
    this._input('region', { type: 'list', choices: ['eu-west-2'], store: true });
    this._input('state_bucket', { type: 'input', default: 'terraform-state' });
    this._input('lock_table', { type: 'input', default: 'terraform-lock' });
    this._input('account_id', { type: 'input' });
    this._input('account_aws_alias', { type: 'input', default: 'mgmt' });
    this._input('account_cli_alias', { type: 'input', default: 'mgmt' });
    this._input('account_role_name', { type: 'input' });
    this._input('assume_dev_account', {
      type: 'input',
      message: 'dev account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input('assume_dev_role', {
      type: 'input',
      message: 'dev role (multi-account only)',
      default: 'terraform'
    });
    this._input('assume_test_account', {
      type: 'input',
      message: 'test account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input('assume_test_role', {
      type: 'input',
      message: 'test role (multi-account only)',
      default: 'terraform'
    });
    this._input('assume_prod_account', {
      type: 'input',
      message: 'prod account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input('assume_prod_role', {
      type: 'input',
      message: 'prod role (multi-account only)',
      default: 'terraform'
    });
  }

  async core_application() {
    const results = await this._prompt();

    this.fs.copyTpl(this.templatePath('**/*'), this.destinationRoot(), results, {}, { globOptions: { dot: true } });
  }
}

module.exports = AppGenerator;
