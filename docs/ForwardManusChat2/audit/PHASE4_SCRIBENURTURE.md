# Phase 4: ScribeNurture Integration Deep Dive

This document provides a deep dive into the integration with the ScribeNurture API, which is critical for the core functionality of the NurturInk application. The analysis is based on the ScribeNurture API documentation and a review of the relevant backend functions.

## 1. Current Integration Audit

A review of the codebase was conducted to identify all functions that interact with the ScribeNurture API. The primary integration points are concentrated in a few key backend functions.

| Function | ScribeNurture Endpoint(s) Used | Purpose |
|---|---|---|
| `submitBatchToScribe` | `POST /v1/batches` | Submits a batch of cards to be created. This is the main function for production sends. |
| `processMailingBatch` | (Calls `submitBatchToScribe`) | Prepares and processes a mailing batch before submission. |
| `scribeTestSuite` | Multiple endpoints | A comprehensive test suite that calls various ScribeNurture endpoints to validate the integration. |
| `scribeMinimalTest` | `POST /v1/batches` (likely) | A minimal test function for a basic integration check. |
| `scribeReturnAddressTester` | (Likely related to address validation) | A function specifically for testing return address functionality with the API. |

### Error Handling

The `submitBatchToScribe` function includes a `try...catch` block to handle errors from the ScribeNurture API. However, as noted in Phase 3, the error handling is basic:

```typescript
// Simplified example from submitBatchToScribe.ts
try {
  const response = await fetch('https://api.scribenurture.com/v1/batches', {
    // ... request options
  });
} catch (error) {
  console.error('Error submitting batch to ScribeNurture:', error);
  // The function stops here, no retry or notification
}
```

This approach logs the error but does not implement any retry logic or notify an administrator, which is a significant risk for a critical process.

### Rate Limit Handling

There is **no evidence** in the current codebase of any explicit rate limit handling. The ScribeNurture API has a documented rate limit of **60 requests per minute**. The current implementation does not appear to have any mechanism to throttle or queue requests to respect this limit. This could lead to API errors and failed sends if a large number of cards are processed in a short period (e.g., through the automation engine).

## 2. Message Formatting Validation

The ScribeNurture API has specific requirements for message formatting. This section audits how the NurturInk application adheres to these requirements.

| Requirement | Finding | Recommendation |
|---|---|---|
| **Message Length** | The API has limits on the number of characters per message, which vary based on the `text_type`. There is no clear evidence in the frontend code (`CreateContent.jsx`) or backend functions that these limits are being enforced before the API call. | Implement client-side and server-side validation to check the message length against the ScribeNurture API limits. The UI should provide real-time feedback to the user as they type. |
| **Preview Endpoints** | The ScribeNurture API provides preview endpoints to see how a message will look before it is sent. The current workflow does not appear to use these endpoints. The `ReviewAndSend.jsx` page likely generates a preview internally, but it may not be a 100% accurate representation of the final output. | Utilize the ScribeNurture preview endpoints to provide a more accurate preview to the user. This will reduce the chances of formatting errors in the final printed card. |
| **Overflow Detection** | There is no mention of overflow detection in the codebase. If a message exceeds the available space on the card, it will likely be truncated by the ScribeNurture API. | Implement a mechanism to detect and handle message overflow. This could involve using the preview endpoint to check the rendered size of the message or by carefully calculating the available space based on the selected card design and font. |

## 3. Image/ZIP Processing Audit

The ScribeNurture API has strict requirements for image and ZIP file uploads. This section reviews how the NurturInk application handles these requirements.

| Requirement | Finding | Recommendation |
|---|---|---|
| **Image Dimensions** | The API requires images to be exactly 1375x2000 pixels. There is no evidence in the codebase that the application resizes or validates the dimensions of uploaded images. | Implement a server-side validation step that checks the dimensions of all uploaded images. If an image does not meet the required dimensions, it should be rejected with a clear error message. For a better user experience, consider adding a client-side check as well. |
| **ZIP File Size** | The API has a 20 MB limit for ZIP file uploads. There is no validation in the codebase to check the size of the ZIP file before it is sent to the API. | Add a validation step in the `submitBatchToScribe` function to check the size of the ZIP file. If it exceeds the 20 MB limit, the request should be rejected. |
| **File Naming** | The API requires images within the ZIP file to be named sequentially (e.g., `1.png`, `2.png`). The code that generates the ZIP file needs to be reviewed to ensure it follows this convention. | Review the code responsible for creating the ZIP file to confirm that it adheres to the sequential naming convention. Add a comment to this code to highlight this important requirement. |
| **Error Handling** | There is no specific error handling for invalid image formats or corrupted ZIP files. If an invalid file is sent to the ScribeNurture API, it will likely result in a generic API error. | Implement more specific error handling to catch invalid file formats and corrupted files. This will allow the application to provide more informative error messages to the user. |
