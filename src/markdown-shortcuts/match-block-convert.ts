import { convertBlockFrom, createBlockSimpleRange, NextEditor, toPlainText } from "@nexteditorjs/nexteditor-core";

const CONVERTER = {
  code: /^```\S+$/,
  table: /^\|.+\|.+\|$/,
};

export function matchBlockConvert(editor: NextEditor, containerId: string, blockIndex: number, offset: number): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const text = toPlainText(editor.getBlockText(block)).trim();
  //
  for (const [type, reg] of Object.entries(CONVERTER)) {
    //
    if (!text.match(reg)) continue;
    //
    const result = editor.undoManager.runInGroup(() => {
      const convertResult = convertBlockFrom(editor, block, type);
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
