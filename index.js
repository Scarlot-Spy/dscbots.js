if (typeof process !== 'undefined' && parseInt(process.versions.node.split('.')[0]) < 16) {
    console.error('Your node version is currently', process.versions.node);
    console.error('Please update it to a version >= 16.x.x from https://nodejs.org/');
    process.exit(1);
};
const Permissions = require('./src/permissions.js');
const BaseClient = require('./src/Base/client');

module.exports = {
    Permissions,
    Bot: BaseClient
};