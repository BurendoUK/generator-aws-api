import { BaseGenerator } from '../../common';

class KmsBaseGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('deletion_window_in_days', { type: 'number', default: 7 });
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

module.exports = KmsBaseGenerator;
