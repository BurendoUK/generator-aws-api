import { BaseGenerator, kebabCase, listKmsKeys, NONE, nullable, or, snakeCase } from '../../common';

const BILLING_MODES = ['PROVISIONED', 'PAY_PER_REQUEST'];
const DYNAMO_DATA_TYPES = ['S', 'N'];

class DynamoDbGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('pk', { type: 'input', validate: snakeCase });
    this._input('pk_type', { type: 'list', choices: DYNAMO_DATA_TYPES });
    this._input('sk', { type: 'input', validate: or(nullable, snakeCase) });
    this._input('sk_type', { type: 'list', choices: DYNAMO_DATA_TYPES, when: ({ sk }) => Boolean(sk) });
    this._input('ttl', { type: 'input', validate: or(nullable, snakeCase) });
    this._input('billing_mode', { type: 'list', choices: BILLING_MODES });
    this._input('read_capacity', {
      type: 'number',
      default: 20,
      when: ({ billing_mode }) => billing_mode === BILLING_MODES[0]
    });
    this._input('write_capacity', {
      type: 'number',
      default: 20,
      when: ({ billing_mode }) => billing_mode === BILLING_MODES[0]
    });
    this._input('kms_key', { type: 'list', choices: listKmsKeys(this.destinationRoot(), false), default: NONE });
  }

  async create() {
    const results = await this._prompt();

    this.fs.copyTpl(
      this.templatePath('**/*.ejs'),
      this.destinationRoot(),
      results,
      {},
      {
        globOptions: { dot: true }
      }
    );
  }
}

module.exports = DynamoDbGenerator;
