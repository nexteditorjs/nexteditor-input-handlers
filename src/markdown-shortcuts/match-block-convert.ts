import { convertBlockFrom, editorRunInUndoGroup, NextEditor, toPlainText } from "@nexteditorjs/nexteditor-core";

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
    const result = editorRunInUndoGroup(editor, () => {
      const convertResult = convertBlockFrom(editor, block, type);
      if (!convertResult) return null;
      //
      const { blockData: newBlockData, focusBlockId } = convertResult;
      if (!newBlockData) return null;
      const newBlock = editor.insertBlock(containerId, blockIndex, newBlockData);
      editor.deleteBlock(block);
      return { newBlock, focusBlockId };
    });
    //
    if (!result) {
      return false;
    }
    //
    const { newBlock, focusBlockId } = result;
    //
    if (focusBlockId) {
      const focusedBlock = editor.getBlockById(focusBlockId);
      editor.focusToBlock(focusedBlock, { tryFocusToChildSimpleBlock: true });
    } else {
      editor.focusToBlock(newBlock, { tryFocusToChildSimpleBlock: true });
    }
    return true;
  }
  return false;
}
