const sharedbMongo = require("sharedb-mongo");
require("dotenv").config();
const ShareDB = require("sharedb");
const richText = require("rich-text");
const mongoose = require("mongoose");

const db = sharedbMongo(process.env.MONGO_CONN_STR);
ShareDB.types.register(richText.type);
var backend = new ShareDB({ db });
const connection = backend.connect();

const createDoc = (username, id, callback) => {
  const doc = connection.get(username, id);
  doc.fetch((err) => {
    if (err) throw err;
    if (doc.type === null) {
      // insert dummy element to initilize shardb
      const init = username.includes("code") ? 'print("hello world")' : "hi";
      doc.create([{ insert: init }], "rich-text", callback);
      return;
    }
    callback("doc already exist");
  });
};

const deleteDoc = async (docName, id, callback) => {
  console.log(docName, id);
  const doc = connection.get(docName, id);
  const conn = await mongoose
    .createConnection(process.env.MONGO_CONN_STR)
    .asPromise();
  await conn.dropCollection(docName);
  await conn.dropCollection(`o_${docName}`);
  return callback();
};

const test = (username, id, callback) => {
  const doc = connection.get(username, id);
  doc.fetch((err) => {
    if (err) throw err;
    console.log(doc.type);
    if (doc.type === null) {
    }
    callback("doc already exist");
  });
};

module.exports = { createDoc, deleteDoc, test };
