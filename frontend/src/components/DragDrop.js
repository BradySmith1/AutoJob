import './DragDrop.css';
import { useRef, useState } from "react";

function fileListToArray(fileList, imageArr){
    for(var i = 0; i < fileList.length; i++){
        if(fileList[i].type === "image/jpg" || fileList[i].type === "image/png" || fileList[i].type === "image/jpeg"){
            Object.assign(fileList[i], {preview: URL.createObjectURL(fileList[i])});
            imageArr.push(fileList[i]);
        }
    }
}

function DragDrop(props){

    const inputRef = useRef();

    const addImages = (fileList) => {
        var imageArr = [...props.images];
        fileListToArray(fileList, imageArr);
        props.setImages(imageArr);
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

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
                        addImages(event.target.files);
                        console.log(props.images);
                    }}
                    ref={inputRef}
                >
                </input>
            </div>
            <div className="imageContainer">
            {props.images.map((image, index) => (
                <div className="thumbnail" key={index}>
                    {image.name}
                    <button 
                        type="button"
                        className="removeBtn"
                        onClick={() => {
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