import {
  assert,
  createEditor,
  createEmptyDoc,
  getLogger,
  LocalDoc,
} from '@nexteditorjs/nexteditor-core';
import { EnforceWithDocumentTitleHandler } from '.';
import { MarkdownInputHandler } from './markdown-shortcuts';
import './app.css';

const logger = getLogger('main');

const app = document.querySelector<HTMLDivElement>('#app');
assert(logger, app, 'app does not exists');

const editor = createEditor(app, new LocalDoc(createEmptyDoc('Document title\nDocument text', { firstLineAsTitle: true })));

editor.input.addHandler(new MarkdownInputHandler());
editor.input.addHandler(new EnforceWithDocumentTitleHandler(editor, {
  headingLevel: 1,
  titlePlaceholder: 'Document title',
  contentPlaceholder: 'Enter some text...',
}));

(window as any).editor = editor;
