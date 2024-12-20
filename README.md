# Creator-Copilot


# TODO BACKEND

- [ ] TRY OPTIMIZING AUTH MIDDLEWARE - VALIDATE FUNCTION FOR ALL USERS
- [X] IF ROLE IS ADMIN OR PROJECT MANAGER, VALIDATE IF CURRENT USER IS ADMIN
- [ ] VERIFY EMAIL WHILE REGISTERING (VERIFICATION (NOT VALIDATION)) - PKGNAME: NODE EMAILER
- [X] ZOD VALIDATION
- [ ] FETCH SINGLE USER
- [ ] FETCH CLIENTS AND FREELANCERS (FOR PROJECT MANAGER)
- [ ] FIX DEPRECATED - MONGODB DRIVERS: useNewUrlParser, useUnifiedTopology
- [ ] IMPLEMENT FORGOT PASSWORD FUNCTIONALITY

# TODO FRONTEND
- [ ] The token returned must be stored in the frontend ideally in the local storage and sent in the headers for all the requests that require authentication.
- [ ] IF ADMIN WANTS TO REGISTER SOMEONE SEND THE TOKEN IN THE HEADERS
- [ ] CHECK VERIFIED STATUS OF USER WHILE LOGGING IN, IF NOT VERIFIED, SHOW A MESSAGE TO VERIFY EMAIL AND AN OPTION TO RESEND THE VERIFICATION EMAIL

# Email Verification

Email verification is implemented using nodemailer. When user is registered, a verification email is sent to the user and account is created with verified status as false. When user clicks on the link in the email, the verified status is changed to true. 

When user tries to login with an unverified email, a message is shown to verify the email and an option to resend the verification email is also provided. Unless the email is verified, user cannot proceed access anything else.

Problem:

but what if user never logs in again and the email is never verified? The email will be stored in the database forever. I need to delete it after some time.

how to delete it after some time? I can use a cron job to delete all the unverified emails after some time. But how to implement cron jobs in nodejs?

What I Did:

implemented cron jobs in nodejs, I can use the node-cron package.I'm running a cron job every day midnight to delete all the unverified emails that are older than 7 days.

# KEEP IN MIND

- Check input Patterns [Validation]
- Treat the input like text - Encoding
- Be aware of how the data is being stored in the database
- Be aware of how the data is being sent to the client
- Be aware of what data is being received from the client
- he.encode() explore on it 
   - he is html entity library, it can be used to encode and decode html  entities. he.encode() will encode the html entities  in the string and  treats the input as string, not execute it
   - the characters are converted to html entities &lt, &gt etc..
   - he.decode() will decode the html entities in the string and return the original string
- Keep a note on expiration of tokens, 
- **What is the difference between a session and a token?**
- ENCODE ALL THE PARAMS he.encode()

## API Docs
#### These colors denote
🟢 - Project Manager
🔴 - Admin
🔵 - Client
🟡 - Freelancer

## Onboarding 
### 1. Onboard Client

Endpoint: POST ```/api/register/client```<br>
Description: Onboard a new client to the platform.<br>
Permissions: All roles can access this endpoint.<br>
Request Body:<br>
```
{
  "userId": "string", // Required. The ID of the user to be onboarded as a client.
  "description": "string", // Required. Description of the client's needs.
  "requirements": "string", // Required. Specific requirements from the client.
  "skillset": ["string"] // Required. Skills the client is looking for.
}
```

Response: Returns a success message if the client is onboarded successfully.
### 2. Onboard Freelancer

Endpoint: POST ```/api/register/freelancer```<br>
Description: Onboard a new freelancer to the platform.<br>
Permissions: All roles can access this endpoint.<br>
Request Body:<br>
```
{
  "userId": "string", // Required. The ID of the user to be onboarded as a freelancer.
  "bio": "string", // Optional. A short biography of the freelancer.
  "hourlyRate": "number", // Required. The hourly rate of the freelancer.
  "education": ["string"], // Required. Educational background of the freelancer.
  "experience": ["string"], // Optional. Experience details of the freelancer.
  "portfolios": ["string"], // Required. Portfolio links or descriptions.
  "servicesList": ["string"], // Required. List of services offered by the freelancer.
  "skills": ["string"], // Required. Skills possessed by the freelancer.
  "languages": ["string"] // Required. Languages spoken by the freelancer.
}
```

Response: Returns a success message if the freelancer is onboarded successfully.

## Chat

### 1. Access Chat (One-on-One Chat)

Endpoint: POST ```/api/chat```<br>
Description: Access an existing one-on-one chat or create a new one if it doesn't exist.<br>
Permissions: All roles can access this endpoint.<br>
Request Body:


