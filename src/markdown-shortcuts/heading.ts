import { createBlockSimpleRange, NextEditor } from "@nexteditorjs/nexteditor-core";

const HEADINGS: { [index: string]: number } = {
  '#': 1,
  '##': 2,
  '###': 3,
  '####': 4,
  '#####': 5,
  '######': 6,
};

export function matchHeading(editor: NextEditor, containerId: string, blockIndex: number, offset: number): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const preText = editor.getBlockString(block, { boxReplacement: ' ' }).substring(0, offset);
  //
  const heading = HEADINGS[preText];
  if (!heading) {
    return false;
  }
  //
  editor.undoManager.runInGroup(() => {
    editor.deleteTextFromBlock(block, 0, offset + 1);
    editor.updateBlockData(block, { 'style-heading': heading }, createBlockSimpleRange(editor, block, 0));
  });
  //
  return true;
}
