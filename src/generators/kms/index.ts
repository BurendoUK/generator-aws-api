import { BaseGenerator, BOOLEAN_CHOICES, kebabCase, NO } from '../../common';
import * as path from 'path';

class KmsKeyGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('description', { type: 'input' });
    this._input('region', { type: 'list', choices: ['eu-west-2'], store: true });
    this._input('is_cloudwatch', { type: 'list', choices: BOOLEAN_CHOICES, default: NO });
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
