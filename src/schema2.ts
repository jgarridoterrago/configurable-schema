import {
  objectType,
  interfaceType,
  queryType,
  stringArg,
  enumType,
  intArg,
  arg,
  makeSchema
} from "nexus";
import { resolve } from "url";

const testArray = [{ fieldName: "name" }, { fieldName: "createdBy" }];

const Test = objectType({
  name: "test",
  definition(t) {
    for (let i = 0; i < testArray.length; i++) {
      t.string(testArray[i].fieldName);
    }
  }
});
const Node = interfaceType({
  name: "Node",
  definition(t) {
    t.id("id", { description: "Unique identifier for the resource" });
    t.resolveType(() => null);
  }
});

const Account = objectType({
  name: "Account",
  definition(t) {
    t.implements(Node); // or t.implements("Node")
    t.string("username");
    t.string("email");
  }
});

const StatusEnum = enumType({
  name: "StatusEnum",
  members: ["ACTIVE", "DISABLED"]
});

const Query = queryType({
  definition(t) {
    t.field("account", {
      type: Account, // or "Account"
      args: {
        name: stringArg(),
        status: arg({ type: "StatusEnum" })
      }
    });
    t.field("testQuery", {
      type: Test,
      resolve: () => {
        return {
          name: "test item",
          createdBy: "test user"
        };
      }
    });
    t.list.field("accountsById", {
      type: Account, // or "Account"
      args: {
        ids: intArg({ list: true })
      }
    });
  }
});

// Recursively traverses the value passed to types looking for
// any valid Nexus or graphql-js objects to add to the schema,
// so you can be pretty flexible with how you import types here.
export const schema = makeSchema({
  types: [Account, Node, Query, StatusEnum],
  // or types: { Account, Node, Query }
  // or types: [Account, [Node], { Query }]
  outputs: false
});
