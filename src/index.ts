import { NextFunction } from 'express';
import { Response } from 'express';
import { Request } from 'express';
import { PaginationAwareObject, paginate } from './helpers/pagination';
import { SelectQueryBuilder } from 'typeorm';
declare module "typeorm" {
    export interface SelectQueryBuilder<Entity> {
        paginate(per_page?: number|null): Promise<PaginationAwareObject<object | any>>;
        paginate(classTransform?: any|number|null, per_page?: number|null): Promise<PaginationAwareObject<object | any>>;
    }
}

/**
 * Boot the package by patching the SelectQueryBuilder
 *  
 */
export function pagination(req: Request, res: Response, next: NextFunction):void {

    /**
     * Modified by @nartos9090
     * 
     * Add support to transform class with classTransformer interceptor
     */
    SelectQueryBuilder.prototype.paginate = async function(classTransformOrPerPage?: any|number|null, per_page?: number|null): Promise<PaginationAwareObject<object | any>> {
        let classTransform
        if (typeof classTransformOrPerPage == 'number' && isFinite(classTransformOrPerPage)) {
            per_page = classTransformOrPerPage
        } else {
            classTransform = classTransformOrPerPage
        }
        let current_page =  getPage(req);
        if (!per_page) per_page = getPerPage(req) // If not set, then get from request, default to 15
        else per_page = getPerPage(req, per_page);// If set, check if the request has per_page (which will override), or fallback to the set default
        return await paginate(this,current_page,per_page, classTransform);
    }
    //console.log("pagination registered");
    next();
}
export function getPerPage(req: Request, defaultPerPage:number = 15) {
    return parseInt(req.query.per_page as string)|| defaultPerPage
}
export function getPage(req: Request, defaultPage:number=1) {
    return parseInt(req.query.page as string) || defaultPage
}
