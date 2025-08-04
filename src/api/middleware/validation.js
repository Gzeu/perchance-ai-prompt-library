const validatePromptRequest = (req, res, next) => {
  const { style, subject } = req.body;
  
  if (!style) {
    return res.status(400).json({
      success: false,
      error: 'Style is required',
      code: 'MISSING_STYLE'
    });
  }
  
  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject is required and cannot be empty',
      code: 'MISSING_SUBJECT'
    });
  }
  
  const validStyles = ['anime', 'cinematic', 'photorealistic', 'digital_art', 'comic', 'pixel_art'];
  if (!validStyles.includes(style)) {
    return res.status(400).json({
      success: false,
      error: `Invalid style. Valid styles: ${validStyles.join(', ')}`,
      code: 'INVALID_STYLE'
    });
  }
  
  next();
};

const validateBatchRequest = (req, res, next) => {
  const { count } = req.body;
  
  // First validate like a normal prompt
  validatePromptRequest(req, res, (error) => {
    if (error) return;
    
    // Additional batch validation
    if (count && (typeof count !== 'number' || count < 1 || count > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Count must be a number between 1 and 10',
        code: 'INVALID_COUNT'
      });
    }
    
    next();
  });
};

module.exports = {
  validatePromptRequest,
  validateBatchRequest
};
