import { IconButton } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core";
const theme = createTheme({
  palette: {
    primary: { main: "#696969" },
    secondary: { main: "#238636" },
    // success: { main: "blue" },
    info: {
      main: "#faff01",
    },
    // success: { main: "#faff01" },
  },
});

const GitHubOauthButton = ({ id, oauth }) => {
  return (
    <ThemeProvider theme={theme}>
      <div>
        {!oauth ? (
          <IconButton
            color="primary"
            error
            disabled={oauth}
            onClick={() => {
              const client_id = process.env.REACT_APP_CLIENT_ID;
              const redirect_url = process.env.REACT_APP_REDIRECT_URL;
              window.location.href =
                `https://github.com/login/oauth/authorize?client_id=${client_id}&` +
                `redirect_uri=${redirect_url}${id}` +
                `&scope=repo`;
              return null;
            }}
          >
            <GitHubIcon />
          </IconButton>
        ) : (
          <IconButton color="secondary">
            <GitHubIcon />
          </IconButton>
        )}
      </div>
    </ThemeProvider>
  );
};

export default GitHubOauthButton;
