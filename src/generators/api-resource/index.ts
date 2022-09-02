import { BaseGenerator, isNone, isNotNone, kebabCase, listApiResources, listApis, safeNone } from '../../common';

class ApiResourceGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('api', { type: 'list', choices: listApis(this.destinationRoot()) });
    this._input('parent', { type: 'list', choices: listApiResources(this.destinationRoot()) });
    this._input('resource', { type: 'input', validate: kebabCase });
    this._input('pathpart', { type: 'input', default: ({ resource }) => resource });
  }

  async create_api_resource() {
    let answers = await this._prompt();
    const { parent, resource } = answers;
    const data = {
      ...answers,
      isNone,
      fullname: [parent, resource].filter(isNotNone).join('-'),
      safe_name: safeNone(parent)
    };

    this.fs.copyTpl(this.templatePath('**/*.ejs'), this.destinationRoot(), data, {}, { globOptions: { dot: true } });
  }
}

module.exports = ApiResourceGenerator;
