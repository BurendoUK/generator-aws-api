import { BaseGenerator, BOOLEAN_CHOICES, kebabCase, languageRuntime, languages, NO, PYTHON, YES } from '../../common';

class LayerGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('language', { type: 'list', choices: languages(), default: 'javascript', store: true });
    this._input('third_party', { type: 'list', choices: BOOLEAN_CHOICES, default: NO });
  }

  async generate() {
    const results = await this._prompt();
    const language = results.language;
    results['runtime'] = languageRuntime(language);
    results['package_name'] = results.name;

    if (language === PYTHON) {
      results['package_name'] = results.name.replace(/-/g, '_');
    }

    this.fs.copyTpl(
      this.templatePath('all/**/*.ejs'),
      this.destinationRoot(),
      results,
      {},
      {
        globOptions: { dot: true }
      }
    );

    if (results.third_party === YES) {
      this.fs.copyTpl(
        this.templatePath(`third_party/${results['language']}/**/*.ejs`),
        this.destinationRoot(),
        results,
        {},
        {
          globOptions: { dot: true }
        }
      );
    } else {
      this.fs.copyTpl(
        this.templatePath(`${results['language']}/**/*.ejs`),
        this.destinationRoot(),
        results,
        {},
        {
          globOptions: { dot: true }
        }
      );
    }
  }
}

module.exports = LayerGenerator;
