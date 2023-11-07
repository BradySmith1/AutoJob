/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component is a drag-drop image uploaded that
 * can also be clicked. If clicked, it will open your
 * file explorer to prompt for uploads.
 */

import './DragDrop.css';
import { useRef, useState } from "react";

const MAXIMAGES = 10;

/**
 * This function takes in a FileList object and
 * filters out any impropper files before adding
 * each file to a new lis.
 * 
 * @param {FileList} fileList the web api FileList object
 * @param {File[]} imageArr array of File Objects
 */
function fileListToArray(fileList, imageArr){
    //Loop through the fileList
    for(var i = 0; i < fileList.length; i++){
        //Filter anything that isnt an image
        if(validateOne(fileList[i]) && imageArr.length < MAXIMAGES){
            //Assign each file a URL so we can view a thumbnail of it
            Object.assign(fileList[i], {preview: URL.createObjectURL(fileList[i])});
            //Push to image array
            imageArr.push(fileList[i]);
        }
    }
}

function validateAll(fileList, imageArr){
    var valid = true;
    for(var i = 0; i < fileList.length; i++){
        if(!validateOne(fileList[i]) || i >= imageArr.length){
            valid = false;
        }
    }
    return valid;
}

function validateOne(file){
    var valid = false;
    if(file.type === "image/jpg" || file.type === "image/png" || file.type === "image/jpeg"){
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
function DragDrop(props){

    //Reference we use to connect drag and drop div
    //to a hidden upload button
    const inputRef = useRef();
    const [valid, setValid] = useState(true);

    /**
     * This function adds an image to the image array
     * 
     * @param {File[]} fileList 
     */
    const addImages = (fileList) => {
        var imageArr = [...props.images];
        fileListToArray(fileList, imageArr);
        if(!validateAll(fileList, imageArr)){
            setValid(false);
        }else{
            setValid(true);
        }
        props.setImages(imageArr);
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    /**
     * This function handles the dropped files.
     * 
     * @param {event} event 
     */
    const handleDrop = (event) => {
        event.preventDefault();
        addImages(event.dataTransfer.files);
        console.log(props.images);
    }

    return(
        <div>
            <div 
                className="dropZone"
                id="drop"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >   
                {valid ? 
                (
                    <>
                    <br/>
                    <br/>
                    Drop Images Here 
                    <br/>
                    Or Click to Upload 
                    <br/>
                    <br/>
                    Images: {props.images.length}/{MAXIMAGES}
                    </>
                )
                :
                (
                    <>
                    <br/>
                    <br/>
                    Invalid Files
                    <br/>
                    <br/>
                    Images: {props.images.length}/{MAXIMAGES}
                    </>
                )}
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    hidden
                    onChange={(event) => {
                        //This button is connected to the drag and drop div through a reference
                        //On click, prompt for file upload
                        addImages(event.target.files);
                        console.log(props.images);
                    }}
                    ref={inputRef}
                >
                </input>
            </div>
            <div className="imageContainer">
                {/**Map over the images to create thumbnails */}
                {props.images.map((image, index) => (
                    <div className="thumbnail" key={index}>
                        <img className='img' src={image.preview}></img>
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