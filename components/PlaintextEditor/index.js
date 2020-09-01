import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import css from "./style.css";

import { Editor, EditorState, RichUtils, ContentState, convertToRaw, convertFromRaw } from 'draft-js';

'use strict';

function RichEditor({ readFile, file, write }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const inputRef = useRef();

  const onChange = (editorState) => {
    const contentStat2e = editorState.getCurrentContent();
    const textFile = JSON.stringify(convertToRaw(contentStat2e));
    // debugger
    setEditorState(editorState)
    const newFile = new File([textFile], file.name, {
      type: file.type,
    });

    // write(newFile)
  }

  useEffect(() => {
    // setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(readFile))))
    setEditorState(EditorState.createWithContent(ContentState.createFromText(readFile)))
  }, [readFile])



  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  }


  const onTab = (e) => {
    const maxDepth = 4;
    onChange(RichUtils.onTab(e, editorState, maxDepth));
  }

  const toggleBlockType = (blockType) => {
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  }

  const toggleInlineStyle = (inlineStyle) => {
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    );
  }

  let className = 'RichEditor-editor';
  var contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }


  return (
    <div className="RichEditor-root">
      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
      />
      <div className={className} onClick={focus}>
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          onTab={onTab}
          placeholder="Tell a story..."
          // eslint-disable-next-line react/no-string-refs
          ref={inputRef}
          spellCheck={true}
        />
      </div>
    </div>
  );
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

function StyleButton({ onToggle, style, active, label }) {
  let className = 'RichEditor-styleButton';
  if (active) {
    className += ' RichEditor-activeButton';
  }

  return (
    <span className={className} onMouseDown={(e) => {
      e.preventDefault();
      onToggle(style)
    }}>
      {label}
    </span>
  );

}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

function BlockStyleControls({editorState, onToggle}){
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

function InlineStyleControls({ editorState,onToggle }){
  var currentStyle = editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};


function PlaintextEditor({ file, write }) {
  const [isReadingFile, setIsReadingFile] = useState(true)
  const [readFile, setReadFile] = useState('')

  useEffect(() => {
    let read = new FileReader();
    read.readAsBinaryString(file);
    read.onloadend = function () {
      setIsReadingFile(false)
      setReadFile(read.result)
    }
  }, [file])

  if (isReadingFile) {
    return (<div>loading...</div>)
  }

  return (
    <div className={css.editor}>
      {/* <h3>TODO</h3>
      <i>text/plain</i> */}
      <RichEditor readFile={readFile} file={file} write={write} />
    </div>
  );
}

PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func,
};

RichEditor.propTypes = {
  readFile: PropTypes.string,
}

StyleButton.propTypes = {
  onToggle: PropTypes.func,
  style: PropTypes.string,
  label: PropTypes.string,
  active: PropTypes.bool
}

BlockStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func,
}

InlineStyleControls.propTypes = {
  editorState: PropTypes.object,
  onToggle: PropTypes.func,
}

export default PlaintextEditor;
