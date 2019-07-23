"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const connection_1 = __importDefault(require("./connection"));
const core_1 = require("nexus/dist/core");
const builderhelper_1 = require("./builderhelper");
function getQueries(collection, types) {
    const nexusQueryTypes = [];
    buildNexusQuery(collection, nexusQueryTypes, types);
    return nexusQueryTypes;
}
exports.getQueries = getQueries;
//create an input type for the queries using the json class definition
function buildInputObject(obj, query, types) {
    const properties = getQueryFields(obj, query);
    const input = nexus_1.inputObjectType({
        name: obj.className + "Input",
        definition(t) {
            properties.forEach((element) => {
                getDefinitionProperties(element, t);
            });
        }
    });
    attachToTypes(types, input);
}
function attachToTypes(types, inputType) {
    types = types.push(inputType);
}
//return the nexus property type
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
        case "obj": return {};
        //return t.field(o.name, { type: o.name + "Input", ...opts });
        case "json":
            return t.json(o.name, { ...opts });
        case "list":
            return t.list.field(o.name, { type: o.type });
    }
    return t;
}
//build the nexus query object
function buildNexusQuery(collection, queryCollection, types) {
    collection.queries.forEach((qry) => {
        let o = collection.classes.find(function (element) {
            return element.className == qry.className;
        });
        if (queryCollection.length == 0) {
            queryCollection.push(getQueryObject(o, qry, types));
        }
        else
            queryCollection.push(getExtendedQueryObject(o, qry, types));
    });
}
//used if there are no queries existing, if so extended the query object
function getQueryObject(o, query, types) {
    buildInputObject(o, query, types);
    const Query = nexus_1.queryType({
        definition(t) {
            getField(t, o, query);
            getListField(t, o);
        }
    });
    return Query;
}
//used to extend the existing query objects
function getExtendedQueryObject(o, query, types) {
    buildInputObject(o, query, types);
    const Query = core_1.extendType({
        type: "Query",
        definition(t) {
            getField(t, o, query);
            getListField(t, o);
        }
    });
    return Query;
}
function getField(t, o, q) {
    return t.field(o.className, {
        type: o.className,
        args: {
            filter: nexus_1.arg({
                type: o.className + "Input",
                required: false
            })
        },
        nullable: true,
        async resolve(root, args, ctx) {
            if (q.authenticate) { /*isAuthenticated(ctx);*/ }
            const filter = args.filter || {};
            let type = q.className;
            let t = await getData(q, o, filter); //await assetForApprovalService.getAssetsForApproval(assetFilter);
            console.log(typeof t[0]);
            return t;
        },
    });
}
function getListField(t, o) {
    return t.list.field(o.className + "s", {
        type: o.className,
        args: {
            filter: nexus_1.arg({
                type: o.className + "Input",
                required: false
            })
        }
    });
}
function getQueryFields(o, q) {
    let prop = o.properties;
    if (q.excludes) {
        return prop.filter((prop) => q.excludes.includes(prop.column) != true);
    }
    else
        return prop;
}
function getWhereCriteria(args) {
    let criteria = {};
    for (const key in args) {
        criteria = Object.assign(criteria, { key: args[key] });
    }
    return criteria;
}
async function getData(q, o, args) {
    // const properties = getQueryFields(o,q);
    const where = getWhereCriteria(args);
    let data = await connection_1.default.withSchema(q.schema).table(q.table).where(where).select('*');
    return data;
}
//# sourceMappingURL=queryhelper.js.map