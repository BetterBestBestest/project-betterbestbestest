import hljs from "highlight.js";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/monokai-sublime.css";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CodeBlock.css";

import { useEffect, useState, useRef } from "react";
import roomsAPI from "../../api/rooms";

function CodeBlock(props) {
  const doc = props.doc;
  const [blockContent, setBlockContent] = useState({});
  let reactQuillRef = useRef(null);

  let quillRef = null;

  hljs.registerLanguage("python", python);

  useEffect(() => {
    attachQuillRefs();

    doc.subscribe((error) => {
      doc.on("op", function (op, source) {
        if (source) return;
        console.log(op);
        setBlockContent(op);
      });
    });
  }, []);

  const attachQuillRefs = () => {
    if (
      !reactQuillRef.current ||
      typeof reactQuillRef.current.getEditor !== "function"
    )
      return;
    quillRef = reactQuillRef.current.getEditor();
    quillRef.formatLine(0, quillRef.getLength(), { "code-block": true });
    console.log(quillRef);
  };

  const handleChange = (content, delta, source, editor) => {
    if (source !== "user") return;
    console.log(editor.getContents());
    doc.submitOp(editor.getContents());
  };

  const modules = {
    syntax: {
      highlight: (text) => hljs.highlight(text, { language: "python" }).value,
    },
    toolbar: false,
  };

  return (
    <div className="code-block">
      <ReactQuill
        ref={reactQuillRef}
        modules={modules}
        onChange={handleChange}
        value={blockContent}
      />
    </div>
  );
}

export default CodeBlock;