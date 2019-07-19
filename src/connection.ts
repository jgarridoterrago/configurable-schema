const knex = require('knex')({
    client: 'pg',
    connection: process.env.ASSET_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/terrago',
  });
  
  export default knex;
  