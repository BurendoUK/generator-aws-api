import * as fs from 'fs';
import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { ICliInputConfig, ICliInputPromptConfig, IGeneratorLanguage, IListFileConfig } from '../interfaces';

const NONE = '(none)';
const isNone = (v: string): boolean => v === NONE;
const isNotNone = (v: string): boolean => !isNone(v);
const safeNone = (v: string, safeValue = ''): string => (isNone(v) ? safeValue : v);

const or = (a, b) => (s) => {
  const ra = a(s);
  if (ra === true) return true;
  return b(s);
};
const nullable = (s: string): boolean | string => s === '' || 'Value must be empty';
const required = (s: string): boolean | string => /.+/.test(s) || 'Value is required';
const shortCode = (s: string): boolean | string => /^[a-z]{1,6}$/.test(s) || 'Value must be 1-6 lowercase characters';
const pascalCase = (s: string): boolean | string => /^[A-Z][A-Za-z0-9]*$/.test(s) || 'Value must be PascalCase';
const camelCase = (s: string): boolean | string => /^[a-z][A-Za-z0-9]*$/.test(s) || 'Value must be camelCase';
const kebabCase = (s: string): boolean | string => /^[a-z][a-z0-9-]*$/.test(s) || 'Value must be kebab-case';
const snakeCase = (s: string): boolean | string => /^[a-z][a-z0-9_]*$/.test(s) || 'Value must be snake_case';
const domainName = (s: string): boolean | string =>
  /^([a-z]+)(\.[a-z]+)+$/.test(s) || 'Must be an app name com.mycompany.mpapp';

const toKebabCase = (s: string): string =>
  s
    .match(/[A-Z][a-z0-9]*/g)
    .map((s) => s.toLowerCase())
    .join('-');

const _languages: IGeneratorLanguage = {
  python: {
    extension: 'py',
    runtime: 'python3.9'
  },
  typescript: {
    extension: 'ts',
    runtime: 'nodejs14.x'
  },
  javascript: {
    extension: 'js',
    runtime: 'nodejs14.x'
  }
};

const languages = () => Object.keys(_languages);

const languageRuntime = (language: string) => _languages[language].runtime;
const languageExtension = (language: string) => _languages[language].extension;

const languageIgnorePattern = (language: string) =>
  Object.entries(_languages)
    .filter(([lang, _]) => lang !== language)
    .map(([_, opt]) => `**/*.${opt.extension}.ejs`);

const list = (config: IListFileConfig): string[] => {
  const { root, pattern, strict, index = 1 } = config;
  return [
    ...(strict ? [] : [NONE]),
    ...fs
      .readdirSync(path.join(root, 'terraform'))
      .map((f) => f.match(new RegExp(pattern)))
      .filter((exp) => exp)
      .map((exp) => exp[index])
  ];
};

const listApis = (root: string) => () => list({ root, pattern: `^api__([^_\.]+)\.tf$`, strict: true });
const listApiResources =
  (root: string) =>
  ({ api }) =>
    list({ root, pattern: `^api__${api}__([^_\.]+)\.tf$`, strict: false });
const listVpcs = (root: string, strict: boolean = false) => () => list({ root, pattern: '^vpc__([^_.]+).tf$', strict });
const listSubnets =
  (root: string) =>
  ({ vpc }) =>
    list({ root, pattern: `^vpc__${vpc}__([^_\.]+)\.tf$` });
const listEventBuses = (root: string) => () => list({ root, pattern: `^eventbus__([^_\.]+)\.tf$` });
const listZones = (root: string) => () => list({ root, pattern: `^dns__([^_\.]+)\.tf$` });
const listLayers = (root: string) => () => list({ root, pattern: `^layer__([^_\.]+)\.tf$`, strict: true });
const listKmsKeys = (root: string, strict: boolean = false) => () => list({ root, pattern: `^kms__([^_\.]+)\.tf$`, strict });

const resolve = (v, ...args) => (typeof v === 'function' ? v(...args) : v);

class BaseGenerator extends Generator {
  protected _inputs: { [key: string]: ICliInputPromptConfig };

  constructor(args, opts) {
    super(args, opts);
    this._inputs = {};
  }

  _input(config: ICliInputConfig) {
    const { name, dataType = String, ...prompt } = config;
    this.argument(name, { type: dataType, required: false });
    this._inputs[name] = prompt;
  }

  async _prompt() {
    const split_checkbox_into_array = (type: string, v: string) => v && (type === 'checkbox' ? v.split(',') : v);
    const cli_arguments = Object.entries(this._inputs)
      .map(([k, v]) => [k, split_checkbox_into_array(v.type, this.options[k])])
      //@ts-ignore
      .reduce((s, [k, v]) => ({ ...s, [k]: v }), {});
    const prompts_for_missing_cli_args = Object.entries(this._inputs)
      .map(([name, prompt]) => [name, prompt, cli_arguments[name]])
      .filter(
        ([name, { type, choices, validate }, value]) =>
          typeof value === 'undefined' ||
          (validate && validate(value) !== true) ||
          (type === 'list' && !resolve(choices, this.options).includes(value))
      )
      .map(([name, { store, default: d, ...prompt }]) => ({
        name,
        default: store ? this.config.get(name) || d : d,
        ...prompt
      }));

    const answers = (await this.prompt(prompts_for_missing_cli_args)) || {};

    const results = {
      ...cli_arguments,
      ...answers
    };

    const inputs_to_store = Object.entries(this._inputs)
      .filter(([name, { store }]) => !!resolve(store, results))
      .map(([name]) => name);
    for (const name of inputs_to_store) {
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
  languageIgnorePattern
};
