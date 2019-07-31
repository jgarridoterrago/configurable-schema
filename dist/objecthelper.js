"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const core_1 = require("nexus/dist/core");
const graphql_iso_date_1 = require("graphql-iso-date");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const builderhelper_1 = require("./builderhelper");
const connection_1 = __importDefault(require("./connection"));
exports.GQLDateTime = core_1.asNexusMethod(graphql_iso_date_1.GraphQLDateTime, "date");
exports.GQLJSON = core_1.asNexusMethod(graphql_type_json_1.default, "json");
//return all nexus objects from the custom profile json
function getTypes(collection) {
    const nexusObjectTypes = [];
    collection.classes.forEach((o) => {
        nexusObjectTypes.push(getNexusObject(o.className, o.properties));
    });
    return nexusObjectTypes;
}
exports.getTypes = getTypes;
//build each object from the json//if the modifier is filter then use only the searchable
function getNexusObject(name, properties) {
    let nexusType;
    nexusType = nexus_1.objectType({
        name: name,
        definition(t) {
            properties.forEach((element) => {
                getDefinitionProperties(element, t);
            });
        }
    });
    return nexusType;
}
exports.getNexusObject = getNexusObject;
function getNexusInput(name, properties, modifier = "") {
    let nexusType;
    nexusType = core_1.inputObjectType({
        name: name + modifier,
        definition(t) {
            properties.forEach((element) => {
                if (modifier === "Filter") {
                    if (element.hasOwnProperty("filterable"))
                        getDefinitionProperties(element, t, true);
                }
            });
        }
    });
    return nexusType;
}
exports.getNexusInput = getNexusInput;
//return the resolver for object types within an object
function getDefObjectWithResolver(o, t) {
    return t.field(o.name, {
        type: o.name,
        nullable: true,
        async resolve(root, args, ctx) {
            let resolver = o.resolver;
            let fk = {
                //it would be better if each object had its name + id; ie assetid exists in the projects table
                column: resolver.columns[0],
                value: root[resolver.params[0]]
            };
            //		console.log(await knex.withSchema(resolver.schema).table(resolver.table).whereRaw(`:column: = :value`,fk).select('*'));
            return await connection_1.default.withSchema(resolver.schema).table(resolver.table).whereRaw(`:column: = :value`, fk).select('*');
            //return {title:'hello',assetid:'444',projectid:'3333'};
        }
    });
}
//build out options
function buildOpts(o, opts) {
    let options = ["description", "nullable"];
    options.forEach((element) => {
        let item = {};
        //@ts-ignore
        if (o[element]) {
            if (element === "nullable") {
                //@ts-ignore
                item[element] = (o[element] == "true") ? true : false;
            }
            //@ts-ignore
            else {
                item[element] = o[element];
            }
            opts = Object.assign(opts, item);
        }
    });
}
//get nexus property definition for each property of the object
async function getDefinitionProperties(o, t, isQuery) {
    let opts = {};
    buildOpts(o, opts);
    switch (builderhelper_1.BuilderHelper.getType(o)) {
        case "str":
            return t.string(o.name, { ...opts });
        case "int":
            return t.int(o.name, { ...opts });
        case "float":
            return t.float(o.name, { ...opts });
        case "date":
            return t.date(o.name, { ...opts });
        case "obj":
            if (isQuery) {
                return t.field(o.name, { type: o.name, ...opts });
            }
            else {
                return getDefObjectWithResolver(o, t);
            }
        case "json":
            return t.json(o.name, { ...opts });
        case "list":
            return t.list.field(o.name, { type: o.type });
    }
    return t;
}
//# sourceMappingURL=objecthelper.js.map