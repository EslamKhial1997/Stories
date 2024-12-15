const expressAsyncHandler = require("express-async-handler");

const ApiError = require("../Resuble/ApiErrors");
const FeatureApi = require("../Utils/Feature");

exports.createOne = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const createDoc = await Model.create(req.body);
    res.status(201).json({ data: createDoc });
  });
exports.getAll = (Model, keyword) =>
  expressAsyncHandler(async (req, res) => {
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
    res
      .status(201)
      .json({ results: getDoc.length, PaginateResult, data: getDoc });
  });
exports.getOne = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    let query = Model.findOne({
      $or: [{ firebaseUid: req.user.firebaseUid }, { _id: req.params.id }],
    });
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const getDocById = await query;

    if (!getDocById) {
      return next(new ApiError(`تعذر الحصول علي البيانات`, 404));
    }
    res.status(200).json({ data: getDocById });
  });
exports.getLoggedTask = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    let query;

    // التحقق من دور المستخدم وإنشاء الاستعلام المناسب
    if (req.user.role === "manager") {
      // إذا كان المستخدم مديرًا، يجلب كل المهام
      query = Model.find();
    } else {
      // إذا لم يكن المستخدم مديرًا، يجلب المهام المخصصة له أو التي قام بتعيينها
      query = Model.find({
        $or: [{ assignedBy: req.user._id }, { assignedTo: req.user._id }],
      });
    }

    // إذا كانت هناك خيارات "populate"، يتم إضافتها للاستعلام
    if (populateOpt) {
      query = query.populate(populateOpt);
    }

    // تنفيذ الاستعلام
    const getDocById = await query;

    // إذا لم يتم العثور على مستندات، إرسال خطأ

    // إرسال النتائج
    res.status(200).json({ data: getDocById });
  });

exports.getLoggedTaskassignedTo = (Model, populateOpt) =>
  expressAsyncHandler(async (req, res, next) => {
    let query = Model.find({ assignedTo: req.user._id });
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const getDocById = await query;

    res.status(200).json({ data: getDocById });
  });

exports.deleteOne = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const deleteDoc = await Model.findByIdAndDelete(req.params.id);
    if (!deleteDoc) {
      return next(
        new ApiError(`لم يتم العثور علي هذا المعرف :${req.params.id}`, 404)
      );
    }

    res.status(200).json({ message: "تم الحذف بنجاح", data: deleteDoc });
  });
  exports.updateOne = (Model, filePath) =>
    expressAsyncHandler(async (req, res, next) => {
      try {
        const baseUrl = `${process.env.BASE_URL}/${filePath}/`;
  
        // العثور على المستند بناءً على ID
        const findDocument = await Model.findById(req.params.id);
  
        if (!findDocument) {
          return next(
            new ApiError(
              `Sorry, can't find the document with ID: ${req.params.id}`,
              404
            )
          );
        }
  
        // قائمة بالمفاتيح التي قد تحتوي على مسارات الصور
        const imageKeys = ["image", "avater", "picture", "pdf"];
  
        // تحقق من كل مفتاح في req.body وقم بحذف الصورة القديمة إذا لزم الأمر
        for (const key of imageKeys) {
          if (req.body[key] !== undefined) {
            // تحقق إذا كان الحقل موجودًا في req.body
            if (findDocument[key] && findDocument[key] !== req.body[key]) {
              const relativePathImage = findDocument[key].split(baseUrl)[1];
              filePathImage(filePath, relativePathImage); // حذف الصورة القديمة
            }
          }
        }
  
        // تحديث الحقول التي تحتوي على قيم جديدة فقط
        const updateData = req.body;
        for (const key of imageKeys) {
          if (req.body[key] !== undefined) {
            updateData[key] = req.body[key];
          }
        }
        // تحديث المستند بناءً على ID
        const updateDocById = await Model.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        );
  
        if (!updateDocById) {
          return next(
            new ApiError(
              `Sorry, can't update the document with ID: ${req.params.id}`,
              404
            )
          );
        }
  
        res.status(200).json({ data: updateDocById });
      } catch (error) {
        next(error);
      }
    });
