import {
	queryType,
	arg } from "nexus";
import { CustomProfileDef } from "./icpjson";
import { QueryDef } from "./interface.query";
import { ClassDef } from "./interface.class";
import { PropertyType } from "./interface.propertytype";
import knex from "./connection";
import {  extendType, objectType, CommonFieldConfig } from "nexus/dist/core";
import { BuilderHelper } from "./builderhelper";

export function getQueries(collection: CustomProfileDef, types: any): any {
	const nexusQueryTypes: Array<QueryDef> = [];
	buildNexusQuery(collection, nexusQueryTypes, types);
	return nexusQueryTypes;
}

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

function attachToTypes(types: any, filterType: any) {
	types = types.push(filterType);
}

function buildFilterObject(obj: ClassDef, query: QueryDef, types: any) {
    	const properties: Array<PropertyType> = getQueryFields(obj, query);
    	const filter: any = objectType({
    		name: obj.className + "Filter",
    		definition(t) {
    			properties.forEach((element: PropertyType) => {
    				getDefinitionProperties(element, t);
    			});
    		}
    	});
    	attachToTypes(types, filter);
    }


//build the query collection to be used by server
function buildNexusQuery(
	collection: CustomProfileDef,
	queryCollection: Array<QueryDef>,
	types: any
) {
	collection.queries.forEach((qry: QueryDef) => {
        //based on the query being generated get the matching class object
		let o: ClassDef = collection.classes.find(function(element) {
			return element.className == qry.className;
        });
        //if this is the first query objected created, use this, else extend the existing query object
		if (queryCollection.length == 0){
            //get individual objects and add them to the queryCollection
            queryCollection.push(getQueryObject(o, qry, types));
        }
		else queryCollection.push(getExtendedQueryObject(o, qry, types));
	});
}
//used if there are no queries existing, if so extended the query object
function getQueryObject(o: ClassDef, query: QueryDef, types: any): any {
	buildFilterObject(o, query, types);
	const Query = queryType({
		definition(t) {
			getField(t,o,query)
			getListField(t,o,query)
		}
	});
	return Query;
}

//used to extend the existing query objects
function getExtendedQueryObject(o: ClassDef, query: QueryDef, types: any): any {
	buildFilterObject(o, query, types);
	const Query = extendType({
		type: "Query",
		definition(t) {
            getField(t,o,query)
			getListField(t,o,query)
		}
	});
	return Query;
}

function getField(t:any,o:ClassDef,q?:QueryDef):any{
    return 	t.field(o.className, getFieldDef(o,q));
}

function getListField(t:any,o:ClassDef,q:QueryDef):any{
    return t.list.field(o.className + "s", getFieldDef(o,q))
}

function getFieldDef(o:ClassDef,q:QueryDef):any{
    return {
        type: o.className,
        args: {
            filter: arg({
                type: o.className + "Filter",
                required: false
            })
        }, async resolve(root:any, args:any, ctx:any) {
            if(q.authenticate){/*isAuthenticated(ctx);*/}
            const filter = args.filter || {};
            let arr:any = await getData(q,o,filter);//await assetForApprovalService.getAssetsForApproval(assetFilter);
            return arr 
          },
    };
}

function getQueryFields(o: ClassDef, q: QueryDef): Array<PropertyType> {
	let prop: Array<PropertyType> = o.properties;
	if (q.excludes) {
		return prop.filter(
			(prop: PropertyType) => q.excludes.includes(prop.column) != true
		);
	} else return prop;
}

 function getWhereCriteria(args:any):any{
    let criteria:any = {};
    for (const key in args) {
       criteria = Object.assign(criteria,{key:args[key]})
    }
    return criteria;
}

async function getData(q:QueryDef,o:ClassDef,args:any):Promise<any>{
    const where = getWhereCriteria(args);
    let data:any =  await knex.withSchema(q.schema).table(q.table).where(where).select('*'); 
    console.log(data)
    return data;
}

function getDefinitionProperties(o:PropertyType, t:any) {
    let opts: CommonFieldConfig = {};
    opts.description = o.description;
    opts.nullable = o.nullable;
    switch (BuilderHelper.getType(o)) {
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
