/**
 * @version 1, March 17th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This file is the splash page which displays information about the project
 * and has buttons to either log in or sign up.
 */
import React from "react";
import "./SplashPage.css";
import money from "../../assets/money.png";
import time from "../../assets/clock.png";
import effort from "../../assets/weakness.png";

/**
 * This function returns the JSX for the splash page.
 *
 * @param {Object} props, values passed down from Authenticator
 *
 * @returns {JSXElement} SplashPage
 */
function SplashPage(props) {
  return (
    <>
      <div className="IntroContentContainer">
        <div className="IntroGradient">
          <div className="IntroContentTitle">
            <h1 className="Title">Auto Job</h1>
            <h2>Create Estimates From Anywhere</h2>
            {/*Get started button (sign up)*/}
            <button
              className="GetStartedButton"
              onClick={() => {
                props.setLoggingIn(false);
                props.toggleLogIn(true);
              }}
            >
              Get Started &gt;
            </button>
          </div>
          {/*Login button*/}
          <div className="IntroContent">
            <div className="IntroOverlay"></div>
            <button
              className="button SplashButton"
              onClick={() => {
                props.toggleLogIn(true);
              }}
            >
              Log In
            </button>
          </div>
        </div>
      </div>
      <div className="ThreeItems">
        <div className="item">
          <img src={time} className="SplashImage" />
          <h2 className="SplashH2">Save Time</h2>
          <p className="SplashText">
            Remotely create estimates in minutes and have more time to focus on
            your work.
          </p>
        </div>
        <div className="item">
          <img src={money} className="SplashImage" />
          <h2 className="SplashH2">Save Money</h2>
          <p className="SplashText">
            Save money by eliminating travel expenses and intensive labor from
            your estimate making process.
          </p>
        </div>
        <div className="item">
          <img src={effort} className="SplashImage" />
          <h2 className="SplashH2">Save Effort</h2>
          <p className="SplashText">
            Create estimates easily from the comfort of your own home.
          </p>
        </div>
      </div>
      <div className="Footer">
        <div className="FooterElement"></div>
        <div className="FooterElement"></div>
      </div>
    </>
  );
}

export default SplashPage;
