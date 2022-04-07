import { convertBlockFrom, createBlockSimpleRange, DocBlockAttributes, NextEditor, splitText, toPlainText } from "@nexteditorjs/nexteditor-core";

type BlockConverters = {
  [index: string]: {
    reg: RegExp,
    blockType: string;
    data?: DocBlockAttributes,
  }
}

const ENTER_CONVERTER: BlockConverters = {
  code: {
    blockType: 'code',
    reg: /^```\S+$/,
  },
  table: {
    blockType: 'code',
    reg: /^\|.+\|.+\|$/,
  },
};

const SPACE_CONVERTER: BlockConverters = {
  orderedList: {
    reg: /^(\d)+\.$/,
    blockType: 'list',
    data: {
      listType: 'ordered',
    }
  },
  unorderedList1: {
    reg: /^\*$/,
    blockType: 'list',
    data: {
      listType: 'unordered',
    }
  },
  unorderedList2: {
    reg: /^-$/,
    blockType: 'list',
    data: {
      listType: 'unordered',
    }
  },
  checkList: {
    reg: /^\[\]$/,
    blockType: 'list',
    data: {
      listType: 'checkbox',
    }
  }
};

export function matchBlockConvert(editor: NextEditor, containerId: string, blockIndex: number, offset: number, type: 'enter' | 'space'): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const text = toPlainText(splitText(editor.getBlockText(block), offset).left).trim();
  //
  const converters = type === 'enter' ? ENTER_CONVERTER : SPACE_CONVERTER;
  //
  for (const [, converter] of Object.entries(converters)) {
    //
    if (!text.match(converter.reg)) continue;
    //
    const result = editor.undoManager.runInGroup(() => {
      const convertResult = convertBlockFrom(editor, block, converter.blockType, { offset, data: converter.data });
      if (!convertResult) return null;
      //
      const { blockData: newBlockData, focusBlockId } = convertResult;
      if (!newBlockData) return null;
      //
      const newBlock = editor.insertBlock(containerId, blockIndex, newBlockData, createBlockSimpleRange(editor, focusBlockId ?? newBlockData.id, 0));
      editor.deleteBlock(block);
      return { newBlock, focusBlockId };
    });
    //
    return !!result;
  }
  return false;
}
