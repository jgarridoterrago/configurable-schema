"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const filehelper_1 = require("./filehelper");
//import { schema } from "./schema2";
const dist_1 = require("nexus/dist");
const objecthelper_1 = require("./objecthelper");
const queryhelper_1 = require("./queryhelper");
const port = process.env.PORT || 4000;
let schema;
filehelper_1.FileHelper.toObject('src/customerprofile.json').then((o) => {
    // getTypes(o);
    let types = objecthelper_1.getTypes(o);
    let queries = queryhelper_1.getQueries(o, types);
    schema = dist_1.makeSchema({
        types: [types, queries],
        outputs: false
    });
    const server = new apollo_server_1.ApolloServer({
        schema
    });
    server.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
});
//console.log(schema)
//   const server = new ApolloServer({
//     schema
//   });
// server.listen({ port }, () =>
//   console.log(
//     `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
//   )
// );
//# sourceMappingURL=index.js.map