export interface PropertyType {
    name: string
    column: string;
    label: string;
    type: string;
    default?: string;
    description?: string;
    nullable?: boolean;
    resolver?: object;
    filterable?: boolean;
}