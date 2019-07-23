"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require('knex')({
    client: 'pg',
    connection: process.env.ASSET_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/terrago',
});
exports.default = knex;
//# sourceMappingURL=connection.js.map