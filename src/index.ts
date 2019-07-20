import { ApolloServer } from "apollo-server";
import { FileHelper as filehelper } from "./filehelper"
//import { schema } from "./schema2";
import { makeSchema } from "nexus/dist";
import { NexusArgDef } from "nexus/dist/core";
import { getSchema } from "../schema";
import { CustomProfileDef } from "./icpjson";

const port = process.env.PORT || 4000;
let schema:any;
filehelper.toObject('src/customerprofile.json').then((o:CustomProfileDef)=>{
  let types = getSchema(o);
  console.log(types)
schema = makeSchema({
  types: [types],
  outputs: false
});
const server = new ApolloServer({
  schema
});

server.listen({ port }, () =>
console.log(
  `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
)
);
})

//console.log(schema)

//   const server = new ApolloServer({
//     schema
//   });
  
// server.listen({ port }, () =>
//   console.log(
//     `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
//   )
// );
