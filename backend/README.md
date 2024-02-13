# User Estimate and Job Estimate Backend
**API Calls:**
- User Estimate API
  - POST /user : Posts a user estimate to the database of the specific company
    - Errors
    1. Bad Request (400): This error occurs when the Form data for "user" is filled out incorrectly.
    2. Internal Server Error (500): This error occurs when there is any error between how the 
       frontend is coded and how the backend wrongly deserializes the code.