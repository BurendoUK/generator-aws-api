import * as fs from 'fs';
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { Question } from 'yeoman-generator';
import { IGeneratorCliArgs, IGeneratorLanguages } from '../interfaces';
import { ArgumentConfigType } from '../types';

const PYTHON = 'python';
const JAVASCRIPT = 'javascript';
const TYPESCRIPT = 'typescript';

const YES = 'yes';
const NO = 'no';
const BOOLEAN_CHOICES = [YES, NO];

const NONE = '(none)';
const isNone = (v) => v === NONE;
const isNotNone = (v) => !isNone(v);
const safeNone = (v, safeValue = '') => (isNone(v) ? safeValue : v);

const or = (a: Function, b: Function) => (s: string) => {
  const ra = a(s);
  if (ra === true) return true;
  return b(s);
};
const nullable = (s: string) => s === '' || 'Value must be empty';
const required = (s: string) => /.+/.test(s) || 'Value is required';
const shortCode = (s: string) => /^[a-z]{1,6}$/.test(s) || 'Value must be 1-6 lowercase characters';
const pascalCase = (s: string) => /^[A-Z][A-Za-z0-9]*$/.test(s) || 'Value must be PascalCase';
const camelCase = (s: string) => /^[a-z][A-Za-z0-9]*$/.test(s) || 'Value must be camelCase';
const kebabCase = (s: string) => /^[a-z][a-z0-9-]*$/.test(s) || 'Value must be kebab-case';
const snakeCase = (s: string) => /^[a-z][a-z0-9_]*$/.test(s) || 'Value must be snake_case';
const domainName = (s: string) => /^([a-z]+)(\.[a-z]+)+$/.test(s) || 'Must be an app name com.mycompany.mpapp';

const toKebabCase = (s: string): string =>
  s
    .match(/[A-Z][a-z0-9]*/g)
    .map((s) => s.toLowerCase())
    .join('-');

const _languages: IGeneratorLanguages = {
  [PYTHON]: {
    extension: 'py',
    runtime: 'python3.9'
  },
  [TYPESCRIPT]: {
    extension: 'ts',
    runtime: 'nodejs14.x'
  },
  [JAVASCRIPT]: {
    extension: 'js',
    runtime: 'nodejs14.x'
  }
};

const languages = () => Object.keys(_languages);

const languageRuntime = (language: string): string => _languages[language].runtime;
const languageExtension = (language: string): string => _languages[language].extension;

const languageIgnorePattern = (language: string) =>
  Object.entries(_languages)
    .filter(([lang, _]) => lang !== language)
    .map(([_, opt]) => `**/*.${opt.extension}.ejs`);

const list = (root: string, pattern: string, strict: boolean = false, index: number = 1) => {
  return [
    ...(strict ? [] : [NONE]),
    ...fs
      .readdirSync(path.join(root, 'terraform'))
      .map((f) => f.match(new RegExp(pattern)))
      .filter((exp) => exp)
      .map((exp) => exp[index])
  ];
};

const listApis = (root: string) => () => list(root, `^api__([^_\.]+)\.tf$`, true);
const listApiResources =
  (root: string) =>
  ({ api }) =>
    list(root, `^api__${api}__([^_\.]+)\.tf$`);
const listVpcs = (root: string, strict: boolean) => () => list(root, '^vpc__([^_.]+).tf$', strict);
const listSubnets =
  (root: string) =>
  ({ vpc }) =>
    list(root, `^vpc__${vpc}__([^_\.]+)\.tf$`);
const listEventBuses = (root: string) => () => list(root, `^eventbus__([^_\.]+)\.tf$`);
const listZones = (root: string) => () => list(root, `^dns__([^_\.]+)\.tf$`);
const listLayers = (root: string) => () => list(root, `^layer__([^_\.]+)\.tf$`, true);
const listKmsKeys = (root: string, strict: boolean) => () => list(root, `^kms__([^_\.]+)\.tf$`, strict);

