import { BaseGenerator, kebabCase, listKmsKeys } from '../../common';

class S3Generator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('versioning', { type: 'list', choices: ['yes', 'no'] });
    this._input('expiration', { type: 'input', default: 90 }, Number);
    this._input('transition', { type: 'input', default: 365 }, Number);
    this._input('kms_key', { type: 'list', choices: listKmsKeys(this.destinationRoot(), false) });
  }

  async create_api() {
    let answers = await this._prompt();

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

module.exports = S3Generator;
