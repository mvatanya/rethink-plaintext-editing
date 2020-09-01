import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MarkdownIt from 'markdown-it'
import dynamic from 'next/dynamic';

import css from "./style.css";
import 'react-markdown-editor-lite/lib/index.css';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);



function Editor({ file, write }) {
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

  const handleEditorChange = ({text}) => {
    setReadFile(text);
    const newFile = new File([text], file.name, {
      type: file.type,
    });

    write(newFile)
  }


  if (isReadingFile) {
    return (<div>loading...</div>)
  }
  return (
    <MdEditor
      value={readFile}
      style={{ height: "500px" }}
      renderHTML={(text) => mdParser.render(text)}
      onChange={handleEditorChange}
    />
  )
}


function MarkdownEditor({ file, write }) {

  return (
    <div className={css.editor}>
      <Editor file={file} write={write} />
    </div>
  );
}

MarkdownEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

Editor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default MarkdownEditor;
