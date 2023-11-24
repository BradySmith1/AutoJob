import React, { useEffect, useState } from 'react';

function Message(props){

    const [message, setMessage] = useState("");

    useEffect(() => {
        setMessage(props.message);

        if(props.timeout !== undefined){
            setTimeout(() => {
                if(props.setDisplay !== undefined){
                    props.setDisplay(false);
                }else{
                    setMessage(props.errorMessage);
                }
            }, props.timeout);
        }

        if(props.finalErrorMessage !== undefined){
            setTimeout(() => {
                setMessage(props.finalErrorMessage);
            }, props.finalTimeout);
        }
    }, []);

    return (
        <div className='messageContainer'>
            <h3 className='message'>{message}</h3>
        </div>
    );
}

export default Message;