import React, { useState, createContext, useEffect } from "react";
import "./Notification.css"

export const NotificationContext = createContext({
    enqueue: () => {},
});

const awaitTimeout = (delay) => {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function NotificationProvider(props){
    const [notificationArray, setNotificationArray] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

    const enqueue = (element) => {
        var newArray = [...notificationArray];
        newArray.push(element);
        setNotificationArray(newArray);
    }

    const dequeue = () => {
        var newArray = [...notificationArray];
        const firstElement = newArray.shift();
        setNotificationArray(newArray);
        return firstElement;
    }

    useEffect(() => {
        if(notificationArray.length > 0){
            setCurrentMessage(notificationArray[0]);
            awaitTimeout(3000).then(() => {
                setCurrentMessage("");
                dequeue();
            });
        }
    }, [notificationArray]);

    return(
        <>
            <NotificationContext.Provider value={{addMessage: enqueue}}>
                {currentMessage !== "" ? (
                    <div className="Notification">
                        <h2>{currentMessage}</h2>
                    </div>
                ) : (null)}
                {props.children}
            </NotificationContext.Provider>
        </>
    );
}

export default NotificationProvider;