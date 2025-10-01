# Word Export Testing Guide

## Quick Testing Steps

### 1. **Basic Export Test**

1. Navigate to any blueprint view page
2. Locate the export buttons (usually in the header or action area)
3. Click the blue Word export button (FileType icon)
4. Verify the file downloads as `.docx`
5. Open the file in Microsoft Word, Google Docs, or compatible editor

### 2. **Visual Verification Checklist**

Open the exported Word document and verify:

- [ ] **Title Page**
  - Blueprint title is centered and prominent
  - Description appears below title
  - Creation date is formatted properly
  - Version number is visible

- [ ] **Document Structure**
  - Table of contents appears (if implemented)
  - Page breaks between major sections
  - Headers follow logical hierarchy (H1 → H2 → H3)

- [ ] **Executive Summary**
  - Paragraph formatting is correct
  - No markdown syntax visible (no `#`, `**`, `*`)
  - Spacing between paragraphs is appropriate

- [ ] **Learning Objectives**
  - Numbered list format
  - Objective titles are bold
  - Descriptions are formatted as regular text
  - Metrics and targets are highlighted

- [ ] **Lists**
  - Bulleted lists render with proper bullets
  - Numbered lists have sequential numbering
  - Indentation is consistent
  - No extra spacing issues

- [ ] **Bold and Italic**
  - Bold text renders correctly
  - Italic text renders correctly
  - Combined formatting works (if applicable)

- [ ] **Budget Information**
  - Currency symbols display correctly
  - Numbers are formatted with commas
  - Total is bold and prominent

- [ ] **Dates and Times**
  - Dates are in readable format
  - Timeline information is clear
  - No ISO timestamp strings visible

- [ ] **Special Characters**
  - Percentage signs (%)
  - Currency symbols ($, €, £)
  - Ampersands (&)
  - Quotes and apostrophes

### 3. **Export All Formats Test**

1. Click "Export All" button
2. Verify Word document is included in downloads
3. Confirm file size is reasonable (typically 20-200KB)
4. Open and verify formatting matches single export

### 4. **Content Completeness Test**

Compare the Word export with the on-screen blueprint:

- [ ] All sections present
- [ ] No missing content
- [ ] No truncated text
- [ ] All objectives included
- [ ] All modules listed
- [ ] Complete budget information
- [ ] All risks documented
- [ ] All metrics present

### 5. **Cross-Platform Compatibility**

Test opening the exported file in multiple applications:

**Microsoft Word**
- [ ] Opens without errors
- [ ] Formatting is preserved
- [ ] Headings show in navigation pane
- [ ] Can edit text without issues

**Google Docs**
- [ ] Upload and open successfully
- [ ] Formatting mostly preserved
- [ ] Text is selectable and editable

**Apple Pages**
- [ ] Opens on macOS/iOS
- [ ] Layout is reasonable
- [ ] Text formatting preserved

**LibreOffice Writer**
- [ ] Opens successfully
- [ ] Formatting is acceptable
- [ ] Can export to PDF from LibreOffice

### 6. **Edge Cases Testing**

Test with various blueprint types:

- [ ] **Empty Sections**: Blueprint with missing optional sections
- [ ] **Long Content**: Blueprint with extensive descriptions
- [ ] **Special Characters**: Blueprint with emojis, symbols
- [ ] **International**: Blueprint with non-English characters
- [ ] **Large Budget**: Numbers with many digits
- [ ] **Many Objectives**: 10+ learning objectives

### 7. **Performance Testing**

- [ ] Export completes in < 5 seconds
- [ ] No browser freezing during export
- [ ] File size is reasonable
- [ ] Memory usage is acceptable

### 8. **Error Handling Test**

Test error scenarios:

1. **Network Issues**
   - Disconnect network mid-export
   - Verify graceful error message

2. **Invalid Data**
   - Try exporting a corrupted blueprint
   - Check error handling

3. **Large Documents**
   - Export a very large blueprint
   - Verify it completes successfully

### 9. **Accessibility Testing**

In Microsoft Word:

- [ ] Run Accessibility Checker
- [ ] Verify heading hierarchy
- [ ] Check reading order
- [ ] Validate document structure

### 10. **Printing Test**

1. Open exported Word document
2. Go to Print Preview
3. Verify:
   - [ ] Page breaks are logical
   - [ ] No content cutoff
   - [ ] Margins are appropriate
   - [ ] Headers/footers (if present)

## Common Issues and Solutions

### Issue: Markdown syntax still visible
**Solution**: Check `parseMarkdown()` method in `wordGenerator.ts`

### Issue: Formatting lost in Google Docs
**Expected**: Some styling differences are normal due to format conversion

### Issue: Large file size
**Check**: 
- Image embeddings (if implemented)
- Excessive metadata
- Duplicate content

### Issue: Missing sections
**Verify**:
- Blueprint data structure
- Section conditional rendering
- Error console for warnings

### Issue: Incorrect bullet points
**Check**:
- List parsing logic
- Markdown list format detection

## Automated Testing (Future)

Consider implementing:

```typescript
// Example test structure
describe('Word Export', () => {
  it('should generate valid .docx file', async () => {
    const result = await exportService.exportBlueprint(
      mockBlueprint,
      { format: 'docx' }
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Blob);
    expect(result.data?.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  it('should include all blueprint sections', async () => {
    // Test implementation
  });

  it('should parse markdown correctly', () => {
    const generator = new WordGenerator();
    const paragraphs = generator.parseMarkdown('# Heading\n\nParagraph text');
    // Assertions
  });
});
```

## Reporting Issues

When reporting export issues, include:

1. **Blueprint Details**
   - Blueprint type
   - Number of sections
   - Approximate content length

2. **Export Context**
   - Browser and version
   - Operating system
   - Export options used

3. **Observed Behavior**
   - What went wrong
   - Expected behavior
   - Screenshots if applicable

4. **Console Output**
   - Any error messages
   - Warning logs
   - Network errors

5. **Sample Document**
   - Attach exported file (if possible)
   - Or describe specific formatting issues

## Success Criteria

Export is considered successful when:

✅ Document downloads without errors  
✅ Opens in Microsoft Word without warnings  
✅ All content is present and readable  
✅ Formatting enhances readability  
✅ No visible markdown syntax  
✅ Lists and headings are properly formatted  
✅ Budget and numbers display correctly  
✅ File size is reasonable (<1MB for typical blueprint)  
✅ Can be edited and resaved without issues  
✅ Prints correctly with good page breaks  

## Developer Testing Checklist

For code review and development:

- [ ] TypeScript compilation passes
- [ ] No linting errors
- [ ] Dynamic import works correctly
- [ ] Error handling catches edge cases
- [ ] Performance is acceptable
- [ ] Memory leaks are prevented
- [ ] Code follows project conventions
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] Type definitions are accurate

## Sign-Off

Tester: _______________  
Date: _______________  
Result: [ ] Pass [ ] Fail [ ] Needs Revision  
Notes: _____________________________________________

