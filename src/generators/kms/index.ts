import { BaseGenerator, kebabCase } from '../../common';
import * as path from 'path';

class KmsKeyGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('description', { type: 'input' });
  }

  async generate() {
    this._requireFile(path.join('terraform', 'kms.tf'), 'kms base file not found. Please run: yo aws-api:kms-base');
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

module.exports = KmsKeyGenerator;
