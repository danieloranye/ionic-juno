export interface DBConfig {
    user?: string;
    host?: string;
    database?: string;
    password?: string;
    port?: number;
}

export interface ColumnDef {
    column_name: string;
    data_type: string;
}

export interface TableMapping {
    column: string;
    fakerCategory: string; // e.g. 'person.firstName'
}

export type ViewState = 'connect' | 'generate' | 'create-table';
