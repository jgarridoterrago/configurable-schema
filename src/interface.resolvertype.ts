export interface ClassResolverType {
    table:string
    schema:string
    columns:[string] //display data from here
    where:[string] //search data from here
    params:[string]
}