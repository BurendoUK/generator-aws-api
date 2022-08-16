import { BaseGenerator, kebabCase, listKmsKeys, nullable, or, snakeCase } from '../../common';

const BILLING_MODES = ['PROVISIONED', 'PAY_PER_REQUEST'];

class DynamoDbGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input({ name: 'name', type: 'input', validate: kebabCase });
    this._input({ name: 'pk', type: 'input', validate: snakeCase });
    this._input({ name: 'sk', type: 'input', validate: or(nullable, snakeCase) });
    this._input({ name: 'ttl', type: 'input', validate: or(nullable, snakeCase) });
    this._input({ name: 'billing_mode', type: 'list', choices: BILLING_MODES });
    this._input({
      name: 'read_capacity',
      type: 'number',
      default: 20,
      when: ({ billing_mode }) => billing_mode === BILLING_MODES[0]
    });
    this._input({
      name: 'write_capacity',
      type: 'number',
      default: 20,
      when: ({ billing_mode }) => billing_mode === BILLING_MODES[0]
    });
    this._input({ name: 'kms_key', type: 'list', choices: listKmsKeys(this.destinationRoot()) });
  }

  async create() {
    const answers = await this._prompt();

    this.fs.copyTpl(
      this.templatePath('**/*.ejs'),
      this.destinationRoot(),
      answers,
      {},
      {
        globOptions: { dot: true }
      }
    );
  }
}

module.exports = DynamoDbGenerator;
