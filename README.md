# Design a Chat Room

## Tech stack
![image](https://github.com/user-attachments/assets/f47f7f2a-289a-401c-b1ac-0fe3c98a108e)

&nbsp;

## Architecture

### Frontend

<img width="1066" alt="image" src="https://github.com/user-attachments/assets/2049a9d5-558b-41fa-b274-23d7494b76d5" />

&nbsp;

### Backend

![image](https://github.com/user-attachments/assets/820db2ad-1b32-4235-b4ab-b25a0583c474)


&nbsp;

## Roadmap

## Functional (Basic) requirements

Results：

https://github.com/user-attachments/assets/8316b8db-1616-4842-b5e2-182e083446c1

&nbsp;

- [x] Create user account and Login
    - [x] Build email input
    - [x] Create user by email on server
    - [x] Login by email on server
    - [x] Create / Login user on browser
    - [x] Redirect to chat room UI

- [x] Create chat room and show chat room list
    - [x] Create Room DynamoDB and define schema
    - [x] Create Connection DynamoDB and define schema for recording current connecting users
    - [x] Create Room by AWS Lambda
    - [x] Create Web socket API Gateway and connect with create-room Lambda
    - [x] Build create room dropdown and button UI
    - [x] Create User-Room DynamoDB and define schema for quickly get user's room list
    - [x] Connect to Web socket Gateway and corresponding action to
    - [x] Build chat room list UI
    - [x] Test real time new room notification for notification

- [x] Join chat room and send message
    - [x] Create Message DynamoDB and define schema
    - [x] Create Message by AWS Lambda
    - [x] Create Web socket API action Gateway and connect with send-message Lambda
    - [x] Build send message input chat message UI
    - [x] Store new message to DynamoDB
    - [x] Test new message is sent to the participant in the same room
    - [x] Query message history from DynamoDB and show on message UI
    - [x] Scroll to bottom when new message is sent for everyone


&nbsp;


### Non-functional (Advanced) requirements

#### Many to many connection

Results：

https://github.com/user-attachments/assets/8f094ef2-0271-4ca3-827b-588591efc53c

&nbsp;

- [x] Update creating a room by selecting single user to many users
- [x] Update room list UI able to show multiple users
- [x] Test multiple users can send message to others in real time


&nbsp;

#### Share connection for all the tabs and windows

Problem：
- Unnecessary multiple connections builts due to multiple tabs opened by the same user

&nbsp;

Result：

https://github.com/user-attachments/assets/2fef058e-4738-42a7-9652-ff95880bf7cc

&nbsp;

- [x] Setup Shared worker for Web socket connection
- [x] Test multiple tabs and windows can accept 'create_connection' action from Shared worker
- [x] Test multiple tabs and windows can accept 'get_user_rooms' action from Shared worker
- [x] Test multiple tabs and window can disconnect websocket when all tabs & windows are closed
- [x] Test multiple tabs and windows can accept 'create_room' action from Shared worker
- [x] Test multiple tabs and windows can accept 'create_message' action from Shared worker
- [x] Test if multiple tabs & windows only share one connection
- [x] Test if original version is required multiple tabs & windows connection

&nbsp;

#### Store draft in indexDB

Problem：
- Unsent text and image message will disappear

&nbsp;

Result：

https://github.com/user-attachments/assets/a1ebdc05-81eb-4835-9904-5b02ddbe0938

- [x] Be able to upload and preview uploaded image by antd <Upload />
- [x] Create chat room indexedDB database
- [x] Create draftMessage objectStore(table) with `keyPath: ${roomId}` to save draft text and image messages
- [x] Save text message when text input change
- [x] Save image message when <Upload /> change
- [x] Show draft message when open chat room
- [x] Fix wrong draft message in chat room by upgrade indexedDB with draftMessage objectStore with `keyPath: ${userId}_${roomId}`

&nbsp;


#### Optimistic update mesage, and retry failed message by adding message status

Problem:
- Slow message update until websocket send, client update first will be ideal
- No idea of failed message, and retry mechanism

&nbsp;

Result:

https://github.com/user-attachments/assets/07090414-ee71-4364-8ef5-98362f2da91c

- [x] Update client messages data structure to map, to quickly get corresponding message by message_id
- [x] Optimistic update by adding new message in client side, not wait until websocket server send
- [x] Create `outgoingMessage` objectStore in indexedDB to store failed messsage
- [x] Handle message when failed, store to indexedDB
- [x] Add retry mechansim to resend message, and update the correct message in client messages state
