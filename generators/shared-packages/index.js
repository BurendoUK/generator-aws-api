const { BaseGenerator, languages, languageRuntime, kebabCase, languageVersion } = require('../../common');

class SharedPackagesGenerator extends BaseGenerator {

    constructor(args, opts) {
        super(args, opts);

        this._input({ name: 'name', type: 'input', validate: kebabCase });
        this._input({ name: 'language', type: 'list', choices: languages(), default: 'javascript', store: true });
    }

    async execute() {
        let answers = await this._prompt();
        const language = answers['language'];
        answers['runtime'] = languageRuntime(language);
        answers['languageVersion'] = languageVersion(language);

        await this.fs.copyTplAsync(
            this.templatePath(`${answers['language']}/**/*`),
            this.destinationRoot(),
            answers,
            {},
            {
                globOptions: { dot: true },
            }
        );
    }
}

module.exports = SharedPackagesGenerator;
