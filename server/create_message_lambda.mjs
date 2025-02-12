import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

const WEBSOCKET_ENDPOINT = 'https://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/';
const apiGateway = new ApiGatewayManagementApiClient({ endpoint: WEBSOCKET_ENDPOINT });

export const handler = async (event) => {
    try {
        console.log('event =>', event);

        const messagePayload = event;
        delete messagePayload.action;

        const uuid = uuidv4();
        const timestamp = new Date().toISOString();

        console.log('messagePayload =>', messagePayload);

        // add to room table to quick find all participants to find connection_id
        await documentClient.send(new PutCommand({
            TableName: 'chat_app_messages',
            Item: {
                room_id: messagePayload.room_id,
                message_id: uuid,
                timestamp: timestamp,
                message: messagePayload.message,
                sender: messagePayload.sender,
            },
        }));

        // get all connection_ids for participants
        const { Items } = await documentClient.send(new QueryCommand({
            TableName: 'chat_app_rooms',
            KeyConditionExpression: 'room_id = :room_id',
            ExpressionAttributeValues: {
                ':room_id': messagePayload.room_id
            }
        }));

        console.log('Items =>', Items);

        const otherParticipants = Items[0].participants.filter(
            participant => participant !== messagePayload.sender
        );


        // get all connection_ids for participants
        const otherParticipantsConnectionData = await Promise.all(
            otherParticipants.map(participant => documentClient.send(new QueryCommand({
                TableName: 'chat_app_connections',
                KeyConditionExpression: 'user_id = :user_id',
                ExpressionAttributeValues: {
                    ':user_id': participant
                }
            })))
        );

        console.log('otherParticipantsConnectionData =>', JSON.stringify(otherParticipantsConnectionData));

        const otherParticipantsConnectionIds = otherParticipantsConnectionData.map(
            item => item.Items[0].connection_id
        );

        console.log('otherParticipantsConnectionIds =>', otherParticipantsConnectionIds);

        // send message to all participants
        await Promise.all(otherParticipantsConnectionIds.map(connectionId => 
            apiGateway.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    action: 'create_message',
                    message: messagePayload.message,
                    timestamp: timestamp,
                    sender: messagePayload.sender,
                }),
            }))
        ));

        console.log('message sent to all participants');

        return {
          statusCode: 200,
          body: JSON.stringify({
            action: 'create_message',
            message: 'Success',
            message_id: uuid,
          }),
        };
    } catch (error) {
        console.log('Error =>', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

export { client };
