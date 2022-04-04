import { convertBlockFrom, createBlockSimpleRange, NextEditor, splitText, toPlainText } from "@nexteditorjs/nexteditor-core";

const ENTER_CONVERTER = {
  code: /^```\S+$/,
  table: /^\|.+\|.+\|$/,
};

const SPACE_CONVERTER = {
  list: /^(\d)+\.$/,
};

export function matchBlockConvert(editor: NextEditor, containerId: string, blockIndex: number, offset: number, type: 'enter' | 'space'): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const text = toPlainText(splitText(editor.getBlockText(block), offset).left).trim();
  //
  const converter = type === 'enter' ? ENTER_CONVERTER : SPACE_CONVERTER;
  //
  for (const [type, reg] of Object.entries(converter)) {
    //
    if (!text.match(reg)) continue;
    //
    const result = editor.undoManager.runInGroup(() => {
      const convertResult = convertBlockFrom(editor, block, type, { offset });
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
