/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component is a drag-drop image uploaded that
 * can also be clicked. If clicked, it will open your
 * file explorer to prompt for uploads.
 */

import './DragDrop.css';
import { useRef } from "react";

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
        if(fileList[i].type === "image/jpg" || fileList[i].type === "image/png" || fileList[i].type === "image/jpeg"){
            //Assign each file a URL so we can view a thumbnail of it
            Object.assign(fileList[i], {preview: URL.createObjectURL(fileList[i])});
            //Push to image array
            imageArr.push(fileList[i]);
        }
    }
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

    /**
     * This function adds an image to the image array
     * 
     * @param {File[]} fileList 
     */
    const addImages = (fileList) => {
        var imageArr = [...props.images];
        fileListToArray(fileList, imageArr);
        props.setImages(imageArr);
    }

    /**
     * This function prevents the default functionality
     * of the drag over event.
     * 
     * @param {event} event 
     */
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
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >
                <br/>
                <br/>
                Drop Images Here <br/>
                Or Click to Upload
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