```
{
  "userId": "string", // Required. The ID of the user to chat with.
  "chatName": "string" // Required. Name of the chat.
}
```
Response: Returns the chat details if accessed or created successfully.
### 2. Create Group Chat

Endpoint: POST ```/api/chat/group```
<br>
Description: Create a new group chat.<br>
Permissions: Only 🟢 Project Managers and 🔴 Admins can create group chats.<br>
Request Body:


```
{
  "users": "string", // Required.  stringified array of user IDs to include in the group.
  "name": "string" // Required. Name of the group chat.
}
```
Response: Returns the newly created group chat details.
 ### 3. Fetch All Chats

Endpoint: GET ```/api/chat/fetch```<br>
Description: Fetch all chats of the authenticated user.<br>
Permissions: All roles can access this endpoint.<br>
Response: Returns an array of chat objects associated with the user.
### 4. Add User to Group Chat

Endpoint: PUT ```/api/chat/groupadd```<br>
Description: Add a user to an existing group chat.<br>
Permissions: Only 🟢 Project Managers and 🔴 Admins can add users to group chats.<br>
Request Body:


```
{
  "chatId": "string", // Required. The ID of the group chat.
  "userId": "string" // Required. The ID of the user to add.
}
```
Response: Confirmation message on successful addition.
### 5. Remove User from Group Chat

Endpoint: PUT ```/api/chat/groupremove```<br>
Description: Remove a user from an existing group chat.<br>
Permissions: Only 🟢 Project Managers and 🔴 Admins can remove users from group chats.<br>
Request Body:


```
{
  "chatId": "string", // Required. The ID of the group chat.
  "userId": "string" // Required. The ID of the user to remove.
}
```

Response: Confirmation message on successful removal.
### 6. Delete Group Chat

Endpoint: DELETE ```/api/chat/deletegroup```<br>
Description: Delete an existing group chat.<br>
Permissions: Only 🟢 Project Managers and 🔴 Admins who are the group admin can delete the group chat.<br>
Request Body:


```
{
  "chatId": "string" // Required. The ID of the group chat.
}
```
Response: Confirmation message on successful deletion.
Models

## Message Endpoints
### 7. Send Message

Endpoint: POST ```/api/message```<br>
Description: Send a message in a chat.<br>
Permissions: Only users who are participants of the chat can send messages.<br>
Request Body:


```
{
  "chatId": "string", // Required. The ID of the chat.
  "content": "string", // Required. The content of the message.
  "media": "string" // Optional. Any media associated with the message.
}
```
Response: Returns the sent message details.
### 8. Delete Message

Endpoint: DELETE ```/api/message/delete```<br>
Description: Delete a message in a chat.<br>
Permissions: Only 🟢 Project Managers and 🔴 Admins can delete messages.<br>
Request Body:


```
{
  "messageId": "string", // Required. The ID of the message to delete.
  "chatId": "string" // Required. The ID of the chat.
}
```
Response: Confirmation message on successful deletion.
### 9. Search Messages

Endpoint: GET ```/api/message/search```<br>
Description: Search for messages in a chat.<br>
Permissions: Only users who are participants of the chat can search messages.<br>
Request Body:


```
{
  "keyword": "string", // Required. The keyword to search for.
  "chatId": "string" // Required. The ID of the chat.
}
```
Response: Returns an array of messages that match the search criteria.
### 10. Fetch All Messages

Endpoint: GET ```/api/message/fetch/:chatId```<br>
Description: Fetch all messages in a chat.<br>
Permissions: Only users who are participants of the chat can fetch messages.<br>
Response: Returns an array of messages in the specified chat.

## Project

### 1. Create a Project

Endpoint: POST ```/api/projects/create```<br>
Description: Allows a client to create a new project by providing the necessary details.<br>
Permissions: Only clients can access this endpoint.<br>
Request Body:<br>


```
{
  "title": "string", // Required. The title of the project.
  "description": "string", // Required. A detailed description of the project.
  "skills": ["string"], // Required. List of skills needed for the project.
  "budget": "number", // Required. The budget allocated for the project.
  "deadline": "date" // Required. The deadline for project completion.
}
```

Response: Returns a success message if the project is created successfully.
### 2. Accept a Project

Endpoint: POST ```/api/projects/accept```<br>
Description: Allows a project manager to accept a project, changing its status to open and assigning themselves as the manager.<br>
Permissions: Only project managers can access this endpoint.<br>
Request Body:<br>


```
{
  "projectId": "string" // Required. The ID of the project to be accepted.
}
```

