import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptymessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  
  useEffect(() => {
    if (authState.loggedIn || localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

 
  useEffect(() => {
    dispatch(emptymessage());
  }, []);

  
  const handleRegister = () => {
    if (!email || !password || !username || !name) {
      alert("Please fill all the fields!");
      return;
    }
    dispatch(registerUser({ username, password, email, name }));
  };

  // Login
  const handleLogin = () => {
    if (!email || !password) {
      alert("Email & Password required");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

 
  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>

          {/* LEFT SIDE (Form) */}
          <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}>
              {isLogin ? "Sign In" : "Sign Up"}
            </p>

            {/* error or success msg */}
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {authState.message}
            </p>

            {/* Form */}
            <div className={styles.inputContainer}>
              {!isLogin && (
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    placeholder="Username"
                    className={styles.inputField}
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Full Name"
                    className={styles.inputField}
                  />
                </div>
              )}

              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="Email"
                className={styles.inputField}
              />

              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className={styles.inputField}
              />

              <div onClick={handleSubmit} className={styles.buttonWithOutline}>
                <p>{isLogin ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (Toggle) */}
          <div className={styles.cardContainer_right}>
            <div>
              <p className={styles.accountMessage}>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>

              <div
                onClick={() => setIsLogin(!isLogin)}
                className={`${styles.buttonWithOutline} ${styles.rightButton}`}
              >
                <p>{isLogin ? "Sign Up" : "Sign In"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
