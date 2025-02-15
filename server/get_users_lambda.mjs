import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const { Items } = await documentClient.send(new ScanCommand({
            TableName: 'chat_room_users',
        }));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

export { client };
