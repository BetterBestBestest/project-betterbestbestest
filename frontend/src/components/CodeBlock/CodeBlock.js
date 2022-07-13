import hljs from "highlight.js";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/monokai-sublime.css";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import "./CodeBlock.css";
import UploadFileForm from "../uploadFileForm";

import { useEffect, useRef, useState } from "react";

function CodeBlock(props) {
  const doc = props.doc;

  const [quill, setQuill] = useState(null);

  // hljs.registerLanguage("python", python);

  useEffect(() => {
    doc.subscribe((err) => {
      if (err) console.log(err);
      initQuill();
    });
    initQuill();
  }, []);

  const initQuill = () => {
    hljs.configure({
      languages: ["javascript", "ruby", "python"],
    });
    const quill = new Quill("#editor-container", {
      modules: {
        syntax: {
          highlight: (text) =>
            hljs.highlight(text, { language: "python" }).value,
        },
        toolbar: false,
      },
      theme: "snow", // or 'bubble'
    });
    setQuill(quill);
    quill.setContents(doc.data);
    quill.formatLine(0, quill.getLength(), { "code-block": true });
    quill.on("text-change", function (delta, oldDelta, source) {
      if (source !== "user") return;
      doc.submitOp(delta, { source: quill });
    });
    doc.on("op", function (op, source) {
      if (source === quill) return;
      quill.updateContents(op);
    });
  };

  // const modules = {
  //   syntax: {
  //     highlight: (text) => hljs.highlight(text, { language: "python" }).value,
  //   },
  //   toolbar: false,
  // };

  return (
    <div className="code-block">
      <UploadFileForm quill={quill} doc={doc} isCode={true} />
      <div id="editor-container"></div>
    </div>
  );
}

export default CodeBlock;
