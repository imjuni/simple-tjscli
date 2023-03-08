import defaultTemplate from '#config/defaultTemplate';
import type ICommonOption from '#config/interfaces/ICommonOption';
import type ITemplateContents from '#config/ITemplateContents';
import fastSafeStringify from 'fast-safe-stringify';
import { isEmpty } from 'my-easy-fp';

function getTemplateKey(templateKey: string): string {
  return `\\%\\{\\{${templateKey}\\}\\}\\%`;
}

function appendNewline(content?: string): string {
  if (content === undefined || content === null) {
    return '';
  }

  if (content.endsWith('\n')) {
    return content;
  }

  return `${content}\n`;
}

export default function applyFormat(content: ITemplateContents, option: ICommonOption): string {
  const stringified = fastSafeStringify(content.jsonSchemaContent);

  if (isEmpty(option.template) && option.outputType === 'json') {
    return stringified;
  }

  const template = isEmpty(option.template) ? defaultTemplate : option.template;

  const formatted = template
    .replace(new RegExp(getTemplateKey('VARIABLE_NAME'), 'g'), appendNewline(content.variableName))
    .replace(new RegExp(getTemplateKey('JSON_SCHEMA_CONTENT'), 'g'), appendNewline(stringified));

  if (option.noBanner) {
    return formatted;
  }

  return `${content.banner}\n${formatted}`;
}
