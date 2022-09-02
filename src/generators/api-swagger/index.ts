import * as fs from 'fs';
import yaml from 'js-yaml';
import { BaseGenerator, kebabCase, languageRuntime, languages, listLayers, listVpcs } from '../../common';

const isYaml = (filename) => filename.endsWith('.yaml') || filename.endsWith('yml');

const validateFilename = (filename) => fs.existsSync(filename) || 'File does not exist';

const apiEndPoints = (filename) => {
  const raw = fs.readFileSync(filename, 'utf-8');
  const json = isYaml(filename) ? yaml.load(raw) : JSON.parse(raw);
  return Object.entries(json.paths)
    .map(([path, methods]) => Object.keys(methods).map((method) => `${method} ${path}`))
    .flat();
};

const buildOperationId = (path, method) =>
  `${path
    .replace('/', '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .slice(1)}--${method.toUpperCase()}`;

class ApiSwaggerGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this._input('name', {
      type: 'input',
      validate: kebabCase
    });
    this._input('filename', {
      type: 'input',
      validate: validateFilename,
      default: 'swagger.yaml'
    });
    this._input('endpoints', {
      type: 'checkbox',
      choices: ({ filename }) => apiEndPoints(filename),
      default: ({ filename }) => apiEndPoints(filename)
    });
    this._input('language', {
      type: 'list',
      choices: languages,
      store: true
    });
    this._input('vpc', {
      type: 'list',
      choices: listVpcs(this.destinationRoot(), false)
    });
    this._input('layers', {
      type: 'checkbox',
      choices: listLayers(this.destinationRoot()),
      default: listLayers(this.destinationRoot())
    });
  }

  async create_api_resource() {
    let answers = await this._prompt();
    const { name, filename, language, vpc, layers } = answers;

    const normalise = (o) => {
      if (Array.isArray(o)) return o.map((x) => normalise(x));
      if (typeof o !== 'object') return o;
      return Object.entries(o)
        .map(([k, v]) => [k.replace(/_/g, ''), v])
          //@ts-ignore TODO: FIX IN TICKET
        .reduce((s, [k, v]) => ({ ...s, [k]: normalise(v) }), {});
    };

    const raw = fs.readFileSync(filename, 'utf-8');
    const json = isYaml(filename) ? yaml.load(raw) : JSON.parse(raw);
    json.components = normalise(json.components);

    const endpoints = answers.endpoints
      .map((e) => e.split(' '))
      .map(([method, path]) => [path, method, json.paths[path][method].operationId || buildOperationId(path, method)]);
    for (const [path, method, operationId] of endpoints) {
      json.paths[path][method]['x-amazon-apigateway-integration'] = {
        type: 'aws_proxy',
        httpMethod: 'POST',
        uri: `\${method_${operationId}}`,
        responses: {
          default: {
            statusCode: Object.keys(json.paths[path][method].responses)[0]
          }
        },
        passthroughBehavior: 'when_no_match',
        contentHandling: 'CONVERT_TO_TEXT'
        // credentials: '${credentials_x}',
      };
    }

    const replacer = (key, value) => {
      if (key === 'pattern') value = value.replace(/\\/g, '\\\\');
      if (key === '$ref') value = value.replace(/_/g, '');
      return value;
    };

    answers.raw = yaml.dump(json, {
      replacer
    });

    const operations = endpoints.map(([path, method, operationId]) => operationId);

    this.fs.copyTpl(
      this.templatePath('all/**/*.ejs'),
      this.destinationRoot(),
      { ...answers, operations },
      {},
      { globOptions: { dot: true } }
    );
    for (const [path, method, operationId] of endpoints) {
      const data = {
        api: name,
        path,
        method,
        operationId,
        language,
        runtime: languageRuntime(language),
        vpc,
        layers
      };
      this.fs.copyTpl(this.templatePath('each/**/*'), this.destinationRoot(), data, {}, { globOptions: { dot: true } });
      this.fs.copyTpl(
        this.templatePath(`${language}/**/*`),
        this.destinationRoot(),
        data,
        {},
        { globOptions: { dot: true } }
      );
    }
  }
}

module.exports = ApiSwaggerGenerator;
