'use strict'

//load dependencies
const validator = require('./validator.js');
const inquirer = require('inquirer');

//define properties
const PROPERTY_DEFINITIONS = {
    'backend-s3-bucket': {
        'validation': {
            'required': true,
            'regex': /^[a-z0-9\.\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'backend-s3-bucket',
            'message': 'Please provide a valid S3 bucket:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['backend-s3-bucket'].validation)) {
                    return true;
                } else {
                    return 'Invalid S3 bucket provided.';
                }
            }
        }
    },
    'backend-code-archive-name': {
        'validation': {
            'required': true,
            'regex': /^[a-z0-9\.\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'backend-code-archive-name',
            'message': 'Please provide a valid name for the built code archive:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['backend-code-archive-name'].validation)) {
                    return true;
                } else {
                    return 'Invalid code archive name provided.';
                }
            }
        }
    },
    'backend-code-archive-files': {
        'validation': {
            'required': true
        }
    },
    'backend-code-build-dir': {
        'validation': {
            'required': true
        }
    },
    'stack-name': {
        'validation': {
            'required': true,
            'regex': /^[a-zA-Z0-9\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'stack-name',
            'message': 'Please provide a valid stack name:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['stack-name'].validation)) {
                    return true;
                } else {
                    return 'Invalid stack name provided.';
                }
            }
        }
    },
    'profile': {
        'validation': {
            'regex': /^[a-zA-Z0-9\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'profile',
            'message': 'Please provide AWS CLI profile to use [Optional]:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['profile'].validation)) {
                    return true;
                } else {
                    return 'Invalid AWS CLI profile provided.';
                }
            }
        }
    }
};

//load properties
const PROPERTIES_FILE = './properties-' + (process.env.ENV_PROPERTIES || 'local') + '.json';
let properties = {};
try {
    properties = require(PROPERTIES_FILE);
} catch (error) {
    console.debug('Properties file "' + PROPERTIES_FILE + '" not found.')
}

//validate loaded properties
Object.keys(properties).forEach((key) => {
    if (PROPERTY_DEFINITIONS[key] && PROPERTY_DEFINITIONS[key].validation) {
        if (!validator.valid(properties[key], PROPERTY_DEFINITIONS[key].validation)) {
            console.warn('Property ' + key + ' in "' + PROPERTIES_FILE + '" is invalid.  Ignoring value.');
            delete properties[key];
        }
    }
});

module.exports = {
    read: async (name, prompt) => {
        let value;

        if (!properties.hasOwnProperty(name)) {
            if (PROPERTY_DEFINITIONS[name]) {
                if (prompt && PROPERTY_DEFINITIONS[name].prompt) {
                    console.info('Configure ' + name + ' property in "' + PROPERTIES_FILE + '" to suppress prompt.');
                    let promptValue = await inquirer.prompt([PROPERTY_DEFINITIONS[name].prompt]);
                    value = promptValue[name];
                } else if (!PROPERTY_DEFINITIONS[name].validation.required) {
                    value = null;
                } else {
                    throw new Error('Required property ' + name + ' not configured in ' + PROPERTIES_FILE + '.');
                }
            } else {
                throw new Error('Invalid property ' + name + ' being requested.');
            }
        } else {
            value = properties[name];
        }

        return value;
    }
};
