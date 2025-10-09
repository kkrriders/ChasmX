# AI Workflow Generator - Testing Checklist

## Pre-Test Setup
- [ ] Backend API is running (workflow generation endpoint available)
- [ ] Frontend development server is running
- [ ] User is authenticated
- [ ] Browser console is open for monitoring

## Test 1: Toolbar Button
### Steps:
1. [ ] Navigate to `/workflows/new` or `/workbench/new`
2. [ ] Locate "AI Generate" button in the center toolbar section
3. [ ] Click the button
4. [ ] Verify modal opens with AI generator form

### Expected Results:
- [ ] Button is visible and styled correctly (secondary variant, sparkles icon)
- [ ] Modal opens smoothly
- [ ] Form has topic and prompt fields
- [ ] No console errors

## Test 2: Quick Actions Panel Button
### Steps:
1. [ ] Navigate to workflow builder
2. [ ] Locate "AI Generate" button in top-left panel (with Library, Templates, etc.)
3. [ ] Click the button
4. [ ] Verify modal opens

### Expected Results:
- [ ] Button has gradient styling (purple to blue)
- [ ] Sparkles icon is visible
- [ ] Modal opens correctly
- [ ] No console errors

## Test 3: Empty State Button
### Steps:
1. [ ] Navigate to workflow builder with no nodes
2. [ ] Verify empty state message appears in center
3. [ ] Locate "Generate with AI" primary button
4. [ ] Click the button
5. [ ] Verify modal opens

### Expected Results:
- [ ] Empty state card displays correctly
- [ ] Button is prominent with gradient styling
- [ ] "Browse Components" and "Use Template" buttons also visible
- [ ] Modal opens on click
- [ ] No console errors

## Test 4: Workflow Generation
### Steps:
1. [ ] Open AI generator from any access point
2. [ ] Enter topic: "Customer Support"
3. [ ] Enter prompt: "Create a workflow that receives customer emails, categorizes them by urgency, and routes urgent ones to Slack"
4. [ ] Click "Generate workflow"
5. [ ] Wait for generation
6. [ ] Verify workflow loads into canvas

### Expected Results:
- [ ] Loading state shows during generation
- [ ] Workflow appears on canvas after generation
- [ ] Nodes are properly positioned
- [ ] Edges connect nodes correctly
- [ ] Workflow name is updated
- [ ] Success toast notification appears
- [ ] Modal closes automatically
- [ ] Empty state disappears
- [ ] No console errors

## Test 5: Generated Workflow Editing
### Steps:
1. [ ] Generate a workflow using AI
2. [ ] Click on a node
3. [ ] Verify node config panel opens
4. [ ] Modify node configuration
5. [ ] Save changes
6. [ ] Add a new node manually
7. [ ] Connect nodes manually
8. [ ] Save the workflow

### Expected Results:
- [ ] Can edit AI-generated nodes
- [ ] Can add new nodes to AI-generated workflow
- [ ] Can create new connections
- [ ] All changes persist
- [ ] No console errors

## Test 6: Error Handling
### Steps:
1. [ ] Open AI generator
2. [ ] Submit with empty prompt
3. [ ] Verify validation error
4. [ ] Enter valid prompt but simulate backend error
5. [ ] Verify error message displays

### Expected Results:
- [ ] Validation prevents empty submission
- [ ] Error messages are user-friendly
- [ ] Modal stays open on error
- [ ] User can retry
- [ ] No unhandled exceptions

## Test 7: Responsive Design
### Steps:
1. [ ] Test on desktop (1920x1080)
2. [ ] Test on tablet (768px width)
3. [ ] Test on mobile (375px width)
4. [ ] Verify all buttons are accessible

### Expected Results:
- [ ] Toolbar button hides text on small screens (icon only)
- [ ] Quick actions panel wraps appropriately
- [ ] Empty state card is responsive
- [ ] Modal is usable on all screen sizes
- [ ] No layout breaks

## Test 8: Workflows List Page Integration
### Steps:
1. [ ] Navigate to `/workflows`
2. [ ] Locate "Generate with AI" button in header
3. [ ] Click the button
4. [ ] Generate a workflow
5. [ ] Verify workflow appears in list

### Expected Results:
- [ ] Button is visible in workflows page header
- [ ] Modal opens correctly
- [ ] Generated workflow saves to backend
- [ ] Workflow list refreshes
- [ ] New workflow appears in list

## Test 9: Multiple Generations
### Steps:
1. [ ] Generate first workflow
2. [ ] Verify it loads
3. [ ] Click AI Generate again
4. [ ] Generate second workflow
5. [ ] Verify it replaces the first

### Expected Results:
- [ ] Second generation replaces first (or asks for confirmation)
- [ ] No memory leaks
- [ ] No duplicate nodes
- [ ] State is properly reset

## Test 10: Browser Compatibility
### Browsers to Test:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### Expected Results:
- [ ] All buttons render correctly
- [ ] Gradient styling works
- [ ] Modal functions properly
- [ ] Icons display correctly
- [ ] No browser-specific issues

## Performance Tests
- [ ] Measure modal open time (should be < 100ms)
- [ ] Monitor memory usage during generation
- [ ] Check for memory leaks after multiple generations
- [ ] Verify canvas performance with generated workflows

## Accessibility Tests
- [ ] Tab navigation works through all buttons
- [ ] Modal can be closed with Escape key
- [ ] Screen reader announces button labels
- [ ] Focus management is correct
- [ ] Color contrast meets WCAG standards

## Known Issues / Notes
```
Document any issues found during testing:

1. Issue: 
   Steps to reproduce:
   Expected:
   Actual:
   Severity:

2. Issue:
   ...
```

## Test Summary
**Date:** _________
**Tester:** _________
**Build:** _________

**Total Tests:** 10
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Overall Status:** [ ] PASS [ ] FAIL [ ] NEEDS REVIEW
