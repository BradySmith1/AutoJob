import React, { useState, createContext, useEffect, useRef } from "react";
import Close from "../../assets/Close.png";
import "./Notification.css"

export const NotificationContext = createContext({
    enqueue: () => {},
});

function NotificationProvider(props){
    const [notificationArray, setNotificationArray] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentTimeout, setCurrentTimeout] = useState(() => {});
    const [timeOutRunning, setTimeoutRunning] = useState(false);

    const notificationArrayRef = useRef(notificationArray);
    notificationArrayRef.current = notificationArray;

    const dequeue = () => {
        var newArray = [...notificationArrayRef.current];
        const firstElement = newArray.shift();
        setNotificationArray(newArray);
        return firstElement;
    }
    
    const enqueue = (element, time) => {
        var newArray = [...notificationArray];
        const timeoutFunction = () => {
            setTimeoutRunning(true);
            setCurrentMessage(element);
            const timeout = setTimeout(() => {
                setTimeoutRunning(false);
                dequeue();
            }, time)
            return timeout;
        }
        newArray.push(timeoutFunction);
        setNotificationArray(newArray);
    }

    useEffect(() => {
        if(notificationArray.length > 0 && !timeOutRunning){
            setCurrentTimeout(notificationArray[0]());
        }
    }, [notificationArray]);

    return(
        <>
            <NotificationContext.Provider value={{addMessage: enqueue}}>
                {timeOutRunning ? (
                    <div className="Notification">
                        <div className="NotificationContentWrapper">
                            <h2>{currentMessage}</h2>
                            <img src={Close} className="NotificationClose" onClick={() => {
                                clearTimeout(currentTimeout);
                                setTimeoutRunning(false);
                                dequeue();
                            }} />
                        </div>
                    </div>
                ) : (null)}
                {props.children}
            </NotificationContext.Provider>
        </>
    );
}

export default NotificationProvider;