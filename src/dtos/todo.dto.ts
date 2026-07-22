export interface PaginationQuery{
    page: number;
    limit: number;
}

export interface FilterQuery{
    completed?: boolean;
    title?: string;
}

export interface SortingQuery{
    sortBy?: 'createdAt' | 'title' | 'completed'| 'updatedAt';
    order?: 'asc' | 'desc';
}

export interface TodoQuery extends PaginationQuery, FilterQuery, SortingQuery{

}

export interface TodoWhereFilter {
    completed?: boolean;
    title?: { contains: string; mode: "insensitive" };
}

export interface TodoOrderBy {
    createdAt?: "asc" | "desc";
    title?: "asc" | "desc";
    completed?: "asc" | "desc";
    updatedAt?: "asc" | "desc";
}

export interface TodoListResponse{
    data : Array<{
        id : string;
        title: string;
        completed: boolean | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pagination :{
        page:number;
        limit: number;
        total:number;
        pages: number;
    };
}