import React, { useState } from "react";
import SignUpForm from "./SignUpForm.js";
import userAPI from "../../../api/userAPI";
import validateSignUpForm from "../validate";
import errorHandler from "../utils/errhandling";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const SignUpContainer = () => {
  let nav = useNavigate();
  const zxcvbn = require("zxcvbn");

  const [errors, setError] = useState({});
  const [user, setUser] = useState({
    username: "",
    password: "",
    pwconfirm: "",
  });
  const [btnTxt, setBtnTxt] = useState("show");
  const [type, setType] = useState("password");
  const [score, setScore] = useState("0");
  const handleChange = (event) => {
    const field = event.target.name;

    switch (field) {
      case "username":
        setUser({ ...user, username: event.target.value });
        break;
      case "password":
        setUser({ ...user, password: event.target.value });
        break;
      case "pwconfirm":
        setUser({ ...user, pwconfirm: event.target.value });
        break;
      default:
    }
  };

  const pwHandleChange = (event) => {
    const field = event.target.name;
    switch (field) {
      case "username":
        setUser({ ...user, username: event.target.value });
        break;
      case "password":
        setUser({ ...user, password: event.target.value });
        break;
      case "pwconfirm":
        setUser({ ...user, pwconfirm: event.target.value });
        break;
      default:
    }

    if (event.target.value === "") {
      setScore("null");
    } else {
      var pw = zxcvbn(event.target.value);
      const newScore = pw.score + 1;
      setScore(newScore);
    }
  };

  const submitSignup = () => {
    userAPI
      .signup(user.username, user.password)
      .then((data) => {
        toast.success(data.message);
        nav("/");
        window.location.reload();
      })
      .catch(({ response }) => {
        errorHandler.handleSignUp(response);
      });
  };

  const validateForm = (event) => {
    event.preventDefault();
    console.log("user obj is");

    console.log(user);
    var payload = validateSignUpForm(user);
    if (payload.success) {
      setError({});

      submitSignup();
    } else {
      const errors = payload.errors;
      console.log(errors);
      setError(errors);
    }
  };

  const pwMask = (event) => {
    event.preventDefault();

    btnTxt === "show" ? setBtnTxt("hide") : setBtnTxt("show");
    type === "password" ? setType("input") : setType("password");
  };

  return (
    <div>
      <SignUpForm
        onSubmit={validateForm}
        onChange={handleChange}
        onPwChange={pwHandleChange}
        errors={errors}
        user={user}
        score={score}
        btnTxt={btnTxt}
        type={type}
        pwMask={pwMask}
      />
    </div>
  );
};
export default SignUpContainer;