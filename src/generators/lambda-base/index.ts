import { BaseGenerator } from '../../common';

class LambdaBaseGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('lambda_timeout', { type: 'number', default: 30 });
    this._input('lambda_log_retention_in_days', { type: 'number', default: 30 });
  }

  async generate() {
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

module.exports = LambdaBaseGenerator;
