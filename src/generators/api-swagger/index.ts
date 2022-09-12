import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { BaseGenerator, kebabCase, languageRuntime, languages, listLayers, listVpcs, NONE } from '../../common';
import * as path from 'path';

const isYaml = (filename: string) => filename.endsWith('.yaml') || filename.endsWith('yml');

const validateFilename = (filename: string) => fs.existsSync(filename) || 'File does not exist';

const apiEndPoints = (filename: string) => {
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

    this._input('region', { type: 'list', choices: ['eu-west-2'], store: true });
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
      choices: listVpcs(this.destinationRoot(), false),
      default: NONE
    });
    this._input('layers', {
      type: 'checkbox',
      choices: listLayers(this.destinationRoot()),
      default: listLayers(this.destinationRoot())
    });
  }

  async generate() {
    this._requireFile(
      path.join('terraform', 'lambda.tf'),
      'lambda base file not found. Please run: yo aws-api:lambda-base'
    );
    const results = await this._prompt();
    const { name, filename, language, vpc, layers } = results;

    const normalise = (o) => {
      if (Array.isArray(o)) return o.map((x) => normalise(x));
      if (typeof o !== 'object') return o;
      return (
        Object.entries(o)
            // Fixing typing on this method is a pain. Left to be any[] for now.
          .map(([key, value]): any[] => [key.replace(/_/g, ''), value])
          .reduce((s, [key, value]) => ({ ...s, [key]: normalise(value) }), {})
      );
    };

    const raw = fs.readFileSync(filename, 'utf-8');
    const json = isYaml(filename) ? yaml.load(raw) : JSON.parse(raw);
    json.components = normalise(json.components);

    const endpoints = results.endpoints
      .map((e: string) => e.split(' '))
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
      };
    }

    // Need to remove discriminator as AWS API gateway doesn't work with this block
    delete json.components.schemas.Resource.discriminator;

    const replacer = (key: string, value: string) => {
      if (key === 'pattern') value = value.replace(/\\/g, '\\\\');
      if (key === '$ref') value = value.replace(/_/g, '');
      return value;
    };

    results.raw = yaml.dump(json, {
      replacer
    });

    const operations = endpoints.map(([path, method, operationId]) => operationId);

    this.fs.copyTpl(
      this.templatePath('all/**/*.ejs'),
      this.destinationRoot(),
      { ...results, operations },
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
