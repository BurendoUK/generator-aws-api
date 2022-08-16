import { BaseGenerator, shortCode } from '../../common';

class AppGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input({ name: 'project', type: 'input', validate: shortCode, store: true });
    this._input({ name: 'region', type: 'list', choices: ['eu-west-2'], store: true });
    this._input({ name: 'state_bucket', type: 'input', default: 'terraform-state' });
    this._input({ name: 'lock_table', type: 'input', default: 'terraform-lock' });
    this._input({ name: 'mgmt_account_id', type: 'input' });
    this._input({ name: 'account_aws_alias', type: 'input', default: 'mgmt:admin' });
    this._input({ name: 'account_cli_alias', type: 'input', default: 'mgmt:admin' });
    this._input({ name: 'account_role_name', type: 'input' });
    this._input({
      name: 'dev_account_id',
      type: 'input',
      message: 'dev account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input({
      name: 'test_account_id',
      type: 'input',
      message: 'test account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input({
      name: 'prod_account_id',
      type: 'input',
      message: 'prod account (multi-account only)',
      default: ({ account_id }) => account_id
    });
    this._input({
      name: 'assume_terraform_role',
      type: 'input',
      message: 'terraform role used by runner (multi-account only)',
      default: 'terraform'
    });
    this._input({
      name: 'gitlab_url',
      type: 'input',
      message: 'gitlab url for registering gitlab runner',
      default: 'https://nhsd-git.digital.nhs.uk/'
    });
  }

  async core_application() {
    const state = await this._prompt();

    this.fs.copyTpl(this.templatePath('**/*'), this.destinationRoot(), state, {}, { globOptions: { dot: true } });

    this.config.save();
  }
}

module.exports = AppGenerator;
