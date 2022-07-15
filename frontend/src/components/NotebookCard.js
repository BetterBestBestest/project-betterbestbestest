import { makeStyles } from "@material-ui/core/styles";
import { useNavigate } from "react-router-dom";
// import CreateIcon from "@material-ui/icons/Create";
// import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import { deepOrange, deepPurple } from "@material-ui/core/colors";

import NotebookInteractive from "./NotebookInteractive/NotebookInteractive";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 220,
    minHeight: 250,
    marginTop: 30,

    background: "#f5f5f5",
  },
  root_my: {
    minWidth: 220,
    minHeight: 250,
    marginTop: 30,
  },
  background_blue: {
    marginTop: 10,
    // background: "linear-gradient(to right,  #2980B9, #6DD5FA)",
    background: "#3f51b5",
    border: 0,
    color: "white",
  },
  background_red: {
    marginTop: 10,
    background: "#f44336",
    color: "white",
  },
  title: {
    fontSize: 28,
  },
  icon: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  icons: {
    display: "flex",
    flexDirection: "row",
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  pos: {
    marginBottom: 12,
  },
}));

const NotebookCard = ({ room, isMine, leaveRoom, deleteMyRoom }) => {
  const classes = useStyles();
  const nevigate = useNavigate();

  return (
    <Card className={classes.root}>
      <CardContent onClick={(e) => nevigate(`${room._id}`)}>
        <Typography className={classes.title} gutterBottom>
          {room.name}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {new Date(room.date).toISOString().split("T")[0]}
        </Typography>
        <div className={classes.icons}>
          {room.members.map((member, idx) => (
            <Avatar
              key={`member_${idx}`}
              style={{
                backgroundColor: ["#ffc107", deepPurple[500], deepOrange[500]][
                  idx % 3
                ],
              }}
              className={classes.small}
            >
              {member.slice(0, 1).toUpperCase()}
            </Avatar>
          ))}
        </div>
      </CardContent>
      <CardActions
        justifycontent="flex-end"
        className={isMine ? classes.background_red : classes.background_blue}
      >
        <NotebookInteractive
          isMine={isMine}
          room={room}
          deleteMyRoom={deleteMyRoom}
          leaveRoom={leaveRoom}
        />
      </CardActions>
    </Card>
  );
};

export default NotebookCard;
