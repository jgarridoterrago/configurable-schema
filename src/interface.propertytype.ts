export interface PropertyType {
    name: string
    column: string;
    label: string;
    type: string;
    default?: string | null;
    description?: string | null;
    nullable?: boolean | false;
    resolver?: object;
    filterable?: boolean;
}