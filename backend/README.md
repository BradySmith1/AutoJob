# User Estimate and Job Estimate Backend
### Things to know
- All code that requires a authorization token means that the authorization token inherently 
  points to the correct company database that will be used.
- All errors that have to do with a Internal Server Error (500) are always associated with the 
  frontend not communicating with the backend correctly.

**API Calls:**
- User Estimate API
  - POST /user - Posts a user estimate to the database of the specific company
    1. Bad Request (400): This error occurs when the Form data for "user" is filled out incorrectly.
    2. Internal Server Error (500)
    
### All of the Code below this line requires a authorization token
  
  - GET /user - Gets a user estimate from a specific company's database. The company is 
    deciphered from the authentication token that is provided
    1. Internal Server Error (500)
  - GET /userimage - Gets a image from the specified location in the file system.
  - PUT /user/{id} - updates the user that is attached to the id provided in the query
    1. Bad Request(400): This error occurs if there is no id provided in the request
    2. internal Server Error (500)
  - DELETE /user - Deletes a user based on the attributes provided.
    1. Bad Request (400): This error occurs when a empty query is provided in the request
    2. Not Found (404): This error occurs when the query provided did not map to a user in the 
       companies database.
    3. Internal Server Error (500)
  - GET /users - Gets all the user estimates from the database
- Job Estimate API
  - POST /estimate - Posts a job estimate to the database of the specific company
    1. Internal Server Error (500)
  - GET /estimate - Gets a job estimate from a specific company's database. The company is
    deciphered from the authentication token that is provided
      1. Internal Server Error (500)
  - PUT /estimate/{id} - updates the job that is attached to the id provided in the query
      1. Bad Request(400): This error occurs if there is no id provided in the request
      2. internal Server Error (500)
  - DELETE /estimate - Deletes a job estimate based on the attributes provided.
      1. Bad Request (400): This error occurs when a empty query is provided in the request
      2. Not Found (404): This error occurs when the query provided did not map to a user in the
         companies database.
      3. Internal Server Error (500)
  - GET /estimates - Gets all the job estimates from the database