## tjscli

[![Download Status](https://img.shields.io/npm/dw/simple-tjscli.svg)](https://npmcharts.com/compare/simple-tjscli?minimal=true) [![Github Star](https://img.shields.io/github/stars/imjuni/simple-tjscli.svg?style=popout)](https://github.com/imjuni/simple-tjscli) [![Github Issues](https://img.shields.io/github/issues-raw/imjuni/simple-tjscli.svg)](https://github.com/imjuni/simple-tjscli/issues) [![NPM version](https://img.shields.io/npm/v/simple-tjscli.svg)](https://www.npmjs.com/package/simple-tjscli) [![License](https://img.shields.io/npm/l/simple-tjscli.svg)](https://github.com/imjuni/simple-tjscli/blob/master/LICENSE)  [![simple-tjscli](https://circleci.com/gh/imjuni/simple-tjscli.svg?style=shield)](https://app.circleci.com/pipelines/github/imjuni/simple-tjscli?branch=master)

tjscli is interactive cli tool for JSONSchema generation from TypeScript interface. tjscli using two generator that [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) and [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator). You can select one tool after generate JSONSchema from TypeScript interface.

# Why tjscli?

- convenient: tjscli provide interactive cli interface and variety option
- select generator: You can select [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) or [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)
- npm bin package: You can use npx tool
- formatting: Create TypeScript source

# Usage

See below example.

```
# interfactive mode
$ npx tjscli tsj

# Pass file and type
$ npx tjscli tsj -f hello.ts -t IPrompt
```

Most case, Interactive mode satisfy your need. tjscli ask to you that interface file to convert JSONSchema.

# Options

## Engine tjs

JSONSchema convert using by typescript-json-schema.

- --project, -p
  - tsconfig.json path
- --output-type, -u
  - output file type: json or ts, default value is ts
- --output, -o
  - output directory
- --prefix, -x
  - prefix of output filename
  - ex> JSC_JSONSchemaFile.ts
- --format, -r
  - output contents layout
  - TYPE_NAME replaced JSONSchema type name: Recommand [@types/json-schema](https://www.npmjs.com/package/@types/json-schema)
  - SCHEMA_JSON_CONTENT replaced converted content
  - See example format in [.tjsclirc](https://github.com/imjuni/tjscli/blob/master/.tjsclirc)

## Engine tsj

Default engine. JSONSchema convert using by ts-json-schema-generator.

### tsj engine only 
- --extraTags, -a
  - extra tag option in ts-json-schema-generator.
- --jsDoc, -d
  - jsDoc option in ts-json-schema-generator.
- --expose, -e
  - expose option in ts-json-schema-generator.
- --additionalProperties, -n
  - additionalProperties option in ts-json-schema-generator.

### Common
- --project, -p
  - tsconfig.json path
- --output-type, -u
  - output file type: json or ts, default value is ts
- --output, -o
  - output directory
- --prefix, -x
  - prefix of output filename, default 'JSC\_'
  - ex> JSC_JSONSchemaFile.ts
- --format, -r
  - output contents layout
  - TYPE_NAME replaced JSONSchema type name: Recommand [@types/json-schema](https://www.npmjs.com/package/@types/json-schema)
  - SCHEMA_JSON_CONTENT replaced converted content
  - See example format in [.tjsclirc](https://github.com/imjuni/tjscli/blob/master/.tjsclirc)
