"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const connection_1 = __importDefault(require("./connection"));
const core_1 = require("nexus/dist/core");
const objecthelper_1 = require("./objecthelper");
function getQueries(collection, types) {
    const nexusQueryTypes = [];
    buildNexusQuery(collection, nexusQueryTypes, types);
    return nexusQueryTypes;
}
exports.getQueries = getQueries;
//create an input type for the queries using the json class definition
// function buildInputObject(obj: ClassDef, query: QueryDef, types: any) {
// 	const properties: Array<PropertyType> = getQueryFields(obj, query);
// 	const input: any = inputObjectType({
// 		name: obj.className + "Input",
// 		definition(t) {
// 			properties.forEach((element: PropertyType) => {
// 				getDefinitionProperties(element, t);
// 			});
// 		}
// 	});
// 	attachToTypes(types, input);
// }
//create filter objects and add them to the list of existing objects
// function buildFilterObject(obj: ClassDef, query: QueryDef, types: any) {
// 	const properties: Array<PropertyType> = getQueryFields(obj, query);
// 	const filter: any = getNexusObject(obj.className, properties,'Filter');
// 	attachToTypes(types, filter);
// }
function attachToTypes(types, filterType) {
    types = types.push(filterType);
}
function buildFilterObject(obj, query, types) {
    const properties = getQueryFields(obj, query);
    const filter = objecthelper_1.getNexusInput(obj.className, obj.properties, "Filter");
    attachToTypes(types, filter);
}
//build the query collection to be used by server
function buildNexusQuery(collection, queryCollection, types) {
    collection.queries.forEach((qry) => {
        //based on the query being generated get the matching class object
        let o = collection.classes.find(function (element) {
            return element.className == qry.className;
        });
        //if this is the first query objected created, use this, else extend the existing query object
        if (queryCollection.length == 0) {
            //get individual objects and add them to the queryCollection
            queryCollection.push(getQueryObject(o, qry, types));
        }
        else
            queryCollection.push(getExtendedQueryObject(o, qry, types));
    });
}
//used if there are no queries existing, if so extended the query object
function getQueryObject(o, query, types) {
    buildFilterObject(o, query, types);
    const Query = nexus_1.queryType({
        definition(t) {
            getField(t, o, query);
            getListField(t, o, query);
        }
    });
    return Query;
}
//used to extend the existing query objects
function getExtendedQueryObject(o, query, types) {
    buildFilterObject(o, query, types);
    const Query = core_1.extendType({
        type: "Query",
        definition(t) {
            getField(t, o, query);
            getListField(t, o, query);
        }
    });
    return Query;
}
function getField(t, o, q) {
    return t.field(o.className, getFieldDef(o, q));
}
function getListField(t, o, q) {
    return t.list.field(o.className + "s", getFieldDef(o, q));
}
function getFieldDef(o, q) {
    return {
        type: o.className,
        args: {
            filters: nexus_1.arg({
                type: o.className + "Filter",
                required: false
            })
        },
        nullable: true,
        async resolve(root, args, ctx) {
            if (q.authenticate) { /*isAuthenticated(ctx);*/ }
            const filters = args.filters || {};
            let arr = await getData(q, o, filters); //await assetForApprovalService.getAssetsForApproval(assetFilter);
            //console.log(arr)
            return arr;
        },
    };
}
function getQueryFields(o, q) {
    let prop = o.properties;
    if (q.excludes) {
        return prop.filter((prop) => q.excludes.includes(prop.column) != true);
    }
    else
        return prop;
}
//  function getWhereCriteria(args:any):any{
//     let criteria:any = {};
//     for (const key in args) {
//        criteria = Object.assign(criteria,{key:args[key]})
//     }
//     return criteria;
// }
async function getData(q, o, args) {
    const where = getWhereCriteria(args);
    let data = {};
    if (!where) {
        data = await connection_1.default.withSchema(q.schema).select('*').from(q.table);
    }
    else {
        data = await connection_1.default.withSchema(q.schema).table(q.table).where(where).select('*');
    }
    console.log(connection_1.default.withSchema(q.schema).table(q.table).where(where).select('*').toString());
    return data;
}
function getWhereCriteria(args) {
    let where = '';
    let statement = '';
    let include = (Object.keys(args).length > 1) ? 'and ' : '';
    let obj = {};
    let values = {};
    for (const key in args) {
        statement += `:${key}: like :${args[key]} ${include}`;
        //@ts-ignore
        obj[key] = key;
        //@ts-ignore
        obj[args[key]] = `%${args[key]}%`;
        values = Object.assign(values, obj);
    }
    //remove the last occurance of 'and'
    statement = (include) ? statement.substring(0, (statement.length) - 5) : statement;
    where = connection_1.default.raw(statement, values);
    console.log(where.toString());
    return where;
}
//# sourceMappingURL=queryhelper.js.map