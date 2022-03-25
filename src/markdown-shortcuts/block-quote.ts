import { createBlockSimpleRange, NextEditor } from "@nexteditorjs/nexteditor-core";

export function matchBlockQuote(editor: NextEditor, containerId: string, blockIndex: number, offset: number): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const preText = editor.getBlockString(block, { boxReplacement: ' ' }).substring(0, offset);
  //
  if (preText !== '>') {
    return false;
  }

  editor.undoManager.runInGroup(() => {
    editor.deleteTextFromBlock(block, 0, offset + 1);
    editor.updateBlockData(block, { 'style-block-quote': true }, createBlockSimpleRange(editor, block, 0));
  });
  //
  return true;
}
