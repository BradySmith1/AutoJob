import "./ImageCarousel.css"
import { useState } from "react";

function ImageCarousel(props){

    const [imgIndex, setImgIndex] = useState(0);
    const [display, setDisplay] = useState(false);

    return(
        <div className="carouselContainer">
            <h2>Job Site Images</h2>
            <div className="images">
                {props.images.map((source, index) => (
                    <img 
                        src={source} 
                        className="image" 
                        key={index}
                        onClick={() => {
                            setImgIndex(index);
                            setDisplay(true);
                            document.body.style.overflowY = 'hidden';
                        }}
                    />
                ))}
            </div>
            {!display ? null : (
                <div className="fullScreen">
                    <div className="imgNav">
                        {imgIndex === 0 ? null : (
                            <button 
                            className="navBtn"
                            onClick={() => {
                                setImgIndex(index => index - 1);
                            }}
                        > &lt; </button>
                        )}
                        <img
                            src={props.images[imgIndex]}
                            className="fullScreenImg"
                        />
                        {imgIndex === props.images.length - 1 ? null : (
                            <button 
                            className="navBtn"
                            onClick={() => {
                                setImgIndex(index => index + 1);
                            }}
                        > &gt; </button>
                        )}
                    </div>
                    <button 
                        className="closeButton"
                        onClick={() => {
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