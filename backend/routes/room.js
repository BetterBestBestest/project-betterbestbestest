const express = require("express");
const Room = require("../models/room");
const { generateString, generateId } = require("../utils/random");
const { param, body, validationResult } = require("express-validator");
const { createDoc, deleteDoc, test } = require("../models/sharedb");
const { v4 } = require("uuid");
const { ObjectId } = require("mongodb");
const Message = require("../utils/defaultMessages");
const MAX_MEMBERS = 3;
const MAX_ROOM_PER_USER = 1;
const StatusCodes = require("../utils/StatusCodes");
// router = "/api/room"
const router = express.Router();

// endpoint for creating a room
router.post(
  "/",
  body("username")
    .notEmpty()
    .trim()
    .escape()
    .withMessage({ err: "wrong or missing roomOwner" }),
  body("roomName")
    .notEmpty()
    .withMessage({ err: "wrong or missing roomName" })
    .trim()
    .isLength({ max: 20 })
    .withMessage({ err: "name too long" }),
  async (req, res) => {
    // console.log("jason");
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(400)
        .json(Message.createErrorMessage(err.errors[0].msg.err));
    }
    const roomOwner = req.body.username;
    const roomName = req.body.roomName;
    const rooms = await Room.find({ owner: roomOwner });
    if (rooms.length >= MAX_ROOM_PER_USER) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          Message.createErrorMessage("exceed number of rooms allowed per user")
        );
    }
    const commentId = v4();
    const codeId = v4();
    const _id = ObjectId();
    createDoc(`${_id}_comment`, commentId, function (err) {
      if (err)
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(Message.createErrorMessage("unable to create the room"));
      createDoc(`${_id}_code`, codeId, async function (err) {
        if (err)
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(Message.createErrorMessage("unable to create the room"));
        const newRoom = new Room({
          joinCode: generateString(6),
          owner: roomOwner,
          commentSharedbID: commentId,
          codeSharedbID: codeId,
          members: [roomOwner],
          roomNumber: generateId(9),
          name: roomName,
          date: new Date(),
          _id: _id,
        });
        const room = await newRoom.save();
        return res.json(room.toObject());
      });
    });
  }
);

// endpoint for deleting a room
router.delete(
  "/:roomId/",
  param("roomId")
    .notEmpty()
    .trim()
    .escape()
    .custom((roomId) => ObjectId.isValid(roomId))
    .withMessage({ err: "wrong or missing roomOwner" }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(Message.createErrorMessage(err.errors[0].msg.err));
    }
    const roomId = req.params.roomId;
    const room = await Room.findOne({ _id: ObjectId(roomId) });
    if (!room) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(Message.createErrorMessage("room does not exist"));
    }
    deleteDoc(`${room._id}_comment`, room.commentSharedbID, (err) => {
      console.log(err);
      deleteDoc(`${room._id}_code`, room.codeSharedbID, async (err) => {
        console.log(err);
        await Room.deleteOne({ _id: ObjectId(roomId) });
        return res.json(room.toObject());
      });
    });
  }
);

// endpoint for get all rooms for a user
router.get(
  "/all/:username/",
  param("username")
    .notEmpty()
    .trim()
    .escape()
    .withMessage({ err: "wrong or missing username" }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(Message.createErrorMessage(err.errors[0].msg.err));
    }

    const username = req.params.username;
    const rooms = await Room.find({
      $and: [{ members: { $all: [username] } }, { owner: { $ne: username } }],
    });
    const myRooms = await Room.find({ owner: username });
    return res.json({
      rooms: rooms.map((room) => room.toObject()),
      myRooms: myRooms.map((myRoom) => myRoom.toObject()),
    });
  }
);

// endpoint for get a room
router.get(
  "/:roomId/",
  param("roomId")
    .notEmpty()
    .trim()
    .escape()
    .custom((roomId) => ObjectId.isValid(roomId))
    .withMessage({ err: "Missing or Wrong roomId" }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(Message.createErrorMessage(err.errors[0].msg.err));
    }
    const roomId = req.params.roomId;
    const room = await Room.findOne({ _id: ObjectId(roomId) });
    if (!room)
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(Message.createErrorMessage("Room Not Found"));
    return res.json(room.toObject());
  }
);

// endpoint for join a room
router.patch(
  "/join/",
  body("joinCode")
    .notEmpty()
    .isLength({ max: 6 })
    .trim()
    .escape()
    .withMessage({ err: "wrong or missing joinCode" }),
  body("roomNumber")
    .notEmpty()
    .isLength({ max: 9 })
    .trim()
    .escape()
    .withMessage({ err: "wrong or missing room number" }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(400)
        .json(Message.createErrorMessage(err.errors[0].msg.err));
    }
    const roomNumber = req.body.roomNumber;
    const joinCode = req.body.joinCode;
    const room = await Room.findOne({ roomNumber: roomNumber });
    if (!room || room.joinCode !== joinCode) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(Message.createErrorMessage("Wrong RoomId or Join Code"));
    }
    if (room.members.length >= MAX_MEMBERS) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(Message.createErrorMessage("Room Already Full"));
    }
    if (room.members.includes(req.username)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(Message.createErrorMessage("you join the room already"));
    }
    room.members.push(req.username);
    const update_room = await Room.findOneAndUpdate(
      { roomNumber: roomNumber },
      { members: room.members },
      { new: true }
    );
    return res.json(update_room.toObject());
  }
);

// endpoint for leave a room
router.patch(
  "/leave/",
  body("roomId")
    .notEmpty()
    .trim()
    .escape()
    .custom((roomId) => ObjectId.isValid(roomId))
    .withMessage({ err: "wrong or missing RoomId" }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res
        .status(400)
        .json(Message.createErrorMessage(err.errors[0].msg.err));
    }
    const roomId = req.body.roomId;
    const room = await Room.findOne({ _id: roomId });
    if (!room)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sned(Message.createErrorMessage("room does not exist"));
    if (!room.members.includes(req.username))
      return res
        .status(StatusCodes.FORBIDDEN)
        .send(Message.createErrorMessage("you need to join first"));
    const index = room.members.indexOf(req.username);
    if (index !== -1) {
      room.members.splice(index, 1);
    }
    const update_room = await Room.findOneAndUpdate(
      { _id: roomId },
      { members: room.members },
      { new: true }
    );
    return res.json(update_room.toObject());
  }
);

module.exports = router;