class BaseGenerator extends Generator {
  protected _inputs: { [key: string]: Question };

  constructor(args, opts) {
    super(args, opts);
    this._inputs = {};
  }

  protected _requireFile(filename: string, message: string) {
    const filepath = path.join(this.destinationRoot(), filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(message);
    }
  }

  protected _input(name: string, promptConfig: Question, dataType: ArgumentConfigType = String) {
    this.argument(name, { type: dataType, required: false });
    this._inputs[name] = promptConfig;
  }

  protected _getArgumentValue(name: string, promptConfig: Question, value: string): string | string[] {
    if (value && promptConfig.type === 'checkbox') {
      return value.split(',');
    }

    const defaultValue = this._getDefaultValue(name, promptConfig);

    if (!value && defaultValue) {
      return defaultValue;
    }

    return value;
  }

  protected _getDefaultValue(name: string, promptConfig: Question) {
    let defaultValue = promptConfig.default;
    if (typeof promptConfig.default === 'function') {
      defaultValue = promptConfig.default(this.options);
    }

    if (promptConfig.store) {
      return this.config.get(name) || defaultValue;
    }

    return defaultValue;
  }

  protected _getCliArgs(): IGeneratorCliArgs {
    return Object.entries(this._inputs)
      .map(([name, config]) => ({ [name]: this._getArgumentValue(name, config, this.options[name]) }))
      .reduce((result, current) => Object.assign(result, current), {});
  }

  protected _getMissingCliArgPrompts(cliArgs: IGeneratorCliArgs): Question[] {
    return Object.entries(this._inputs)
      .filter(([name, config]) => this._showPrompt(config, cliArgs[name]))
      .map(([name, { name: _name, default: _default, ...rest }]) => ({
        ...rest,
        name,
        default: rest.store ? this.config.get(name) || _default : _default
      }));
  }

  protected _showPrompt(promptConfig: Question, value: string | string[]): boolean {
    const { validate, type } = promptConfig;
    const choices: Function | any[] = promptConfig['choices'];

    if (!this._promptWhenConditionMet(promptConfig)) {
      return false;
    }

    return (
      typeof value === 'undefined' ||
      (validate && validate(value) !== true) ||
      (type === 'list' && !this._getValidChoices(choices).includes(value))
    );
  }

  protected _promptWhenConditionMet(promptConfig: Question): boolean {
    const { when } = promptConfig;
    if (when && typeof when === 'function') {
      return <boolean>when(this.options);
    }
    return true;
  }

  protected _getValidChoices(choices: Function | any[]): any[] {
    if (typeof choices === 'function') {
      return choices(this.options);
    }
    return choices;
  }

  protected async _prompt() {
    const cliArgs = this._getCliArgs();
    const promptsForMissingCliArgs = this._getMissingCliArgPrompts(cliArgs);
    const answers = (await this.prompt(promptsForMissingCliArgs)) || {};

    const results = {
      ...cliArgs,
      ...answers
    };

    const inputsToStore = Object.entries(this._inputs)
      .filter(([_name, config]) => config.store)
      .map(([name]) => name);

    for (const name of inputsToStore) {
      this.config.set(name, results[name]);
    }
    this.config.save();

    return results;
  }
}

export {
  NONE,
  isNone,
  isNotNone,
  safeNone,
  BaseGenerator,
  listVpcs,
  listSubnets,
  listEventBuses,
  required,
  domainName,
  listApis,
  listZones,
  listApiResources,
  listLayers,
  listKmsKeys,
  or,
  shortCode,
  nullable,
  pascalCase,
  camelCase,
  kebabCase,
  snakeCase,
  toKebabCase,
  languages,
  languageRuntime,
  languageIgnorePattern,
  YES,
  NO,
  BOOLEAN_CHOICES,
  PYTHON,
  TYPESCRIPT,
  JAVASCRIPT
};
