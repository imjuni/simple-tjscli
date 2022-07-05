# simple-tjscli

[![Download Status](https://img.shields.io/npm/dw/simple-tjscli.svg)](https://npmcharts.com/compare/simple-tjscli?minimal=true) [![Github Star](https://img.shields.io/github/stars/imjuni/simple-tjscli.svg?style=popout)](https://github.com/imjuni/simple-tjscli) [![Github Issues](https://img.shields.io/github/issues-raw/imjuni/simple-tjscli.svg)](https://github.com/imjuni/simple-tjscli/issues) [![NPM version](https://img.shields.io/npm/v/simple-tjscli.svg)](https://www.npmjs.com/package/simple-tjscli) [![License](https://img.shields.io/npm/l/simple-tjscli.svg)](https://github.com/imjuni/simple-tjscli/blob/master/LICENSE)  [![simple-tjscli](https://circleci.com/gh/imjuni/simple-tjscli.svg?style=shield)](https://app.circleci.com/pipelines/github/imjuni/simple-tjscli?branch=master)

simple-tjscli is interactive cli tool for JSONSchema generation from TypeScript interface. simple-tjscli using two generator that [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) and [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator). You can select one tool after generate JSONSchema from TypeScript interface.

# Why tjscli?

- convenient: tjscli provide interactive cli interface and variety option
- fastify: optimize for fastify, @fastify/swagger

If you use fastify.js, you usually generate json-schema for validation and swagger documentation. You can write json-schema or use [fluent-json-schema](https://github.com/fastify/fluent-json-schema). simple-tjscli is third option to write json-schema. [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) is great tool for typescript interface convert json-schema. simple-tjscli help to conversion using vega/ts-json-schema-generator.

# install
```bash
npm install simple-tjscli --save-dev
```

# Usage

See below example.

```
# interfactive mode
$ npx tjscli tsj -i

# Pass file and type
$ npx tjscli tsj -f hello.ts -t IPrompt

# Watch mode
$ npx tjscli tsj-w --watch [watching directory]
```

Most case, interactive mode or watch mode satisfy your need. tjscli ask to you that interface file to convert JSONSchema.

# Example Project
[maeum](https://github.com/imjuni/maeum) is example project. maeum using simple-tjscli and fast-maker.

```
# Clone the boilerplate:
git clone --depth=1 \
  https://github.com/imjuni/maeum \
  your-project-name

cd your-project-name
npm install

# run simple-tjscli watch mode
npm run tjs-w
```

# Recommand configuration

## fastify
1. create .tjsclirc
```jsonc
{
  "cwd": "./src/dto",
  "project": "tsconfig.json",
  "watch": ".", // watch directory base on cwd directory

  // output directory and template
  "output": "../schemas", // output directory base on cwd directory
  "outputType": "ts",
  "template": "import { JSONSchema7 } from 'json-schema';\\n \\n const %{{VARIABLE_NAME}}%: JSONSchema7 = %{{JSON_SCHEMA_CONTENT}}%;\\n\\n\\nexport default %{{VARIABLE_NAME}}%;\\n",

  // ts-json-schema-generator mode option
  "sync": true,
  "seperateDefinitions": true,

  // ts-json-schema-generator option
  "topRef": false,
  "jsDoc": "extended",
  "expose": "all",
  "additionalProperties": true  
}
```

2. add schema at fastify
add definitions on fastify
```ts
const fastify = Fastify();

const definitionLoaded = await import('src/schemas/definitions/definitions')
const definitions = definitionLoaded.default;

Object.entries(definitions).forEach(([key, defintion]) => {
  fastify.addSchema({
    $id: key,
    ...defintion,
  });
});
```

3. add definitions on @fastify/swagger
```ts
import definitions from 'src/schemas/definitions/definitions';

fastify.register(fastifySwagger, {
  // ...your swagger configuration
  definitions,
})
```

Then, you run command below.

```bash
$ ./node_modules/.bin/tjscli tsj-w --overwrite --config .tjsclirc --watch ./src/dto
```

You can found auto generated json-schema file in output directory.

# Options

| name | shortcut | type | generator | desc. |
| - | - | :-: | :-: | :- |
| --cwd | -w | string | tsj, tjs | working directory |
| --config | -c | string | tsj, tjs | configuration file path. [example](https://github.com/imjuni/tjscli/blob/master/example/.tjsclirc) |
| --project | -p | string | tsj, tjs | tsconfig.json file path |
| --files | -f | string[] | tsj, tjs | target file |
| --types | -t | string[] | tsj, tjs | target type |
| --sync | -s | boolean | tsj, tjs | sync mode, schema have same directory structure in input file |
| --interactive | -i | boolean | tsj, tjs | interactive mode, ask input file and type |
| --noBanner | -b | boolean | tsj, tjs | no banner in generated schema |
| --output | -o | string | tsj, tjs | output directory |
| --outputType | -u | enum('json', 'ts') | tsj, tjs | output schema type |
| --extName | -e | string | tsj, tjs | output file extension |
| --prefix | -x | string | tsj, tjs | output file name prefix, ex> JSC -> JSC_IMajor.ts |
| --overwrite | | string | tsj, tjs | If already exists schema file, overwrite schema |
| --template | | string | tsj, tjs | template string for output typescript file |
| --templatePath | | string | tsj, tjs | template file path for output typescript file |
| --verbose | -v | boolean | tsj, tjs | verbose message |
| --watch | | string | tsj | only work in watch mode. watch directory |
| --debounceTime | | number | tsj | only work in watch mode. watch file debounceTime. default 1000ms |
| --seperateDefinitions | | boolean | tsj | create definitions.ts file using definitions value in generated json-schema |
| --skipTypeCheck | | boolean | tsj | ts-json-schema-generator option |
| --topRef | | boolean | tsj | ts-json-schema-generator option |
| --expose | | enum('all', 'none', 'export') | tsj | ts-json-schema-generator option |
| --jsDoc | | enum('none', 'extended', 'basic') | tsj | ts-json-schema-generator option |
| --extraTags | | string[] | tsj | ts-json-schema-generator option |
| --additionalProperties | | boolean | tsj | ts-json-schema-generator option |

# Programming Interface
| function | desc. |
| - | - |
| generateJSONSchemaUsingTSJ | generate json-schema using [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) |
| generateJSONSchemaUsingTJS | generate json-schema using [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) |
| watchJSONSchemaUsingTSJ | watch for generate json-schema using [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)
