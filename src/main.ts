/* eslint-disable import/no-extraneous-dependencies */
import {
  assert,
  createEditor,
  createEmptyDoc,
  LocalDoc,
} from '@nexteditorjs/nexteditor-core';
import { EnforceWithDocumentTitleHandler } from '.';
import { MarkdownInputHandler } from './markdown-shortcuts';
import './app.css';

const app = document.querySelector<HTMLDivElement>('#app');
assert(app, 'app does not exists');

const editor = createEditor(app, new LocalDoc(createEmptyDoc('Document title\nDocument text', { firstLineAsTitle: true })));

editor.input.addHandler(new MarkdownInputHandler());
editor.input.addHandler(new EnforceWithDocumentTitleHandler(editor, {
  headingLevel: 2,
  titlePlaceholder: 'Document title',
  contentPlaceholder: 'Enter some text...',
}));

(window as any).editor = editor;
