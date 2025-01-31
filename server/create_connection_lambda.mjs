import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;


    try {
        const connectionItem = JSON.parse(event.body);
        delete connectionItem.action;

        await documentClient.send(new PutCommand({
            TableName: 'chat_app_connections',
            Item: {
                connectionId,
                ...connectionItem,
            },
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success',
            data: parsedBody.email
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
