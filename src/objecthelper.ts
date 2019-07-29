import { objectType } from "nexus";
import {
	CommonFieldConfig,
	asNexusMethod,
	inputObjectType
} from "nexus/dist/core";
import { GraphQLDateTime } from "graphql-iso-date";
import GraphQLJSON from "graphql-type-json";
import { PropertyType } from "./interface.propertytype";
import { ClassDef } from "./interface.class";
import { ClassResolverType } from "./interface.resolvertype";
import { BuilderHelper } from "./builderhelper";
import { CustomProfileDef } from "./icpjson";
import knex from "./connection";

export const GQLDateTime = asNexusMethod(GraphQLDateTime, "date");
export const GQLJSON = asNexusMethod(GraphQLJSON, "json");

//return all nexus objects from the custom profile json
export function getTypes(collection: CustomProfileDef) {
	const nexusObjectTypes: Array<any> = [];
	collection.classes.forEach((o: ClassDef) => {
		nexusObjectTypes.push(getNexusObject(o.className, o.properties));
	});
	return nexusObjectTypes;
}

//build each object from the json//if the modifier is filter then use only the searchable
export function getNexusObject(
	name: string,
	properties: Array<PropertyType>
): any {
	let nexusType: any;
	nexusType = objectType({
		name: name,
		definition(t) {
			properties.forEach((element: PropertyType) => {
				getDefinitionProperties(element, t);
			});
		}
	});
	return nexusType;
}

export function getNexusInput(
	name: string,
	properties: Array<PropertyType>,
	modifier: string = ""
): any {
	let nexusType: any;
	nexusType = inputObjectType({
		name: name + modifier,
		definition(t) {
			properties.forEach((element: PropertyType) => {
				if (modifier === "Filter") {
					if (element.hasOwnProperty("filterable"))
						getDefinitionProperties(element, t, true);
				}
			});
		}
	});
	return nexusType;
}

//return the resolver for object types within an object
function getDefObjectWithResolver(o: PropertyType, t: any): any {
	return t.field(o.name, {
		type: o.name,
		resolve(root: any, args: any, ctx: any) {
			return () => {
				//	BuilderHelper.buildquery(o);
			};
			//  return projectService.getById(root.projectid);
		}
	});
}

// build the where clause for the knex query
function buildWhereClause(r: ClassResolverType,clause:any) {
  let criteria: {} = {};
  r.where.forEach((element:string)=>{
    //@ts-ignore
    criteria[element] = r.where[element];
    clause = Object.assign(clause,criteria)
  })
}


//build out options
function buildOpts(o: PropertyType, opts: CommonFieldConfig) {
	let options: Array<string> = ["description", "nullable"];
	options.forEach((element: any) => {
		let item: {} = {};
		//@ts-ignore
		if (o[element]) {
			if (element === "nullable") {
				//@ts-ignore
				item[element] = (o[element] == "true")?true:false;
			}
			//@ts-ignore
			else { item[element] = o[element];}
			opts = Object.assign(opts, item);
		}
	});
}

//get nexus property definition for each property of the object
function getDefinitionProperties(
	o: PropertyType,
	t: any,
	isQuery?: boolean
): any {
	let opts: CommonFieldConfig = {};
	buildOpts(o, opts);
	switch (BuilderHelper.getType(o)) {
		case "str":
			return t.string(o.name, { ...opts });
		case "int":
			return t.int(o.name, { ...opts });
		case "float":
			return t.float(o.name, { ...opts });
		case "date":
			return t.date(o.name, { ...opts });
		case "obj":
			if (isQuery) return {}
			//return t.field(o.name, { type: o.name + "Filter", ...opts });
			else return getDefObjectWithResolver(o, t);
		case "json":
			return t.json(o.name, { ...opts });
		case "list":
			return t.list.field(o.name, { type: o.type });
	}
	return t;
}
