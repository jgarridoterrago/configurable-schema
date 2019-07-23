import { ApolloServer } from "apollo-server";
import { FileHelper as filehelper } from "./filehelper"
//import { schema } from "./schema2";
import { makeSchema } from "nexus/dist";
import { getTypes } from "./objecthelper";
import { CustomProfileDef } from "./icpjson";
import { getQueries } from "./queryhelper";

const port = process.env.PORT || 4000;
let schema:any;
filehelper.toObject('src/customerprofile.json').then((o:CustomProfileDef)=>{
 // getTypes(o);
 let types = getTypes(o);
 let queries = getQueries(o,types);
  schema = makeSchema({
    types: [types,queries],
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
