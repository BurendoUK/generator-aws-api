import { BaseGenerator, listVpcs } from '../../common';

class SubnetGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('vpc', { type: 'list', choices: listVpcs(this.destinationRoot(), true) });
    this._input('name', { type: 'input' });
    this._input('type', { type: 'list', choices: ['public', 'private'] });
    this._input('cidr_block_offset', { type: 'number', default: 0 });
  }

  async create_subnet() {
    let answers = await this._prompt();

    this.fs.copyTpl(this.templatePath('**/*.*'), this.destinationRoot(), answers, {}, { globOptions: { dot: true } });
  }
}

module.exports = SubnetGenerator;
