/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This component is a drag-drop image uploaded that
 * can also be clicked. If clicked, it will open your
 * file explorer to prompt for uploads.
 */

import "./DragDrop.css";
import { useRef, useState } from "react";

//The maximum amount of allowed images
const MAXIMAGES = 10;

/**
 * This function takes in a FileList object and
 * filters out any impropper files before adding
 * each file to a new list.
 *
 * @param {FileList} fileList the web api FileList object
 * @param {File[]} imageArr array of File Objects
 * @param {function} setErrors a setter for image errors
 * @returns valid, a boolean representing if any images are not valid
 */
function fileListToArray(fileList, imageArr, setErrors) {
  var valid = true;
  var errorArr = ["Invalid Files"];
  //Loop through the fileList
  for (var i = 0; i < fileList.length; i++) {
    //Filter anything that isnt an image
    if (validateOne(fileList[i]) && imageArr.length < MAXIMAGES) {
      //Assign each file a URL so we can view a thumbnail of it
      Object.assign(fileList[i], { preview: URL.createObjectURL(fileList[i]) });
      //Push to image array
      imageArr.push(fileList[i]);
    } else {
      valid = false;
      errorArr.push(determineError(imageArr.length, fileList[i]));
    }
  }
  setErrors(errorArr);
  return valid;
}

/**
 * This function constructs an error message
 * to display to the user if an upladed image
 * is invalid
 *
 * @param {number} size the size of the array of uploaded images
 * @param {file} file
 * @returns errorMessage,
 */
function determineError(size, file) {
  var errorMessage = "";
  if (size >= MAXIMAGES) {
    errorMessage = file.name + " exceeds limit.";
  } else {
    errorMessage = file.name + " is not an image.";
  }
  return errorMessage;
}

/**
 * This function validates one image. It makes sure it
 * is of type jpg, png or jpeg
 * @param {File} file the image to validate
 * @returns valid, boolean if valid or not
 */
function validateOne(file) {
  var valid = false;
  if (
    file.type === "image/jpg" ||
    file.type === "image/png" ||
    file.type === "image/jpeg"
  ) {
    valid = true;
  }
  return valid;
}

/**
 *
 * @param  props data from parent component
 *         props.images the array of File objects
 *         props.setImages set state for File objects array
 * @returns JSX object, the html for this component
 */
function DragDrop(props) {
  //Reference we use to connect drag and drop div
  //to a hidden upload button
  const inputRef = useRef();
  //Error flag for displaying invalid images
  const [valid, setValid] = useState(true);
  //Array of error messages
  const [imageErrors, setImageErrors] = useState([]);

  /**
   * This function adds an image to the image array
   *
   * @param {File[]} fileList
   */
  const addImages = (fileList) => {
    var imageArr = [...props.images];
    setValid(fileListToArray(fileList, imageArr, setImageErrors));
    props.setImages(imageArr);
  };

  /**
   * Prevent the default functionality of the drag over
   * event
   * @param {event} event drag over event.
   */
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /**
   * This function handles the dropped files.
   *
   * @param {event} event
   */
  const handleDrop = (event) => {
    event.preventDefault();
    addImages(event.dataTransfer.files);
    console.log(props.images);
  };

  return (
    <div>
      <div
        className="dropZone"
        id="drop"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <br />
        <br />
        Drop Images Here
        <br />
        Or Click to Upload
        <br />
        <br />
        Images: {props.images.length}/{MAXIMAGES}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          multiple
          hidden
          onChange={(event) => {
            //This button is connected to the drag and drop div through a reference
            //On click, prompt for file upload
            addImages(event.target.files);
          }}
          ref={inputRef}
        ></input>
      </div>
      {!valid ? (
        <div className="imageErrors">
          {imageErrors.map((currentElement, index) => (
            <div className="imageError" key={index}>
              <h3 className="errorMessage">{currentElement}</h3>
            </div>
          ))}
        </div>
      ) : null}
      <div className="imageContainer">
        {/**Map over the images to create thumbnails */}
        {props.images.map((image, index) => (
          <div className="thumbnail" key={index}>
            <img className="img" src={image.preview} alt=""></img>
            <button
              type="button"
              className="removeBtn"
              onClick={() => {
                //Remove this image if clicked
                var imageArr = [...props.images];
                imageArr.splice(index, 1);
                props.setImages(imageArr);
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DragDrop;
