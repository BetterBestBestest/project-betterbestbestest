import ReconnectingWebSocket from "reconnecting-websocket";
import sharedb from "sharedb/lib/client";
import richText from "rich-text";
import CodeBlock from "../CodeBlock/CodeBlock";
import TextBlock from "../TextBlock/TextBlock";
import "./Notebook.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import roomsAPI from "../../api/rooms";

sharedb.types.register(richText.type);
const socket = new ReconnectingWebSocket(process.env.REACT_APP_WS_URL);
const connection = new sharedb.Connection(socket);

function NoteBook() {
  let { id } = useParams();
  const [codeBlockDoc, setCodeBlockDoc] = useState(null);
  const [data, setData] = useState(null);
  const [textBlockDoc, setTextBlockDoc] = useState(null);
  useEffect(() => {
    // hardcoded sharedb connection
    const testRoomId = id;
    roomsAPI.getRoom(testRoomId).then((data) => {
      setData(data);
      setCodeBlockDoc(connection.get(id + "_code", data.codeSharedbID));
      setTextBlockDoc(connection.get(id + "_comment", data.commentSharedbID));
    });
  }, []);
  return (
    <div className="notebook-container">
      <div className="notebook-body">
        <h1>NoteBook</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        ></div>
        <div className="notebook-content">
          {codeBlockDoc && (
            <CodeBlock
              doc={codeBlockDoc}
              collection={`${id}_code`}
              id={data.codeSharedbID}
            />
          )}
          {textBlockDoc && <TextBlock doc={textBlockDoc} />}
        </div>
      </div>
    </div>
  );
}

export default NoteBook;
