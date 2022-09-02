interface IGeneratorCliArgs {
  [key: string]: string | string[];
}

interface IGeneratorLanguages {
  [key: string]: {
    extension: string;
    runtime: string;
  };
}

export {  IGeneratorCliArgs, IGeneratorLanguages };
