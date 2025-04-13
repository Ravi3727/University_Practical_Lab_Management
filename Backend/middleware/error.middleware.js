export const errorHandler = (err, req, res, next) => {
    const error = { ...err }
    error.message = err.message
  
    // Log to console for dev
    console.log(err)
  
    // MySQL error handling
    if (err.code === "ER_DUP_ENTRY") {
      error.message = "Duplicate field value. Please use another value!"
      return res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  
    // Default error
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
    })
  }
  