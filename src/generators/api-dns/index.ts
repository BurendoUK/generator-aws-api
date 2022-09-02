import { BaseGenerator, listApis, listZones } from '../../common';

class ApiDnsGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('api', { type: 'list', choices: listApis(this.destinationRoot()) });
    this._input('zone', { type: 'list', choices: listZones(this.destinationRoot()) });
    this._input('subdomain', { type: 'input' });
    this._input('base_path', { type: 'input' });
  }

  async create() {
    let answers = await this._prompt();
    const { zone, subdomain } = answers;
    answers.safe_name = subdomain.replace(/\./g, '-') + '-' + zone;

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

module.exports = ApiDnsGenerator;
