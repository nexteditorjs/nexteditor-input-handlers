import { NextEditor, NextEditorInputHandler, isMatchShortcut, isTextKindBlock } from '@nexteditorjs/nexteditor-core';
import { matchBlockConvert } from './match-block-convert';
import { matchBlockStyle } from './match-block-style';
import { matchTextStyle } from './match-text-style';

class MarkdownInputHandler implements NextEditorInputHandler {
  handleAfterInsertText(editor: NextEditor, containerId: string, blockIndex: number, offset: number, text: string): boolean {
    console.debug('handle after insert text');
    if (text === ' ') {
      //
      if (matchBlockStyle(editor, containerId, blockIndex, offset)) {
        return true;
      }
      //
      if (matchTextStyle(editor, containerId, blockIndex, offset)) {
        return true;
      }
    }
    return false;
  }

  handleBeforeKeyDown(editor: NextEditor, containerId: string, blockIndex: number, offset: number, event: KeyboardEvent): boolean {
    console.debug('handle keydown');
    //
    if (isMatchShortcut(event, 'Enter') && isTextKindBlock(editor, editor.getBlockByIndex(containerId, blockIndex))) {
      //
      if (matchBlockConvert(editor, containerId, blockIndex, offset)) {
        return true;
      }
    }
    //
    return false;
  }
}

export default MarkdownInputHandler;
