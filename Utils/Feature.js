const logger = require('../config/logger');

class FeatureApi {
  constructor(MongooseQueryApi, QueryStringApi) {
    this.MongooseQueryApi = MongooseQueryApi;
    this.QueryStringApi = QueryStringApi;
    logger.debug('FeatureApi initialized', { 
      query: QueryStringApi
    });
  }  

  Fillter() {
    const QueryStringObj = { ...this.QueryStringApi };
    const excludes = ["page", "limit", "skip", "sort", "fields"];
    excludes.forEach((failds) => delete QueryStringObj[failds]);
    let QueryString = JSON.stringify(QueryStringObj);
    QueryString = QueryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    logger.debug('Applying filter', { 
      filter: JSON.parse(QueryString) 
    });

    this.MongooseQueryApi = this.MongooseQueryApi.find(JSON.parse(QueryString));
    return this;
  }

  Sort() {
    if (this.QueryStringApi.sort) {
      const sortby = this.QueryStringApi.sort.split(",").join(" ");
      logger.debug('Applying custom sort', { sort: sortby });
      this.MongooseQueryApi = this.MongooseQueryApi.sort(sortby);
    } else {
      logger.debug('Applying default sort by createdAt');
      this.MongooseQueryApi = this.MongooseQueryApi.sort("createdAt");
    }
    return this;
  }

  Fields() {
    if (this.QueryStringApi.fields) {
      const fields = this.QueryStringApi.fields.split(",").join(" ");
      logger.debug('Selecting specific fields', { fields });
      this.MongooseQueryApi = this.MongooseQueryApi.select(fields);
    } else {
      logger.debug('Selecting all fields except __v');
      this.MongooseQueryApi = this.MongooseQueryApi.select("-__v");
    }
    return this;
  } 

  Search(modelName) {
    let QuerySearch = {};
    
    if (modelName === undefined) {
      if (this.QueryStringApi.keyword) {
        QuerySearch.$or = [
          { title: { $regex: new RegExp(this.QueryStringApi.keyword, "i") } },
          {
            description: {
              $regex: new RegExp(this.QueryStringApi.keyword, "i"),
            },
          },
        ];
        logger.debug('Applying search on title and description', { 
          keyword: this.QueryStringApi.keyword 
        });
      }
    } else {
      QuerySearch = {
        name: { $regex: new RegExp(this.QueryStringApi.keyword, "i") },
      };
      logger.debug('Applying search on name field', { 
        keyword: this.QueryStringApi.keyword,
        modelName 
      });
    }

    this.MongooseQueryApi = this.MongooseQueryApi.find(QuerySearch);
    return this;
  }
  
  Paginate(countDoc) {
    const page = this.QueryStringApi.page * 1 || 1;
    const limit = this.QueryStringApi.limit * 1 || 100;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    const Pagination = {};
    Pagination.CurrentPage = page;
    Pagination.limit = limit;
    Pagination.numberOfPage = Math.ceil(countDoc / limit);

    if (endIndex < countDoc) {
      Pagination.next = page + 1;
    }
    if (skip > 0) {
      Pagination.preve = page - 1;
    }

    logger.debug('Applying pagination', { 
      page,
      limit,
      skip,
      totalDocs: countDoc,
      pagination: Pagination 
    });

    this.MongooseQueryApi = this.MongooseQueryApi.skip(skip).limit(limit);
    this.PaginateResult = Pagination;
    return this;
  }
}

module.exports = FeatureApi;