Response: Returns a success message if the project is accepted successfully.
### 3. Complete a Project

Endpoint: POST ```/api/projects/complete```<br>
Description: Marks a project as completed, updating relevant user and project details.<br>
Permissions: Accessible by authorized users involved in the project.<br>
Request Body:<br>


```
{
  "projectId": "string" // Required. The ID of the project to be marked as completed.
}
```

Response: Returns a success message if the project is marked as completed successfully.
### 4. Delete a Project

Endpoint: DELETE ```/api/projects/delete```<br>
Description: Allows a project manager to delete a project if it is not yet approved.<br>
Permissions: Only project managers can access this endpoint.<br>
Request Body:<br>


```
{
  "projectId": "string" // Required. The ID of the project to be deleted.
}
```

Response: Returns a success message if the project is deleted successfully.
### 5. View Unapproved Projects

Endpoint: GET ```/api/projects/unapproved```<br>
Description: Retrieves a list of all unapproved projects for project managers to review.<br>
Permissions: Only project managers can access this endpoint.<br>
Response: Returns a list of unapproved projects.<br>
### 6. View All Projects

Endpoint: GET ```/api/projects/all-projects```<br>
Description: Allows a project manager to view details of all projects on the platform.<br>
Permissions: Only project managers can access this endpoint.<br>
Response: Returns a list of all projects.<br>
### 7. Send Proposal to Freelancer

Endpoint: POST ```/api/projects/send-proposal```<br>
Description: Allows a project manager to send a proposal to a freelancer for a specific project role.<br>
Permissions: Only project managers can access this endpoint.<br>
Request Body:<br>


```
{
  "projectId": "string", // Required. The ID of the project for which the proposal is sent.
  "freelancerId": "string", // Required. The ID of the freelancer to whom the proposal is sent.
  "description": "string", // Required. Description of the proposal.
  "duration": "number", // Required. Duration for which the freelancer is needed.
  "amount": "number", // Required. Amount proposed for the freelancer.
  "projectRole": "string" // Required. Role of the freelancer in the project.
}
```

Response: Returns a success message if the proposal is sent successfully.
### 8. View All Proposals for a Project

Endpoint: GET ```/api/projects/all-proposals```<br>
Description: Retrieves all proposals sent for a specific project.<br>
Permissions: Accessible by project managers.<br>
Request Body:<br>


```
{
  "projectId": "string" // Required. The ID of the project for which proposals are to be viewed.
}
```

Response: Returns a list of all proposals for the specified project.
### 9. View Proposals for Freelancer

Endpoint: GET ```/api/projects/view-proposal```<br>
Description: Allows a freelancer to view proposals sent to them for various projects.<br>
Permissions: Only freelancers can access this endpoint.<br>
Response: Returns a list of proposals sent to the freelancer.<br>
### 10. Accept Project Proposal

Endpoint: POST ```/api/projects/accept-proposal```<br>
Description: Allows a freelancer to accept a project proposal sent by a project manager.<br>
Permissions: Only freelancers can access this endpoint.<br>
Request Body:<br>


```
{
  "proposalId": "string" // Required. The ID of the proposal to be accepted.
}
```

Response: Returns a success message if the proposal is accepted successfully.
### 11. Reject Project Proposal

Endpoint: POST ```/api/projects/reject-proposal```<br>
Description: Allows a freelancer to reject a project proposal sent by a project manager.<br>
Permissions: Only freelancers can access this endpoint.<br>
Request Body:<br>

```

{
  "proposalId": "string" // Required. The ID of the proposal to be rejected.
}
```

### 12. Search Freelancer Skills

Endpoint: POST ```/api/projects/search```<br>
Description: Allows a project manager to search for freelancers based on specific skills.<br>
Permissions: Only accessible to users with the appropriate permissions.<br>
Request Body:<br>

```

{
  "skills": ["string"] // Required. List of skills to search for.
}
```

Response: Returns a success message if the proposal is rejected successfully.

## Credit
#### Handle this APIs using paycycle CRON JOB
### Add Credits

    URL: /api/credits/addCredits
    Method: POST
    Description: Adds credits to a client or freelancer's account.
    Request Body:
        numCredits (Number, required)
        userId (String, required)

Adds a specified number of credits to the account of a client or freelancer.
removeCredits

### Remove Credits

    URL: /api/credits/removeCredits
    Method: POST
    Description: Removes credits from a client or freelancer's account.
    Request Body:
        numCredits (Number, required)
        userId (String, required)
Removes a specified number of credits from the account of a client or freelancer, ensuring they have sufficient credits before the operation.