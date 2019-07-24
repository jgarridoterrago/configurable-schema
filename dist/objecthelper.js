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
function getNexusObject(name, properties, modifier = '') {
    let nexusType;
    nexusType = nexus_1.objectType({
        name: name + modifier,
        definition(t) {
            properties.forEach((element) => {
                if (modifier === 'Filter') {
                    if (element.hasOwnProperty('searchable'))
                        getDefinitionProperties(element, t);
                }
                else
                    getDefinitionProperties(element, t);
            });
        }
    });
    return nexusType;
}
exports.getNexusObject = getNexusObject;
//return the resolver for object types within an object
function getDefObjectWithResolver(o, t) {
    return t.field(o.name, {
        type: o.name,
        resolve(root, args, ctx) {
            return () => {
                //	BuilderHelper.buildquery(o);
            };
            //  return projectService.getById(root.projectid);
        }
    });
}
// build the where clause for the knex query
function buildWhereClause(r) {
    let criteria = {};
    for (let i = 0; i < r.where.length; i++) {
        //  criteria += {r.columns[index]:r.params[index]};
        let col = r.where[i];
        let val = r.params[i];
        criteria = Object.assign(criteria, { col: val });
    }
    return criteria;
}
function buildQueryResolver(o) {
    let resolver = o.resolver;
    let where = resolver.where.length > 0 ? buildWhereClause(resolver) : { 1: 1 };
    let select = resolver.columns.length > 0 ? resolver.columns.toString() : '*';
    return connection_1.default.withSchema(resolver.schema).table(resolver.table).where(where).select(select);
}
exports.buildQueryResolver = buildQueryResolver;
//get nexus property definition for each property of the object
function getDefinitionProperties(o, t) {
    let opts = {};
    opts.description = o.description;
    opts.nullable = o.nullable;
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
            return getDefObjectWithResolver(o, t);
        case "json":
            return t.json(o.name, { ...opts });
        case "list":
            return t.list.field(o.name, { type: o.type });
    }
    return t;
}
//# sourceMappingURL=objecthelper.js.map