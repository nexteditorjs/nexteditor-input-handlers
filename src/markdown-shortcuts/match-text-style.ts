import {
  createRichText, DocBlockText, DocBlockTextAttributes, editorRunInUndoGroup, getTextLength,
  NextEditor, splitText, splitToThree, toPlainText,
} from "@nexteditorjs/nexteditor-core";

function getLastPlainText(text: DocBlockText) {
  //
  let plainText = '';
  for (let i = text.length - 1; i >= 0; i--) {
    //
    const op = text[i];
    if (!op.attributes || Object.keys(op.attributes).length === 0) {
      plainText += op.insert;
      continue;
    }
    //
    break;
  }
  //
  return plainText;
}

function matchTextPair(text: string, find: string) {
  if (text.length < find.length * 2 + 1) {
    return -1;
  }
  if (!text.endsWith(find)) {
    return -1;
  }
  //
  if (text.substring(0, text.length - 1).endsWith(find)) {
    return -1;
  }
  //
  const left = text.substring(0, text.length - find.length);
  const index = left.lastIndexOf(find);
  if (index === -1) {
    return -1;
  }
  //
  if (index === 0) {
    return 0;
  }
  // ***xxxx**, **xxx*
  if (left.substring(index - 1).startsWith(find)) {
    return -1;
  }
  //
  return index;
}

const INLINE_STYLES = {
  '*': ['style-italic'],
  '**': ['style-bold'],
  '***': ['style-bold', 'style-italic'],
  '`': ['style-code'],
  // eslint-disable-next-line quote-props
  // '__': ['style-underline'],
};

export function matchTextStyle(editor: NextEditor, containerId: string, blockIndex: number, offset: number): boolean {
  const block = editor.getBlockByIndex(containerId, blockIndex);
  const blockText = editor.getBlockText(block);
  const { left: preText } = splitText(blockText, offset);
  const prePlainText = getLastPlainText(preText);
  const prePlainTextStarts = getTextLength(preText) - prePlainText.length;
  //
  const entries = Object.entries(INLINE_STYLES);
  for (const [find, styles] of entries) {
    //
    const matchIndex = matchTextPair(prePlainText, find);
    if (matchIndex === -1) {
      continue;
    }
    //
    const start = prePlainTextStarts + matchIndex;
    const end = offset;
    //
    const findLength = find.length;
    //
    const textStyle: DocBlockTextAttributes = {};
    styles.forEach((style) => { textStyle[style] = true; });
    //
    const insertedText = toPlainText(splitToThree(blockText, start + findLength, end - start - findLength * 2).middle);
    const styledText = createRichText(insertedText, textStyle);
    //
    editorRunInUndoGroup(editor, () => {
      editor.deleteTextFromBlock(block, start, end - start);
      editor.insertTextToBlock(block, start, styledText);
    });
    return true;
  }
  //
  return false;
}
