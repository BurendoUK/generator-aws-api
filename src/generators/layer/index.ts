import { BaseGenerator, kebabCase, languageRuntime, languages } from '../../common';

class LayerGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('language', { type: 'list', choices: languages(), default: 'javascript', store: true });
  }

  async generate() {
    let answers = await this._prompt();
    answers['runtime'] = languageRuntime(answers['language']);

    this.fs.copyTpl(
      this.templatePath('all/**/*.ejs'),
      this.destinationRoot(),
      answers,
      {},
      {
        globOptions: { dot: true }
      }
    );
    this.fs.copyTpl(
      this.templatePath(`${answers['language']}/**/*`),
      this.destinationRoot(),
      answers,
      {},
      {
        globOptions: { dot: true }
      }
    );
  }
}

module.exports = LayerGenerator;
