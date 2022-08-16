interface ICliInputConfig extends ICliInputPromptConfig {
  name: string;
  dataType?: typeof String | typeof Number | typeof Array | typeof Object;
}

interface ICliInputPromptConfig {
  type: string;
  validate?: Function;
  store?: boolean;
  message?: string;
  default?: Function | string | number | string[];
  choices?: any[] | Function;
  when?: Function;
}

interface IListFileConfig {
  root: string;
  pattern: string;
  strict?: boolean;
  index?: number;
}

interface IGeneratorLanguage {
  [key: string]: {
    runtime: string;
    extension: string;
  };
}

export { ICliInputConfig, ICliInputPromptConfig, IListFileConfig, IGeneratorLanguage };
