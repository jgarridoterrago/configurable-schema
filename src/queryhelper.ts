import {
	objectType,
	interfaceType,
	queryType,
	stringArg,
	enumType,
	intArg,
	arg,
	makeSchema,
	inputObjectType
} from "nexus";
import { CustomProfileDef } from "./icpjson";
import { QueryDef, assetsForApproval } from "./interface.query";
import { ClassDef } from "./interface.class";
import { PropertyType } from "./interface.propertytype";
import knex from "./connection";
import { CommonFieldConfig, extendType } from "nexus/dist/core";
import { BuilderHelper } from "./builderhelper";

export function getQueries(collection: CustomProfileDef, types: any): any {
	const nexusQueryTypes: Array<QueryDef> = [];
	buildNexusQuery(collection, nexusQueryTypes, types);
	return nexusQueryTypes;
}

//create an input type for the queries using the json class definition
function buildInputObject(obj: ClassDef, query: QueryDef, types: any) {
	const properties: Array<PropertyType> = getQueryFields(obj, query);
	const input: any = inputObjectType({
		name: obj.className + "Input",
		definition(t) {
			properties.forEach((element: PropertyType) => {
				getDefinitionProperties(element, t);
			});
		}
	});
	attachToTypes(types, input);
}

function attachToTypes(types: any, inputType: any) {
	types = types.push(inputType);
}

//return the nexus property type
function getDefinitionProperties(o: PropertyType, t: any): any {
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
		case "obj": return {}
			//return t.field(o.name, { type: o.name + "Input", ...opts });
		case "json":
			return t.json(o.name, { ...opts });
		case "list":
			return t.list.field(o.name, { type: o.type });
	}
	return t;
}

//build the nexus query object
function buildNexusQuery(
	collection: CustomProfileDef,
	queryCollection: Array<QueryDef>,
	types: any
) {
	collection.queries.forEach((qry: QueryDef) => {
		let o: ClassDef = collection.classes.find(function(element) {
			return element.className == qry.className;
		});
		if (queryCollection.length == 0){
            queryCollection.push(getQueryObject(o, qry, types));
        }
		else queryCollection.push(getExtendedQueryObject(o, qry, types));
	});
}
//used if there are no queries existing, if so extended the query object
function getQueryObject(o: ClassDef, query: QueryDef, types: any): any {
	buildInputObject(o, query, types);
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
	buildInputObject(o, query, types);
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
    return 	t.field(o.className, {
        type: o.className,
        args: {
            filter: arg({
                type: o.className + "Input",
                required: false
            })
        },
        nullable:true,
         async resolve(root:any, args:any, ctx:any) {
            if(q.authenticate){/*isAuthenticated(ctx);*/}
            const filter = args.filter || {};
            let type:any = t.typeName
            let arr:any = await getData(q,o,filter);//await assetForApprovalService.getAssetsForApproval(assetFilter);
            
            return arr
          },
    });
}

function getListField(t:any,o:ClassDef,q:QueryDef):any{
    return t.list.field(o.className + "s", {
        type: o.className,
        args: {
            filter: arg({
                type: o.className + "Input",
                required: false
            })
        }, async resolve(root:any, args:any, ctx:any) {
            if(q.authenticate){/*isAuthenticated(ctx);*/}
            const filter = args.filter || {};
            let arr:Array<assetsForApproval> = await getData(q,o,filter);//await assetForApprovalService.getAssetsForApproval(assetFilter);
            return arr 
          },
    });
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
   // const properties = getQueryFields(o,q);
    const where = getWhereCriteria(args);
    let data:any =  await knex.withSchema(q.schema).table(q.table).where(where).select('*'); 
    console.log(data)
    return data;
}
