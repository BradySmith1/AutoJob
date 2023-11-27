import React, { useEffect, useState } from 'react';

function Message(props){

    const [message, setMessage] = useState("");

    const determineDisplay = () => {
        if(props.setDisplay !== undefined){
            props.setDisplay(false);
        }else{
            setMessage(props.errorMessage);
        }
    }

    useEffect(() => {
        setMessage(props.message);

        if(props.timeout !== undefined){
            setTimeout(() => {
                determineDisplay();
            }, props.timeout);
        }

        if(props.finalErrorMessage !== undefined){
            setTimeout(() => {
                setMessage(props.finalErrorMessage);
            }, props.finalTimeout);
        }
    }, []);
    
    useEffect(() => {
        if(props.errorCondition === true){
            setMessage(props.finalErrorMessage);
        }
    });

    return (
        <div className='messageContainer'>
            <h3 className='message'>{message}</h3>
        </div>
    );
}

export default Message;