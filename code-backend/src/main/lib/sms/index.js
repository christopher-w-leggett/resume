"use strict";

const AWS = require('aws-sdk');

module.exports = {
    send: async function(message, number) {
        if(process.env.ENABLE_SMS === 'true') {
            const sns = new AWS.SNS();
            const params = {
                Message: message,
                MessageStructure: 'string',
                PhoneNumber: number
            };
            await new Promise((resolve, reject) => {
                sns.publish(params, (error, data) => {
                    if(error) {
                        reject(error);
                    } else {
                        console.log(JSON.stringify(data));
                        resolve(data);
                    }
                });
            });
        } else {
            console.log(`${number}: ${message}`);
        }
    }
};