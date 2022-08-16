import { BaseGenerator, kebabCase } from '../../common';

const BILLING_MODES = ['PROVISIONED', 'PAY_PER_REQUEST'];

class KmsKeyGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input({ name: 'name', type: 'input', validate: kebabCase });
    this._input({ name: 'description', type: 'input' });
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

module.exports = KmsKeyGenerator;
