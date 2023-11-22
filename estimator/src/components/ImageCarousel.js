/**
 * @version 1, October 26th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component acts as an image gallery and carousel. It
 * displays the images in a grid, and when you click one it
 * brings up the full screen image carousel to view them better.
 */
import "./ImageCarousel.css"
import React, { useState } from "react";

const URLHEADER = "userimage?reference=";

/**
 * This function returns the jsx component containing
 * all of the HTML for this component.
 * 
 * @param props data from the parent component
 *        props.images the list of images 
 * @returns JSX Object, the html for this component
 */
function ImageCarousel(props){

    //state for the currently selected image
    const [imgIndex, setImgIndex] = useState(0);
    //state for displaying the carousel
    const [display, setDisplay] = useState(false);

    return(
        <div className="carouselContainer">
            <h2>Job Site Images</h2>
            <div className="images">
                {/**map over the images and display them in a grid */}
                {props.images.map((source, index) => (
                    <img 
                        src={URLHEADER + source.reference} 
                        className="image" 
                        key={index}
                        onClick={() => {
                            //When an image is clicked
                            //Set the image index
                            setImgIndex(index);
                            //Display the carousel
                            setDisplay(true);
                            //hide the scrollbar
                            document.body.style.overflowY = 'hidden';
                        }}
                    />
                ))}
            </div>
            {/**If display is true, display the carousel*/}
            {!display ? null : (
                <div className="fullScreen">
                    <div className="imgNav">
                        {/**Only display the left arrow if this isnt the first element */}
                        {imgIndex === 0 ? 
                        (
                            <div className="placeHolderDiv"></div>
                        )
                        : 
                        (
                            <button 
                            className="navBtn"
                            onClick={() => {
                                //On click, decrement the image index
                                setImgIndex(index => index - 1);
                            }}
                        > &lt; </button>
                        )}
                        {/**Full screen image is displayed here */}
                        <div className="maxImageSize">
                            <img
                                src={URLHEADER + props.images[imgIndex].reference}
                                className="fullScreenImg"
                            />
                        </div>
                        {/**Only display the right arrow if this isnt the first element */}
                        {imgIndex === props.images.length - 1 ? 
                        (
                            <div className="placeHolderDiv"></div>
                        )
                        : 
                        (
                            <button 
                            className="navBtn"
                            onClick={() => {
                                //On click, increment the image index
                                setImgIndex(index => index + 1);
                            }}
                        > &gt; </button>
                        )}
                    </div>
                    <button 
                        className="closeButton"
                        onClick={() => {
                            //Close the carousel on click.
                            setDisplay(false);
                            document.body.style.overflowY = 'auto';
                        }}
                    >
                        close
                    </button>
                </div>
            )}
        </div>
    );
}

export default ImageCarousel
