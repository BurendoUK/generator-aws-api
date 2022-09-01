import {
  BaseGenerator,
  languageRuntime,
  languages,
  listApiResources,
  listApis,
  listLayers,
  listVpcs
} from '../../common';

class ApiMethodGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('vpc', { type: 'list', choices: listVpcs(this.destinationRoot(), false) });
    this._input('api', { type: 'list', choices: listApis(this.destinationRoot()) });
    this._input('resource', { type: 'list', choices: listApiResources(this.destinationRoot()) });
    this._input('method', {
      type: 'list',
      choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      default: 'GET'
    });
    this._input('language', { type: 'list', choices: languages(), store: true });
    this._input('layers', { type: 'checkbox', choices: listLayers(this.destinationRoot()) });
  }

  async create_api() {
    let answers = await this._prompt();
    const data = {
      ...answers,
      runtime: languageRuntime(answers['language'])
    };

    this.fs.copyTpl(this.templatePath('all/**/*.*'), this.destinationRoot(), data, {}, { globOptions: { dot: true } });
    this.fs.copyTpl(
      this.templatePath(`${answers['language']}/**/*.*`),
      this.destinationRoot(),
      data,
      {},
      { globOptions: { dot: true } }
    );
  }
}

module.exports = ApiMethodGenerator;
