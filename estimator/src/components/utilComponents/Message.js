import React, { useEffect } from 'react';

function Message(props){

    useEffect(() => {
        setTimeout(() => {
            props.setDisplay(false);
        }, props.timeout);
    }, []);

    return (
        <div className='messageContainer'>
            <h3 className='message'>{props.message}</h3>
        </div>
    );
}

export default Message;