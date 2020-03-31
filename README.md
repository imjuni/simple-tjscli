tjscli 
----

tjscli is convenient tool for JSONSchema generation from TypeScript interface. tjscli using two engine that [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) and [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator). You can select one tool after generate JSONSchema from TypeScript interface.

# Why tjscli?
* convenient: tjscli provide interactive cli interface and variety option
* select engine: You can select [YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema) or [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)
* npm bin package: You can use npx tool
* formatting: Create TypeScript source

# Example
```
# interfactive mode
$ npx tjscli tsj

# Pass file and type
$ npx tjscli tsj -f hello.ts -t IPrompt
```
