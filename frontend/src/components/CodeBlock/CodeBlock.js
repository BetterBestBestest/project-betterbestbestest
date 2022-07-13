import hljs from "highlight.js";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/monokai-sublime.css";
import ReactQuill from "react-quill";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "react-quill/dist/quill.snow.css";
import "./CodeBlock.css";
import UploadFileForm from "../uploadFileForm";
import tinycolor from "tinycolor2";
import ObjectID from "bson-objectid";

import { useEffect, useRef, useState } from "react";

function CodeBlock(props) {
  const doc = props.doc;
  const [quill, setQuill] = useState(null);
  let presenceId = new ObjectID().toString();
  let colors = {};

  // hljs.registerLanguage("python", python);
  Quill.register("modules/cursors", QuillCursors);

  useEffect(() => {
    doc.subscribe((err) => {
      if (err) console.log(err);
      initQuill();
    });
    // initQuill();
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
        cursors: true,
        toolbar: false,
      },
      theme: "snow", // or 'bubble'
    });
    let cursors = quill.getModule("cursors");

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

    let presence = doc.connection.getDocPresence(props.collection, props.id);
    presence.subscribe(function (error) {
      if (error) throw error;
    });
    let localPresence = presence.create(presenceId);

    quill.on("selection-change", function (range, oldRange, source) {
      // We only need to send updates if the user moves the cursor
      // themselves. Cursor updates as a result of text changes will
      // automatically be handled by the remote client.
      if (source !== "user") return;
      // Ignore blurring, so that we can see lots of users in the
      // same window. In real use, you may want to clear the cursor.
      if (!range) return;
      // In this particular instance, we can send extra information
      // on the presence object. This ability will vary depending on
      // type.
      range.name = "test";
      console.log(range);
      localPresence.submit(range, function (error) {
        if (error) throw error;
      });
    });

    presence.on("receive", function (id, range) {
      console.log(range);
      colors[id] = colors[id] || tinycolor.random().toHexString();
      var name = (range && range.name) || "Anonymous";
      cursors.createCursor(id, name, colors[id]);
      cursors.moveCursor(id, range);
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
