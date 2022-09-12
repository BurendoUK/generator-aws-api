import { BaseGenerator, kebabCase, listKmsKeys } from '../../common';


class SecretsGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', { type: 'input', validate: kebabCase });
    this._input('description', { type: 'input' });
    this._input('secret_string', { type: 'input' });
    this._input('kms_key', { type: 'list', choices: listKmsKeys(this.destinationRoot(), false) });
    this._input('repeat', { type: 'confirm', message: 'Do you want to add another secret?' });

    
  }

  promptUser = async () => {
    return this._prompt()
  }

  async execute() {
    let answers = [];
    let repeat = 'true'

    while (repeat === 'true') {
        let result = await this.promptUser()
        answers.push(result)

        if(result.repeat === false) {
            repeat = 'false'
        }
    }

    this.fs.copyTpl(
      this.templatePath('**/*.ejs'),
      this.destinationRoot(),
      {data: answers},
      {},
      {
        globOptions: { dot: true }
      }
    );
  }
}

module.exports = SecretsGenerator;
