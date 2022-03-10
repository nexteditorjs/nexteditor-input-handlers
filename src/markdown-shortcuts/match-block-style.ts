import { NextEditor } from '@nexteditorjs/nexteditor-core';
import { matchBlockQuote } from './block-quote';
import { matchHeading } from './heading';

export function matchBlockStyle(editor: NextEditor, containerId: string, blockIndex: number, offset: number): boolean {
  if (matchHeading(editor, containerId, blockIndex, offset)) {
    return true;
  }
  //
  if (matchBlockQuote(editor, containerId, blockIndex, offset)) {
    return true;
  }
  //
  return false;
}
