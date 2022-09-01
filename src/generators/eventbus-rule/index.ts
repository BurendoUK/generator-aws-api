import {
  BaseGenerator,
  kebabCase,
  languageIgnorePattern,
  languageRuntime,
  languages,
  listEventBuses,
  listVpcs,
  required
} from '../../common';

class EventBusRuleGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('eventbus', {
      message: 'Event Bus',
      type: 'list',
      choices: listEventBuses(this.destinationRoot())
    });
    this._input('name', {
      message: 'Rule',
      type: 'input',
      validate: kebabCase
    });
    this._input('description', {
      message: 'description',
      type: 'input',
      validate: required
    });
    this._input('source', {
      message: 'Event Source',
      default: 'com.mycompany.myapp',
      type: 'input',
      //@ts-ignore TODO: FIX
      validate: souceName,
      store: true
    });
    this._input('detailType', {
      message: 'Detail Type',
      type: 'input',
      validate: required
    });
    this._input('target', {
      message: 'Target',
      type: 'list',
      choices: ['lambda']
    });
    this._input('vpc', {
      type: 'list',
      choices: listVpcs(this.destinationRoot(), false)
    });
    this._input('language', {
      type: 'list',
      choices: languages(),
      default: 'javascript',
      store: true
    });
  }

  async execute() {
    let answers = await this._prompt();

    const ignore = languageIgnorePattern(answers.answers.language);
    answers.runtime = languageRuntime(answers.language);

    this.fs.copyTpl(
      this.templatePath('**/*.*'),
      this.destinationRoot(),
      answers,
      {},
      { globOptions: { dot: true, ignore } }
    );
  }
}

module.exports = EventBusRuleGenerator;
