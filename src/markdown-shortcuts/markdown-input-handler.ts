import { NextEditor, NextEditorInputHandler, isMatchShortcut, isTextKindBlock } from '@nexteditorjs/nexteditor-core';
import { matchBlockConvert } from './match-block-convert';
import { matchBlockStyle } from './match-block-style';
import { matchTextStyle } from './match-text-style';

class MarkdownInputHandler implements NextEditorInputHandler {
  handleAfterInsertText(editor: NextEditor, containerId: string, blockIndex: number, offset: number, text: string): boolean {
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

  handleBeforeKeyDown(editor: NextEditor, event: KeyboardEvent): boolean {
    const range = editor.selection.range;
    if (!range.isSimple()) {
      return false;
    }
    //
    const { containerId, blockIndex, offset } = editor.getTextPosition();
    //
    const isTextBlock = isTextKindBlock(editor, editor.getBlockByIndex(containerId, blockIndex));
    if (isTextBlock) {
      if (isMatchShortcut(event, 'Enter')) {
        if (matchBlockConvert(editor, containerId, blockIndex, offset, 'enter')) {
          return true;
        }
      } else if (isMatchShortcut(event, 'Space')) {
        if (matchBlockConvert(editor, containerId, blockIndex, offset, 'space')) {
          return true;
        }
      }
    }
    //
    return false;
  }
}

export default MarkdownInputHandler;
