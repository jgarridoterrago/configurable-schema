import {
    objectType, interfaceType,  queryType,
    stringArg, enumType, intArg,  arg,  makeSchema
  } from "nexus";
import { CommonFieldConfig, asNexusMethod } from "nexus/dist/core";
import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLJSON from 'graphql-type-json';
import knex from "./src/connection";

export const GQLDateTime = asNexusMethod(GraphQLDateTime, 'date');
export const GQLJSON = asNexusMethod(GraphQLJSON,'json');

  export function getSchema(collection:CustomProfileDef):any{
    let nexusObjectTypes:{}={};
    collection.classes.forEach(o=>{
      nexusObjectTypes = Object.assign(nexusObjectTypes,getNexusObject(o))
    })
    return nexusObjectTypes;
  }

   function getNexusObject(obj:ClassDef):any{
    let nexusType:any;
      
    nexusType = objectType({
        name: obj.className,
        definition(t) {
            obj.properties.forEach(element => {
            getDefType(element,t);
            });
        }
      });
      console.log(nexusType)
      return nexusType;
  }

  function getType(o:ClassType):string{
      if(o.type.toLowerCase().includes('str'))
        return 'str'
      else if(o.type.toLowerCase().includes('int'))
        return 'int'
        else if(o.type.toLowerCase().includes('fl'))
        return 'float'
     else if(o.type.toLowerCase().includes('date'))
        return 'date'
      else if(o.type.toLowerCase().includes('json'))
        return 'json'
      else if(o.type.toLowerCase().includes('list'))
        return 'list'
      else
        return 'obj'
  }
  
  function getDefType(o:ClassType, t:any):any{
    let opts:CommonFieldConfig={};
    opts.description = o.description;
    opts.nullable = o.nullable;

      switch(getType(o)){
          case 'str':
              return t.string(o.name,{...opts});
          case 'int':
              return t.int(o.name,{...opts});
          case 'float':
              return t.float(o.name,{...opts});
          case 'date':
                  return t.date(o.name,{...opts});
          case 'obj':
             return getDefObjectWithResolver(o,t);
          case 'json':
              return t.json(o.name,{...opts});
          case 'list':
              return t.list.field(o.name,{type:o.type});
      }
      
      return t;
  }

  function buildquery(o:ClassType):any{
    let resolver:ClassResolverType = o.resolver as ClassResolverType;
    let where: any = resolver.where.length>0 ? getSQLWhere(resolver) : {1:1};
    let select: any = resolver.columns.length>0? resolver.columns.toString() : '*';
  
    return knex.withSchema(resolver.schema).table(resolver.table).where(where).select(select); 
  }

  function getSQLSelect(r:ClassResolverType):{}{
    let criteria:string = '';
    for (let i = 0; i < r.columns.length; i++) {
  
       let col = r.where[i];
       let val = r.params[i];
      criteria = Object.assign(criteria,{col : val});
    }
    return criteria;
  }
  
  function getSQLWhere(r:ClassResolverType):{}{
    let criteria:any = {};
    for (let i = 0; i < r.where.length; i++) {
    //  criteria += {r.columns[index]:r.params[index]};
       let col = r.where[i];
       let val = r.params[i];
      criteria = Object.assign(criteria,{col : val});
    }
    return criteria;
  }

  function getDefObjectWithResolver(o:ClassType, t:any):any{
    return t.field(o.name, {
        type: o.type,
        resolve(root, args, ctx) {
          return ()=>{ 
          //  buildquery(o); 
          }
        //  return projectService.getById(root.projectid);
        },
    })
  }

