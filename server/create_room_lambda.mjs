import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

const WEBSOCKET_ENDPOINT = 'wss://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/';
const apiGateway = new ApiGatewayManagementApiClient({ endpoint: WEBSOCKET_ENDPOINT });

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    console.log('connectionId ======>', connectionId);

    try {
        const roomPayload = JSON.parse(event.body);
        delete roomPayload.action;

        const uuid = uuidv4();

        // add to room table to quick find all participants to find connection_id
        await documentClient.send(new PutCommand({
            TableName: 'chat_app_rooms',
            Item: {
                room_id: uuid,
                ...roomPayload,
            },
        }));

        const [creator, ...otherParticipants] = roomPayload.participants;

        const WEBSOCKET_ENDPOINT = 'https://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/';
        const apiGateway = new ApiGatewayManagementApiClient({ endpoint: WEBSOCKET_ENDPOINT });

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

        const otherParticipantsConnectionIds = otherParticipantsConnectionData.map(
            item => item.Items.map(item => item.connection_id)
        );

        // send message to all participants
        await Promise.all(otherParticipantsConnectionIds.map(connectionId => 
            apiGateway.send(new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    action: 'create_room',
                    message: 'Success',
                    room_id: uuid,
                }),
            }))
        ));

        // add to user_rooms table for quick search by user
        await Promise.all(roomPayload.participants.map(participant => 
            documentClient.send(new PutCommand({
                TableName: 'chat_app_user_rooms',
                Item: {
                    user_id: participant,
                    room_id: uuid,
                    other_participants: roomPayload.participants.filter(p => p !== participant),
                },
            }))
        ));

        return {
          statusCode: 200,
          body: JSON.stringify({
            action: 'create_room',
            message: 'Success',
            room_id: uuid,
          }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

export { client };
