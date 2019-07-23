"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const testArray = [{ fieldName: "name" }, { fieldName: "createdBy" }];
const Test = nexus_1.objectType({
    name: "test",
    definition(t) {
        for (let i = 0; i < testArray.length; i++) {
            t.string(testArray[i].fieldName);
        }
    }
});
const Node = nexus_1.interfaceType({
    name: "Node",
    definition(t) {
        t.id("id", { description: "Unique identifier for the resource" });
        t.resolveType(() => null);
    }
});
const Account = nexus_1.objectType({
    name: "Account",
    definition(t) {
        t.implements(Node); // or t.implements("Node")
        t.string("username");
        t.string("email");
    }
});
const StatusEnum = nexus_1.enumType({
    name: "StatusEnum",
    members: ["ACTIVE", "DISABLED"]
});
const Query = nexus_1.queryType({
    definition(t) {
        t.field("account", {
            type: Account,
            args: {
                name: nexus_1.stringArg(),
                status: nexus_1.arg({ type: "StatusEnum" })
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
            type: Account,
            args: {
                ids: nexus_1.intArg({ list: true })
            }
        });
    }
});
// Recursively traverses the value passed to types looking for
// any valid Nexus or graphql-js objects to add to the schema,
// so you can be pretty flexible with how you import types here.
exports.schema = nexus_1.makeSchema({
    types: [Account, Node, Query, StatusEnum],
    // or types: { Account, Node, Query }
    // or types: [Account, [Node], { Query }]
    outputs: false
});
//# sourceMappingURL=schema2.js.map