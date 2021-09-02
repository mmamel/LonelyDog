Hi! Welcome to my to side project.

The goal of this project was to use the Node framework to create a website that would allow users to create chat rooms
based on their shared interest in different games. MongoDB Atlas served as the backend for this project.

So far, these features have been implemented:

Below is an example of a user creating an account.

https://user-images.githubusercontent.com/43307993/131765434-403d44a5-25a1-407c-a3e1-e55fd39873dc.mp4


When logging in, the username and password are checked against the MongoDB database to see if its valid.
The passwords are hashed for increased security when they are created.

When the user logins in, they are able to see the groups they are currently in as well as join/create new groups.

https://user-images.githubusercontent.com/43307993/131765444-9e1fa3fa-217f-48fa-a352-50b18ff06481.mp4


The user's credentials and active session are authenticated with a JWT secret and stored with cookies.
This ensures all the users actions are in fact from them and minimizes that chances of a XSS or CSRF attack.
