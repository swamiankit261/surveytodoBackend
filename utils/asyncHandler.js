const asyncHandler = (theFunk) => async (req, res, next) => {
    return Promise.resolve(theFunk(req, res, next)).catch(err => next(err));
};


export default asyncHandler;