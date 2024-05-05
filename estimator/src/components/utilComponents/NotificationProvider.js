/**
 * @version 1, April 1st, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This component acts as a queue data strcuture which holds
 * notifications. This component also provides context to children
 * components so that they can add to the notification queue.
 */
import React, { useState, createContext, useEffect, useRef } from "react";
import Close from "../../assets/Close.png";
import "./Notification.css"

//Export the notification context
export const NotificationContext = createContext({
    enqueue: () => {},
});

/**
 * This function returns the JSX and logic for this component
 * 
 * @param {Object} props, children to display 
 * @returns {JSXElement} JSX for this component
 */
function NotificationProvider(props){
    //Array to hold timeout functions
    const [notificationArray, setNotificationArray] = useState([]);
    //State for current message being displayed
    const [currentMessage, setCurrentMessage] = useState("");
    //State for the current timeout in queue
    const [currentTimeout, setCurrentTimeout] = useState(() => {});
    //State for the current timeout running
    const [timeOutRunning, setTimeoutRunning] = useState(false);

    //Ref to keep a reference to the current notificatio running
    const notificationArrayRef = useRef(notificationArray);
    notificationArrayRef.current = notificationArray;

    /**
     * This function dequeues a notificatio
     * @returns {object} firstElement, current element in queue
     */
    const dequeue = () => {
        var newArray = [...notificationArrayRef.current];
        const firstElement = newArray.shift();
        setNotificationArray(newArray);
        return firstElement;
    }
    
    /**
     * This function enqueues a notification.
     * 
     * @param {object} element, notification to enqueue 
     * @param {number} time, time to stay on screen in MS
     */
    const enqueue = (element, time) => {
        var newArray = [...notificationArray];
        //Create the timeout function
        const timeoutFunction = () => {
            //Set the timeout running
            setTimeoutRunning(true);
            //Set the current message
            setCurrentMessage(element);
            //Timeout function
            const timeout = setTimeout(() => {
                //Set timeout running false and dequeue
                setTimeoutRunning(false);
                dequeue();
            }, time)
            return timeout;
        }
        //Push this function
        newArray.push(timeoutFunction);
        //Set the notification array
        setNotificationArray(newArray);
    }

    /**
     * This use effect function acts almost recursively, 
     * firing off the current function in the notifcation array
     * until there are none left.
     */
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
                            {/*Close Button */}
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