const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../Resuble/ApiErrors");
const FeatureApi = require("../Utils/Feature");
const { filePathImage } = require("../Utils/imagesHandler");
const logger = require('../Config/logger');

exports.createOne = (Model) =>
  expressAsyncHandler(async (req, res) => {
    logger.debug('Creating new document', { model: Model.modelName, body: req.body });
    const createDoc = await Model.create(req.body);
    logger.info('Document created successfully', { model: Model.modelName, id: createDoc._id });
    res.status(201).json({ data: createDoc });
  });

exports.getAll = (Model, keyword) =>
  expressAsyncHandler(async (req, res) => {
    logger.debug('Getting all documents', { model: Model.modelName, query: req.query });
    let fillter = {};
    if (req.filterObject) {
      fillter = req.filterObject;
    }

    const countDocs = await Model.countDocuments();
    const ApiFeatures = new FeatureApi(Model.find(fillter), req.query)
      .Fillter(Model)
      .Sort()
      .Fields()
      .Search(keyword)
      .Paginate(countDocs);
    const { MongooseQueryApi, PaginateResult } = ApiFeatures;
    const getDoc = await MongooseQueryApi;
    logger.info('Documents retrieved successfully', { 
      model: Model.modelName, 
      count: getDoc.length,
      pagination: PaginateResult 
    });
    res
      .status(201)
      .json({ results: getDoc.length, PaginateResult, data: getDoc });
  });

exports.getOne = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    logger.debug('Getting single document', { 
      model: Model.modelName, 
      id: req.params.id,
      firebaseUid: req.user.firebaseUid 
    });

    let query = Model.findOne({
      $or: [{ firebaseUid: req.user.firebaseUid }, { _id: req.params.id }],
    });
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const getDocById = await query;

    if (!getDocById) {
      logger.warn('Document not found', { model: Model.modelName, id: req.params.id });
      return next(new ApiError(`تعذر الحصول علي البيانات`, 404));
    }
    logger.info('Document retrieved successfully', { model: Model.modelName, id: getDocById._id });
    res.status(200).json({ data: getDocById });
  });

exports.getLoggedTask = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    logger.debug('Getting logged tasks', { 
      model: Model.modelName, 
      userRole: req.user.role,
      userId: req.user._id 
    });

    let query;

    if (req.user.role === "manager") {
      query = Model.find();
      logger.debug('Manager accessing all tasks');
    } else {
      query = Model.find({
        $or: [{ assignedBy: req.user._id }, { assignedTo: req.user._id }],
      });
      logger.debug('User accessing assigned tasks');
    }

    if (populateOpt) {
      query = query.populate(populateOpt);
    }

    const getDocById = await query;
    logger.info('Tasks retrieved successfully', { 
      model: Model.modelName, 
      count: getDocById.length 
    });
    res.status(200).json({ data: getDocById });
  });

exports.getLoggedTaskassignedTo = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    logger.debug('Getting tasks assigned to user', { 
      model: Model.modelName, 
      userId: req.user._id 
    });

    let query = Model.find({ assignedTo: req.user._id });
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const getDocById = await query;

    logger.info('Assigned tasks retrieved successfully', { 
      model: Model.modelName, 
      count: getDocById.length 
    });
    res.status(200).json({ data: getDocById });
  });

exports.deleteOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    logger.debug('Attempting to delete document', { 
      model: Model.modelName, 
      id: req.params.id 
    });

    const deleteDoc = await Model.findByIdAndDelete(req.params.id);
    if (!deleteDoc) {
      logger.warn('Document not found for deletion', { 
        model: Model.modelName, 
        id: req.params.id 
      });
      return next(
        new ApiError(`لم يتم العثور علي هذا المعرف :${req.params.id}`, 404)
      );
    }

    logger.info('Document deleted successfully', { 
      model: Model.modelName, 
      id: req.params.id 
    });
    res.status(200).json({ message: "تم الحذف بنجاح", data: deleteDoc });
  });

exports.updateOne = (Model, filePath) =>
  expressAsyncHandler(async (req, res, next) => {
    try {
      logger.debug('Attempting to update document', { 
        model: Model.modelName, 
        id: req.params.id 
      });

      const baseUrl = `${process.env.BASE_URL}/${filePath}/`;
      const findDocument = await Model.findById(req.params.id);

      if (!findDocument) {
        logger.warn('Document not found for update', { 
          model: Model.modelName, 
          id: req.params.id 
        });
        return next(
          new ApiError(
            `Sorry, can't find the document with ID: ${req.params.id}`,
            404
          )
        );
      }

      const imageKeys = ["image", "avater", "picture", "pdf"];

      for (const key of imageKeys) {
        if (req.body[key] !== undefined) {
          if (findDocument[key] && findDocument[key] !== req.body[key]) {
            const relativePathImage = findDocument[key].split(baseUrl)[1];
            logger.debug('Deleting old image', { 
              model: Model.modelName, 
              field: key,
              path: relativePathImage 
            });
            filePathImage(filePath, relativePathImage);
          }
        }
      }

      const updateData = req.body;
      for (const key of imageKeys) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }

      const updateDocById = await Model.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updateDocById) {
        logger.error('Failed to update document', { 
          model: Model.modelName, 
          id: req.params.id 
        });
        return next(
          new ApiError(
            `Sorry, can't update the document with ID: ${req.params.id}`,
            404
          )
        );
      }

      logger.info('Document updated successfully', { 
        model: Model.modelName, 
        id: updateDocById._id 
      });
      res.status(200).json({ data: updateDocById });
    } catch (error) {
      logger.error('Error in update operation', { 
        model: Model.modelName, 
        error: error.message 
      });
      next(error);
    }
  });
