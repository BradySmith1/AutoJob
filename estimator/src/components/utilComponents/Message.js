/**
 * @version 1, November 29th, 2023
 * @author Andrew Monroe and Brady Smith
 * 
 * This component is a reuseable message component that can be used
 * to make dissapearing message components, responsive loading messages,
 * or used like an observer for responsive error messages.
 */
import React, { useEffect, useState } from 'react';

/**
 * This is the method that renders the message. 
 * @param {*} props passed values
 * @returns JSX object
 */
function Message(props){

    //Current message
    const [message, setMessage] = useState("");

    /**
     * This is a helper function that detremines if
     * we want to make this component dissapear or
     * set it to a second error message.
     */
    const determineDisplay = () => {
        if(props.setDisplay !== undefined){
            props.setDisplay(false);
        }else{
            setMessage(props.errorMessage);
        }
    }

    /**
     * This use effect function runs at startup and sets the message to
     * the props message. If we want to set timeouts on this, then it sets
     * the timeoutes as well.
     */
    useEffect(() => {
        //Set the message.
        setMessage(props.message);

        //If we want a timeout
        if(props.timeout !== undefined){
            //Set the timeout
            setTimeout(() => {
                //Detrmine what to do after the timeout
                determineDisplay();
            }, props.timeout);
        }

        //If we have a final message
        if(props.finalErrorMessage !== undefined){
            //Set timeout for it
            setTimeout(() => {
                //Set message after timeout
                setMessage(props.finalErrorMessage);
            }, props.finalTimeout);
        }
    }, []);
    
    /**
     * this use effect function will monitor a given
     * error condition and if that becomes true, it 
     * will display the final error message skipping
     * all timeouts.
     */
    useEffect(() => {
        if(props.errorCondition === true){
            setMessage(props.finalErrorMessage);
        }
    });

    //Here we are just returning the div with an h3 message.
    return (
        <div className='messageContainer'>
            <h3 className='message'>{message}</h3>
        </div>
    );
}

export default Message;