import './Form.css'

function EstimateForm(){
    return (
        <form id="estimateForm">
            <div className="multiBoxWrapper">

                <div className="inputAndLabel half">
                    <h2>First Name</h2>
                    <input className="singleLineInput inputBox" type="text" id="fName" name="fName"></input>
                </div>

                <div className="inputAndLabel half">
                    <h2>Last Name</h2>
                    <input className="singleLineInput inputBox" type="text" id="lName" name="lName"></input>
                </div>

            </div>

            <div className="inputAndLabel">
                <h2>Email</h2>
                <input className="singleLineInput inputBox" type="text" id="strAddr" name="strAddr"></input>
            </div>

            <div className="inputAndLabel">
                <h2>Street Address</h2>
                <input className="singleLineInput inputBox" type="text" id="strAddr" name="strAddr"></input>
            </div>

            <div className="multiBoxWrapper">

                <div className="inputAndLabel third">
                    <h2>City</h2>
                    <input className="singleLineInput inputBox" type="text" id="city" name="city"></input>
                </div>

                <div className="inputAndLabel third">
                    <h2>State</h2>
                    <input className="singleLineInput inputBox" type="text" id="state" name="state"></input>
                </div>

                <div className="inputAndLabel third">
                    <h2>Zip</h2>
                    <input className="singleLineInput inputBox" type="text" id="zip" name="zip"></input>
                </div>

            </div>

            <div className="inputAndLabel">
                <h2>Include Any Surfaces and Their Square Footage</h2>
                <textarea className="multiLineInput inputBox" type="paragraph" id="measurments" name="measurments"></textarea>
            </div>

            <div className="inputAndLabel">
                <h2>Include Any Images of the Job Site</h2>
                <div class="placeholder">
                    <br/>
                    <br/>
                    Placeholder <br/>
                    Looking to add drag and drop feature here
                </div>
            </div>

            <div className="inputAndLabel">
                <h2>Include Any Other Details of the Job</h2>
                <textarea className="multiLineInput inputBox" type="paragraph" id="measurments" name="measurments"></textarea>
            </div>

            <input type="submit" id="submitButton"></input>

        </form>
    );
}

export default EstimateForm;