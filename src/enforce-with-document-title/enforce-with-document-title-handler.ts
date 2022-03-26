import {
  assert, BlockElement, createTextBlockData, editorGetBlockData,
  getBlockByIndex,
  getBlockContent, getBlockTextLength, getChildBlockCount,
  getContainerId, getNextBlock, getTextLength, isMatchShortcut,
  NextEditor, NextEditorInputHandler
} from "@nexteditorjs/nexteditor-core";

import './placeholder.css';

export interface EnforceWithDocumentTitleHandlerOptions {
  headingLevel?: number,
  titlePlaceholder?: string;
  contentPlaceholder?: string;
}

class EnforceWithDocumentTitleHandler implements NextEditorInputHandler {
  constructor(editor: NextEditor, private options: EnforceWithDocumentTitleHandlerOptions = {
    headingLevel: 1,
  }) {
    this.handleChanged(editor);
    this.applyPlaceholder(editor);
  }

  handleBeforeInsertText(editor: NextEditor, containerId: string, blockIndex: number, offset: number, text: string): boolean {
    if (!EnforceWithDocumentTitleHandler.isDocumentTitleBlock(containerId, blockIndex)) {
      return false;
    }
    //
    editor.input.defaultInsertText(editor, containerId, blockIndex, offset, text);
    return true;
  }

  handleBeforeKeyDown(editor: NextEditor, event: KeyboardEvent): boolean {
    const range = editor.selection.range;
    if (!range.isSimple()) {
      return false;
    }
    //
    const { containerId, blockIndex, offset } = editor.getTextPosition();
    if (!EnforceWithDocumentTitleHandler.isDocumentTitleBlock(containerId, blockIndex)) {
      return false;
    }
    if (!isMatchShortcut(event, 'Enter')) {
      return false;
    }
    //
    let deleteSecondBlock = false;
    let secondBlock: BlockElement | null = null;
    //
    if (getChildBlockCount(editor.rootContainer) === 2) {
      secondBlock = getBlockByIndex(editor.rootContainer, 1);
      if (getBlockTextLength(editor, secondBlock) === 0) {
        deleteSecondBlock = true;
      }
      //
    }
    //
    //
    const block = editor.getFirstBlock();
    editor.undoManager.runInGroup(() => {
      //
      editor.breakTextBlock(block, offset, {
        forceInsertAfter: true,
      });
      //
      if (deleteSecondBlock && secondBlock) {
        editor.deleteBlock(secondBlock);
      }
    });
    //
    return true;
  }

  handleChanged(editor: NextEditor): void {
    try {
      const blocks = editor.doc.getContainerBlocks(getContainerId(editor.rootContainer));
      assert(blocks.length > 0, 'root container is empty');
      //
      const firstBlock = blocks[0];
      if (firstBlock.type !== 'text' || firstBlock['style-heading'] !== this.options.headingLevel) {
        const blockData = createTextBlockData('', { 'style-heading': this.options.headingLevel ?? 1 });
        editor.insertBlock(getContainerId(editor.rootContainer), 0, blockData);
        return;
      }
      //
      if (blocks.length > 1) {
        return;
      }
      //
      editor.insertTextBlock('', getContainerId(editor.rootContainer), 1, { newRange: editor.selection.range.toDocRange()});
    } finally {
      this.applyPlaceholder(editor);
    }
  }

  handleRemoteChanged(editor: NextEditor): void {
    setTimeout(() => {
      this.applyPlaceholder(editor);
    });
  }

  handleUpdateCompositionText(editor: NextEditor): void {
    this.applyPlaceholder(editor);
  }

  private applyPlaceholder(editor: NextEditor) {
    if (!this.options?.titlePlaceholder && !this.options?.contentPlaceholder) {
      return;
    }
    //
    editor.rootContainer.querySelectorAll('[data-content-placeholder').forEach((e) => {
      e.removeAttribute('data-content-placeholder');
    });
    //
    const isEmptyTextBlock = (block: BlockElement) => {
      const titleBlockData = editorGetBlockData(editor, block);
      if (titleBlockData.text && getTextLength(titleBlockData.text) === 0) {
        if (!block.querySelector('.inputting-insertion')) {
          return true;
        }
      }
      return false;
    }
    //
    // title block
    const titleBlock = editor.getFirstBlock();
    const titleContent = getBlockContent(titleBlock);
    if (isEmptyTextBlock(titleBlock)) {
      titleContent.setAttribute('data-title-placeholder', this.options?.titlePlaceholder ?? 'Enter document title');
    } else {
      titleContent.removeAttribute('data-title-placeholder');
    }
    //
    if (getChildBlockCount(editor.rootContainer) > 2) {
      return;
    }
    // content block
    const contentBlock = getNextBlock(titleBlock);
    if (!contentBlock) {
      console.log('no content block');
      return;
    }
    const contentElem = getBlockContent(contentBlock);
    if (isEmptyTextBlock(contentBlock)) {
      contentElem.setAttribute('data-content-placeholder', this.options?.contentPlaceholder ?? 'Enter some text...');
   } else {
    contentElem.removeAttribute('data-content-placeholder');
   }
  }

  private static isDocumentTitleBlock(containerId: string, blockIndex: number) {
    return containerId === 'root' && blockIndex === 0;
  } 
}

export default EnforceWithDocumentTitleHandler;
