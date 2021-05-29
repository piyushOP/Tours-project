class APIFeatures {
  constructor(allTours, queryString) {
    this.allTours = allTours;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const query = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((item) => delete query[item]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.allTours = this.allTours.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) SORT --> To get data in an order
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //split because sort function using parameters like this .sort(price name) and we get string like (price,name).
      this.allTours = this.allTours.sort(sortBy);
    } else {
      this.allTours = this.allTours.sort('--createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Fields Limiting --> to get particular data from DB
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.allTours = this.allTours.select(fields);
    } else {
      this.allTours = this.allTours.select('-__v'); //Mongoose automatically deSelect with - sign, __v is auto generated and used internally by mongoose.
    }

    return this;
  }

  pagination() {
    // 4) Pagination
    // page=2 & limit=10 --> page1->1 - 10, page2-> 11 - 20, and so on..........
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.allTours = this.allTours.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
