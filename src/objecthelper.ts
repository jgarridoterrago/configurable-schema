import { objectType } from "nexus";
import { CommonFieldConfig, asNexusMethod } from "nexus/dist/core";
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
export function getTypes(collection:CustomProfileDef) {
 const nexusObjectTypes: Array<any> = [];
	collection.classes.forEach((o:ClassDef) => {
		nexusObjectTypes.push(getNexusObject(o.className,o.properties));
	});
	return nexusObjectTypes;
}

//build each object from the json//if the modifier is filter then use only the searchable
export function getNexusObject(name:string, properties: Array<PropertyType>, modifier:string=''): any {
	let nexusType: any;
	nexusType = objectType({
		name: name + modifier,
		definition(t) {
		properties.forEach((element: PropertyType) => {
        if(modifier === 'Filter'){
          if(element.hasOwnProperty('searchable'))
          getDefinitionProperties(element, t);
        }
        else
				  getDefinitionProperties(element, t);
			});
		}
	});
	return nexusType;
}

//return the resolver for object types within an object
function getDefObjectWithResolver(o: PropertyType, t: any): any {
	return t.field(o.name, {
		type: o.name,
		resolve(root:any, args:any, ctx:any) {
			return () => {
			//	BuilderHelper.buildquery(o);
			};
			//  return projectService.getById(root.projectid);
		}
	});
}

// build the where clause for the knex query
 function buildWhereClause(r:ClassResolverType):{}{
  let criteria:any = {};
  for (let i = 0; i < r.where.length; i++) {
  //  criteria += {r.columns[index]:r.params[index]};
  let col = r.where[i];
  let val = r.params[i];
  criteria = Object.assign(criteria,{col : val});
  }
  return criteria;
}

export function buildQueryResolver(o:PropertyType):any{
  let resolver:ClassResolverType = o.resolver as ClassResolverType;
  let where: any = resolver.where.length> 0 ? buildWhereClause(resolver) : {1:1};
  let select: any = resolver.columns.length>0? resolver.columns.toString() : '*';
  return knex.withSchema(resolver.schema).table(resolver.table).where(where).select(select); 
}

//get nexus property definition for each property of the object
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
		case "obj":
			return getDefObjectWithResolver(o, t);
		case "json":
			return t.json(o.name, { ...opts });
		case "list":
			return t.list.field(o.name, { type: o.type });
	}
	return t;
}
  